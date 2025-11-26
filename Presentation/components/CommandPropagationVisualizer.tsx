"use client";

import { useEffect, useMemo, useState } from "react";

interface CommandPropagationVisualizerProps {
  inView: boolean;
}

const COMMAND_STAGES = [
  {
    id: "frontend",
    label: "Frontend",
    role: "React UI",
    detail: "Operator issues switching/control command with validation",
    latency: 80,
  },
  {
    id: "backend",
    label: "Backend",
    role: "Node.js API",
    detail: "Authenticates payload, signs it, and schedules MQTT publish",
    latency: 95,
  },
  {
    id: "mqtt",
    label: "MQTT Broker",
    role: "HiveMQ Cluster",
    detail: "Batches command, prioritizes QoS 1 delivery, fan-outs to panel",
    latency: 110,
  },
  {
    id: "panel",
    label: "Panel",
    role: "CCMS Controller",
    detail: "Executes relays, updates energy counters, logs transaction",
    latency: 140,
  },
];

const ACK_STAGES = [
  {
    id: "panel-ack",
    label: "Panel",
    role: "LoRa Node",
    detail: "Packages ACK with measured load + timestamp",
    latency: 70,
  },
  {
    id: "lora",
    label: "LoRa Mesh",
    role: "Gateway Ring",
    detail: "Multi-hop spread-spectrum return to MQTT edge bridge",
    latency: 120,
  },
  {
    id: "mqtt-return",
    label: "MQTT Broker",
    role: "QoS Monitor",
    detail: "Confirms packet integrity and forwards to backend",
    latency: 90,
  },
  {
    id: "backend-ui",
    label: "Backend → Frontend",
    role: "Websocket",
    detail: "Streams acknowledgment + telemetry back to operator",
    latency: 85,
  },
];

const GAP_BEFORE_ACK = 350;
const GAP_AFTER_ACK = 450;

const formatMs = (value: number) => `${Math.round(value)} ms`;

const CommandPropagationVisualizer = ({
  inView,
}: CommandPropagationVisualizerProps) => {
  const commandDuration = useMemo(
    () => COMMAND_STAGES.reduce((sum, stage) => sum + stage.latency, 0),
    []
  );
  const ackDuration = useMemo(
    () => ACK_STAGES.reduce((sum, stage) => sum + stage.latency, 0),
    []
  );
  const ackStart = commandDuration + GAP_BEFORE_ACK;
  const totalDuration =
    commandDuration + GAP_BEFORE_ACK + ackDuration + GAP_AFTER_ACK;

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!inView) {
      setElapsed(0);
      return;
    }
    if (typeof window === "undefined") return;
    const perf = window.performance;
    let start = perf.now();
    const interval = window.setInterval(() => {
      const now = perf.now();
      const delta = now - start;
      const looped = delta % totalDuration;
      setElapsed(looped);
    }, 80);

    return () => {
      window.clearInterval(interval);
    };
  }, [inView, totalDuration]);

  const commandActive = elapsed < commandDuration;
  const commandElapsed = Math.min(elapsed, commandDuration);
  const commandProgress = Number((commandElapsed / commandDuration).toFixed(3));

  const ackElapsed = Math.max(elapsed - ackStart, 0);
  const ackActive = ackElapsed > 0 && ackElapsed < ackDuration;
  const ackProgress = ackActive
    ? Number((ackElapsed / ackDuration).toFixed(3))
    : 0;

  const getActiveIndex = (
    stages: typeof COMMAND_STAGES,
    time: number
  ): number => {
    let acc = 0;
    for (let i = 0; i < stages.length; i += 1) {
      acc += stages[i].latency;
      if (time <= acc) return i;
    }
    return stages.length - 1;
  };

  const activeCommandIndex = commandActive
    ? getActiveIndex(COMMAND_STAGES, commandElapsed)
    : -1;
  const activeAckIndex = ackActive
    ? getActiveIndex(ACK_STAGES, ackElapsed)
    : -1;

  const roundTrip = commandDuration + ackDuration;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Command Dispatch",
            value: formatMs(commandDuration),
            accent: "text-cyan-300",
            sub: "Frontend → Panel",
          },
          {
            label: "LoRa Ack",
            value: formatMs(ackDuration),
            accent: "text-purple-300",
            sub: "Panel → Backend",
          },
          {
            label: "Round Trip",
            value: formatMs(roundTrip),
            accent: "text-emerald-300",
            sub: "Command + Confirmation",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-white/5 bg-slate-900/60 p-5"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
              {metric.label}
            </p>
            <p className={`text-3xl font-semibold mt-3 ${metric.accent}`}>
              {metric.value}
            </p>
            <p className="text-gray-400 text-sm mt-1">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-4xl border border-cyan-500/20 bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
            Command Dispatch Path
          </p>
          <h4 className="text-2xl font-semibold text-white mt-2 mb-6">
            Frontend → Backend → MQTT Broker → Panel
          </h4>

          <div className="relative h-3 rounded-full bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 opacity-40"></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white/60 bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-[left,opacity] duration-150"
              style={{
                left: `${Math.min(Math.max(commandProgress, 0), 1) * 100}%`,
                opacity: commandActive ? 1 : 0.35,
              }}
            ></div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {COMMAND_STAGES.map((stage, idx) => {
              const active = idx === activeCommandIndex && commandActive;
              return (
                <div
                  key={stage.id}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    active
                      ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
                      : "border-white/5 bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-semibold">
                      {idx + 1}. {stage.label}
                    </span>
                    <span className="text-gray-400">
                      {formatMs(stage.latency)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">
                    {stage.role}
                  </p>
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                    {stage.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-4xl border border-purple-500/20 bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-purple-200">
            LoRa Acknowledgment
          </p>
          <h4 className="text-2xl font-semibold text-white mt-2 mb-6">
            Panel → LoRa Mesh → MQTT Broker → Backend
          </h4>

          <div className="relative h-3 rounded-full bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-purple-500 via-fuchsia-500 to-pink-500 opacity-40"></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white/60 bg-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.6)] transition-[left,opacity] duration-150"
              style={{
                left: `${(1 - Math.min(Math.max(ackProgress, 0), 1)) * 100}%`,
                opacity: ackActive ? 1 : 0,
              }}
            ></div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {ACK_STAGES.map((stage, idx) => {
              const active = idx === activeAckIndex && ackActive;
              return (
                <div
                  key={stage.id}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    active
                      ? "border-purple-400/60 bg-purple-500/10 shadow-[0_10px_30px_rgba(192,132,252,0.25)]"
                      : "border-white/5 bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-semibold">
                      {idx + 1}. {stage.label}
                    </span>
                    <span className="text-gray-400">
                      {formatMs(stage.latency)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">
                    {stage.role}
                  </p>
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                    {stage.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPropagationVisualizer;
