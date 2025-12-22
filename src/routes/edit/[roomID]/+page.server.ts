import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { escapeRoom, chapter, hint } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

function generateId(): string {
    return crypto.randomBytes(12).toString('hex');
}

export const load = (async ({ locals, params }) => {
    if (!locals.user) {
        redirect(303, '/login');
    }

    const roomId = params.roomID;

    // Load the escape room with all chapters and hints
    const room = await db.query.escapeRoom.findFirst({
        where: eq(escapeRoom.id, roomId),
        with: {
            chapters: {
                with: {
                    hints: true
                },
                orderBy: (chapters, { asc }) => [asc(chapters.chapterNumber)]
            }
        }
    });

    if (!room) {
        redirect(303, '/user');
    }

    // Check if the user is the creator
    if (room.userId !== locals.user.id) {
        redirect(303, '/user');
    }

    return {
        room,
        user: locals.user
    };
}) satisfies PageServerLoad;

interface ChapterData {
    id?: string; // Existing chapter ID (if updating)
    chapterNumber: number;
    title: string;
    content: string;
    answer: string;
    hints: { id?: string; hintNumber: number; content: string }[];
}

export const actions = {
    default: async ({ request, locals, params }) => {
        if (!locals.user) {
            return fail(401, { error: 'You must be logged in to edit an escape room', success: false });
        }

        const roomId = params.roomID;

        // Verify ownership
        const room = await db.query.escapeRoom.findFirst({
            where: eq(escapeRoom.id, roomId)
        });

        if (!room) {
            return fail(404, { error: 'Escape room not found', success: false });
        }

        if (room.userId !== locals.user.id) {
            return fail(403, { error: 'You do not have permission to edit this escape room', success: false });
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const theme = formData.get('theme') as string;
        const chaptersData = formData.get('chaptersData') as string;

        if (!title || title.trim() === '') {
            return fail(400, { error: 'Title is required', success: false });
        }

        let chapters: ChapterData[] = [];
        try {
            chapters = JSON.parse(chaptersData || '[]');
        } catch {
            return fail(400, { error: 'Invalid chapters data', success: false });
        }

        if (chapters.length === 0) {
            return fail(400, { error: 'At least one chapter is required', success: false });
        }

        for (let i = 0; i < chapters.length; i++) {
            const ch = chapters[i];
            if (!ch.title || ch.title.trim() === '') {
                return fail(400, { error: `Chapter ${i + 1} title is required`, success: false });
            }
            if (!ch.content || ch.content.trim() === '') {
                return fail(400, { error: `Chapter ${i + 1} content is required`, success: false });
            }
            if (!ch.answer || ch.answer.trim() === '') {
                return fail(400, { error: `Chapter ${i + 1} answer is required`, success: false });
            }
        }

        try {
            // Update escape room basic info
            await db.update(escapeRoom)
                .set({
                    title: title.trim(),
                    description: description?.trim() || null,
                    theme: theme || 'light',
                })
                .where(eq(escapeRoom.id, roomId));

            // Get existing chapters to determine what to delete
            const existingChapters = await db.query.chapter.findMany({
                where: eq(chapter.escapeRoomId, roomId),
                with: {
                    hints: true
                }
            });

            const existingChapterIds = existingChapters.map(ch => ch.id);
            const submittedChapterIds = chapters.map(ch => ch.id).filter(id => id);

            // Delete chapters that are no longer in the form
            for (const existingChapter of existingChapters) {
                if (!submittedChapterIds.includes(existingChapter.id)) {
                    // Hints will be deleted automatically due to cascade
                    await db.delete(chapter).where(eq(chapter.id, existingChapter.id));
                }
            }

            // Update or insert chapters
            for (let i = 0; i < chapters.length; i++) {
                const ch = chapters[i];
                
                if (ch.id && existingChapterIds.includes(ch.id)) {
                    // Update existing chapter
                    await db.update(chapter)
                        .set({
                            chapterNumber: i + 1,
                            title: ch.title.trim(),
                            content: ch.content.trim(),
                            answer: ch.answer.trim().toLowerCase(),
                        })
                        .where(eq(chapter.id, ch.id));

                    // Get existing hints for this chapter
                    const existingHints = existingChapters.find(ec => ec.id === ch.id)?.hints || [];
                    const existingHintIds = existingHints.map(h => h.id);
                    const submittedHintIds = ch.hints.map(h => h.id).filter(id => id);

                    // Delete hints that are no longer in the form
                    for (const existingHint of existingHints) {
                        if (!submittedHintIds.includes(existingHint.id)) {
                            await db.delete(hint).where(eq(hint.id, existingHint.id));
                        }
                    }

                    // Update or insert hints
                    for (let j = 0; j < ch.hints.length; j++) {
                        const h = ch.hints[j];
                        if (h.content && h.content.trim() !== '') {
                            if (h.id && existingHintIds.includes(h.id)) {
                                // Update existing hint
                                await db.update(hint)
                                    .set({
                                        hintNumber: j + 1,
                                        content: h.content.trim(),
                                    })
                                    .where(eq(hint.id, h.id));
                            } else {
                                // Insert new hint
                                await db.insert(hint).values({
                                    id: generateId(),
                                    hintNumber: j + 1,
                                    content: h.content.trim(),
                                    chapterId: ch.id
                                });
                            }
                        }
                    }
                } else {
                    // Insert new chapter
                    const chapterId = generateId();

                    await db.insert(chapter).values({
                        id: chapterId,
                        chapterNumber: i + 1,
                        title: ch.title.trim(),
                        content: ch.content.trim(),
                        answer: ch.answer.trim().toLowerCase(),
                        escapeRoomId: roomId
                    });

                    // Insert hints for new chapter
                    for (let j = 0; j < ch.hints.length; j++) {
                        const h = ch.hints[j];
                        if (h.content && h.content.trim() !== '') {
                            await db.insert(hint).values({
                                id: generateId(),
                                hintNumber: j + 1,
                                content: h.content.trim(),
                                chapterId: chapterId
                            });
                        }
                    }
                }
            }

            return redirect(303, `/escape-room/${roomId}`);
        } catch (error) {
            // Re-throw redirect errors
            if (error && typeof error === 'object' && 'status' in error) {
                throw error;
            }
            console.error('Error updating escape room:', error);
            return fail(500, { error: 'Failed to update escape room. Please try again.', success: false });
        }
    }
} satisfies Actions;