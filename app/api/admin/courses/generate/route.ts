import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  brief: z.string().trim().min(20).max(5000),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  language: z.string().trim().min(2).max(50).default("English"),
});

const generatedCourseSchema = z.object({
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(20).max(300),
  description: z.string().min(50).max(4000),
  writtenLesson: z.string().min(100).max(10000),
  outcomes: z.array(z.string().min(5).max(200)).min(3).max(8),
  tags: z.array(z.string().min(2).max(40)).max(10),
  durationMinutes: z.number().int().min(1).max(10000),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI course generation is not configured. Set OPENAI_API_KEY to enable it." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsedRequest = requestSchema.safeParse(body);
    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Provide a course brief of at least 20 characters." },
        { status: 400 }
      );
    }

    const { brief, level, language } = parsedRequest.data;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Create an accurate course draft authored by a company administrator, supporting both video and written lessons. Return JSON with title, shortDescription, description, writtenLesson, outcomes (3-8 strings), tags (up to 10 strings), and durationMinutes (integer). writtenLesson must be a useful self-contained lesson grounded only in the brief, not merely an outline. Do not invent credentials, guarantees, or facts not supported by the brief.",
          },
          {
            role: "user",
            content: `Course level: ${level}\nLanguage: ${language}\nAdministrator's course brief:\n${brief}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      console.error("AI course generation provider returned status:", response.status);
      return NextResponse.json(
        { error: "The AI provider could not generate a course draft. Please try again." },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "The AI provider returned an empty course draft. Please try again." },
        { status: 502 }
      );
    }

    let generated: unknown;
    try {
      generated = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "The AI provider returned an invalid course draft. Please try again." },
        { status: 502 }
      );
    }

    const validated = generatedCourseSchema.safeParse(generated);
    if (!validated.success) {
      return NextResponse.json(
        { error: "The AI course draft did not meet validation requirements. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ course: validated.data });
  } catch (error) {
    console.error("AI course generation failed:", error);
    return NextResponse.json(
      { error: "Course generation failed. Please try again." },
      { status: 500 }
    );
  }
}
