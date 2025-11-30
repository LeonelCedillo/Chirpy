import type { Request, Response, NextFunction } from "express";
import { responseWithError } from "./json.js";
import { config } from "../config.js";


export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const statusCode = res.statusCode;
    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);      
    }
  });
  next();
}


export function middlewareMetricsInc(_: Request, __: Response, next: NextFunction) {
  config.fileServerHits++;
  next();
}


export function errorMiddleWare(err: Error, _: Request, res: Response, __: NextFunction) {
  const statusCode = 500;
  const message = "Something went wrong on our end";
  console.log(err.message);
  responseWithError(res, statusCode, message)
}
