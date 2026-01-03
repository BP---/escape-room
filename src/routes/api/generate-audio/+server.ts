import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { chapter, escapeRoom } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateSpeech } from '$lib/server/elevenlabs';
import { uploadAudio } from '$lib/server/r2';
import crypto from 'crypto';

/**
 * Creates a SHA-256 hash of the given text.
 */
function hashText(text: string): string {
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export const POST: RequestHandler = async ({ request, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
        return error(401, { message: 'You must be logged in to generate audio' });
    }

    // Check if user is premium
    if (!locals.user.premium) {
        return error(403, { message: 'Audio generation is a premium feature. Please upgrade to access this functionality.' });
    }

    try {
        const { chapterId, text } = await request.json();

        // Validate input
        if (!chapterId || typeof chapterId !== 'string') {
            return error(400, { message: 'chapterId is required' });
        }

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return error(400, { message: 'text is required and must not be empty' });
        }

        // Fetch the chapter and verify ownership
        const chapterData = await db
            .select({
                chapter: chapter,
                escapeRoom: escapeRoom,
            })
            .from(chapter)
            .innerJoin(escapeRoom, eq(chapter.escapeRoomId, escapeRoom.id))
            .where(eq(chapter.id, chapterId))
            .get();

        if (!chapterData) {
            return error(404, { message: 'Chapter not found' });
        }

        // Verify the user owns this escape room
        if (chapterData.escapeRoom.userId !== locals.user.id) {
            return error(403, { message: 'You do not have permission to modify this chapter' });
        }

        // Create hash of the input text
        const currentHash = hashText(text.trim());

        // Idempotency check: if audio already exists for this exact text, return existing URL
        if (
            chapterData.chapter.audioTextHash === currentHash &&
            chapterData.chapter.audioUrl
        ) {
            return json({
                success: true,
                audioUrl: chapterData.chapter.audioUrl,
                cached: true,
                message: 'Audio already exists for this text',
            });
        }

        // Generate speech using ElevenLabs
        const audioArrayBuffer = await generateSpeech(text.trim());
        const audioBuffer = Buffer.from(audioArrayBuffer);

        // Generate unique file key
        const timestamp = Date.now();
        const fileKey = `rooms/${chapterData.escapeRoom.id}/chapters/${chapterId}-${timestamp}.mp3`;

        // Upload to R2
        const audioUrl = await uploadAudio(audioBuffer, fileKey, 'audio/mpeg');

        // Update database with new audio URL and hash
        await db
            .update(chapter)
            .set({
                audioUrl,
                audioTextHash: currentHash,
            })
            .where(eq(chapter.id, chapterId));

        return json({
            success: true,
            audioUrl,
            cached: false,
            message: 'Audio generated and uploaded successfully',
        });
    } catch (err) {
        console.error('Error generating audio:', err);

        if (err instanceof Error) {
            // Check for specific error types
            if (err.message.includes('ElevenLabs')) {
                return error(502, { message: 'Failed to generate speech. Please try again later.' });
            }
            if (err.message.includes('R2') || err.message.includes('S3')) {
                return error(502, { message: 'Failed to upload audio. Please try again later.' });
            }
        }

        return error(500, { message: 'An unexpected error occurred while generating audio' });
    }
};
