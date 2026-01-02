<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    interface Props {
        text: string;
    }

    let { text }: Props = $props();

    let isSpeaking = $state(false);
    let speechSupported = $state(false);
    let speechLang = $state<'en-US' | 'nb-NO'>('en-US');

    function speak() {
        if (!speechSupported || !window.speechSynthesis) return;

        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Get voice for selected language
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find((voice) => voice.lang === speechLang);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.lang = speechLang;
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => {
            isSpeaking = true;
        };

        utterance.onend = () => {
            isSpeaking = false;
        };

        utterance.onerror = () => {
            isSpeaking = false;
        };

        window.speechSynthesis.speak(utterance);
    }

    function stop() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
        }
    }

    function toggle() {
        if (isSpeaking) {
            stop();
        } else {
            speak();
        }
    }

    function setLanguage(lang: 'en-US' | 'nb-NO') {
        speechLang = lang;
        if (isSpeaking) {
            stop();
            speak();
        }
    }

    onMount(() => {
        // Check for speech synthesis support
        speechSupported = 'speechSynthesis' in window;

        // Load voices (they may load asynchronously)
        if (speechSupported && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    });

    // Clean up speech synthesis when component is destroyed
    onDestroy(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    });
</script>

{#if speechSupported}
    <div class="flex items-center gap-2">
        <div class="join">
            <button
                class="join-item btn btn-sm {speechLang === 'en-US' ? 'btn-primary' : 'btn-ghost'}"
                onclick={() => setLanguage('en-US')}
            >
                En
            </button>
            <button
                class="join-item btn btn-sm {speechLang === 'nb-NO' ? 'btn-primary' : 'btn-ghost'}"
                onclick={() => setLanguage('nb-NO')}
            >
                No
            </button>
        </div>
        <button onclick={toggle} class="btn btn-circle btn-ghost" title={isSpeaking ? 'Stop reading' : 'Read aloud'}>
            {#if isSpeaking}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
                    />
                </svg>
            {:else}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                    />
                </svg>
            {/if}
        </button>
    </div>
{/if}
