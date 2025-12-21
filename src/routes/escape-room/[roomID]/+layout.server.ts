import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { escapeRoom } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ params }) => {
    const room = await db.query.escapeRoom.findFirst({
        where: eq(escapeRoom.id, params.roomID),
        columns: {
            theme: true
        }
    });

    if (!room) {
        error(404, 'Escape room not found');
    }

    return {
        theme: room.theme || 'light'
    };
}) satisfies LayoutServerLoad;
