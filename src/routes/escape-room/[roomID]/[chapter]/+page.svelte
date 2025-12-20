<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from '$app/forms';
    import { SvelteSet } from 'svelte/reactivity';

    let { data, form }: PageProps = $props();

    let revealedHints = $state(new SvelteSet<string>());

    function revealHint(hintId: string) {
        revealedHints.add(hintId);
    }
</script>

<svelte:head>
    <title>{data.chapter.title} - {data.room.title}</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-6">
    <div class="breadcrumbs text-sm mb-4">
        <ul>
            <li><a href="/escape-room/{data.room.id}">{data.room.title}</a></li>
            <li>Chapter {data.chapter.chapterNumber}</li>
        </ul>
    </div>

    <div class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
            <h1 class="card-title text-3xl">{data.chapter.title}</h1>
            <p class="text-sm text-base-content/60">
                Chapter {data.chapter.chapterNumber} of {data.totalChapters}
            </p>
            
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

    <div class="flex justify-between mt-6">
        {#if data.chapter.chapterNumber > 1}
            <a href="/escape-room/{data.room.id}/{data.chapter.chapterNumber - 1}" class="btn btn-outline">
                ← Previous Chapter
            </a>
        {:else}
            <div></div>
        {/if}

        <a href="/escape-room/{data.room.id}" class="btn btn-ghost">
            Back to Overview
        </a>
    </div>
</div>