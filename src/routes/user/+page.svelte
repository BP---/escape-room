<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">My Escape Rooms</h1>
        <p class="text-gray-600">Welcome back, {data.user.name}!</p>
    </div>

    {#if data.escapeRooms.length === 0}
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body text-center">
                <h2 class="card-title justify-center">No Escape Rooms Yet</h2>
                <p>You haven't created any escape rooms yet. Start creating one now!</p>
                <div class="card-actions justify-center mt-4">
                    <a href="/create" class="btn btn-primary">Create Escape Room</a>
                </div>
            </div>
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2">
            {#each data.escapeRooms as room}
                <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                    <div class="card-body">
                        <h2 class="card-title">{room.title}</h2>
                        {#if room.description}
                            <p class="text-sm text-gray-600">{room.description}</p>
                        {/if}
                        <div class="text-xs text-gray-500 mt-2">
                            Created: {new Date(room.createdAt).toLocaleDateString()}
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <a href="/escape-room/{room.id}" class="btn btn-primary btn-sm">
                                View Room
                            </a>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="mt-8 text-center">
            <a href="/create" class="btn btn-outline">Create Another Escape Room</a>
        </div>
    {/if}
</div>