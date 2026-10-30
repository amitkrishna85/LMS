import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export const metadata = {
  title: "Terms of Service | SkillPulse",
  description: "Terms of service and usage conditions for SkillPulse Academy.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      <div className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Last Updated: October 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SkillPulse, you acknowledge that you have read,
              understood, and agree to be bound by these terms. This platform is an
              authorized internal and curated directory managed by organization
              administrators.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              2. User Accounts and Credentials
            </h2>
            <p>
              User accounts are provisioned exclusively by administrators. You are
              responsible for maintaining the confidentiality of your credentials.
              Forced password changes are mandatory upon initial login with a temporary
              password.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              3. External Provider Links
            </h2>
            <p>
              SkillPulse contains curated links directing users to third-party
              educational websites (e.g., Udemy, Coursera). We make no warranties
              concerning the availability, uptime, pricing, or terms of third-party
              platforms. All enrollment, payment (if applicable), and account creation
              on external platforms is governed by their respective terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              4. Proprietary Course Content
            </h2>
            <p>
              All internal curriculum materials, video recordings, and code samples
              are proprietary assets of SkillPulse and its instructors. Unauthorized
              reproduction or dissemination outside the platform is strictly prohibited.
            </p>
          </section>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
