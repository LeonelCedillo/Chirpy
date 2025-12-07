import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { type NewUser, users } from "../schema.js";


export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}


export async function reset() {
  await db.delete(users);  
}


export async function getUserByEmail(email: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return result;
}


export async function updateUser(id: string, email: string, hashedPassword: string) {
  const [result] = await db
    .update(users)
    .set({ 
      email: email, 
      hashedPassword: hashedPassword 
    })
    .where(eq(users.id, id))
    .returning();
  return result;
}


export async function upgradeChirpyRed(userID: string) {
  const [result] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, userID))
    .returning();
  return result;
}