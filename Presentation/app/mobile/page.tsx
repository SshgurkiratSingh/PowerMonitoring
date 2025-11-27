"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CircuitBoard, Smartphone } from "lucide-react";
import MobileInteractiveHub from "@/components/MobileInteractiveHub";
import HardwareFlowDiagram from "@/components/HardwareFlowDiagram";

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

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-4xl border border-emerald-500/30 bg-slate-950/80 p-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-sm text-emerald-200">
            <CircuitBoard className="w-4 h-4" />
            Hardware Telemetry Flow
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">
            RS485 → ESP32 → Mesh, optimized for field demos
          </h2>
          <p className="text-gray-300 mt-3 text-sm">
            Quick reference of how the power stack, Modbus reads, sensor sweep,
            automation core, and dual comms synchronize before every alert hits
            the server.
          </p>

          <div className="mt-6 -mx-2 sm:mx-0">
            <HardwareFlowDiagram />
          </div>
        </motion.section>
      </main>
    </div>
  );
}
