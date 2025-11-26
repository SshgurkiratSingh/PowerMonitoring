"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Signal, Smartphone } from "lucide-react";
import MobileInteractiveHub from "@/components/MobileInteractiveHub";

export default function MobilePlayground() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Desktop Tour
          </Link>
          <div className="inline-flex items-center gap-2 text-xs text-gray-400">
            <Smartphone className="w-4 h-4 text-cyan-300" />
            Mobile Play Mode
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="rounded-4xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/70 to-slate-900/40 p-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-200">
            <Signal className="w-4 h-4" /> Visualization Mode
          </div>
          <h1 className="text-4xl font-black mt-6">
            Mobile Visualization Studio
          </h1>
          <p className="text-gray-300 text-lg mt-4">
            Built for 12-inch tablets and phones — every module loops live
            telemetry, timelines, and heatmaps for quick demos.
          </p>
        </motion.section>

        <MobileInteractiveHub />
      </main>
    </div>
  );
}
