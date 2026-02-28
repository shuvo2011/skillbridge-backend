import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
// import { auth } from "./lib/auth";
import cors from "cors";

const app: Application = express();

app.use(
	cors({
		origin: process.env.APP_URL || "http://localhost:5050",
		credentials: true,
	}),
);

// app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hii, This is arif");
});

export default app;
