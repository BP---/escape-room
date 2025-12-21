import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { escapeRoom } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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