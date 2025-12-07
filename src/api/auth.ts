import type { Request, Response } from "express";
import { config } from "../config.js";
import { UserResponse } from "./users.js";
import { getUserByEmail } from "../db/queries/users.js";
import { responseWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { saveRefreshToken, revokeRefreshToken, getUserFromRefreshToken } from "../db/queries/refresh.js";
import { checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken } from "../auth.js";


type LoginResponse = UserResponse & { 
    token: string; 
    refreshToken: string; 
};


export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    }

    const params: parameters = req.body;
    const user = await getUserByEmail(params.email);
    if (!user) {
        throw new UserNotAuthenticatedError("Invalid username or password");
    }
    const matching = await checkPasswordHash(params.password, user.hashedPassword);
    if (!matching) {
        throw new UserNotAuthenticatedError("Invalid username or password");
    }

    const accessToken = makeJWT(
        user.id, 
        config.jwt.defaultDuration, 
        config.jwt.secret
    );
    const refreshToken = makeRefreshToken();
    const saved = await saveRefreshToken(user.id, refreshToken);
    if (!saved) {
        throw new UserNotAuthenticatedError("Could not save refresh token");
    }
    responseWithJSON(res, 200, {
        id: user.id, 
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isChirpyRed: user.isChirpyRed,
        token: accessToken,
        refreshToken: refreshToken,
    } satisfies LoginResponse);
}


export async function handlerRefresh(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    const user = await getUserFromRefreshToken(refreshToken);
    if (!user) {
        throw new UserNotAuthenticatedError("Invalid refresh token");
    }
    const accessToken = makeJWT(
        user.id, 
        config.jwt.defaultDuration, 
        config.jwt.secret
    );
    responseWithJSON(res, 200, {
        token: accessToken,
    });
}


export async function handlerRevoke(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    await revokeRefreshToken(refreshToken);
    res.status(204).send();
}