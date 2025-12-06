import { db } from "../index.js";
import { eq, isNull, and, gt } from "drizzle-orm";
import { refreshTokens } from "../schema.js";
import { config } from "../../config.js";
import { users } from "../schema.js";


export async function saveRefreshToken(userID: string, token: string): Promise <boolean> {
  const result = await db
    .insert(refreshTokens)
    .values({
      userId: userID,
      token: token,
      expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
      revokedAt: null
    })
    .returning();
  return result.length > 0;
}


export async function revokeRefreshToken(token: string) {
  const result = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();
  if (result.length === 0) {
    throw new Error("Couldn't revoke token");
  }
}


export async function getUserFromRefreshToken(token: string) {
  const [result] = await db
    .select({ 
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt 
    })
    .from(users)
    .innerJoin(
      refreshTokens, 
      eq(users.id, refreshTokens.userId)
    )
    .where(
      and(
        eq(refreshTokens.token, token), 
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return result;
}