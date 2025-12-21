<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';

    let { data }: { data: PageData } = $props();
    
    let deleteModal = $state<{ open: boolean; roomId: string; roomTitle: string }>({
        open: false,
        roomId: '',
        roomTitle: ''
    });
    
    function openDeleteModal(roomId: string, roomTitle: string) {
        deleteModal = { open: true, roomId, roomTitle };
    }
    
    function closeDeleteModal() {
        deleteModal = { open: false, roomId: '', roomTitle: '' };
    }
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
                            <button 
                                type="button"
                                class="btn btn-error btn-sm"
                                onclick={() => openDeleteModal(room.id, room.title)}
                            >
                                Delete
                            </button>
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

<!-- Delete Confirmation Modal -->
<dialog class="modal" class:modal-open={deleteModal.open}>
    <div class="modal-box">
        <h3 class="font-bold text-lg">Confirm Delete</h3>
        <p class="py-4">
            Are you sure you want to delete <strong>{deleteModal.roomTitle}</strong>? 
            This action cannot be undone and will delete all chapters and hints associated with this escape room.
        </p>
        <div class="modal-action">
            <form method="POST" action="?/delete" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') {
                        closeDeleteModal();
                        // Reload the page to show updated list
                        window.location.reload();
                    }
                };
            }}>
                <input type="hidden" name="roomId" value={deleteModal.roomId} />
                <button type="submit" class="btn btn-error">Delete</button>
            </form>
            <button type="button" class="btn" onclick={closeDeleteModal}>Cancel</button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button type="button" onclick={closeDeleteModal}>close</button>
    </form>
</dialog>