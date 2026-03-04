import { DayOfWeek } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// ─────────────────────────────────────────────
// HELPERS
// "HH:MM" → DateTime  (Prisma @db.Time needs a full Date object)
// ─────────────────────────────────────────────
// const toTimeDate = (timeStr: string): Date => {
// 	const parts = timeStr.split(":");
// 	const hours = parseInt(parts[0] ?? "0", 10);
// 	const minutes = parseInt(parts[1] ?? "0", 10);
// 	const date = new Date("1970-01-01T00:00:00.000Z");
// 	date.setUTCHours(hours, minutes, 0, 0);
// 	return date;
// };

// // DateTime → "HH:MM"  (so client gets clean time string, not full Date)
// const toTimeStr = (date: Date): string => date.toISOString().slice(11, 16);

// GET ALL availability for a tutor
const getAllAvailability = async (userId: string) => {
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) {
		throw new Error("Tutor profile not found");
	}

	return await prisma.tutorAvailability.findMany({
		where: { tutorId: tutorProfile.id },
		orderBy: { dayOfWeek: "asc" },
	});
};

// GET single availability slot by id
const getAvailabilityById = async (userId: string, id: string) => {
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) {
		throw new Error("Tutor profile not found");
	}

	const availability = await prisma.tutorAvailability.findFirst({
		where: { id, tutorId: tutorProfile.id },
	});

	if (!availability) {
		throw new Error("Availability slot not found");
	}

	return availability;
};

// CREATE a new availability slot
const createAvailability = async (userId: string, dayOfWeek: DayOfWeek, availableFrom: string, availableTo: string) => {
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) {
		throw new Error("Tutor profile not found");
	}

	// Exact duplicate check
	const exactDuplicate = await prisma.tutorAvailability.findFirst({
		where: {
			tutorId: tutorProfile.id,
			dayOfWeek,
			availableFrom,
			availableTo,
		},
	});

	if (exactDuplicate) {
		throw new Error(`Slot ${availableFrom}-${availableTo} on ${dayOfWeek} already exists`);
	}

	// Overlap check
	const overlapping = await prisma.tutorAvailability.findFirst({
		where: {
			tutorId: tutorProfile.id,
			dayOfWeek,
			AND: [{ availableFrom: { lt: availableTo } }, { availableTo: { gt: availableFrom } }],
		},
	});

	if (overlapping) {
		throw new Error(
			`Slot overlaps with existing slot ${overlapping.availableFrom}-${overlapping.availableTo} on ${dayOfWeek}`,
		);
	}

	return await prisma.tutorAvailability.create({
		data: {
			tutorId: tutorProfile.id,
			dayOfWeek,
			availableFrom,
			availableTo,
		},
	});
};

// UPDATE an existing availability slot
const updateAvailability = async (
	userId: string,
	id: string,
	payload: {
		dayOfWeek?: DayOfWeek;
		availableFrom?: string;
		availableTo?: string;
	},
) => {
	// userId দিয়ে tutor_profiles এর id বের করো
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) {
		throw new Error("Tutor profile not found");
	}

	const existing = await prisma.tutorAvailability.findFirst({
		where: { id, tutorId: tutorProfile.id },
	});

	if (!existing) {
		throw new Error("Availability slot not found");
	}

	const dayOfWeek = payload.dayOfWeek ?? existing.dayOfWeek;
	const availableFrom = payload.availableFrom ?? existing.availableFrom;
	const availableTo = payload.availableTo ?? existing.availableTo;

	// Exact duplicate check
	const exactDuplicate = await prisma.tutorAvailability.findFirst({
		where: {
			tutorId: tutorProfile.id,
			dayOfWeek,
			availableFrom,
			availableTo,
			id: { not: id },
		},
	});

	if (exactDuplicate) {
		throw new Error(`Slot ${availableFrom}-${availableTo} on ${dayOfWeek} already exists`);
	}

	// Overlap check
	const overlapping = await prisma.tutorAvailability.findFirst({
		where: {
			tutorId: tutorProfile.id,
			dayOfWeek,
			id: { not: id },
			AND: [{ availableFrom: { lt: availableTo } }, { availableTo: { gt: availableFrom } }],
		},
	});

	if (overlapping) {
		throw new Error(
			`Slot overlaps with existing slot ${overlapping.availableFrom}-${overlapping.availableTo} on ${dayOfWeek}`,
		);
	}

	return await prisma.tutorAvailability.update({
		where: { id },
		data: {
			...(payload.dayOfWeek !== undefined && { dayOfWeek: payload.dayOfWeek }),
			...(payload.availableFrom !== undefined && { availableFrom: payload.availableFrom }),
			...(payload.availableTo !== undefined && { availableTo: payload.availableTo }),
		},
	});
};

// DELETE an availability slot
const deleteAvailability = async (userId: string, id: string) => {
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) {
		throw new Error("Tutor profile not found");
	}

	const existing = await prisma.tutorAvailability.findFirst({
		where: { id, tutorId: tutorProfile.id },
	});

	if (!existing) {
		throw new Error("Availability slot not found");
	}

	return await prisma.tutorAvailability.delete({
		where: { id },
	});
};

export const tutorAvailabilityService = {
	getAllAvailability,
	getAvailabilityById,
	createAvailability,
	updateAvailability,
	deleteAvailability,
};
