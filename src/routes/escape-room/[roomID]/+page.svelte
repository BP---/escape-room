<script lang="ts">
    import type { PageProps } from './$types';
    import { onMount } from 'svelte';
    import { getRoomProgress, clearRoomProgress } from '$lib/stores/progress';
    import SpeechPlayer from '$lib/components/SpeechPlayer.svelte';

    let { data }: PageProps = $props();

    let unlockedChapters = $state<number[]>([1]); // Chapter 1 is always unlocked
    let isLoading = $state(true);
    let showClearModal = $state(false);

    onMount(async () => {
        const progress = getRoomProgress(data.room.id);
        
        try {
            const response = await fetch(`/api/escape-room/${data.room.id}/validate-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress })
            });
            
            if (response.ok) {
                const result = await response.json();
                unlockedChapters = result.unlockedChapters;
            }
        } catch (error) {
            console.error('Failed to validate progress:', error);
        } finally {
            isLoading = false;
        }
    });

    function isChapterUnlocked(chapterNumber: number): boolean {
        return unlockedChapters.includes(chapterNumber);
    }

    function getFirstUnlockedChapter(): number {
        // Return the highest unlocked chapter (the one the user should be working on)
        return Math.max(...unlockedChapters);
    }

    function handleClearProgress(): void {
        clearRoomProgress(data.room.id);
        showClearModal = false;
        // Refresh the page to reset state
        window.location.reload();
    }
</script>

<svelte:head>
    <title>{data.room.title} - Escape Room</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-6">
    <div class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="card-title text-3xl">{data.room.title}</h1>
                    <p class="text-sm text-base-content/60">
                        Created by {data.room.author}
                    </p>
                </div>
                {#if data.room.description}
                    <SpeechPlayer text={data.room.description} />
                {/if}
            </div>

            {#if data.room.description}
                <div class="divider"></div>
                <p class="whitespace-pre-wrap">{data.room.description}</p>
            {/if}
        </div>
    </div>

    <h2 class="text-2xl font-bold mb-4">Chapters</h2>

    {#if isLoading}
        <div class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
    {:else if data.chapters.length === 0}
        <div class="alert alert-info">
            <span>This escape room has no chapters yet.</span>
        </div>
    {:else}
        <div class="space-y-3">
            {#each data.chapters as chapter (chapter.id)}
                {@const unlocked = isChapterUnlocked(chapter.chapterNumber)}
                {#if unlocked}
                    <a 
                        href="/escape-room/{data.room.id}/{chapter.chapterNumber}"
                        class="card bg-base-200 shadow hover:shadow-lg transition-shadow cursor-pointer block"
                    >
                        <div class="card-body py-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="badge badge-primary badge-lg">
                                        {chapter.chapterNumber}
                                    </div>
                                    <h3 class="card-title text-lg">{chapter.title}</h3>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>
                        </div>
                    </a>
                {:else}
                    <div class="card bg-base-300 shadow opacity-60 cursor-not-allowed">
                        <div class="card-body py-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div class="badge badge-neutral badge-lg">
                                        {chapter.chapterNumber}
                                    </div>
                                    <h3 class="card-title text-lg text-base-content/50">{chapter.title}</h3>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-base-content/50">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>

        <div class="mt-6 flex gap-3 flex-wrap">
            <a href="/escape-room/{data.room.id}/{getFirstUnlockedChapter()}" class="btn btn-primary btn-lg">
                {#if getFirstUnlockedChapter() === 1}
                    Start Escape Room
                {:else}
                    Continue from Chapter {getFirstUnlockedChapter()}
                {/if}
            </a>
            <button class="btn btn-outline btn-error btn-lg" onclick={() => showClearModal = true}>
                Clear Progress
            </button>
        </div>
    {/if}
</div>

<!-- Clear Progress Confirmation Modal -->
<dialog class="modal" class:modal-open={showClearModal}>
    <div class="modal-box">
        <h3 class="text-lg font-bold">Clear Progress?</h3>
        <p class="py-4">
            Are you sure you want to clear your progress for this escape room? 
            <span class="text-error font-semibold">This action cannot be undone.</span>
        </p>
        <p class="text-sm text-base-content/70">
            All your answers will be erased and you will start from Chapter 1.
        </p>
        <div class="modal-action">
            <button class="btn" onclick={() => showClearModal = false}>Cancel</button>
            <button class="btn btn-error" onclick={handleClearProgress}>Clear Progress</button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button onclick={() => showClearModal = false}>close</button>
    </form>
</dialog>
