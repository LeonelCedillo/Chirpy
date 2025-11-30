import type { Request, Response } from "express";
import { responseWithJSON } from "./json.js";


export async function handlerChirpsValidate(req: Request, res: Response) {
    type parameters = {
        body: string;
    }
    let params: parameters = req.body;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new Error("Chirp is too long");
    }

    const words = params.body.split(" ");
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        if (badWords.includes(word)) {
            words[i] = "****";
        }
    }
    const cleaned = words.join(" ");

    responseWithJSON(res, 200, { cleanedBody: cleaned });

    // let body = ""; // 1. Initialize a string buffer
    // 2. Listen for data events
    // req.on("data", (chunk) => { 
    //     body += chunk;
    // });

    // 3. Listen for end events
    // req.on("end", () => { 
    //     try {
    //         params = JSON.parse(body);              
    //     } catch (e) {
    //         responseWithError(res, 400, "Invalid JSON");
    //         return;
    //     }
    //     const maxChirpLength = 140;
    //     if (params.body.length > maxChirpLength) {
    //         responseWithError(res, 400, "Chirp is too long");
    //         return;
    //     }
    //     responseWithJSON(res, 200, { valid: true });
    // });
}