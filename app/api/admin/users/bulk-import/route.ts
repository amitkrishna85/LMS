import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import Papa from "papaparse";
import { z } from "zod";

export const dynamic = "force-dynamic";

const rowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "STUDENT"]).default("STUDENT"),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { csvData } = await req.json();

    if (!csvData || typeof csvData !== "string") {
      return NextResponse.json(
        { error: "CSV string data is required" },
        { status: 400 }
      );
    }

    const parsed = Papa.parse(csvData.trim(), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json(
        { error: "No records found in CSV" },
        { status: 400 }
      );
    }

    const createdUsers: any[] = [];
    const errors: { row: number; email?: string; error: string }[] = [];

    for (let i = 0; i < parsed.data.length; i++) {
      const rawRow = parsed.data[i] as any;
      const rowNumber = i + 2; // +1 for header, +1 for 1-index

      const validation = rowSchema.safeParse({
        name: rawRow.name || rawRow["full name"] || "",
        email: rawRow.email || "",
        role: (rawRow.role?.toUpperCase() === "ADMIN" ? "ADMIN" : "STUDENT"),
      });

      if (!validation.success) {
        errors.push({
          row: rowNumber,
          email: rawRow.email,
          error: validation.error.errors[0].message,
        });
        continue;
      }

      const { name, email, role } = validation.data;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existing = await safeDbQuery(
        () => prisma.user.findUnique({ where: { email: normalizedEmail } }),
        null
      );

      if (existing) {
        errors.push({
          row: rowNumber,
          email: normalizedEmail,
          error: "Email already exists in system",
        });
        continue;
      }

      const tempPass = "Welcome" + Math.floor(1000 + Math.random() * 9000) + "!";
      const passwordHash = await bcrypt.hash(tempPass, 10);

      const created = await safeDbQuery(
        () =>
          prisma.user.create({
            data: {
              name,
              email: normalizedEmail,
              role,
              passwordHash,
              mustChangePassword: true,
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          }),
        {
          id: `mock_csv_${i}`,
          name,
          email: normalizedEmail,
          role,
        }
      );

      createdUsers.push({
        ...created,
        temporaryPassword: tempPass,
      });
    }

    // Audit Log
    if (createdUsers.length > 0) {
      await safeDbQuery(
        () =>
          prisma.auditLog.create({
            data: {
              actorId: session.user.id,
              action: "USERS_BULK_IMPORT",
              entity: "User",
              meta: JSON.stringify({
                importedCount: createdUsers.length,
                failedCount: errors.length,
              }),
            },
          }),
        null
      );
    }

    return NextResponse.json({
      success: true,
      totalProcessed: parsed.data.length,
      createdCount: createdUsers.length,
      skippedCount: errors.length,
      createdUsers,
      errors,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk import" },
      { status: 500 }
    );
  }
}
