"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Bolt,
  Gamepad2,
  ShieldCheck,
  Smartphone,
  Activity,
  Zap,
  Wifi,
} from "lucide-react";

const COMMAND_STAGES = [
  {
    title: "Frontend",
    detail: "Operator taps dim command with live validation",
    tip: "Explain why commands are signed before leaving UI.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Backend",
    detail: "Next.js API checks roles, signs MQTT payload, logs intent",
    tip: "Highlight role-based approvals.",
    color: "from-blue-500 to-violet-500",
  },
  {
    title: "MQTT Broker",
    detail: "HiveMQ cluster fans out to CCMS panels with QoS 1",
    tip: "Mention redundancy and batching windows.",
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Panel",
    detail: "CCMS controller toggles relays, streams telemetry back",
    tip: "Call out real-time energy counters.",
    color: "from-purple-500 to-emerald-500",
  },
];

const ENERGY_TARGET = 68;

const RESPONSE_CARDS = [
  {
    id: "storm",
    title: "Storm Surge",
    action: "Fail forward to LoRa mesh while GPRS recovers",
    result: "Keeps lamps alive even when GSM towers struggle.",
  },
  {
    id: "audit",
    title: "Audit Night",
    action: "Enable signature-only scheduling mode",
    result: "Prevents rogue overrides during power audits.",
  },
  {
    id: "festival",
    title: "Festival Boost",
    action: "Blend adaptive dimming with offset timer",
    result: "Saves 12% energy yet keeps avenues bright.",
  },
];

const QUIZ = [
  {
    question: "Which hop confirms execution back to the UI?",
    options: ["Frontend", "LoRa Mesh", "MQTT Broker"],
    answer: "LoRa Mesh",
    note: "LoRa acknowledgment carries telemetry that the UI renders live.",
  },
  {
    question: "Best way to cut energy without dark spots?",
    options: ["Kill feeders", "Adaptive dimming", "Disable sensors"],
    answer: "Adaptive dimming",
    note: "Adaptive dimming honors lux rules and CT limits.",
  },
];

const MobileInteractiveHub = () => {
  const [stage, setStage] = useState(0);
  const [energy, setEnergy] = useState(65);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [selection, setSelection] = useState<string | null>(null);

  const stageProgress = (stage / (COMMAND_STAGES.length - 1)) * 100;

  const energyInsight = useMemo(() => {
    const delta = Math.abs(energy - ENERGY_TARGET);
    if (delta < 5) return "Perfect balance — panels stay efficient and bright.";
    if (delta < 12) return "Close! Slight tweak keeps PF in the sweet spot.";
    return "Too aggressive — field relays will complain. Dial it in.";
  }, [energy]);

  const currentQuiz = QUIZ[quizIndex];
  const quizCompleted = selection === currentQuiz.answer;

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center"
      >
        <p className="text-sm uppercase tracking-[0.4em] text-cyan-200">
          Mobile Discovery Mode
        </p>
        <h2 className="text-3xl font-bold text-white mt-2">
          Play your way through CCMS
        </h2>
        <p className="text-gray-300 mt-3">
          Tap, slide, and flip cards to understand how commands, energy, and redundancy really work.
        </p>
      </motion.div>

      {/* Mission 1 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-4xl border border-cyan-500/20 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="w-6 h-6 text-cyan-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Mission 1
            </p>
            <h3 className="text-2xl font-semibold text-white">Signal Relay Race</h3>
          </div>
        </div>

        <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
            style={{ width: `${stageProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Step {stage + 1} of {COMMAND_STAGES.length}
        </p>

        <div className="mt-6 space-y-4">
          {COMMAND_STAGES.map((item, idx) => {
            const active = idx === stage;
            return (
              <motion.div
                key={item.title}
                layout
                className={`rounded-3xl border p-4 transition ${
                  active
                    ? "border-cyan-400/70 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                    : "border-white/5 bg-slate-900/70"
                }`}
              >
                <p className="text-sm text-gray-400">{item.title}</p>
                <p className="text-lg text-white font-semibold mt-1">{item.detail}</p>
                {active && <p className="text-xs text-cyan-200 mt-2">{item.tip}</p>}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3"
            onClick={() =>
              setStage((prev) => (prev < COMMAND_STAGES.length - 1 ? prev + 1 : 0))
            }
          >
            {stage < COMMAND_STAGES.length - 1 ? "Next Hop" : "Restart Run"}
          </button>
        </div>
      </motion.div>

      {/* Mission 2 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-4xl border border-emerald-500/20 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
              Mission 2
            </p>
            <h3 className="text-2xl font-semibold text-white">Energy Mix Master</h3>
          </div>
        </div>

        <p className="text-sm text-gray-300">
          Drag the slider to balance brightness and savings.
        </p>
        <div className="mt-6">
          <input
            type="range"
            min={40}
            max={95}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full accent-emerald-400"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Eco</span>
            <span>Balanced</span>
            <span>Boost</span>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 border border-white/5">
          <p className="text-4xl font-bold text-emerald-300">{energy}%</p>
          <p className="text-sm text-gray-300 mt-2">{energyInsight}</p>
          <p className="text-xs text-gray-500 mt-2">
            Target sweet spot: {ENERGY_TARGET}% dimming for expressways at midnight.
          </p>
        </div>
      </motion.div>

      {/* Mission 3 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-4xl border border-purple-500/20 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-purple-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-purple-200">
              Mission 3
            </p>
            <h3 className="text-2xl font-semibold text-white">Resilience Deck</h3>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Tap a card to flip it and learn how the platform reacts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RESPONSE_CARDS.map((card) => {
            const isOpen = revealed[card.id];
            return (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  setRevealed((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                }
                className={`rounded-3xl border p-4 text-left transition h-full ${
                  isOpen ? "border-purple-400/60 bg-purple-500/10" : "border-white/5 bg-slate-900/70"
                }`}
              >
                <p className="text-lg font-semibold text-white">{card.title}</p>
                <p className="text-sm text-gray-300 mt-2">
                  {isOpen ? card.result : card.action}
                </p>
                <p className="text-xs text-purple-200 mt-3">
                  {isOpen ? "Tap to hide" : "Tap to reveal"}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Quiz */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="rounded-4xl border border-orange-500/20 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Bolt className="w-6 h-6 text-orange-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-orange-200">
              Mission 4
            </p>
            <h3 className="text-2xl font-semibold text-white">Rapid-Fire Quiz</h3>
          </div>
        </div>

        <p className="text-gray-200 text-lg">{currentQuiz.question}</p>

        <div className="mt-4 space-y-3">
          {currentQuiz.options.map((option) => {
            const isChosen = selection === option;
            const isAnswer = option === currentQuiz.answer;
            const showState = selection !== null;
            return (
              <button
                key={option}
                disabled={showState && !isChosen}
                onClick={() => setSelection(option)}
                className={`w-full text-left rounded-2xl border px-4 py-3 font-semibold transition ${
                  showState
                    ? isAnswer
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                      : isChosen
                      ? "border-rose-400 bg-rose-500/10 text-rose-200"
                      : "border-white/5 text-gray-400"
                    : "border-white/10 text-white"
                } ${showState ? "cursor-default" : "cursor-pointer"}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selection && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-300">{currentQuiz.note}</p>
            <button
              onClick={() => {
                setSelection(null);
                setQuizIndex((prev) => (prev + 1) % QUIZ.length);
              }}
              className="mt-3 text-sm font-semibold text-orange-200"
            >
              Next Question →
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="rounded-4xl border border-white/10 bg-white/5 p-5 flex flex-col gap-3"
      >
        <div className="flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-cyan-300" />
          <div>
            <p className="text-sm font-semibold text-white">Keep Exploring</p>
            <p className="text-xs text-gray-300">
              Replay missions or open the desktop view for the full holographic experience.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Signals", value: stage + 1 },
            { label: "Energy", value: `${energy}%` },
            { label: "Cards", value: Object.values(revealed).filter(Boolean).length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-slate-900/70 py-3">
              <p className="text-lg font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MobileInteractiveHub;
