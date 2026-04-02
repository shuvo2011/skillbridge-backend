import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

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
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5050",
	advanced: {
		crossSubdomainCookies: {
			enabled: true,
		},
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
		},
	},
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
Hi ${user.name || "there"},

Welcome to Skill Bridge! We're excited to have you on board.

Please verify your email address by clicking the link below:
${url}

This link will expire in 24 hours.

If you didn't create a Skill Bridge account, you can safely ignore this email.

– Skill Bridge Team
  `,
					html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0; padding:0; background-color:#f0f4ff; font-family:'Segoe UI', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4ff; padding: 48px 16px;">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(79,70,229,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%); padding:40px 48px 36px; text-align:center;">
              <div style="display:inline-block; background:rgba(255,255,255,0.15); border-radius:12px; padding:10px 20px; margin-bottom:20px;">
                <span style="color:#ffffff; font-size:13px; font-weight:600; letter-spacing:2px; text-transform:uppercase;">Skill Bridge</span>
              </div>
              <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.5px;">Verify your email</h1>
              <p style="margin:10px 0 0; color:rgba(255,255,255,0.75); font-size:14px;">One click and you're all set!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 32px;">
              <p style="margin:0 0 8px; font-size:16px; color:#374151; font-weight:600;">Hi ${user.name || "there"} 👋</p>
              <p style="margin:0 0 24px; font-size:15px; color:#6b7280; line-height:1.7;">
                Welcome to <strong style="color:#4f46e5;">Skill Bridge</strong>! We're excited to have you on board.
                Just confirm your email address to activate your account and start your journey.
              </p>

              <div style="border-top:1px solid #f3f4f6; margin-bottom:32px;"></div>

              <!-- CTA Button -->
              <div style="text-align:center; margin-bottom:32px;">
                <a href="${url}"
                   style="display:inline-block; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#ffffff; font-size:15px; font-weight:600; padding:14px 40px; border-radius:50px; text-decoration:none; letter-spacing:0.3px; box-shadow:0 4px 16px rgba(79,70,229,0.35);">
                  ✓ &nbsp; Verify My Email
                </a>
              </div>

              <!-- Link fallback -->
              <div style="background:#f8f7ff; border-radius:10px; padding:16px 20px; margin-bottom:28px;">
                <p style="margin:0 0 6px; font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Or copy this link</p>
                <p style="margin:0; font-size:12px; color:#6d6afe; word-break:break-all; font-family:'Courier New', monospace;">${url}</p>
              </div>

              <div style="border-top:1px solid #f3f4f6; margin-bottom:24px;"></div>

              <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.6;">
                If you didn't create a Skill Bridge account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa; border-top:1px solid #f3f4f6; padding:24px 48px; text-align:center;">
              <p style="margin:0 0 4px; font-size:13px; color:#4f46e5; font-weight:600;">Skill Bridge Team</p>
              <p style="margin:0; font-size:12px; color:#9ca3af;">Building bridges between skills and opportunities</p>
            </td>
          </tr>

        </table>

        <p style="margin-top:24px; font-size:12px; color:#9ca3af; text-align:center;">
          &copy; 2024 Skill Bridge &bull; All rights reserved
        </p>
      </td>
    </tr>
  </table>

</body>
</html>
  `,
				});
			} catch (err) {
				throw err;
			}
		},
	},

	databaseHooks: {
		user: {
			create: {
				before: async (payload) => {
					const data = (payload as any).data ?? payload;

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
