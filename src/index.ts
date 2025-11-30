import express from "express";
import { middlewareLogResponses, middlewareMetricsInc, errorMiddleWare } from "./api/middleware.js";
import { handlerChirpsValidate } from "./api/chirps.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";


const app = express();
const PORT = 8080;


app.use(middlewareLogResponses);
app.use(express.json()); // Built-in JSON body parsing middleware
app.use("/app", middlewareMetricsInc, express.static("./src/app"));


// Catching errors in async code:
app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
}); // or this way:
app.post("/api/validate_chirp", async (req, res, next) => {
  try {
    await handlerChirpsValidate(req, res);
  } catch (err) {
    next(err); // Pass the error to Express
  }
});


// Error handling middleware in non-async code
app.use(errorMiddleWare);


app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});


