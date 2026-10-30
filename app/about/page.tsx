import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Compass, ShieldCheck, Award, Route, CheckCircle } from "lucide-react";

export const metadata = {
  title: "About SkillPulse Academy | Enterprise Learning Architecture",
  description:
    "SkillPulse delivers a unified learning experience blending proprietary internal masterclasses with verified external credentials.",
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
            About SkillPulse
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reinventing workforce capability development with original,
            curated learning tracks that combine in-house technical workshops
            and world-class external certifications.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 space-y-12 text-sm text-slate-600 leading-relaxed">
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
          <p>
            Modern engineering and leadership teams need rapid access to both
            specialized proprietary architectures and accredited industry
            credentials. SkillPulse was engineered as a single, centralized
            learning marketplace designed to eliminate bookmark sprawl and fragmented
            learning portals.
          </p>
          <p>
            Platform administrators curate high-impact internal video and text
            workshops while seamlessly linking students to external programs on
            Udemy, Coursera, and other leading educational providers.
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
            External Content Policy & Compliance
          </h2>
          <p>
            SkillPulse respects intellectual property rights and adheres to all
            fair linking best practices. We do not scrape, republish, or embed
            third-party video players. When a learner accesses an external
            course (such as on Udemy or Coursera), they are directed in a new tab
            to the official provider where they log in with their own account.
          </p>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
