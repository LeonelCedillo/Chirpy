import type { Request, Response } from "express";
import { config } from "../config.js";
import { NewUser } from "src/db/schema.js";
import { hashPassword } from "../auth.js";
import { responseWithJSON } from "./json.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";



export type UserResponse = Omit<NewUser, "hashedPassword">;


export async function handlerUsersCreate(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    }
    const params: parameters = req.body;
    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const hashedPassword = await hashPassword(params.password);

    const user = await createUser({ 
        email: params.email, 
        hashedPassword 
    } satisfies NewUser);
    if (!user) {
        throw new Error("Could not create user");
    }

    responseWithJSON(res, 201, {
        id: user.id, 
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}



export async function handlerUsersUpdate(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    }
    const accessToken = getBearerToken(req);
    const userId = validateJWT(accessToken, config.jwt.secret);
    const params: parameters = req.body;
    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }
    
    const hashedPassword = await hashPassword(params.password);
    
    const user = await updateUser(userId, params.email, hashedPassword);
    if (!user) {
        throw new Error("Could not update user");
    }

    responseWithJSON(res, 200, {
        id: user.id, 
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}



