<script lang="ts">
    import { signOut } from '$lib/auth-client';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let status = $state<'loading' | 'error'>('loading');

    onMount(async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        goto('/');
                    }
                }
            });
        } catch (e) {
            status = 'error';
        }
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body items-center text-center">
            {#if status === 'loading'}
                <span class="loading loading-spinner loading-lg"></span>
                <p class="mt-4">Signing out...</p>
            {:else}
                <div class="alert alert-error">
                    <span>Failed to sign out. Please try again.</span>
                </div>
                <a href="/" class="btn btn-neutral mt-4">Go Home</a>
            {/if}
        </div>
    </div>
</div>
