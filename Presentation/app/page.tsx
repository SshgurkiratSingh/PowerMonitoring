"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Cpu,
  Wifi,
  Cloud,
  Shield,
  BarChart3,
  Zap,
  Radio,
  Server,
  Database,
  Globe,
  Lock,
  Activity,
  TrendingUp,
  CircuitBoard,
  Gauge,
  Signal,
  Network,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import EnhancedBackground from "@/components/EnhancedBackground";
import AdvancedDataFlow from "@/components/AdvancedDataFlow";
import Premium3DArchitecture from "@/components/Premium3DArchitecture";
import InteractiveBenefits from "@/components/InteractiveBenefits";
import DataPipelineFlow from "@/components/DataPipelineFlow";
import SyncSchedulingVisualization from "@/components/SyncSchedulingVisualization";
import RedundancyVisualization from "@/components/RedundancyVisualization";
import GlobalPanelMap from "@/components/GlobalPanelMap";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [heroRef, heroInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const [overviewRef, overviewInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [archRef, archInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [commRef, commInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [benefitsRef, benefitsInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [pipelineRef, pipelineInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [networkRef, networkInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [syncRef, syncInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [redundancyRef, redundancyInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-x-hidden">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500 origin-left z-50"
        style={{ scaleX }}
      />

      <EnhancedBackground />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute inset-0 gradient-mesh"></div>

        <div className="container mx-auto px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full card-glass border border-cyan-500/30"
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-medium">
                Next-Generation IoT Solution
              </span>
            </motion.div>

            <motion.h1
              className="text-[10rem] md:text-[12rem] font-black mb-6 leading-none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 neon-cyan">
                CCMS
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="space-y-4 mb-12"
            >
              <p className="text-4xl md:text-5xl font-bold text-white">
                Centralized Control & Monitoring System
              </p>
              <p className="text-2xl text-gray-300">
                Smart Street Light Management with GPRS/GSM Technology
              </p>
            </motion.div>

            <motion.div
              className="w-64 h-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500 mx-auto rounded-full shadow-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: 256 }}
              transition={{ delay: 1.2, duration: 1.5 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-20 flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-cyan-400 font-medium">
                Scroll to explore
              </span>
              <ArrowRight className="w-8 h-8 text-cyan-400 rotate-90" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Overview Section (continuing after hero) */}
      <motion.section ref={overviewRef} className="relative py-32 px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={overviewInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-purple-500/30">
              <CircuitBoard className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">
                Comprehensive Solution
              </span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
              Core Features
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              20kW 3-Phase Street Light Control Panel with Remote Management
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Real-time Monitoring",
                desc: "Multi-function digital meter tracking voltage, current, power factor, energy consumption, and load parameters",
                color: "cyan",
                gradient: "from-cyan-500 to-blue-500",
              },
              {
                icon: Network,
                title: "Dual Communication",
                desc: "GPRS/GSM primary channel with LoRa mesh backup, 48hr power backup for uninterrupted connectivity",
                color: "purple",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Cloud,
                title: "Remote Schedule Control",
                desc: "Cloud-based schedule management with signature verification, sunrise-sunset automation, and CT ratio control",
                color: "blue",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Gauge,
                title: "Web Dashboard",
                desc: "User-friendly dashboard showing total lights on/off status, power consumption, and remote parameter configuration",
                color: "orange",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Shield,
                title: "2-Level Security",
                desc: "Password-protected access with parameter and schedule write protection, role-based user management",
                color: "green",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: TrendingUp,
                title: "Smart Fault Detection",
                desc: "Automatic failure reports, network off device alerts, and CT misbehavior detection for easy troubleshooting",
                color: "pink",
                gradient: "from-pink-500 to-rose-500",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={overviewInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative card-holographic rounded-3xl p-8 transform-3d cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                ></div>

                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} p-1 mb-6`}
                >
                  <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
                    <item.icon className={`w-10 h-10 text-${item.color}-400`} />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {item.desc}
                </p>

                <div
                  className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl`}
                ></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Architecture Section */}
      <motion.section
        ref={archRef}
        className="relative py-32 px-8 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={archInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-cyan-500/30">
              <Server className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-medium">System Design</span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-6">
              System Architecture
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Edge-to-Cloud architecture for 20kW 3-phase street light control
            </p>
          </motion.div>

          <Premium3DArchitecture inView={archInView} />

        </div>
      </motion.section>

      {/* Global Coverage Section */}
      <motion.section ref={networkRef} className="relative py-32 px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={networkInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-blue-500/30">
              <Network className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Global Coverage</span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mb-6">
              Real-Time Energy Intelligence
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Live energy flow animation plus interactive 3D globe with every CCMS panel location
            </p>
          </motion.div>
          <GlobalPanelMap inView={networkInView} />
        </div>
      </motion.section>

      {/* Data Pipeline Section */}
      <motion.section ref={pipelineRef} className="relative py-32 px-8 bg-gradient-to-b from-transparent via-pink-950/10 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={pipelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-pink-500/30">
              <Database className="w-5 h-5 text-pink-400" />
              <span className="text-pink-300 font-medium">Data Flow</span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
              Complete Data Pipeline
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              End-to-end data processing from collection to visualization
            </p>
          </motion.div>

          <DataPipelineFlow inView={pipelineInView} />
        </div>
      </motion.section>

      {/* Communication Section */}
      <motion.section ref={commRef} className="relative py-32 px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={commInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-green-500/30">
              <Wifi className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Connectivity</span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-6">
              GPRS/GSM + LoRa Communication
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Hybrid communication for street light panels with 48hr backup power
            </p>
          </motion.div>

          <AdvancedDataFlow inView={commInView} />
        </div>
      </motion.section>

      {/* Sync Scheduling Section */}
      <motion.section ref={syncRef} className="relative py-32 px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={syncInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-cyan-500/30">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-medium">Schedule Integrity</span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-6">
              Signature-Based Schedule Sync
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Unique signature matching keeps remote street light ON/OFF schedules aligned across server and field nodes
            </p>
          </motion.div>

          <SyncSchedulingVisualization inView={syncInView} />
        </div>
      </motion.section>

      {/* Redundancy Section */}
      <motion.section ref={redundancyRef} className="relative py-32 px-8 bg-gradient-to-b from-transparent via-green-950/10 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={redundancyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-green-500/30">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Redundancy</span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-6">
              Automatic Failover
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Dual-path architecture with intelligent redundancy management
            </p>
          </motion.div>

          <RedundancyVisualization inView={redundancyInView} />
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        ref={benefitsRef}
        className="relative py-32 px-8 bg-gradient-to-b from-transparent via-orange-950/10 to-transparent"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-full card-glass border border-orange-500/30">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-medium">
                Business Impact
              </span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 mb-6">
              Key Benefits
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Advantages of automated street light management system
            </p>
          </motion.div>

          <InteractiveBenefits inView={benefitsInView} />
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative py-16 px-8 border-t border-white/10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Zap className="w-10 h-10 text-cyan-400" />
            <span className="text-3xl font-bold text-white">CCMS</span>
          </div>
          <p className="text-gray-300 text-lg mb-2">
            Centralized Control & Monitoring System
          </p>
          <p className="text-gray-400">
            20kW 3-Phase Street Light Control Panel with GPRS/GSM Technology
          </p>
        </div>
      </footer>
    </div>
  );
}
