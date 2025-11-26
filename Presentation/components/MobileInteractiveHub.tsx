"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Antenna,
  Lock,
  Radar,
  RadioTower,
  Signal,
  Smartphone,
  Unlock,
  Wifi,
} from "lucide-react";

const FLOW_STEPS = [
  {
    title: "Command Auth",
    detail: "Frontend signs payload + embeds schedule context",
    duration: 82,
  },
  {
    title: "Edge Routing",
    detail: "Backend selects GPRS primary, LoRa standby",
    duration: 118,
  },
  {
    title: "MQTT Transit",
    detail: "HiveMQ fan-out with QoS1 handshake",
    duration: 164,
  },
  {
    title: "Panel Execution",
    detail: "CCMS relays toggle and meter snapshots",
    duration: 141,
  },
  {
    title: "LoRa Return",
    detail: "Mesh ACK carries load + anomaly bits",
    duration: 126,
  },
];

const PANEL_METRICS = [
  {
    name: "Sector 17 Plaza",
    value: 88,
    health: "Stable",
    color: "#22d3ee",
  },
  {
    name: "Sukhna Lakefront",
    value: 74,
    health: "Optimized",
    color: "#a855f7",
  },
  {
    name: "Madhya Marg Corridor",
    value: 92,
    health: "Peak Load",
    color: "#f97316",
  },
  {
    name: "IT Park Cluster",
    value: 69,
    health: "Eco",
    color: "#34d399",
  },
];

const MESH_NODES = [
  { id: "N1", city: "Sector 17 Plaza", tier: "Gateway" },
  { id: "N2", city: "Madhya Marg", tier: "Panel" },
  { id: "N3", city: "Sector 35", tier: "Panel" },
  { id: "N4", city: "ISBT-43", tier: "Repeater" },
  { id: "N5", city: "IT Park", tier: "Panel" },
  { id: "N6", city: "Sukhna Lake", tier: "Repeater" },
  { id: "N7", city: "Tribune Chowk", tier: "Panel" },
  { id: "N8", city: "Aero City", tier: "Gateway" },
];

const TELEMETRY = [
  {
    label: "Avg Latency",
    value: "482 ms",
    desc: "Command → ACK window (p95)",
  },
  {
    label: "LoRa Success",
    value: "99.2%",
    desc: "Mesh acknowledgments today",
  },
  {
    label: "Energy Saved",
    value: "37%",
    desc: "Sensor fusion efficiency across corridors",
  },
];

type ModeType = "GPRS" | "LoRa";
type PanelStatus = "Online" | "Syncing" | "Alert";
type DoorStatus = "Locked" | "Open";

const PING_INTERVALS: Record<ModeType, number[]> = {
  GPRS: [320, 340, 360],
  LoRa: [540, 560, 520],
};

const PANEL_GRID = [
  { id: "CHD-17A", area: "Sector 17 Plaza", feeder: "Feeder A" },
  { id: "CHD-22B", area: "Sector 22 Market", feeder: "Feeder B" },
  { id: "CHD-35C", area: "Sector 35 Spine", feeder: "Feeder C" },
  { id: "CHD-SL1", area: "Sukhna Lake Walkway", feeder: "Lakeside" },
  { id: "CHD-MM3", area: "Madhya Marg East", feeder: "Express" },
  { id: "CHD-IT2", area: "IT Park Towers", feeder: "Tech" },
  { id: "CHD-TB1", area: "Tribune Chowk Flyover", feeder: "Grid X" },
  { id: "CHD-43B", area: "ISBT-43 Bay", feeder: "Terminal" },
];

const PANEL_STATUS_OPTIONS: PanelStatus[] = ["Online", "Syncing", "Alert"];

const PANEL_STATUS_COLORS: Record<
  PanelStatus,
  { bg: string; border: string; accent: string }
> = {
  Online: {
    bg: "rgba(15,118,110,0.18)",
    border: "rgba(16,185,129,0.65)",
    accent: "#6ee7b7",
  },
  Syncing: {
    bg: "rgba(202,138,4,0.16)",
    border: "rgba(251,191,36,0.7)",
    accent: "#fbbf24",
  },
  Alert: {
    bg: "rgba(190,24,93,0.2)",
    border: "rgba(244,63,94,0.75)",
    accent: "#fb7185",
  },
};

type PanelCardState = {
  id: string;
  area: string;
  feeder: string;
  status: PanelStatus;
  door: DoorStatus;
  pulseKey: number;
  sensors: number;
};

const MobileInteractiveHub = () => {
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [flowIndex, setFlowIndex] = useState(0);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [activeMode, setActiveMode] = useState<ModeType>("GPRS");
  const [isSwitching, setIsSwitching] = useState(false);
  const [panels, setPanels] = useState<PanelCardState[]>(() =>
    PANEL_GRID.map((panel, idx) => ({
      ...panel,
      status: PANEL_STATUS_OPTIONS[idx % PANEL_STATUS_OPTIONS.length],
      door: idx % 3 === 0 ? "Open" : "Locked",
      pulseKey: Date.now() + idx,
      sensors: Math.floor(Math.random() * 3) + 1,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowIndex((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...MESH_NODES].sort(() => Math.random() - 0.5);
      setActiveNodes(shuffled.slice(0, 4).map((node) => node.id));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setOrbitAngle((prev) => (prev + 0.8) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let switchTimeout: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setIsSwitching(true);
      switchTimeout = setTimeout(() => {
        setActiveMode((prev) => (prev === "GPRS" ? "LoRa" : "GPRS"));
        setIsSwitching(false);
      }, 700);
    }, 6500);
    return () => {
      clearInterval(interval);
      if (switchTimeout) clearTimeout(switchTimeout);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPanels((prev) => {
        const index = Math.floor(Math.random() * prev.length);
        const chosenStatus =
          PANEL_STATUS_OPTIONS[
            Math.floor(Math.random() * PANEL_STATUS_OPTIONS.length)
          ];
        const shouldToggleDoor = Math.random() > 0.7;
        return prev.map((panel, idx) =>
          idx === index
            ? {
                ...panel,
                status: chosenStatus,
                door: shouldToggleDoor
                  ? panel.door === "Locked"
                    ? "Open"
                    : "Locked"
                  : panel.door,
                pulseKey: Date.now(),
                sensors:
                  Math.min(
                    3,
                    Math.max(1, panel.sensors + (Math.random() > 0.6 ? 1 : -1))
                  ) || panel.sensors,
              }
            : panel
        );
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true });
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;
      varying vec3 vColor;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 3.0;
        vColor = a_color;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(vColor, alpha);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const colorLocation = gl.getAttribLocation(program, "a_color");

    const PARTICLE_COUNT = 1500;
    const positions = new Float32Array(PARTICLE_COUNT * 2);
    const velocities = new Float32Array(PARTICLE_COUNT * 2);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const mqttColor: [number, number, number] = [0.2, 0.82, 0.99];
    const loraColor: [number, number, number] = [0.4, 0.98, 0.76];

    const seedParticle = (index: number, seedColor = false) => {
      const lane = index % 2;
      positions[index * 2] = -0.9 + Math.random() * 1.8;
      positions[index * 2 + 1] = -0.98 + Math.random() * 0.1;
      velocities[index * 2] = 0;
      velocities[index * 2 + 1] = 0.0035 + Math.random() * 0.0025;
      if (seedColor) {
        const tint = lane === 0 ? mqttColor : loraColor;
        colors[index * 3] = tint[0];
        colors[index * 3 + 1] = tint[1];
        colors[index * 3 + 2] = tint[2];
      }
    };

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      seedParticle(i, true);
    }

    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    if (!positionBuffer || !colorBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const resize = () => {
      const host = canvas.parentElement ?? canvas;
      const rect = host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.width * 0.5 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.width * 0.5}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);

    let animationFrame: number;

    const render = () => {
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        positions[i * 2] += (0 - positions[i * 2]) * 0.0005;
        positions[i * 2] +=
          Math.sin((performance.now() * 0.0004 + i) % Math.PI) * 0.0004;
        positions[i * 2 + 1] += velocities[i * 2 + 1];
        if (positions[i * 2 + 1] > 1.05) {
          seedParticle(i, false);
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.clearColor(0.01, 0.02, 0.06, 0.6);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  const flowProgress = (flowIndex / (FLOW_STEPS.length - 1)) * 100;

  const waveformPath = useMemo(() => {
    const points = FLOW_STEPS.map((step, idx) => ({
      x: (idx / (FLOW_STEPS.length - 1)) * 100,
      y: 50 + Math.sin(idx * 1.2) * 30,
    }));
    return points
      .map((point, idx) => `${idx === 0 ? "M" : "L"}${point.x},${point.y}`)
      .join(" ");
  }, []);

  const backupMode = activeMode === "GPRS" ? "LoRa" : "GPRS";

  const statusBarWidth = (status: PanelStatus) => {
    if (status === "Alert") return "100%";
    if (status === "Syncing") return "72%";
    return "42%";
  };

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center"
      >
        <p className="text-sm uppercase tracking-[0.4em] text-cyan-200">
          Mobile Visualization Lab
        </p>
        <h2 className="text-3xl font-bold text-white mt-2">
          See CCMS stories come alive
        </h2>
        <p className="text-gray-300 mt-3">
          Live timelines, radial health views, and mesh heatmaps built for
          tablets — no minigames, just real telemetry.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-4xl border border-cyan-500/30 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Signal className="w-6 h-6 text-cyan-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
              Command Waveform
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Timeline of a single instruction
            </h3>
          </div>
        </div>

        <div className="relative h-28 bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl border border-white/5 overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 text-cyan-400/40"
          >
            <path
              d={waveformPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            animate={{ left: `${flowProgress}%` }}
            transition={{ ease: "easeInOut", duration: 0.8 }}
          />
        </div>

        <div className="mt-6 space-y-3">
          {FLOW_STEPS.map((step, idx) => {
            const active = idx === flowIndex;
            return (
              <div
                key={step.title}
                className={`rounded-3xl border px-4 py-3 flex items-center justify-between gap-3 ${
                  active
                    ? "border-cyan-400/70 bg-cyan-500/10"
                    : "border-white/5 bg-slate-900/70"
                }`}
              >
                <div>
                  <p className="text-sm text-gray-400">
                    {idx + 1}. {step.title}
                  </p>
                  <p className="text-base text-white">{step.detail}</p>
                </div>
                <span className="text-sm text-cyan-200 font-semibold">
                  {step.duration} ms
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-4xl border border-purple-500/30 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Radar className="w-6 h-6 text-purple-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-purple-200">
              Panel Orbit
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Health rings & orbiting alerts
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PANEL_METRICS.map((metric) => {
            const ringStyle = {
              background: `conic-gradient(${metric.color} ${
                metric.value * 3.6
              }deg, rgba(15,23,42,0.6) ${metric.value * 3.6}deg)`,
            };
            return (
              <div
                key={metric.name}
                className="rounded-3xl border border-white/5 p-4 bg-slate-900/70"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={ringStyle}
                    ></div>
                    <div className="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {metric.value}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{metric.name}</p>
                    <p className="text-base text-white font-semibold">
                      {metric.health}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 relative h-40 rounded-3xl border border-white/5 bg-slate-900/70 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border border-purple-400/50 flex items-center justify-center text-center px-4">
              <p className="text-sm text-gray-200">Orbiting alert beacons</p>
            </div>
          </div>
          {[0, 120, 240].map((angle) => (
            <div
              key={angle}
              className="absolute w-4 h-4 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.7)]"
              style={{
                left: `${
                  50 + 38 * Math.cos(((orbitAngle + angle) * Math.PI) / 180)
                }%`,
                top: `${
                  50 + 38 * Math.sin(((orbitAngle + angle) * Math.PI) / 180)
                }%`,
              }}
            ></div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-4xl border border-emerald-500/30 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Wifi className="w-6 h-6 text-emerald-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">
              LoRa Mesh Heatmap
            </p>
            <h3 className="text-2xl font-semibold text-white">
              See which pockets are pulsing
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MESH_NODES.map((node) => {
            const active = activeNodes.includes(node.id);
            return (
              <div
                key={node.id}
                className={`rounded-2xl border px-3 py-4 text-center transition ${
                  active
                    ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "border-white/5 bg-slate-900/60"
                }`}
              >
                <p className="text-xs text-gray-400">{node.tier}</p>
                <p className="text-base text-white font-semibold">
                  {node.city}
                </p>
                <p className="text-xs text-emerald-200 mt-1">
                  {active ? "Active pulse" : "Idle"}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="rounded-4xl border border-blue-500/30 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Antenna className="w-6 h-6 text-cyan-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
              Communication Mode Switch Visualizer
            </p>
            <h3 className="text-2xl font-semibold text-white">
              GPRS primary, LoRa on hot standby
            </h3>
          </div>
        </div>

        <div className="relative rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-4 overflow-hidden">
          {isSwitching && (
            <motion.div
              className="absolute inset-0 bg-cyan-500/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["GPRS", "LoRa"] as ModeType[]).map((mode) => {
              const isActive = mode === activeMode;
              const isBackup = mode === backupMode;
              const Icon = mode === "GPRS" ? Antenna : RadioTower;
              return (
                <div key={mode} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="channelHighlight"
                      className="absolute inset-0 rounded-3xl border border-cyan-400/40 bg-cyan-500/10"
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 30,
                      }}
                    />
                  )}
                  <div
                    className={`relative rounded-3xl border border-white/10 bg-slate-900/70 p-5 overflow-hidden ${
                      isActive ? "shadow-[0_0_25px_rgba(34,211,238,0.3)]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs uppercase tracking-[0.4em] ${
                          isActive ? "text-cyan-200" : "text-gray-500"
                        }`}
                      >
                        {isActive ? "Active Link" : "Backup"}
                      </span>
                      {isSwitching && isActive && (
                        <motion.span
                          className="text-xs text-cyan-300"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        >
                          Switching…
                        </motion.span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div
                        className={`rounded-2xl p-3 ${
                          mode === "GPRS"
                            ? "bg-cyan-500/10"
                            : "bg-emerald-500/10"
                        }`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {mode}
                        </p>
                        <p className="text-sm text-gray-400">
                          {mode === "GPRS"
                            ? "Wide-area carrier with 320ms heartbeat"
                            : "LoRa mesh fallback with longer pings"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <p className="text-xs text-gray-400">Ping intervals</p>
                      <div className="flex gap-2">
                        {PING_INTERVALS[mode].map((interval, idx) => (
                          <div
                            key={`${mode}-${interval}-${idx}`}
                            className="flex-1"
                          >
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                className={`h-full ${
                                  mode === "GPRS"
                                    ? "bg-gradient-to-r from-sky-400 to-blue-500"
                                    : "bg-gradient-to-r from-emerald-400 to-lime-400"
                                }`}
                                animate={{ x: ["-100%", "0%", "100%"] }}
                                transition={{
                                  duration: Math.max(interval / 600, 0.8),
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            </div>
                            <p className="text-[0.65rem] text-gray-500 mt-1 text-center">
                              {interval} ms
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      {isActive
                        ? "Carrying live switching payloads"
                        : "Ready to absorb load instantly"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="rounded-4xl border border-lime-500/30 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Radar className="w-6 h-6 text-lime-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-lime-200">
              Panel Status Grid with Animations
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Doors, relays, and alerts in one glance
            </h3>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {panels.map((panel) => {
            const palette = PANEL_STATUS_COLORS[panel.status];
            return (
              <motion.div
                key={panel.id}
                layout
                className="relative rounded-3xl border bg-slate-900/70 p-5 overflow-hidden"
                animate={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-300">{panel.area}</p>
                    <p className="text-lg text-white font-semibold">
                      {panel.id}
                    </p>
                  </div>
                  <motion.span
                    key={`${panel.id}-${panel.status}`}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10"
                    style={{ color: palette.accent }}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {panel.status}
                  </motion.span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                  <div>
                    <p>Feeder</p>
                    <p className="text-white font-semibold">{panel.feeder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      key={`${panel.id}-door-${panel.door}`}
                      className="rounded-full bg-white/10 p-2 text-cyan-200"
                      initial={{ rotate: -12, scale: 0.9 }}
                      animate={{
                        rotate: panel.door === "Locked" ? 0 : 12,
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 18,
                      }}
                    >
                      {panel.door === "Locked" ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </motion.span>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                      {panel.door}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-300">
                  <div>
                    <p className="uppercase tracking-[0.4em] text-gray-500">
                      Sensors
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 3 }).map((_, sensorIdx) => (
                        <span
                          key={sensorIdx}
                          className={`w-2.5 h-2.5 rounded-full ${
                            sensorIdx < panel.sensors
                              ? "bg-lime-300 shadow-[0_0_6px_rgba(190,242,100,0.8)]"
                              : "bg-white/10"
                          }`}
                        ></span>
                      ))}
                    </div>
                    <p className="text-[0.65rem] text-gray-500 mt-1">
                      Up to 3 sensor add-ons per node
                    </p>
                  </div>
                  <p className="text-[0.65rem] text-gray-400">
                    {panel.sensors} active
                  </p>
                </div>
                <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                    animate={{ width: statusBarWidth(panel.status) }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <motion.span
                  key={panel.pulseKey}
                  className="pointer-events-none absolute inset-0 border border-white/10 rounded-3xl"
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 0, scale: 1.25 }}
                  transition={{ duration: 1.2 }}
                />
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Cards ripple when telemetry hits — each node supports up to three
          sensor add-ons.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="rounded-4xl border border-sky-500/30 bg-slate-950/80 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Signal className="w-6 h-6 text-sky-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-sky-200">
              Particle Stream Visualizer
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Data packets streaming from field to cloud
            </h3>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-4">
          <canvas ref={particleCanvasRef} className="w-full h-56" />
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-300"></span>
              MQTT fan-out
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-300"></span>
              LoRa acknowledgments
            </div>
            <p className="text-gray-500">1.5k concurrent particles in motion</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="rounded-4xl border border-white/10 bg-white/5 p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-orange-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-orange-200">
              Telemetry Overlay
            </p>
            <h3 className="text-xl font-semibold text-white">
              Snapshot of current run
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TELEMETRY.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-4"
            >
              <p className="text-xs text-gray-400 uppercase tracking-[0.4em]">
                {item.label}
              </p>
              <p className="text-3xl font-bold text-white mt-2">{item.value}</p>
              <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-300">
          <Smartphone className="w-5 h-5 text-cyan-300" />
          Built for unattended kiosks – visuals keep looping even if no one taps
          the screen.
        </div>
      </motion.div>
    </div>
  );
};

export default MobileInteractiveHub;
