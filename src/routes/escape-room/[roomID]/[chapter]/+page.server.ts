import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { escapeRoom, chapter, hint } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const load = (async ({ params }) => {
    const chapterNumber = parseInt(params.chapter, 10);
    
    if (isNaN(chapterNumber)) {
        error(400, 'Invalid chapter number');
    }

    const room = await db.query.escapeRoom.findFirst({
        where: eq(escapeRoom.id, params.roomID),
        with: {
            chapters: {
                orderBy: [asc(chapter.chapterNumber)]
            }
        }
    });

    if (!room) {
        error(404, 'Escape room not found');
    }

    const currentChapter = room.chapters.find(ch => ch.chapterNumber === chapterNumber);
    
    if (!currentChapter) {
        error(404, 'Chapter not found');
    }

    const chapterHints = await db.query.hint.findMany({
        where: eq(hint.chapterId, currentChapter.id),
        orderBy: [asc(hint.hintNumber)]
    });

    return {
        room: {
            id: room.id,
            title: room.title
        },
        chapter: {
            id: currentChapter.id,
            chapterNumber: currentChapter.chapterNumber,
            title: currentChapter.title,
            content: currentChapter.content
        },
        hints: chapterHints.map(h => ({
            id: h.id,
            hintNumber: h.hintNumber,
            content: h.content
        })),
        totalChapters: room.chapters.length
    };
}) satisfies PageServerLoad;

export const actions = {
    checkAnswer: async ({ request, params }) => {
        const chapterNumber = parseInt(params.chapter, 10);
        
        if (isNaN(chapterNumber)) {
            return fail(400, { error: 'Invalid chapter number', correct: false });
        }

        const formData = await request.formData();
        const answer = formData.get('answer') as string;

        if (!answer || answer.trim() === '') {
            return fail(400, { error: 'Please enter an answer', correct: false });
        }

        const currentChapter = await db.query.chapter.findFirst({
            where: and(
                eq(chapter.escapeRoomId, params.roomID),
                eq(chapter.chapterNumber, chapterNumber)
            )
        });

        if (!currentChapter) {
            return fail(404, { error: 'Chapter not found', correct: false });
        }

        const isCorrect = answer.trim().toLowerCase() === currentChapter.answer.toLowerCase();

        if (isCorrect) {
            // Get total chapters to check if this is the last one
            const allChapters = await db.query.chapter.findMany({
                where: eq(chapter.escapeRoomId, params.roomID)
            });

            if (chapterNumber >= allChapters.length) {
                // Last chapter completed
                return { correct: true, completed: true };
            }

            // Redirect to next chapter
            redirect(303, `/escape-room/${params.roomID}/${chapterNumber + 1}`);
        }

        return fail(400, { error: 'Incorrect answer. Try again!', correct: false });
    }
} satisfies Actions;