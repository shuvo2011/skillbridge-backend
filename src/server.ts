import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5050;
async function bootstrap() {
	try {
		await prisma.$connect();

		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		await prisma.$disconnect();
		process.exit(1);
	}
}

bootstrap();
