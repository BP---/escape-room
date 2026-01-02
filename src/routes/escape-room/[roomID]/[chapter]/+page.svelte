<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from '$app/forms';
    import { SvelteSet } from 'svelte/reactivity';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { getRoomProgress, saveChapterAnswer } from '$lib/stores/progress';
    import SpeechPlayer from '$lib/components/SpeechPlayer.svelte';

    let { data, form }: PageProps = $props();

    let revealedHints = new SvelteSet<string>();
    let isValidating = $state(true);
    let accessDenied = $state(false);
    let redirectChapter = $state<number | null>(null);

    onMount(async () => {
        // Validate access to this chapter
        const progress = getRoomProgress(data.room.id);
        
        try {
            const response = await fetch(`/api/escape-room/${data.room.id}/${data.chapter.chapterNumber}/validate-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (!result.allowed) {
                    accessDenied = true;
                    redirectChapter = result.redirectTo || 1;
                }
            }
        } catch (error) {
            console.error('Failed to validate access:', error);
        } finally {
            isValidating = false;
        }
    });

    // Save the answer to localStorage when form returns success and navigate
    $effect(() => {
        if (form?.correct && form?.answer) {
            saveChapterAnswer(data.room.id, data.chapter.chapterNumber, form.answer);
            
            // Navigate to next chapter if not completed
            if (!form.completed && form.nextChapter) {
                goto(`/escape-room/${data.room.id}/${form.nextChapter}`);
            }
        }
    });

    function revealHint(hintId: string) {
        revealedHints.add(hintId);
    }

    function goToAllowedChapter() {
        if (redirectChapter) {
            goto(`/escape-room/${data.room.id}/${redirectChapter}`);
        }
    }
</script>

<svelte:head>
    <title>{data.chapter.title} - {data.room.title}</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-6">
    {#if isValidating}
        <div class="flex flex-col items-center justify-center py-16">
            <span class="loading loading-spinner loading-lg"></span>
            <p class="mt-4 text-base-content/60">Validating access...</p>
        </div>
    {:else if accessDenied}
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-warning mb-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <h2 class="card-title text-2xl">Chapter Locked</h2>
                <p class="text-base-content/70">
                    You need to complete the previous chapters first before accessing Chapter {data.chapter.chapterNumber}.
                </p>
                <div class="card-actions mt-4">
                    <button onclick={goToAllowedChapter} class="btn btn-primary">
                        Go to Chapter {redirectChapter}
                    </button>
                    <a href="/escape-room/{data.room.id}" class="btn btn-ghost">
                        Back to Overview
                    </a>
                </div>
            </div>
        </div>
    {:else}
    <div class="breadcrumbs text-sm mb-4">
        <ul>
            <li><a href="/escape-room/{data.room.id}">{data.room.title}</a></li>
            <li>Chapter {data.chapter.chapterNumber}</li>
        </ul>
    </div>

    <div class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="card-title text-3xl">{data.chapter.title}</h1>
                    <p class="text-sm text-base-content/60">
                        Chapter {data.chapter.chapterNumber} of {data.totalChapters}
                    </p>
                </div>
                <SpeechPlayer text={data.chapter.content} />
            </div>
            
            <div class="divider"></div>
            
            <div class="prose max-w-none">
                <p class="whitespace-pre-wrap">{data.chapter.content}</p>
            </div>
        </div>
    </div>

    {#if data.hints.length > 0}
        <div class="card bg-base-200 shadow-xl mb-6">
            <div class="card-body">
                <h2 class="card-title text-xl">Hints</h2>
                <p class="text-sm text-base-content/60 mb-4">
                    Click on a hint to reveal it. Try to solve the puzzle before using hints!
                </p>

                <div class="space-y-3">
                    {#each data.hints as hint (hint.id)}
                        <div class="collapse collapse-arrow bg-base-100">
                            <input 
                                type="checkbox" 
                                checked={revealedHints.has(hint.id)}
                                onchange={() => revealHint(hint.id)}
                            />
                            <div class="collapse-title font-medium">
                                Hint {hint.hintNumber}
                                {#if !revealedHints.has(hint.id)}
                                    <span class="badge badge-warning ml-2">Hidden</span>
                                {/if}
                            </div>
                            <div class="collapse-content">
                                <p class="whitespace-pre-wrap">{hint.content}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}

    <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
            <h2 class="card-title text-xl">Submit Your Answer</h2>

            {#if form?.completed}
                <div class="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 class="font-bold">Congratulations!</h3>
                        <p>You've completed the entire escape room!</p>
                    </div>
                </div>
                <a href="/escape-room/{data.room.id}" class="btn btn-primary mt-4">
                    Back to Escape Room
                </a>
            {:else}
                {#if form?.error}
                    <div class="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{form.error}</span>
                    </div>
                {/if}

                <form method="POST" action="?/checkAnswer" use:enhance class="space-y-4">
                    <div class="form-control">
                        <label class="label" for="answer">
                            <span class="label-text">Your Answer</span>
                        </label>
                        <input 
                            type="text" 
                            id="answer"
                            name="answer" 
                            placeholder="Enter your answer" 
                            class="input input-bordered w-full"
                            required
                        />
                    </div>

                    <button type="submit" class="btn btn-primary">
                        Submit Answer
                    </button>
                </form>
            {/if}
        </div>
    </div>

    <div class="flex justify-center mt-6">
        <a href="/escape-room/{data.room.id}" class="btn btn-ghost">
            Back to Overview
        </a>
    </div>
    {/if}
</div>