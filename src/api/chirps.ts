import type { Request, Response } from "express";
import { config } from "../config.js";
import { responseWithJSON } from "./json.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { createChirp, getChirps, getChirp, deleteChirp } from "../db/queries/chirps.js";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";


export async function handlerChirpsCreate(req: Request, res: Response) {
    type parameters = {
        body: string;
    }
    
    const params: parameters = req.body;
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwt.secret);

    const cleaned = validateChirp(params.body);    
    const chirp = await createChirp({ body: cleaned, userId});
    if (!chirp) {
        throw new Error("Could not create chirp");
    }
    responseWithJSON(res, 201, chirp);
}


function validateChirp(body: string) {
    const maxChirpLength = 140;
    if (body.length > maxChirpLength) {
        throw new BadRequestError(
            `Chirp is too long. Max length is ${maxChirpLength}`
        );
    }
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    return getCleanedBody(body, badWords);
}


function getCleanedBody(body: string, badWords: string[]) {
    const words = body.split(" ");
    for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        if (badWords.includes(word)) {
            words[i] = "****";
        }
    }
    const cleaned = words.join(" ");
    return cleaned;
}


export async function handlerChirpsRetrieve(req: Request, res: Response) {
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
    }
    const chirps = await getChirps();
    if (!chirps) {
        console.log("No chirps found");
    }
    const filteredChirps = chirps.filter((chirp) => chirp.userId === authorId || authorId === "");
    responseWithJSON(res, 200, filteredChirps);
}


export async function handlerChirpsGet(req: Request, res: Response) {
    const { chirpId } = req.params;    
    const chirp = await getChirp(chirpId);
    if (!chirp) {
        throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
    }
    responseWithJSON(res, 200, chirp);
}


export async function handlerChirpsDelete(req: Request, res: Response) {
    const { chirpId } = req.params;    
    const accessToken = getBearerToken(req);
    
    const untrustedUserId = validateJWT(accessToken, config.jwt.secret);

    const chirp = await getChirp(chirpId);
    if (!chirp) {
        throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
    }
    if (chirp.userId !== untrustedUserId) {
        throw new UserForbiddenError("User forbidden"); // 403
    }

    const deleted = await deleteChirp(chirpId);
    if (!deleted) {
        throw new Error("Failed to delete chirp with chirpId: ${chirpId}")
    }
    
    res.status(204).send();
}