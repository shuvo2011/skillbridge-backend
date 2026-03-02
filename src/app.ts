import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { categoryRouter } from "./modules/category/category.router";
import { studentRouter } from "./modules/student/student.router";

const app: Application = express();

app.use(
	cors({
		origin: process.env.APP_URL || "http://localhost:3000",
		credentials: true,
	}),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use("/api/categories", categoryRouter);
app.use("/api/students", studentRouter);

app.get("/", (req, res) => {
	res.send("Hii, This is arif");
});

export default app;
