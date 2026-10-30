import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockUsers } from "@/lib/mock-data";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "STUDENT"]).default("STUDENT"),
  temporaryPassword: z
    .string()
    .min(6, "Temporary password must be at least 6 characters")
    .optional(),
  mustChangePassword: z.boolean().default(true),
});

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && (role === "ADMIN" || role === "STUDENT")) {
      whereClause.role = role;
    }

    if (status === "ACTIVE") {
      whereClause.isActive = true;
    } else if (status === "DEACTIVATED") {
      whereClause.isActive = false;
    }

    const [users, total] = await safeDbQuery(
      async () => {
        const u = await prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
            _count: {
              select: {
                enrollments: true,
                pathEnrollments: true,
              },
            },
          },
        });
        const cnt = await prisma.user.count({ where: whereClause });
        return [u, cnt];
      },
      [
        getMockUsers().map((u) => ({
          ...u,
          _count: { enrollments: 2, pathEnrollments: 1 },
        })),
        getMockUsers().length,
      ]
    );

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, role, temporaryPassword, mustChangePassword } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await safeDbQuery(
      () => prisma.user.findUnique({ where: { email: normalizedEmail } }),
      null
    );

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    const rawPassword = temporaryPassword || "TempPass" + Math.floor(1000 + Math.random() * 9000) + "!";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await safeDbQuery(
      () =>
        prisma.user.create({
          data: {
            name,
            email: normalizedEmail,
            role,
            passwordHash,
            mustChangePassword,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true,
          },
        }),
      {
        id: "mock_new_" + Date.now(),
        name,
        email: normalizedEmail,
        role,
        isActive: true,
        mustChangePassword,
        createdAt: new Date(),
      }
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "USER_CREATE",
            entity: "User",
            entityId: user.id,
            meta: JSON.stringify({ email: user.email, role: user.role }),
          },
        }),
      null
    );

    return NextResponse.json({
      success: true,
      user,
      temporaryPassword: rawPassword,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
