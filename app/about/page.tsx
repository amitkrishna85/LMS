import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Compass, ShieldCheck, Award, Route, CheckCircle } from "lucide-react";

export const metadata = {
  title: "About Falkor Academy | Internal Learning Platform",
  description: "Falkor Academy delivers a unified learning experience built for company-wide skills growth and certification.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      <div className="bg-slate-900 text-white py-16 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            About Falkor Academy
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reinventing workforce capability development with original,
            curated learning paths built around internal expertise and practical growth.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 space-y-12 text-sm text-slate-600 leading-relaxed">
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
          <p>
            Modern engineering and leadership teams need rapid access to the
            specialized knowledge and capabilities that support real business goals.
            Falkor Academy was engineered as a centralized learning platform that
            simplifies training, certification, and team growth in one experience.
          </p>
          <p>
            Platform administrators curate high-impact internal video and text
            workshops, structured programs, and role-based learning paths without
            forcing employees to navigate fragmented systems.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Admin-Governed Quality
            </h3>
            <p className="text-xs text-slate-500">
              Only authorized administrators can publish courses, curate
              roadmaps, and invite team members, ensuring zero curriculum clutter
              and verified instructional quality.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Route className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Unified Career Roadmaps
            </h3>
            <p className="text-xs text-slate-500">
              Step-by-step learning paths combine internal drills with external
              industry certifications, letting employees track progress in one
              cohesive dashboard.
            </p>
          </div>
        </section>

        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            Internal Learning Policy & Quality
          </h2>
          <p>
            Falkor Academy prioritizes clear ownership, curated learning paths,
            and high-quality internal content created for real business outcomes.
            We keep course material, assessments, and certifications aligned with
            the needs of the company and the people it serves.
          </p>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
