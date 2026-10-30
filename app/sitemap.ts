import { MetadataRoute } from "next";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses, getMockLearningPaths } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://skillpulse.io";

  // Safe fetch courses
  const courses = await safeDbQuery(
    () =>
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
    getMockCourses().filter((c: any) => c.status === "PUBLISHED").map((c: any) => ({
      slug: c.slug,
      updatedAt: new Date(),
    }))
  );

  // Safe fetch paths
  const paths = await safeDbQuery(
    () =>
      prisma.learningPath.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, createdAt: true },
      }),
    getMockLearningPaths().filter((p) => p.status === "PUBLISHED").map((p) => ({
      slug: p.slug,
      createdAt: new Date(),
    }))
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/paths`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course: any) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const pathRoutes: MetadataRoute.Sitemap = paths.map((path: any) => ({
    url: `${baseUrl}/paths/${path.slug}`,
    lastModified: path.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes, ...pathRoutes];
}
