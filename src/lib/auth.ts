import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// If your Prisma file is located elsewhere, you can change the path

const transporter = nodemailer.createTransport({
	host: "sandbox.smtp.mailtrap.io",
	port: 2525,
	secure: false,
	auth: {
		user: process.env.APP_MAILER_USER,
		pass: process.env.APP_MAILER_PASS,
	},
});

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [process.env.APP_URL || "http://localhost:3000"],
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "STUDENT",
				required: true,
				input: true,
			},
			banned: {
				type: "boolean",
				defaultValue: false,
				required: false,
				input: false,
			},
			banReason: {
				type: "string",
				defaultValue: null,
				required: false,
				input: false,
			},
			banExpires: {
				type: "date",
				defaultValue: null,
				required: false,
				input: false,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			try {
				const info = await transporter.sendMail({
					from: '"Skill Bridge" <skillbridge@ph.com>',
					to: user.email,
					subject: "Verify your email address – Skill Bridge",
					text: `
Hello ${user.name || "there"},

Welcome to Skill Bridge!

Please verify your email address by clicking the link below:
${url}

If you did not create this account, you can safely ignore this email.

– Skill Bridge Team
          `,
					html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>Welcome to Skill Bridge 👋</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>Thanks for creating an account. Please verify your email address by clicking the button below:</p>
              <p style="margin: 20px 0;">
                <a href="${url}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Verify Email
                </a>
              </p>
              <p>If you didn't create an account with Prisma Blog, you can safely ignore this email.</p>
              <p style="margin-top: 30px;">Regards,<br /><strong>Skill Bridge Team</strong></p>
            </div>
          `,
				});
				console.log("Verification email sent:", info.messageId);
			} catch (err) {
				console.log(err);
				throw err;
			}
		},
	},
	socialProviders: {
		google: {
			prompt: "select_account consent",
			accessType: "offline",
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (payload) => {
					const data = (payload as any).data ?? payload;

					// ✅ seed admin bypass
					if (data.__seedAdmin === true) {
						delete data.__seedAdmin;
						data.role = "ADMIN";
						return { data };
					}

					const rawRole = data.role as string;
					data.role = rawRole === "TUTOR" ? "TUTOR" : "STUDENT";
					return { data };
				},
				after: async (user) => {
					const role = (user as any).role as string;

					// ✅ ADMIN হলে কোনো profile create হবে না
					if (role === "ADMIN") return;

					if (role === "STUDENT") {
						await prisma.student.upsert({
							where: { userId: user.id },
							update: {},
							create: { userId: user.id },
						});
					} else if (role === "TUTOR") {
						await prisma.tutorProfiles.upsert({
							where: { userId: user.id },
							update: {},
							create: { userId: user.id },
						});
					}
				},
			},
		},
	},
});
