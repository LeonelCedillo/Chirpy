import type { Request, Response } from "express";
import { upgradeChirpyRed } from "../db/queries/users.js";


export async function handlerWebhook(req: Request, res: Response) {
    type parameters = {
        event: string;
        data: {
            userId: string;
        };
    }
    const params: parameters = req.body;
    
    if (params.event !== "user.upgraded") {
        return res.status(204).send();
    }

    const user = await upgradeChirpyRed(params.data.userId);
    if (!user) {
        return res.status(404).send();
    }
    res.status(204).send();
}