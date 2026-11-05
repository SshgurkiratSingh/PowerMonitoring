"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, CheckCircle2 } from "lucide-react";

interface BenefitsProps {
  inView: boolean;
}

export default function InteractiveBenefits({ inView }: BenefitsProps) {
  const [activeBenefit, setActiveBenefit] = useState(0);

  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Reliability",
      stat: "99.9%",
      desc: "Enterprise-grade uptime with dual communication redundancy",
      points: ["Automatic failover", "Self-healing network", "24/7 monitoring"],
      color: "green",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "Scalable Growth",
      stat: "∞",
      desc: "Unlimited scalability for expanding infrastructure needs",
      points: ["Cloud architecture", "Distributed system", "Easy deployment"],
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ delay: idx * 0.2, duration: 0.8 }}
            onMouseEnter={() => setActiveBenefit(idx)}
            className={`relative group cursor-pointer ${
              activeBenefit === idx ? "z-10" : ""
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-all duration-500`}
            ></div>

            <motion.div
              animate={activeBenefit === idx ? { scale: 1.05 } : { scale: 1 }}
              className="relative card-holographic rounded-3xl p-10 h-full"
            >
              <div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-1 mb-6 shadow-neon-${benefit.color}`}
              >
                <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
                  <benefit.icon
                    className={`w-12 h-12 text-${benefit.color}-400`}
                  />
                </div>
              </div>

              <div
                className={`text-8xl font-black text-${benefit.color}-400 mb-4 neon-${benefit.color}`}
              >
                {benefit.stat}
              </div>

              <h3 className="text-4xl font-bold text-white mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-400 text-lg mb-6">{benefit.desc}</p>

              <div className="space-y-3">
                {benefit.points.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      activeBenefit === idx && inView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0.5, x: 0 }
                    }
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 text-${benefit.color}-400`}
                    />
                    <span className="text-gray-300">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
