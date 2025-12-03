import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";
import { NewUser } from "src/db/schema.js";
import { BadRequestError } from "./errors.js";
import { responseWithJSON } from "./json.js";


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



