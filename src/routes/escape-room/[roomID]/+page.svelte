<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<svelte:head>
    <title>{data.room.title} - Escape Room</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-6">
    <div class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
            <h1 class="card-title text-3xl">{data.room.title}</h1>
            <p class="text-sm text-base-content/60">
                Created by {data.room.author}
            </p>

            {#if data.room.description}
                <div class="divider"></div>
                <p class="whitespace-pre-wrap">{data.room.description}</p>
            {/if}
        </div>
    </div>

    <h2 class="text-2xl font-bold mb-4">Chapters</h2>

    {#if data.chapters.length === 0}
        <div class="alert alert-info">
            <span>This escape room has no chapters yet.</span>
        </div>
    {:else}
        <div class="space-y-3">
            {#each data.chapters as chapter (chapter.id)}
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
            {/each}
        </div>

        <div class="mt-6">
            <a href="/escape-room/{data.room.id}/1" class="btn btn-primary btn-lg">
                Start Escape Room
            </a>
        </div>
    {/if}
</div>
