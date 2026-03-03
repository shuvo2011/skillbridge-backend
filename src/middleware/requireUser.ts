import { Request } from "express";

export function requireUser(req: Request) {
	if (!req.user) {
		throw new Error("Unauthorized");
	}
	return req.user;
}
