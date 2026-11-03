import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses, updateMockCourse } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// CREATE SECTION OR LESSON
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id: courseId } = params;
    const body = await req.json();
    const { itemType } = body; // "SECTION" or "LESSON"

    if (itemType === "SECTION") {
      const { title, order } = body;
      const section = await safeDbQuery(
        () =>
          prisma.section.create({
            data: {
              courseId,
              title: title || "New Section",
              order: order || 0,
            },
          }),
        {
          id: "sec_" + Date.now(),
          courseId,
          title: title || "New Section",
          order: order || 0,
        }
      );
      const course = getMockCourses().find((savedCourse) => savedCourse.id === courseId);
      if (course) {
        updateMockCourse(courseId, {
          sections: [
            ...(course.sections || []),
            { ...section, lessons: (section as any).lessons || [] },
          ],
        });
      }
      return NextResponse.json({ success: true, section });
    }

    if (itemType === "LESSON") {
      const { sectionId, title, type, contentUrl, body: lessonBody, durationMinutes, order, isPreview } = body;
      const lesson = await safeDbQuery(
        () =>
          prisma.lesson.create({
            data: {
              sectionId,
              title: title || "New Lesson",
              type: type || "VIDEO",
              contentUrl: contentUrl || null,
              body: lessonBody || null,
              durationMinutes: durationMinutes || 10,
              order: order || 0,
              isPreview: Boolean(isPreview),
            },
          }),
        {
          id: "les_" + Date.now(),
          sectionId,
          title: title || "New Lesson",
          type: type || "VIDEO",
          contentUrl: contentUrl || null,
          body: lessonBody || null,
          durationMinutes: durationMinutes || 10,
          order: order || 0,
          isPreview: Boolean(isPreview),
        }
      );
      const course = getMockCourses().find((savedCourse) => savedCourse.id === courseId);
      const sections = (course?.sections || []).map((section: any) =>
        section.id === sectionId
          ? { ...section, lessons: [...(section.lessons || []), lesson] }
          : section
      );
      if (course) updateMockCourse(courseId, { sections });
      return NextResponse.json({ success: true, lesson });
    }

    return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
  } catch (error) {
    console.error("Create curriculum item error:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

// UPDATE SECTION OR LESSON
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { itemType, itemId, data } = body;

    if (itemType === "SECTION") {
      const updated = await safeDbQuery(
        () =>
          prisma.section.update({
            where: { id: itemId },
            data,
          }),
        { id: itemId, ...data }
      );
      const course = getMockCourses().find((savedCourse) => savedCourse.id === params.id);
      if (course) {
        updateMockCourse(params.id, {
          sections: (course.sections || []).map((section: any) =>
            section.id === itemId ? { ...section, ...data } : section
          ),
        });
      }
      return NextResponse.json({ success: true, section: updated });
    }

    if (itemType === "LESSON") {
      const updated = await safeDbQuery(
        () =>
          prisma.lesson.update({
            where: { id: itemId },
            data,
          }),
        { id: itemId, ...data }
      );
      const course = getMockCourses().find((savedCourse) => savedCourse.id === params.id);
      if (course) {
        updateMockCourse(params.id, {
          sections: (course.sections || []).map((section: any) => ({
            ...section,
            lessons: (section.lessons || []).map((lesson: any) =>
              lesson.id === itemId ? { ...lesson, ...data } : lesson
            ),
          })),
        });
      }
      return NextResponse.json({ success: true, lesson: updated });
    }

    return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
  } catch (error) {
    console.error("Update curriculum item error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE SECTION OR LESSON
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    if (itemType === "SECTION") {
      await safeDbQuery(
        () => prisma.section.delete({ where: { id: itemId } }),
        null
      );
      const course = getMockCourses().find((savedCourse) => savedCourse.id === params.id);
      if (course) {
        updateMockCourse(params.id, {
          sections: (course.sections || []).filter(
            (section: any) => section.id !== itemId
          ),
        });
      }
      return NextResponse.json({ success: true });
    }

    if (itemType === "LESSON") {
      await safeDbQuery(
        () => prisma.lesson.delete({ where: { id: itemId } }),
        null
      );
      const course = getMockCourses().find((savedCourse) => savedCourse.id === params.id);
      if (course) {
        updateMockCourse(params.id, {
          sections: (course.sections || []).map((section: any) => ({
            ...section,
            lessons: (section.lessons || []).filter(
              (lesson: any) => lesson.id !== itemId
            ),
          })),
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
  } catch (error) {
    console.error("Delete curriculum item error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
