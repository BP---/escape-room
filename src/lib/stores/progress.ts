import { browser } from '$app/environment';

const STORAGE_KEY = 'escape-room-progress';

export interface ChapterProgress {
    chapterNumber: number;
    answer: string;
}

export interface RoomProgress {
    [chapterNumber: number]: string; // chapterNumber -> answer
}

export interface AllProgress {
    [roomId: string]: RoomProgress;
}

/**
 * Get all progress from localStorage
 */
export function getAllProgress(): AllProgress {
    if (!browser) return {};
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Get progress for a specific room
 */
export function getRoomProgress(roomId: string): RoomProgress {
    const all = getAllProgress();
    return all[roomId] || {};
}

/**
 * Save an answer for a specific chapter in a room
 */
export function saveChapterAnswer(roomId: string, chapterNumber: number, answer: string): void {
    if (!browser) return;
    
    const all = getAllProgress();
    if (!all[roomId]) {
        all[roomId] = {};
    }
    all[roomId][chapterNumber] = answer;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Get the answer for a specific chapter
 */
export function getChapterAnswer(roomId: string, chapterNumber: number): string | null {
    const roomProgress = getRoomProgress(roomId);
    return roomProgress[chapterNumber] || null;
}

/**
 * Clear progress for a specific room
 */
export function clearRoomProgress(roomId: string): void {
    if (!browser) return;
    
    const all = getAllProgress();
    delete all[roomId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Clear all progress
 */
export function clearAllProgress(): void {
    if (!browser) return;
    localStorage.removeItem(STORAGE_KEY);
}
