<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from '$app/forms';

    let { data, form }: PageProps = $props();

    interface Hint {
        id?: string;
        dbId: number;
        content: string;
    }

    interface Chapter {
        id?: string;
        dbId: number;
        title: string;
        content: string;
        answer: string;
        hints: Hint[];
    }

    // For an edit form, we want to capture the initial values, not track changes
    // This is the intended behavior for form initialization
    let title = $state((() => data.room.title)());
    let description = $state((() => data.room.description || '')());
    let theme = $state((() => data.room.theme)());
    
    // Map loaded data to the format needed by the form
    let chapters = $state<Chapter[]>(
        (() => data.room.chapters.map((ch) => ({
            id: ch.id,
            dbId: ch.chapterNumber,
            title: ch.title,
            content: ch.content,
            answer: ch.answer,
            hints: ch.hints.map((h) => ({
                id: h.id,
                dbId: h.hintNumber,
                content: h.content
            }))
        })))()
    );
    
    let nextChapterId = $state(Math.max(...chapters.map(ch => ch.dbId), 0) + 1);
    let nextHintId = $state(
        Math.max(
            ...chapters.flatMap(ch => ch.hints.map(h => h.dbId)),
            0
        ) + 1
    );

    function addChapter() {
        chapters.push({
            dbId: nextChapterId++,
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
        chapters[chapterIndex].hints.push({ dbId: nextHintId++, content: '' });
    }

    function removeHint(chapterIndex: number, hintIndex: number) {
        chapters[chapterIndex].hints.splice(hintIndex, 1);
    }

    // Prepare data for submission - include IDs for existing items
    $effect(() => {
        // This reactive statement is just for reference
        // The actual serialization happens in the form
    });
</script>

<div class="container mx-auto max-w-4xl p-6">
    <h1 class="text-3xl font-bold mb-6">Edit Escape Room</h1>

    {#if form?.success}
        <div class="alert alert-success mb-6">
            <span>Escape room updated successfully!</span>
        </div>
    {/if}

    {#if form?.error}
        <div class="alert alert-error mb-6">
            <span>{form.error}</span>
        </div>
    {/if}

    <form method="POST" use:enhance class="space-y-6">
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

            {#each chapters as chapter, chapterIndex (chapter.dbId)}
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
                            {#each chapter.hints as hint, hintIndex (hint.dbId)}
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
        </div>

        <div class="flex justify-end gap-4">
            <a href="/escape-room/{data.room.id}" class="btn btn-outline btn-lg">
                Cancel
            </a>
            <button type="submit" class="btn btn-primary btn-lg">
                Update Escape Room
            </button>
        </div>
    </form>
</div>