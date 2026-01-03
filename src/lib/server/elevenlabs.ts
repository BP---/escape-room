import { env } from '$env/dynamic/private';

// Default voice ID - you can change this or make it configurable
const DEFAULT_VOICE_ID = 'vY7jMt4Cbubxeq9O5Qsj'; 

/**
 * Generates speech audio from text using ElevenLabs API.
 * @param text - The text to convert to speech
 * @param voiceId - Optional voice ID (defaults to Sarah)
 * @returns ArrayBuffer containing the audio data
 */
export async function generateSpeech(
    text: string,
    voiceId: string = DEFAULT_VOICE_ID
): Promise<ArrayBuffer> {
    const apiKey = env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY is not configured.');
    }

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    return response.arrayBuffer();
}
