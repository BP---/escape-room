<script lang="ts">
    import type { PageProps } from './$types';
    import { getAllProgress } from '$lib/stores/progress';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let { data }: PageProps = $props();
    
    let roomsWithProgress = $derived(data.rooms);
    let progressData: Record<string, Record<number, string>> = {};
    
    onMount(() => {
        // Get progress from localStorage
        progressData = getAllProgress();
        const roomIds = Object.keys(progressData);
        
        if (roomIds.length > 0) {
            // Reload the page with roomIds as query params to fetch room details
            const currentUrl = new URL(window.location.href);
            if (!currentUrl.searchParams.get('roomIds')) {
                currentUrl.searchParams.set('roomIds', roomIds.join(','));
                goto(currentUrl.toString(), { replaceState: true });
            }
        }
    });
    
    function getCompletedChapters(roomId: string): number {
        return Object.keys(progressData[roomId] || {}).length;
    }
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Continue Your Adventure</h1>
    
    {#if roomsWithProgress.length === 0}
        <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>You haven't started any escape rooms yet. <a href="/" class="link">Go back to to landing</a></span>
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each roomsWithProgress as room}
                <div class="card bg-base-200 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title">{room.title}</h2>
                        {#if room.description}
                            <p class="text-sm opacity-70">{room.description}</p>
                        {/if}
                        <div class="badge badge-primary">
                            {getCompletedChapters(room.id)} chapter{getCompletedChapters(room.id) !== 1 ? 's' : ''} completed
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <a href="/escape-room/{room.id}" class="btn btn-primary">Continue</a>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>