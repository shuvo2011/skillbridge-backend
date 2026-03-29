import "dotenv/config";
import { prisma } from "../lib/prisma";

// 🔐 Admin seed protection
if (process.env.ADMIN_SEED_SECRET !== "lalaadmin") {
	throw new Error("Not allowed to seed admin");
}

const API_URL = process.env.API_URL || "http://localhost:5050";
const url = new URL(API_URL);
const origin = url.origin;
const host = url.host;

const ADMIN = {
	name: "Rahim Uddin",
	email: "rahim@skillbridge.com",
	password: "Pa$$w0rd!",
};

const seedAdmin = async () => {
	try {
		console.log("🚀 Seeding admin...");

		// 1️⃣ Check if user exists
		let user = await prisma.user.findUnique({
			where: { email: ADMIN.email },
			select: { id: true, role: true },
		});

		// 2️⃣ If not exists → create via signup API
		if (!user) {
			const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Origin: origin,
					Host: host,
				},
				body: JSON.stringify({
					name: ADMIN.name,
					email: ADMIN.email,
					password: ADMIN.password,
				}),
			});

			const data = await res.json().catch(() => ({}));
			console.log("📦 Signup response:", data);

			if (!res.ok) {
				throw new Error(data?.error || data?.message || "Signup failed");
			}

			// ✅ role সহ আবার fetch (টাইপ মিসম্যাচ এড়াতে)
			user = await prisma.user.findUnique({
				where: { email: ADMIN.email },
				select: { id: true, role: true },
			});
		}

		if (!user) throw new Error("User not found after signup");

		// 3️⃣ Promote to ADMIN + verify email
		const updated = await prisma.user.update({
			where: { email: ADMIN.email },
			data: {
				role: "ADMIN",
				emailVerified: true,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				emailVerified: true,
			},
		});

		// 4️⃣ Ensure admin not in student/tutor table
		await prisma.student.deleteMany({ where: { userId: updated.id } });
		await prisma.tutorProfiles.deleteMany({ where: { userId: updated.id } });

		console.log("✅ Admin seeded successfully:", updated);
	} catch (error: any) {
		console.error("❌ Admin seeding failed:", error.message || error);
	} finally {
		await prisma.$disconnect();
	}
};

seedAdmin();
