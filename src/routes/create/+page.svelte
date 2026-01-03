<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from '$app/forms';

    let { data, form }: PageProps = $props();

    const isPremium = $derived(data.isPremium);

    interface Hint {
        id: number;
        content: string;
    }

    interface Chapter {
        id: number;
        title: string;
        content: string;
        answer: string;
        hints: Hint[];
    }

    let title = $state('');
    let description = $state('');
    let theme = $state('light');
    let chapters = $state<Chapter[]>([]);
    let nextChapterId = $state(1);
    let nextHintId = $state(1);
    let isGenerating = $state(false);
    let generateError = $state('');
    let showPromptModal = $state(false);
    let aiPrompt = $state('');
    let showPremiumVoiceModal = $state(false);
    let wantsPremiumVoice = $state(false);
    let formElement: HTMLFormElement | undefined = $state();

    // Sample JSON data for testing
    const sampleEscapeRoomJson = {
        title: "The Mystery Mansion",
        description: "A haunted mansion with secrets to uncover. Can you solve all the puzzles and escape?",
        theme: "dark",
        chapters: [
            {
                title: "The Entrance Hall",
                content: "You stand in a dimly lit entrance hall. A grandfather clock ticks ominously in the corner, showing 11:47. Above the fireplace, a portrait of a stern-looking man seems to follow your movements. On a side table, you notice a dusty book with a symbol on its cover.",
                answer: "midnight",
                hints: [
                    { content: "Look at the clock more carefully. What time comes after 11:47?" },
                    { content: "The portrait seems important. What happens at the witching hour?" }
                ]
            },
            {
                title: "The Library",
                content: "Shelves upon shelves of ancient books surround you. In the center, a reading desk has an open book with a riddle: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?'",
                answer: "map",
                hints: [
                    { content: "Think about representations, not real things." },
                    { content: "What shows all these things but isn't the real thing?" },
                    { content: "Travelers use this to find their way." }
                ]
            },
            {
                title: "The Secret Study",
                content: "Behind a bookshelf, you discover a hidden study. On the wall is a mathematical puzzle: 'I am a three-digit number. My tens digit is five more than my ones digit. My hundreds digit is eight less than my tens digit. What number am I?'",
                answer: "194",
                hints: [
                    { content: "Start with the relationship between tens and ones digit." },
                    { content: "If ones digit is 4, tens would be 9, and hundreds would be 1." }
                ]
            }
        ]
    };

    function populateFromJson(jsonData: typeof sampleEscapeRoomJson) {
        title = jsonData.title;
        description = jsonData.description;
        theme = jsonData.theme;
        
        chapters = jsonData.chapters.map(ch => ({
            id: nextChapterId++,
            title: ch.title,
            content: ch.content,
            answer: ch.answer,
            hints: ch.hints.map(h => ({
                id: nextHintId++,
                content: h.content
            }))
        }));
    }

    function loadSampleData() {
        populateFromJson(sampleEscapeRoomJson);
    }

    function openPromptModal() {
        showPromptModal = true;
        aiPrompt = '';
        generateError = '';
    }

    function closePromptModal() {
        showPromptModal = false;
    }

    function handleCreateClick() {
        showPremiumVoiceModal = true;
    }

    function closePremiumVoiceModal() {
        showPremiumVoiceModal = false;
    }

    function submitWithVoice(withVoice: boolean) {
        wantsPremiumVoice = withVoice;
        showPremiumVoiceModal = false;
        // Use setTimeout to ensure the hidden input value is updated before submit
        setTimeout(() => {
            formElement?.requestSubmit();
        }, 0);
    }

    async function generateWithAI() {
        if (!aiPrompt.trim()) {
            generateError = 'Please enter a description';
            return;
        }

        isGenerating = true;
        generateError = '';

        try {
            const response = await fetch('/api/generate-escape-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: aiPrompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate escape room');
            }

            const generatedData = await response.json();
            populateFromJson(generatedData);
            closePromptModal();
        } catch (err) {
            generateError = err instanceof Error ? err.message : 'An error occurred';
        } finally {
            isGenerating = false;
        }
    }

    function addChapter() {
        chapters.push({
            id: nextChapterId++,
            title: '',
            content: '',
            answer: '',
            hints: []
        });
    }

    function removeChapter(index: number) {
        chapters.splice(index, 1);
    }

    function addHint(chapterIndex: number) {
        chapters[chapterIndex].hints.push({ id: nextHintId++, content: '' });
    }

    function removeHint(chapterIndex: number, hintIndex: number) {
        chapters[chapterIndex].hints.splice(hintIndex, 1);
    }
</script>

<div class="container mx-auto max-w-4xl p-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Create Escape Room</h1>
        <div class="flex gap-2">
            <button 
                type="button" 
                class="btn btn-secondary btn-sm"
                onclick={loadSampleData}
            >
                Load Sample Data
            </button>
            {#if isPremium}
                <button 
                    type="button" 
                    class="btn btn-primary btn-sm"
                    onclick={openPromptModal}
                >
                    ✨ Generate with AI
                </button>
            {:else}
                <div class="tooltip tooltip-left" data-tip="Upgrade to Premium to unlock AI generation">
                    <button 
                        type="button" 
                        class="btn btn-primary btn-sm btn-disabled"
                        disabled
                    >
                        ✨ Generate with AI
                    </button>
                </div>
            {/if}
        </div>
    </div>

    {#if form?.success}
        <div class="alert alert-success mb-6">
            <span>Escape room created successfully!</span>
        </div>
    {/if}

    {#if form?.error}
        <div class="alert alert-error mb-6">
            <span>{form.error}</span>
        </div>
    {/if}

    <form method="POST" use:enhance class="space-y-6" bind:this={formElement}>
        <input type="hidden" name="wantsPremiumVoice" value={wantsPremiumVoice ? 'true' : 'false'} />
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="card-title">Basic Information</h2>
                
                <div class="form-control w-full">
                    <label class="label" for="title">
                        <span class="label-text">Title</span>
                    </label>
                    <input 
                        type="text" 
                        id="title"
                        name="title" 
                        bind:value={title}
                        placeholder="Enter escape room title" 
                        class="input input-bordered w-full" 
                        required
                    />
                </div>

                <div class="form-control w-full">
                    <label class="label" for="description">
                        <span class="label-text">Description</span>
                    </label>
                    <textarea 
                        id="description"
                        name="description" 
                        bind:value={description}
                        placeholder="Enter escape room description" 
                        class="textarea textarea-bordered w-full h-24"
                    ></textarea>
                </div>

                <div class="form-control w-full">
                    <label class="label" for="theme">
                        <span class="label-text">Theme</span>
                    </label>
                    <select 
                        id="theme"
                        name="theme" 
                        bind:value={theme}
                        class="select select-bordered w-full"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="mytheme">My Theme</option>
                        <option value="hacker">Hacker</option>
                        <option value="treasure">Treasure</option>

                    </select>
                </div>
            </div>
        </div>

        <input type="hidden" name="chaptersData" value={JSON.stringify(chapters)} />

        <div class="space-y-4">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Chapters</h2>
                
            </div>

            {#each chapters as chapter, chapterIndex (chapter.id)}
                <div class="card bg-base-200 shadow-xl">
                    <div class="card-body">
                        <div class="flex justify-between items-center">
                            <h3 class="card-title">Chapter {chapterIndex + 1}</h3>
                            <button 
                                type="button" 
                                class="btn btn-error btn-sm"
                                onclick={() => removeChapter(chapterIndex)}
                            >
                                Remove
                            </button>
                        </div>

                        <div class="form-control w-full">
                            <label class="label" for="chapter-title-{chapterIndex}">
                                <span class="label-text">Chapter Title</span>
                            </label>
                            <input 
                                type="text" 
                                id="chapter-title-{chapterIndex}"
                                bind:value={chapter.title}
                                placeholder="Enter chapter title" 
                                class="input input-bordered w-full" 
                                required
                            />
                        </div>

                        <div class="form-control w-full">
                            <label class="label" for="chapter-content-{chapterIndex}">
                                <span class="label-text">Content</span>
                            </label>
                            <textarea 
                                id="chapter-content-{chapterIndex}"
                                bind:value={chapter.content}
                                placeholder="Enter the chapter content and clues" 
                                class="textarea textarea-bordered w-full h-32"
                                required
                            ></textarea>
                        </div>

                        <div class="form-control w-full">
                            <label class="label" for="chapter-answer-{chapterIndex}">
                                <span class="label-text">Answer</span>
                            </label>
                            <input 
                                type="text" 
                                id="chapter-answer-{chapterIndex}"
                                bind:value={chapter.answer}
                                placeholder="Enter the correct answer" 
                                class="input input-bordered w-full" 
                                required
                            />
                        </div>

                        <div class="divider">Hints</div>

                        <div class="space-y-3">
                            {#each chapter.hints as hint, hintIndex (hint.id)}
                                <div class="flex gap-2 items-start">
                                    <div class="form-control flex-1">
                                        <label class="label" for="hint-{chapterIndex}-{hintIndex}">
                                            <span class="label-text">Hint {hintIndex + 1}</span>
                                        </label>
                                        <textarea 
                                            id="hint-{chapterIndex}-{hintIndex}"
                                            bind:value={hint.content}
                                            placeholder="Enter hint content" 
                                            class="textarea textarea-bordered w-full"
                                            required
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="button" 
                                        class="btn btn-error btn-sm mt-9"
                                        onclick={() => removeHint(chapterIndex, hintIndex)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            {/each}

                            <button 
                                type="button" 
                                class="btn btn-outline btn-sm"
                                onclick={() => addHint(chapterIndex)}
                            >
                                + Add Hint
                            </button>
                        </div>
                    </div>
                </div>
            {/each}

            {#if chapters.length === 0}
                <div class="text-center py-8 text-base-content/60">
                    <p>No chapters added yet. Click "Add Chapter" to get started.</p>
                </div>
            {/if}
        </div>
        <div class="flex justify-between items-center">
            <button 
                type="button" 
                class="btn btn-primary"
                onclick={addChapter}
            >
                + Add Chapter
            </button>

            <button type="button" class="btn btn-primary btn-lg" onclick={handleCreateClick}>
                Create Escape Room
            </button>
        </div>
    </form>
</div>

<!-- AI Generation Modal -->
{#if showPromptModal}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Generate Escape Room with AI</h3>
            
            <div class="form-control w-full">
                <label class="label" for="ai-prompt">
                    <span class="label-text">Describe your escape room</span>
                </label>
                <textarea 
                    id="ai-prompt"
                    bind:value={aiPrompt}
                    placeholder="E.g., 'A pirate-themed escape room with treasure hunting puzzles' or 'A cyberpunk hacking challenge set in a dystopian future'"
                    class="textarea textarea-bordered w-full h-24"
                    disabled={isGenerating}
                ></textarea>
            </div>

            {#if generateError}
                <div class="alert alert-error mt-4">
                    <span>{generateError}</span>
                </div>
            {/if}

            <div class="modal-action">
                <button 
                    type="button" 
                    class="btn btn-ghost"
                    onclick={closePromptModal}
                    disabled={isGenerating}
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    class="btn btn-primary"
                    onclick={generateWithAI}
                    disabled={isGenerating}
                >
                    {#if isGenerating}
                        <span class="loading loading-spinner"></span>
                        Generating...
                    {:else}
                        Generate
                    {/if}
                </button>
            </div>
        </div>
        <div class="modal-backdrop" onclick={closePromptModal} onkeydown={(e) => e.key === 'Enter' && closePromptModal()} role="button" tabindex="0"></div>
    </div>
{/if}

<!-- Premium Voice Modal -->
{#if showPremiumVoiceModal}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">🎙️ Premium Voice</h3>
            
            <p class="text-base-content/80 mb-4">
                Would you like to add enhanced voice narration to your escape room chapters? Generating the room will take a bit longer, but vastly improves narration quality.
            </p>

            {#if !isPremium}
                <div class="alert alert-info mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Premium Voice is available for Premium users only.</span>
                </div>
            {/if}

            <div class="modal-action">
                <button 
                    type="button" 
                    class="btn btn-ghost"
                    onclick={closePremiumVoiceModal}
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    class="btn btn-outline"
                    onclick={() => submitWithVoice(false)}
                >
                    No, skip voice
                </button>
                {#if isPremium}
                    <button 
                        type="button" 
                        class="btn btn-primary"
                        onclick={() => submitWithVoice(true)}
                    >
                        ✨ Yes, add voice
                    </button>
                {:else}
                    <div class="tooltip" data-tip="Upgrade to Premium to unlock voice narration">
                        <button 
                            type="button" 
                            class="btn btn-primary btn-disabled"
                            disabled
                        >
                            ✨ Yes, add voice
                        </button>
                    </div>
                {/if}
            </div>
        </div>
        <div class="modal-backdrop" onclick={closePremiumVoiceModal} onkeydown={(e) => e.key === 'Enter' && closePremiumVoiceModal()} role="button" tabindex="0"></div>
    </div>
{/if}