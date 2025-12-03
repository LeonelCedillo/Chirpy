import argon2 from "argon2";

// Hash the password using the argon2.hash function.
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
}


// Use the argon2.verify function to compare the password in the HTTP request with the password that is stored in the database.
export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
}
