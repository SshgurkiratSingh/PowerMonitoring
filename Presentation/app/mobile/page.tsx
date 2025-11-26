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
        <MobileInteractiveHub />
      </main>
    </div>
  );
}
