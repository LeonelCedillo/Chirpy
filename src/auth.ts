import argon2 from "argon2";
import jwt  from "jsonwebtoken"; 
import crypto from "crypto";
import { Request } from "express";
import { type JwtPayload } from "jsonwebtoken";
import { BadRequestError, UserNotAuthenticatedError } from "./api/errors.js";


const TOKEN_ISSUER = "chirpy";


// Hash the password using the argon2.hash function.
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
}


// Use the argon2.verify function to compare the password in the HTTP request with the password that is stored in the database.
export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    if (!password) return false;
    try {
        return await argon2.verify(hash, password);
    } catch {
        return false;
    }
}


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;


export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const payload = {
        iss: TOKEN_ISSUER, // issuer of the token
        sub: userID, // subject of the token
        iat: issuedAt, // time the token was issued (in seconds)
        exp: expiresAt, // time the token expires
    } satisfies payload;
    const token = jwt.sign(payload, secret, { algorithm: "HS256"});
    return token;
}


export function validateJWT(tokenString: string, secret: string): string {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new UserNotAuthenticatedError("Invalid token");
    }
    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UserNotAuthenticatedError("Invalid issuer");
    }
    if (!decoded.sub) {
        throw new UserNotAuthenticatedError("No user ID in token");
    }
    const userId = decoded.sub;
    return userId;
}


export function getBearerToken(req: Request): string {
    // Authorization: Bearer <token>
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new UserNotAuthenticatedError("Missing autherization header");
    }
    return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string): string {
    // Expected format: "Bearer TOKEN_STRING"
    const splitAuth = header.split(" ");
    if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
        throw new BadRequestError("Malformed authorization header")
    }
    const token = splitAuth[1];
    return token
}


// Generate a random 256-bit (32-byte) hex-encoded string
export function makeRefreshToken (): string {
    return crypto.randomBytes(32).toString("hex");
}