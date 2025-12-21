import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { escapeRoom, chapter, hint } from '$lib/server/db/schema';
import crypto from 'crypto';

function generateId(): string {
    return crypto.randomBytes(12).toString('hex');
}

export const load = (async ({ locals }) => {
    if (!locals.user) {
        redirect(303, '/login');
    }

    return {
        user: locals.user
    };
}) satisfies PageServerLoad;

interface ChapterData {
    id: number;
    title: string;
    content: string;
    answer: string;
    hints: { id: number; content: string }[];
}

export const actions = {
    default: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'You must be logged in to create an escape room', success: false });
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
            const escapeRoomId = generateId();

            await db.insert(escapeRoom).values({
                id: escapeRoomId,
                title: title.trim(),
                description: description?.trim() || null,
                theme: theme || 'light',
                userId: locals.user.id
            });

            for (let i = 0; i < chapters.length; i++) {
                const ch = chapters[i];
                const chapterId = generateId();

                await db.insert(chapter).values({
                    id: chapterId,
                    chapterNumber: i + 1,
                    title: ch.title.trim(),
                    content: ch.content.trim(),
                    answer: ch.answer.trim().toLowerCase(),
                    escapeRoomId: escapeRoomId
                });

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

            return redirect(303, `/escape-room/${escapeRoomId}`);
        } catch (error) {
            // Re-throw redirect errors
            if (error && typeof error === 'object' && 'status' in error) {
                throw error;
            }
            console.error('Error creating escape room:', error);
            return fail(500, { error: 'Failed to create escape room. Please try again.', success: false });
        }
    }
} satisfies Actions;