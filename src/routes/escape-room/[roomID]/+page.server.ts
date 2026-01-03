import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { escapeRoom, chapter } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

export const load = (async ({ params }) => {
    const room = await db.query.escapeRoom.findFirst({
        where: eq(escapeRoom.id, params.roomID),
        with: {
            chapters: {
                orderBy: [asc(chapter.chapterNumber)]
            },
            user: true
        }
    });

    if (!room) {
        error(404, 'Escape room not found');
    }

    return {
        room: {
            id: room.id,
            title: room.title,
            description: room.description,
            audioUrl: room.audioUrl,
            createdAt: room.createdAt,
            author: room.user.name
        },
        chapters: room.chapters.map(ch => ({
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title
        }))
    };
}) satisfies PageServerLoad;