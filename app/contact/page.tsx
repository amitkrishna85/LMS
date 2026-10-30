import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { Mail, MessageSquare, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Support & Contact | SkillPulse",
  description: "Contact SkillPulse Academy administrators and platform support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      <div className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Support & Inquiries
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Have questions regarding curriculum access, corporate account
            invitations, or learning paths?
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Get in Touch</h2>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900">Email Support</strong>
                  <span>support@skillpulse.internal</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900">Response Hours</strong>
                  <span>Monday - Friday • 9:00 AM - 6:00 PM CET</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900">HQ Office</strong>
                  <span>SkillPulse Digital Academy • Oslo / Global</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support Note */}
          <div className="bg-indigo-950 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase">
                Enterprise Notice
              </span>
              <h3 className="text-xl font-bold">Account Invitations</h3>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Student self-registration is disabled. If you are an employee or
                learner seeking access, please contact your team administrator to
                receive your temporary credentials or password reset link.
              </p>
            </div>

            <div className="pt-6 border-t border-indigo-800 text-xs text-indigo-300">
              Platform status: <strong className="text-emerald-400">All Systems Operational</strong>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
