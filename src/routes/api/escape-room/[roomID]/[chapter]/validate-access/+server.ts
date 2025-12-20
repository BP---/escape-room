import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { escapeRoom, chapter } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

interface RoomProgress {
    [chapterNumber: number]: string;
}

export const POST: RequestHandler = async ({ params, request }) => {
    const roomId = params.roomID;
    const chapterNumber = parseInt(params.chapter, 10);

    if (isNaN(chapterNumber)) {
        return json({ error: 'Invalid chapter number', allowed: false }, { status: 400 });
    }

    // Chapter 1 is always accessible
    if (chapterNumber === 1) {
        return json({ allowed: true });
    }

    // Get the room and all chapters
    const room = await db.query.escapeRoom.findFirst({
        where: eq(escapeRoom.id, roomId),
        with: {
            chapters: {
                orderBy: [asc(chapter.chapterNumber)]
            }
        }
    });

    if (!room) {
        return json({ error: 'Room not found', allowed: false }, { status: 404 });
    }

    // Get progress from request body
    let progress: RoomProgress = {};
    try {
        const body = await request.json();
        progress = body.progress || {};
    } catch {
        progress = {};
    }

    // To access chapter N, user must have correctly answered chapters 1 through N-1
    for (let i = 1; i < chapterNumber; i++) {
        const ch = room.chapters.find(c => c.chapterNumber === i);
        if (!ch) {
            return json({ 
                error: `Chapter ${i} not found`, 
                allowed: false 
            }, { status: 404 });
        }

        const submittedAnswer = progress[i];
        if (!submittedAnswer || submittedAnswer.trim().toLowerCase() !== ch.answer.toLowerCase()) {
            return json({ 
                allowed: false, 
                reason: `You must correctly answer chapter ${i} first`,
                redirectTo: i
            });
        }
    }

    return json({ allowed: true });
};
