<script lang="ts">
    import { onDestroy } from 'svelte';

    interface Props {
        src: string;
    }

    let { src }: Props = $props();

    let audioElement: HTMLAudioElement | null = $state(null);
    let isPlaying = $state(false);
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let currentTime = $state(0);
    let duration = $state(0);

    function toggle() {
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play();
        }
    }

    function handlePlay() {
        isPlaying = true;
        error = null;
    }

    function handlePause() {
        isPlaying = false;
    }

    function handleEnded() {
        isPlaying = false;
        currentTime = 0;
    }

    function handleTimeUpdate() {
        if (audioElement) {
            currentTime = audioElement.currentTime;
        }
    }

    function handleLoadedMetadata() {
        if (audioElement) {
            duration = audioElement.duration;
        }
        isLoading = false;
    }

    function handleLoadStart() {
        isLoading = true;
        error = null;
    }

    function handleError() {
        isLoading = false;
        error = 'Failed to load audio';
        isPlaying = false;
    }

    function handleSeek(event: Event) {
        const target = event.target as HTMLInputElement;
        if (audioElement) {
            audioElement.currentTime = parseFloat(target.value);
        }
    }

    function formatTime(seconds: number): string {
        if (!isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    onDestroy(() => {
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }
    });
</script>

<div class="flex items-center gap-3">
    <audio
        bind:this={audioElement}
        {src}
        preload="metadata"
        onplay={handlePlay}
        onpause={handlePause}
        onended={handleEnded}
        ontimeupdate={handleTimeUpdate}
        onloadedmetadata={handleLoadedMetadata}
        onloadstart={handleLoadStart}
        onerror={handleError}
    ></audio>

    {#if error}
        <span class="text-error text-sm">{error}</span>
    {:else}
        <button
            onclick={toggle}
            class="btn btn-circle btn-ghost"
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={isLoading}
        >
            {#if isLoading}
                <span class="loading loading-spinner loading-sm"></span>
            {:else if isPlaying}
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
                        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
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
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                    />
                </svg>
            {/if}
        </button>

        {#if duration > 0}
            <div class="flex items-center gap-2 text-sm text-base-content/70">
                <span class="w-10 text-right">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    oninput={handleSeek}
                    class="range range-xs range-primary w-24"
                />
                <span class="w-10">{formatTime(duration)}</span>
            </div>
        {/if}
    {/if}
</div>
