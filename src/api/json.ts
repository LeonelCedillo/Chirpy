import type { Response } from "express";


export function responseWithError(res: Response, code: number, message: string) {
    responseWithJSON(res, code, { error: message});
}


export function responseWithJSON(res: Response, code: number, payload: any) {
	res.set("Content-Type", "application/json");
    const body = JSON.stringify(payload);
    res.status(code).send(body);
}