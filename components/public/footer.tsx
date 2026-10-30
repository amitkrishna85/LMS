import Link from "next/link";
import { Compass, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                SkillPulse
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              A curated learning marketplace delivering internal masterclasses
              and direct links to premier external courses across the web.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Admin Verified Curriculum
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-white transition-colors"
                >
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?type=INTERNAL"
                  className="hover:text-white transition-colors"
                >
                  Platform Masterclasses
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?type=EXTERNAL"
                  className="hover:text-white transition-colors"
                >
                  External Curated Links
                </Link>
              </li>
              <li>
                <Link
                  href="/paths"
                  className="hover:text-white transition-colors"
                >
                  Learning Roadmaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Organization
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About SkillPulse
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Support & Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* External disclaimer & compliance notice */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              External Course Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              SkillPulse provides direct links to trusted educational providers
              (e.g., Udemy, Coursera). We do not host or reproduce third-party
              content. External courses require authentication on the host
              platform.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillPulse Academy. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for enterprise engineering and continuous learning
          </p>
        </div>
      </div>
    </footer>
  );
}
