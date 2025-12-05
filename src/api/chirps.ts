import type { Request, Response } from "express";
import { config } from "../config.js";
import { responseWithJSON } from "./json.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { createChirp, getChirps, getChirp } from "../db/queries/chirps.js";


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


export async function handlerChirpsRetrieve(_: Request, res: Response) {
    const chirps = await getChirps();
    if (!chirps) {
        console.log("No chirps found");
    }
    responseWithJSON(res, 200, chirps);
}


export async function handlerChirpsGet(req: Request, res: Response) {
    const { chirpId } = req.params;    
    const chirp = await getChirp(chirpId);
    if (!chirp) {
        throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
    }
    responseWithJSON(res, 200, chirp);
}