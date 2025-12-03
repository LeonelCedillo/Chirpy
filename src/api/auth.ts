import type { Request, Response } from "express";
import { UserNotAuthenticatedError, BadRequestError } from "./errors.js";
import { UserResponse } from "./users.js";
import { getUserByEmail } from "../db/queries/users.js";
import { responseWithJSON } from "./json.js";
import { checkPasswordHash } from "../auth.js";

export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    }

    const params: parameters = req.body;
    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const user = await getUserByEmail(params.email);
    if (!user) {
        throw new UserNotAuthenticatedError("Invalid username or password");
    }

    const matching = await checkPasswordHash(params.password, user.hashedPassword);
    if (!matching) {
        throw new UserNotAuthenticatedError("Invalid username or password");
    }

    responseWithJSON(res, 200, {
        id: user.id, 
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    } satisfies UserResponse);
}