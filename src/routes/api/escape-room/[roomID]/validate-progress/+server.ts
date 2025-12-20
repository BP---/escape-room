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
        return json({ error: 'Room not found' }, { status: 404 });
    }

    // Get progress from request body
    let progress: RoomProgress = {};
    try {
        const body = await request.json();
        progress = body.progress || {};
    } catch {
        progress = {};
    }

    // Validate progress and determine unlocked chapters
    const unlockedChapters: number[] = [];
    
    // Chapter 1 is always unlocked
    if (room.chapters.length > 0) {
        unlockedChapters.push(1);
    }

    // Check each chapter's answer to unlock the next one
    for (const ch of room.chapters) {
        const submittedAnswer = progress[ch.chapterNumber];
        
        if (submittedAnswer && submittedAnswer.trim().toLowerCase() === ch.answer.toLowerCase()) {
            // This chapter is correctly answered, unlock the next one
            const nextChapterNumber = ch.chapterNumber + 1;
            if (nextChapterNumber <= room.chapters.length && !unlockedChapters.includes(nextChapterNumber)) {
                unlockedChapters.push(nextChapterNumber);
            }
        }
    }

    return json({
        unlockedChapters: unlockedChapters.sort((a, b) => a - b),
        totalChapters: room.chapters.length
    });
};
