import Link from "next/link";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockLearningPaths } from "@/lib/mock-data";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { PathCard } from "@/components/public/path-card";
import { Route, Sparkles, BookOpen, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PathsPage() {
  const allPaths = getMockLearningPaths();
  const publishedPaths = allPaths.filter((p: any) => p.status === "PUBLISHED");
  const fallback = publishedPaths.length > 0 ? publishedPaths : allPaths;

  const paths = await safeDbQuery(
    () =>
      prisma.learningPath.findMany({
        where: { status: "PUBLISHED" },
        include: {
          items: {
            include: { course: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    fallback
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Route className="w-4 h-4" />
              Curated Curriculum Sequences
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Learning Paths & Career Roadmaps
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Step-by-step tracks curated by industry leads. Build comprehensive
              expertise by completing internal workshops and external
              industry certifications in optimal sequence.
            </p>
          </div>
        </div>
      </div>

      {/* Paths Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{paths.length}</strong>{" "}
            curated roadmaps
          </p>
        </div>

        {paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paths.map((path: any) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <Route className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              No learning paths available yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Check back soon as our instructional leads publish new career
              roadmaps.
            </p>
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  );
}
