import express from "express";
import postgres from "postgres";
import { config } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { handlerLogin } from "./api/auth.js";
import { handlerReset } from "./api/reset.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerUsersCreate } from "./api/users.js";
import { handlerChirpsCreate, handlerChirpsRetrieve, handlerChirpsGet } from "./api/chirps.js";
import { errorMiddleWare, middlewareMetricsInc, middlewareLogResponses } from "./api/middleware.js";


const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
const app = express();


app.use(middlewareLogResponses);
app.use(express.json()); // Built-in JSON body parsing middleware
app.use("/app", middlewareMetricsInc, express.static("./src/app"));


// Catching errors in async code:
app.get("/api/healthz", async (req, res, next) => {
  try {
    await handlerReadiness(req, res);
  } catch (err) {
	  next(err); // Pass the error to Express
  }
}); // Or this way:
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsCreate(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerChirpsRetrieve(req, res)).catch(next);
});
app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerChirpsGet(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});


// Error handling middleware in non-async code
app.use(errorMiddleWare);


app.listen(config.api.port, () => {
	console.log(`Server is running at http://localhost:${config.api.port}`);
});


