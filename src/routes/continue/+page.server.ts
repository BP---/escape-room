import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { escapeRoom } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';

export const load = (async ({ url }) => {
    const roomIdsParam = url.searchParams.get('roomIds');
    
    if (!roomIdsParam) {
        return { rooms: [] };
    }
    
    const roomIds = roomIdsParam.split(',').filter(id => id.length > 0);
    
    if (roomIds.length === 0) {
        return { rooms: [] };
    }
    
    const rooms = await db
        .select({
            id: escapeRoom.id,
            title: escapeRoom.title,
            description: escapeRoom.description,
            theme: escapeRoom.theme
        })
        .from(escapeRoom)
        .where(inArray(escapeRoom.id, roomIds));
    
    return { rooms };
}) satisfies PageServerLoad;