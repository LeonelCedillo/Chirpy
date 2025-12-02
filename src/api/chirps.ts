import type { Request, Response } from "express";
import { responseWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/chirps.js";


export async function handlerChirpsCreate(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId: string;
    }
    const params: parameters = req.body;
    const cleaned = validateChirp(params.body);    
    const chirp = await createChirp({ body: cleaned, userId: params.userId })
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


