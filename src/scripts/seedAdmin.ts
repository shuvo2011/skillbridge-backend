import { prisma } from "../lib/prisma";

const seedAdmin = async () => {
	try {
		console.log("🚀 Seeding admin...");

		const adminData = {
			name: "Rahim Uddin",
			email: "rahim@example.com",
			password: "admin1234",
			role: "ADMIN",
		};

		// const baseUrl = "http://localhost:5050";

		const res = await fetch(`${process.env.API_URL}/api/auth/sign-up/email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: `${process.env.API_URL}`,
				Host: "localhost:5050",
			},
			body: JSON.stringify(adminData),
		});

		console.log("📡 Response status:", res.status);

		const data = await res.json().catch(() => ({}));
		console.log("📦 Response data:", data);

		if (!res.ok) {
			console.log("❌ Admin already exists or signup failed");
			return;
		}

		await prisma.user.update({
			where: { email: adminData.email },
			data: { emailVerified: true },
		});

		console.log("✅ Admin seeded successfully");
	} catch (error) {
		console.error("❌ Admin seeding failed:", error);
	} finally {
		await prisma.$disconnect();
	}
};

seedAdmin();
