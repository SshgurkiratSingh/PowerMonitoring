"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Check,
  X,
  Clock,
  Server,
  Cpu,
  CheckCircle2,
} from "lucide-react";

interface SyncSchedulingProps {
  inView: boolean;
}

interface ScheduleEntry {
  time: string;
  action: "ON" | "OFF";
  device: string;
}

type NodeKey = "server" | "node1" | "node2";

type SyncStepId = "server" | "node1" | "node2" | "verify";

interface SyncStep {
  id: SyncStepId;
  title: string;
  description: string;
  duration: number;
}

interface SyncLogEntry {
  id: string;
  message: string;
  timestamp: string;
}

interface CanvasNode {
  x: number;
  y: number;
  label: string;
  color: string;
  signature: string;
  key: NodeKey;
}

const SYNC_STEPS: SyncStep[] = [
  {
    id: "server",
    title: "Server seals new signature",
    description: "Master ON/OFF schedule is hashed and versioned at the NOC.",
    duration: 1600,
  },
  {
    id: "node1",
    title: "Node 1 handshake",
    description:
      "North feeder compares hashes and downloads the updated slots.",
    duration: 2200,
  },
  {
    id: "node2",
    title: "Node 2 handshake",
    description: "South feeder repeats the validation over the LoRa path.",
    duration: 2200,
  },
  {
    id: "verify",
    title: "Network validation",
    description: "All nodes report success and commit the synchronized plan.",
    duration: 1600,
  },
];

const STEP_TARGETS: Record<SyncStepId, NodeKey[]> = {
  server: ["server"],
  node1: ["node1"],
  node2: ["node2"],
  verify: ["server", "node1", "node2"],
};

export default function SyncSchedulingVisualization({
  inView,
}: SyncSchedulingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "syncing" | "mismatch"
  >("synced");
  const [serverSignature, setServerSignature] = useState("A7F3E2");
  const [node1Signature, setNode1Signature] = useState("A7F3E2");
  const [node2Signature, setNode2Signature] = useState("A7F3E2");
  const [lastSync, setLastSync] = useState(Date.now());
  const [currentStep, setCurrentStep] = useState<number>(SYNC_STEPS.length);
  const [activeSyncTargets, setActiveSyncTargets] = useState<NodeKey[]>([]);
  const [syncLog, setSyncLog] = useState<SyncLogEntry[]>([]);
  const syncTimeouts = useRef<number[]>([]);
  const syncStatusRef = useRef(syncStatus);
  const signaturesRef = useRef({
    server: serverSignature,
    node1: node1Signature,
    node2: node2Signature,
  });
  const activeTargetsRef = useRef<NodeKey[]>(activeSyncTargets);
  const currentStepRef = useRef(currentStep);

  const formatTimestamp = useCallback(
    () =>
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  const appendLog = useCallback(
    (entry: Omit<SyncLogEntry, "timestamp">) => {
      setSyncLog((prev) => [
        ...prev.slice(-7),
        { timestamp: formatTimestamp(), ...entry },
      ]);
    },
    [formatTimestamp]
  );

  const createLogId = () =>
    Math.random().toString(36).substring(2, 9).toUpperCase();

  const clearSyncTimeouts = useCallback(() => {
    syncTimeouts.current.forEach((id) => window.clearTimeout(id));
    syncTimeouts.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    syncTimeouts.current.push(id);
    return id;
  }, []);

  const generateSignature = useCallback(
    () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    []
  );

  useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);

  useEffect(() => {
    signaturesRef.current.server = serverSignature;
  }, [serverSignature]);

  useEffect(() => {
    signaturesRef.current.node1 = node1Signature;
  }, [node1Signature]);

  useEffect(() => {
    signaturesRef.current.node2 = node2Signature;
  }, [node2Signature]);

  useEffect(() => {
    activeTargetsRef.current = activeSyncTargets;
  }, [activeSyncTargets]);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const schedule: ScheduleEntry[] = [
    { time: "06:00", action: "ON", device: "Pump 1" },
    { time: "08:00", action: "OFF", device: "Pump 1" },
    { time: "10:00", action: "ON", device: "Pump 2" },
    { time: "14:00", action: "ON", device: "Lights" },
    { time: "18:00", action: "OFF", device: "Pump 2" },
    { time: "22:00", action: "OFF", device: "Lights" },
  ];

  const runSyncSequence = useCallback(
    (nextSignature: string) => {
      clearSyncTimeouts();
      setSyncStatus("syncing");
      setActiveSyncTargets(["server"]);
      setCurrentStep(0);

      let elapsed = 0;

      SYNC_STEPS.forEach((step, index) => {
        const stepStart = elapsed;
        const stepEnd = stepStart + step.duration;

        scheduleTimeout(() => {
          setCurrentStep(index);
          setActiveSyncTargets([...STEP_TARGETS[step.id]]);
          appendLog({
            id: createLogId(),
            message: `${step.title} — ${step.description}`,
          });
        }, stepStart);

        if (step.id === "node1") {
          scheduleTimeout(() => {
            setNode1Signature(nextSignature);
            appendLog({
              id: createLogId(),
              message: `Node 1 committed signature #${nextSignature}`,
            });
          }, stepEnd - 350);
        }

        if (step.id === "node2") {
          scheduleTimeout(() => {
            setNode2Signature(nextSignature);
            appendLog({
              id: createLogId(),
              message: `Node 2 committed signature #${nextSignature}`,
            });
          }, stepEnd - 350);
        }

        elapsed = stepEnd;
      });

      scheduleTimeout(() => {
        setSyncStatus("synced");
        setActiveSyncTargets([]);
        setCurrentStep(SYNC_STEPS.length);
        setNode1Signature(nextSignature);
        setNode2Signature(nextSignature);
        setLastSync(Date.now());
        appendLog({
          id: createLogId(),
          message: `Network validation complete. All nodes on #${nextSignature}`,
        });
      }, elapsed + 300);
    },
    [appendLog, clearSyncTimeouts, scheduleTimeout]
  );

  const updateSchedule = useCallback(() => {
    const nextSignature = generateSignature();
    clearSyncTimeouts();
    setServerSignature(nextSignature);
    setSyncStatus("mismatch");
    setActiveSyncTargets([]);
    setCurrentStep(SYNC_STEPS.length);
    setSyncLog([
      {
        id: createLogId(),
        message: `New schedule published with signature #${nextSignature}. Nodes still on previous commit.`,
        timestamp: formatTimestamp(),
      },
    ]);

    scheduleTimeout(() => runSyncSequence(nextSignature), 900);
  }, [
    clearSyncTimeouts,
    formatTimestamp,
    generateSignature,
    runSyncSequence,
    scheduleTimeout,
  ]);

  useEffect(() => {
    return () => clearSyncTimeouts();
  }, [clearSyncTimeouts]);

  useEffect(() => {
    if (!inView) return;
    const introTimer = window.setTimeout(() => updateSchedule(), 1200);
    return () => window.clearTimeout(introTimer);
  }, [inView, updateSchedule]);

  useEffect(() => {
    if (!inView) return;
    const intervalId = window.setInterval(() => updateSchedule(), 32000);
    return () => window.clearInterval(intervalId);
  }, [inView, updateSchedule]);

  useEffect(() => {
    if (!inView || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const nodes: Record<NodeKey, CanvasNode> = {
      server: {
        x: width * 0.5,
        y: height * 0.15,
        label: "Server",
        color: "#3b82f6",
        signature: signaturesRef.current.server,
        key: "server",
      },
      node1: {
        x: width * 0.25,
        y: height * 0.6,
        label: "Node 1",
        color: "#10b981",
        signature: signaturesRef.current.node1,
        key: "node1",
      },
      node2: {
        x: width * 0.75,
        y: height * 0.6,
        label: "Node 2",
        color: "#8b5cf6",
        signature: signaturesRef.current.node2,
        key: "node2",
      },
    };

    const refreshNodeSignatures = () => {
      const { server, node1, node2 } = signaturesRef.current;
      nodes.server.signature = server;
      nodes.node1.signature = node1;
      nodes.node2.signature = node2;
    };

    class SyncPacket {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      progress: number;
      color: string;
      type: "check" | "sync";

      constructor(
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        color: string,
        type: "check" | "sync"
      ) {
        this.x = fromX;
        this.y = fromY;
        this.targetX = toX;
        this.targetY = toY;
        this.progress = 0;
        this.color = color;
        this.type = type;
      }

      update() {
        this.progress = Math.min(this.progress + 0.01, 1);
        this.x = this.x + (this.targetX - this.x) * 0.04;
        this.y = this.y + (this.targetY - this.y) * 0.04;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = 0.25 + (1 - this.progress) * 0.75;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.type === "sync" ? 25 : 15;
        ctx.shadowColor = this.color;

        if (this.type === "check") {
          // Draw check packet as small circle
          ctx.beginPath();
          ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw sync packet as larger glowing packet
          ctx.beginPath();
          ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = this.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      isComplete() {
        return this.progress >= 1;
      }
    }

    const packets: SyncPacket[] = [];
    let time = 0;
    let checkTimer = 0;
    let animationId: number;

    const drawNode = (node: CanvasNode, time: number, isActive: boolean) => {
      const isServer = node.key === "server";
      const pulse =
        Math.sin(time / (isActive ? 450 : 900)) * (isActive ? 9 : 5);
      const radius = isServer ? 47 : 36;
      const serverSig = signaturesRef.current.server;
      const sigMatch = node.key === "server" ? true : node.signature === serverSig;

      ctx.globalAlpha = isActive ? 0.45 : 0.25;
      ctx.fillStyle = sigMatch ? node.color : "#ef4444";
      ctx.shadowBlur = isActive ? 60 : 40;
      ctx.shadowColor = sigMatch ? node.color : "#ef4444";
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 22 + pulse, 0, Math.PI * 2);
      ctx.fill();

      const gradient = ctx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        radius
      );
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.45, sigMatch ? node.color : "#ef4444");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");

      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 28 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const statusColor = sigMatch ? "#10b981" : "#ef4444";
      ctx.fillStyle = statusColor;
      ctx.shadowBlur = 15;
      ctx.shadowColor = statusColor;
      ctx.beginPath();
      ctx.arc(node.x + radius - 10, node.y - radius + 10, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.font = isServer
        ? "bold 18px SF Pro Display, Inter, Arial"
        : "bold 16px SF Pro Display, Inter, Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y - 8);

      ctx.font = "13px Courier New, monospace";
      ctx.fillStyle = sigMatch ? "#10b981" : "#ef4444";
      ctx.shadowBlur = 3;
      ctx.fillText(`#${node.signature}`, node.x, node.y + 12);

      ctx.shadowBlur = 0;
    };

    const drawConnections = (time: number, activeTargets: NodeKey[]) => {
      const connections = [
        { from: nodes.server, to: nodes.node1, key: "node1" as NodeKey },
        { from: nodes.server, to: nodes.node2, key: "node2" as NodeKey },
      ];

      connections.forEach((conn) => {
        const gradient = ctx.createLinearGradient(
          conn.from.x,
          conn.from.y,
          conn.to.x,
          conn.to.y
        );
        gradient.addColorStop(0, conn.from.color);
        gradient.addColorStop(1, conn.to.color);

        const isActive = activeTargets.includes(conn.key);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isActive ? 4 : 2.5;
        ctx.globalAlpha = isActive ? 0.85 : 0.25;
        ctx.shadowBlur = isActive ? 25 : 10;
        ctx.shadowColor = conn.from.color;
        ctx.setLineDash(isActive ? [14, 8] : [10, 12]);
        ctx.lineDashOffset = -time / (isActive ? 20 : 35);

        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      });
    };

    const animate = () => {
      time += 16;
      ctx.fillStyle = "rgba(3, 7, 18, 0.22)";
      ctx.fillRect(0, 0, width, height);

      refreshNodeSignatures();

      const status = syncStatusRef.current;
      const activeTargets = activeTargetsRef.current;
      const currentStepIndex = currentStepRef.current;
      const activeStepId =
        currentStepIndex < SYNC_STEPS.length
          ? SYNC_STEPS[currentStepIndex].id
          : null;

      checkTimer++;
      const spawnInterval = status === "syncing" ? 70 : 110;
      if (checkTimer > spawnInterval) {
        checkTimer = 0;

        const hasActiveTargets = activeTargets.some(
          (target) => target === "node1" || target === "node2"
        );
        if (status === "syncing" && hasActiveTargets) {
          (["node1", "node2"] as NodeKey[]).forEach((target) => {
            if (activeTargets.includes(target)) {
              packets.push(
                new SyncPacket(
                  nodes.server.x,
                  nodes.server.y,
                  nodes[target].x,
                  nodes[target].y,
                  "#38bdf8",
                  "sync"
                )
              );
            }
          });
        } else {
          packets.push(
            new SyncPacket(
              nodes.node1.x,
              nodes.node1.y,
              nodes.server.x,
              nodes.server.y,
              "#10b981",
              "check"
            )
          );
          packets.push(
            new SyncPacket(
              nodes.node2.x,
              nodes.node2.y,
              nodes.server.x,
              nodes.server.y,
              "#8b5cf6",
              "check"
            )
          );
        }

        if (activeStepId === "verify") {
          packets.push(
            new SyncPacket(
              nodes.node1.x,
              nodes.node1.y,
              nodes.server.x,
              nodes.server.y,
              "#22c55e",
              "check"
            )
          );
          packets.push(
            new SyncPacket(
              nodes.node2.x,
              nodes.node2.y,
              nodes.server.x,
              nodes.server.y,
              "#a855f7",
              "check"
            )
          );
        }
      }

      drawConnections(time, activeTargets);

      // Update and draw packets
      for (let i = packets.length - 1; i >= 0; i--) {
        packets[i].update();
        packets[i].draw(ctx);

        if (packets[i].isComplete()) {
          packets.splice(i, 1);
        }
      }

      (Object.values(nodes) as CanvasNode[]).forEach((node) =>
        drawNode(node, time, activeTargets.includes(node.key))
      );

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [inView]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1 }}
        className="relative w-full card-glass rounded-3xl p-8 overflow-hidden border border-cyan-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5"></div>

        {/* Status Banner */}
        <div className="absolute top-4 right-4 z-20">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              syncStatus === "synced"
                ? "bg-green-500/20 border border-green-500/50"
                : syncStatus === "syncing"
                ? "bg-yellow-500/20 border border-yellow-500/50"
                : "bg-red-500/20 border border-red-500/50"
            }`}
          >
            {syncStatus === "synced" && (
              <Check className="w-4 h-4 text-green-400" />
            )}
            {syncStatus === "syncing" && (
              <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
            )}
            {syncStatus === "mismatch" && (
              <X className="w-4 h-4 text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                syncStatus === "synced"
                  ? "text-green-300"
                  : syncStatus === "syncing"
                  ? "text-yellow-300"
                  : "text-red-300"
              }`}
            >
              {syncStatus === "synced"
                ? "Synchronized"
                : syncStatus === "syncing"
                ? "Syncing..."
                : "Signature Mismatch"}
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full h-[400px] rounded-2xl relative z-10"
        />
        <div className="mt-6 text-center text-gray-300 relative z-10">
          <p className="text-lg font-medium">
            Signature-Based Schedule Synchronization
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Server maintains master schedule • Nodes verify signature hash •
            Auto-sync on mismatch
          </p>
        </div>
      </motion.div>

      {/* Schedule Display and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Server Schedule */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="card-holographic rounded-2xl p-6 md:col-span-2 xl:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-blue-400" />
              <div>
                <h4 className="text-xl font-bold text-white">
                  Server Schedule
                </h4>
                <p className="text-sm text-gray-400">
                  Signature: #{serverSignature}
                </p>
              </div>
            </div>
            <button
              onClick={updateSchedule}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Update
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {schedule.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.action === "ON"
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock
                    className={`w-5 h-5 ${
                      entry.action === "ON" ? "text-green-400" : "text-red-400"
                    }`}
                  />
                  <div>
                    <p className="text-white font-medium">{entry.time}</p>
                    <p className="text-sm text-gray-400">{entry.device}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    entry.action === "ON"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {entry.action}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Node Status */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4 md:col-span-2 xl:col-span-1"
        >
          {/* Node 1 */}
          <div className="card-holographic rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-green-400" />
                <div>
                  <h4 className="text-xl font-bold text-white">
                    Node 1 Status
                  </h4>
                  <p className="text-sm text-gray-400">
                    Signature: #{node1Signature}
                  </p>
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  node1Signature === serverSignature
                    ? "bg-green-400"
                    : "bg-red-400"
                } animate-pulse`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              {node1Signature === serverSignature ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">
                    Schedule Synced
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                  <span className="text-yellow-300 font-medium">
                    Syncing...
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Last sync: {new Date(lastSync).toLocaleTimeString()}
            </p>
          </div>

          {/* Node 2 */}
          <div className="card-holographic rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-purple-400" />
                <div>
                  <h4 className="text-xl font-bold text-white">
                    Node 2 Status
                  </h4>
                  <p className="text-sm text-gray-400">
                    Signature: #{node2Signature}
                  </p>
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  node2Signature === serverSignature
                    ? "bg-green-400"
                    : "bg-red-400"
                } animate-pulse`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              {node2Signature === serverSignature ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">
                    Schedule Synced
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                  <span className="text-yellow-300 font-medium">
                    Syncing...
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Last sync: {new Date(lastSync).toLocaleTimeString()}
            </p>
          </div>

          {/* Info Box */}
          <div className="card-glass rounded-2xl p-4 border border-cyan-500/20">
            <h5 className="text-sm font-bold text-cyan-400 mb-2">
              How It Works
            </h5>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Server generates unique signature for schedule</li>
              <li>• Nodes periodically check signature hash</li>
              <li>• Mismatch triggers automatic sync</li>
              <li>• New schedule downloaded and applied</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="card-holographic rounded-2xl p-6 flex flex-col md:col-span-2 xl:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-white">Sync Timeline</h4>
              <p className="text-sm text-gray-400">
                Line-by-line verification steps
              </p>
            </div>
            <span className="text-xs text-gray-400">
              Last sync {new Date(lastSync).toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-3">
            {SYNC_STEPS.map((step, idx) => {
              const isActive = currentStep === idx;
              const isComplete = currentStep > idx;
              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border px-4 py-3 transition-all ${
                    isActive
                      ? "border-cyan-500/60 bg-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.25)]"
                      : isComplete
                      ? "border-green-500/40 bg-green-500/5"
                      : "border-white/5 bg-white/0"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <RefreshCw
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-cyan-300 animate-spin"
                            : "text-gray-500"
                        }`}
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                    <span>
                      {isActive
                        ? "Running now"
                        : isComplete
                        ? "Completed"
                        : "Queued"}
                    </span>
                    <span>{(step.duration / 1000).toFixed(1)}s window</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h5 className="text-sm font-semibold text-cyan-300 mb-3">
              Live log
            </h5>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-4 space-y-2 h-48 overflow-y-auto">
              {syncLog.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Awaiting sync activity...
                </p>
              ) : (
                syncLog.map((entry) => (
                  <div
                    key={`${entry.id}-${entry.timestamp}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <p className="text-xs text-gray-300 leading-snug">
                      {entry.message}
                    </p>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {entry.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
