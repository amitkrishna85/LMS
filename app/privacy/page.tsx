import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export const metadata = {
  title: "Privacy Policy | SkillPulse",
  description: "Privacy policy and learner data protection details for SkillPulse.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      <div className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Last Updated: October 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              1. Information We Collect
            </h2>
            <p>
              We collect information provided by system administrators when
              provisioning your profile (name, email address, role) and telemetry
              pertaining to your internal course progress, lesson completions, quiz
              submissions, and self-reported external course statuses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              2. How Data is Utilized
            </h2>
            <p>
              Learner data is used exclusively for progress tracking, issuing
              completion certificates, computing composite learning path completion,
              and internal workforce capability reporting by administrators.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              3. Data Security & Encryption
            </h2>
            <p>
              Passwords are salted and hashed utilizing bcrypt. All web sessions
              are protected with secure JWT tokens and encrypted HTTP headers. We
              maintain strict audit logging of administrative actions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              4. Third-Party Outbound Links
            </h2>
            <p>
              When navigating to external providers like Udemy or Coursera, your
              activity on their website is subject to their independent privacy
              policies. SkillPulse does not receive or store your external login
              passwords or payment information.
            </p>
          </section>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
