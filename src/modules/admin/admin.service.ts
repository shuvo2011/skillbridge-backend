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

export const adminService = { getAllUsers, updateUserStatus };