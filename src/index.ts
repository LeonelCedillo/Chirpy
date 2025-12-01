import express from "express";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { handlerReset } from "./api/reset.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerChirpsValidate } from "./api/chirps.js";
import { errorMiddleWare, middlewareMetricsInc, 
  middlewareLogResponses, 
} from "./api/middleware.js";
import { config } from "./config.js";
import { handlerUsersCreate } from "./api/users.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
const app = express();


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
app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});

// Error handling middleware in non-async code
app.use(errorMiddleWare);


app.listen(config.api.port, () => {
	console.log(`Server is running at http://localhost:${config.api.port}`);
});


