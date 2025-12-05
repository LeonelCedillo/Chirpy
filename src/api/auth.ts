import type { Request, Response } from "express";
import { UserNotAuthenticatedError, BadRequestError } from "./errors.js";
import { UserResponse } from "./users.js";
import { getUserByEmail } from "../db/queries/users.js";
import { responseWithJSON } from "./json.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";


type LoginResponse = UserResponse & { token: string; };


export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
        expiresIn?: number;
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

    let duration = config.jwt.defaultDuration;
    if (params.expiresIn && (params.expiresIn < duration)) {
        duration = params.expiresIn;
    }

    const accessToken = makeJWT(user.id, duration, config.jwt.secret);

    responseWithJSON(res, 200, {
        id: user.id, 
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: accessToken,
    } satisfies LoginResponse);
}