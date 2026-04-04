import { prisma } from "../../lib/prisma";
import { buildPaginationMeta } from "../../helpers/paginationHelper";
import { DayOfWeek } from "../../generated/enums";

const getAllAvailability = async (payload: {
	tutorId: string;
	search?: string;
	page: number;
	limit: number;
	skip: number;
	take: number;
	sortBy: string;
	sortOrder: "asc" | "desc";
}) => {
	const s = payload.search?.trim().toUpperCase();

	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId: payload.tutorId },
	});

	if (!tutorProfile) {
		return {
			meta: buildPaginationMeta(payload.page, payload.limit, 0),
			data: [],
		};
	}

	const where: any = {
		tutorId: tutorProfile.id,
		...(s
			? {
					dayOfWeek: { equals: s as any },
				}
			: {}),
	};

	const allowedSort = ["createdAt", "updatedAt", "dayOfWeek"];
	const sortBy = allowedSort.includes(payload.sortBy) ? payload.sortBy : "createdAt";

	try {
		const [total, data] = await prisma.$transaction([
			prisma.tutorAvailability.count({ where }),
			prisma.tutorAvailability.findMany({
				where,
				orderBy: { [sortBy]: payload.sortOrder },
				skip: payload.skip,
				take: payload.take,
			}),
		]);

		return {
			meta: buildPaginationMeta(payload.page, payload.limit, total),
			data,
		};
	} catch (error) {
		throw error;
	}
};

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

const createAvailability = async (userId: string, dayOfWeek: DayOfWeek, availableFrom: string, availableTo: string) => {
	const tutorProfile = await prisma.tutorProfiles.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!tutorProfile) {
		throw new Error("Tutor profile not found");
	}

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

const updateAvailability = async (
	userId: string,
	id: string,
	payload: {
		dayOfWeek?: DayOfWeek;
		availableFrom?: string;
		availableTo?: string;
	},
) => {
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
