// modules/admin/admin.service.ts
import { prisma } from "../../lib/prisma";

const getAllUsers = async (params: { search?: string | undefined; role?: string | undefined }) => {
    const where: any = {
        role: { not: "ADMIN" }, // ← admin বাদ
        ...(params.search
            ? {
                OR: [
                    { name: { contains: params.search, mode: "insensitive" } },
                    { email: { contains: params.search, mode: "insensitive" } },
                ],
            }
            : {}),
        ...(params.role ? { role: params.role } : {}),
    };

    return await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            banned: true,
            banReason: true,
            emailVerified: true,
            createdAt: true,
            image: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

const updateUserStatus = async (id: string, data: { banned: boolean; banReason?: string }) => {
    return await prisma.user.update({
        where: { id },
        data: {
            banned: data.banned,
            banReason: data.banned ? (data.banReason ?? null) : null,
            banExpires: null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            banned: true,
            banReason: true,
        },
    });
};


// modules/admin/admin.service.ts এ add করো
const getAllBookings = async (params: { search?: string | undefined; status?: string | undefined }) => {
    const where: any = {
        ...(params.status ? { status: params.status } : {}),
        ...(params.search
            ? {
                OR: [
                    { student: { user: { name: { contains: params.search, mode: "insensitive" } } } },
                    { tutor: { user: { name: { contains: params.search, mode: "insensitive" } } } },
                    { category: { name: { contains: params.search, mode: "insensitive" } } },
                ],
            }
            : {}),
    };

    return await prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            student: {
                include: {
                    user: { select: { name: true, email: true, image: true } },
                },
            },
            tutor: {
                include: {
                    user: { select: { name: true, email: true, image: true } },
                },
            },
            category: { select: { id: true, name: true } },
            availability: { select: { dayOfWeek: true } },
        },
    });
};

export const adminService = { getAllUsers, updateUserStatus, getAllBookings };
