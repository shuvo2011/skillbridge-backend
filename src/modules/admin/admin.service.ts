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


const getStats = async () => {
    const [
        totalStudents,
        totalTutors,
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalCategories,
        revenueData,
    ] = await prisma.$transaction([
        prisma.student.count(),
        prisma.tutorProfiles.count(),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.booking.count({ where: { status: "COMPLETED" } }),
        prisma.booking.count({ where: { status: "CANCELLED" } }),
        prisma.category.count(),
        prisma.booking.findMany({
            where: { status: "COMPLETED" },
            select: { price: true },
        }),
    ]);

    const totalRevenue = revenueData.reduce((sum, b) => sum + parseFloat(b.price?.toString() ?? "0"), 0);

    return {
        totalStudents,
        totalTutors,
        totalUsers: totalStudents + totalTutors,
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalCategories,
        totalRevenue,
    };
};

// admin.service.ts এ getStats এ add করো
const getBookingTrends = async () => {
    const bookings = await prisma.booking.findMany({
        select: {
            createdAt: true,
            status: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const months: Record<string, { confirmed: number; completed: number; cancelled: number }> = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString("en-US", { month: "short", year: "numeric" });
        months[key] = { confirmed: 0, completed: 0, cancelled: 0 };
    }

    bookings.forEach((b) => {
        const key = new Date(b.createdAt).toLocaleString("en-US", { month: "short", year: "numeric" });
        if (months[key]) {
            if (b.status === "CONFIRMED") months[key].confirmed++;
            else if (b.status === "COMPLETED") months[key].completed++;
            else if (b.status === "CANCELLED") months[key].cancelled++;
        }
    });

    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
};
export const adminService = { getAllUsers, updateUserStatus, getAllBookings,getStats,getBookingTrends };
