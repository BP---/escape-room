import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { escapeRoom } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load = (async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }
    
    const userEscapeRooms = await db.query.escapeRoom.findMany({
        where: eq(escapeRoom.userId, locals.user.id),
        orderBy: (escapeRoom, { desc }) => [desc(escapeRoom.createdAt)],
    });
    
    return {
        user: locals.user,
        escapeRooms: userEscapeRooms
    };
}) satisfies PageServerLoad;

export const actions = {
    delete: async ({ locals, request }) => {
        if (!locals.user) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const roomId = formData.get('roomId') as string;

        if (!roomId) {
            return fail(400, { error: 'Room ID is required' });
        }

        // Verify the room belongs to the user before deleting
        const room = await db.query.escapeRoom.findFirst({
            where: and(
                eq(escapeRoom.id, roomId),
                eq(escapeRoom.userId, locals.user.id)
            )
        });

        if (!room) {
            return fail(404, { error: 'Escape room not found or you do not have permission to delete it' });
        }

        // Delete the escape room (cascades to chapters and hints)
        await db.delete(escapeRoom).where(eq(escapeRoom.id, roomId));

        return { success: true };
    }
} satisfies Actions;