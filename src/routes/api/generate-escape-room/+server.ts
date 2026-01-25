import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '$env/dynamic/private';

const hintSchema = z.object({
    content: z.string().describe("The hint text to help solve the puzzle."),
});

const chapterSchema = z.object({
    title: z.string().describe("The title of the chapter."),
    content: z.string().describe("The main content of the chapter, including puzzles, riddles, or story elements."),
    answer: z.string().describe("The correct answer to the chapter's puzzle (lowercase, no extra spaces)."),
    hints: z.array(hintSchema).describe("Array of hints to help solve the chapter."),
});

const escapeRoomSchema = z.object({
    title: z.string().describe("The title of the escape room."),
    description: z.string().describe("A brief description of the escape room scenario."),
    theme: z.enum(["light", "dark", "mytheme", "hacker", "treasure"]).describe("The visual theme for the escape room."),
    chapters: z.array(chapterSchema).min(1).describe("Array of chapters/puzzles in the escape room."),
});

export const POST: RequestHandler = async ({ request, locals }) => {
    // Check if user is logged in
    if (!locals.user) {
        return error(401, { message: 'You must be logged in to generate an escape room' });
    }

    // Check if user has premium subscription
    if (!locals.user.premium) {
        return error(403, { message: 'AI generation is a premium feature. Please upgrade to access this functionality.' });
    }

    try {
        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return error(400, { message: 'Prompt is required' });
        }

        // Check for API key
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return error(500, { message: 'Gemini API key not configured' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const fullPrompt = `
Create an engaging escape room based on the following description: "${prompt}"

Generate a complete escape room with:
- A compelling title and description
- 3-5 chapters/puzzles that fit the theme
- Each chapter should have:
  - A descriptive title
  - Rich content that sets the scene and presents the puzzle
  - A clear answer (keep it simple, one word or short phrase)
  - 2-4 helpful hints that progressively guide players
  
Make the puzzles creative, varied (riddles, logic, wordplay, codes, etc.), and thematically consistent.
The difficulty should progress from easier to harder chapters.
`;

        const model = genAI.getGenerativeModel({
            model: env.GEMINI_MODEL as string,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        title: {
                            type: SchemaType.STRING,
                            description: "The title of the escape room.",
                        },
                        description: {
                            type: SchemaType.STRING,
                            description: "A brief description of the escape room scenario.",
                        },
                        theme: {
                            type: SchemaType.STRING,
                            format: "enum",
                            enum: ["light", "dark", "mytheme", "hacker", "treasure"],
                            description: "The visual theme for the escape room.",
                        },
                        chapters: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: {
                                        type: SchemaType.STRING,
                                        description: "The title of the chapter.",
                                    },
                                    content: {
                                        type: SchemaType.STRING,
                                        description: "The main content of the chapter, including puzzles, riddles, or story elements.",
                                    },
                                    answer: {
                                        type: SchemaType.STRING,
                                        description: "The correct answer to the chapter's puzzle (lowercase, no extra spaces).",
                                    },
                                    hints: {
                                        type: SchemaType.ARRAY,
                                        items: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                content: {
                                                    type: SchemaType.STRING,
                                                    description: "The hint text to help solve the puzzle.",
                                                },
                                            },
                                            required: ["content"],
                                        },
                                        description: "Array of hints to help solve the chapter.",
                                    },
                                },
                                required: ["title", "content", "answer", "hints"],
                            },
                            description: "Array of chapters/puzzles in the escape room.",
                        },
                    },
                    required: ["title", "description", "theme", "chapters"],
                },
            },
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        });

        const responseText = result.response.text();
        const escapeRoomData = escapeRoomSchema.parse(JSON.parse(responseText));

        return json(escapeRoomData);
    } catch (err) {
        console.error('Error generating escape room:', err);
        
        if (err instanceof z.ZodError) {
            return error(500, { message: 'Failed to parse AI response. Please try again.' });
        }
        
        return error(500, { message: 'Failed to generate escape room. Please try again.' });
    }
};
