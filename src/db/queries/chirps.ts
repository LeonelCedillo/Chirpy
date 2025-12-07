import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { type NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
    try {
        const [result] = await db.insert(chirps).values(chirp).returning();
        return result;
    } catch (err) {
        console.error("Insert failed:", err);
        return null;
    }
}


export async function getChirps() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(asc(chirps.createdAt));
    return result
}


export async function getChirp(id: string) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, id));
    return result;
}


export async function deleteChirp(id: string) {
    const [result] = await db
        .delete(chirps)
        .where(eq(chirps.id, id))
        .returning();
    return result;
}