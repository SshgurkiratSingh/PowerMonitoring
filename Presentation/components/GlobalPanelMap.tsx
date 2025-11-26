"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Map } from "lucide-react";

interface GlobalPanelMapProps {
  inView: boolean;
}

type PanelType = "gprs" | "lora";

interface PanelLocation {
  id: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  type: PanelType;
  lightsOn: number;
  voltage: number;
  current: number;
  pf: number;
}

const PANEL_LOCATIONS: PanelLocation[] = [
  {
    id: "panel-01",
    name: "Sector 17 Plaza",
    city: "Chandigarh",
    lat: 30.741,
    lon: 76.7938,
    type: "gprs",
    lightsOn: 128,
    voltage: 414,
    current: 58,
    pf: 0.97,
  },
  {
    id: "panel-02",
    name: "Knowledge Park",
    city: "Mohali",
    lat: 30.7046,
    lon: 76.7179,
    type: "gprs",
    lightsOn: 142,
    voltage: 416,
    current: 60,
    pf: 0.95,
  },
  {
    id: "panel-03",
    name: "Industrial Belt",
    city: "Baddi",
    lat: 30.9578,
    lon: 76.7911,
    type: "lora",
    lightsOn: 88,
    voltage: 412,
    current: 55,
    pf: 0.94,
  },
  {
    id: "panel-04",
    name: "Airport Corridor",
    city: "Amritsar",
    lat: 31.7096,
    lon: 74.7973,
    type: "gprs",
    lightsOn: 176,
    voltage: 418,
    current: 63,
    pf: 0.96,
  },
  {
    id: "panel-05",
    name: "Ring Road",
    city: "Delhi",
    lat: 28.7041,
    lon: 77.1025,
    type: "lora",
    lightsOn: 210,
    voltage: 417,
    current: 64,
    pf: 0.98,
  },
  {
    id: "panel-06",
    name: "IT Hub",
    city: "Gurugram",
    lat: 28.4595,
    lon: 77.0266,
    type: "gprs",
    lightsOn: 162,
    voltage: 415,
    current: 59,
    pf: 0.97,
  },
  {
    id: "panel-07",
    name: "Seaside Promenade",
    city: "Mumbai",
    lat: 19.076,
    lon: 72.8777,
    type: "lora",
    lightsOn: 198,
    voltage: 413,
    current: 61,
    pf: 0.95,
  },
  {
    id: "panel-08",
    name: "Smart Avenue",
    city: "Pune",
    lat: 18.5204,
    lon: 73.8567,
    type: "gprs",
    lightsOn: 154,
    voltage: 416,
    current: 57,
    pf: 0.96,
  },
];

const CONTROL_CENTER = {
  name: "Network Operations Center",
  lat: 28.4595,
  lon: 77.0266,
};

const INDIA_BOUNDS = {
  minLat: 7.5,
  maxLat: 37.5,
  minLon: 68,
  maxLon: 97,
};

const MAP_WIDTH = 640;
const MAP_HEIGHT = 420;

const INDIA_PATH =
  "M160,30 L220,60 L260,80 L300,120 L340,170 L360,210 L330,260 L300,300 L270,340 L240,380 L200,360 L170,320 L140,280 L120,240 L110,200 L120,150 L150,90 Z";

const projectToMap = (lat: number, lon: number) => {
  const x =
    ((lon - INDIA_BOUNDS.minLon) / (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon)) *
    MAP_WIDTH;
  const y =
    (1 -
      (lat - INDIA_BOUNDS.minLat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) *
    MAP_HEIGHT;
  return { x, y };
};

const buildArcPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
) => {
  const cx = (start.x + end.x) / 2;
  const cy = Math.min(start.y, end.y) - Math.max(40, Math.abs(start.x - end.x) * 0.2);
  return `M${start.x},${start.y} Q${cx},${cy} ${end.x},${end.y}`;
};

interface EnergyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  value: string;
}

const ENERGY_NODES: EnergyNode[] = [
  {
    id: "grid",
    label: "415V Grid",
    x: 0.15,
    y: 0.22,
    color: "#38bdf8",
    value: "63A",
  },
  {
    id: "panel",
    label: "CCMS Panel",
    x: 0.4,
    y: 0.38,
    color: "#c084fc",
    value: "20kW",
  },
  {
    id: "bus",
    label: "Feeder Bus",
    x: 0.68,
    y: 0.55,
    color: "#f97316",
    value: "3-Phase",
  },
  {
    id: "lights",
    label: "Street Lights",
    x: 0.88,
    y: 0.78,
    color: "#34d399",
    value: "312 Nodes",
  },
];

const ENERGY_CONNECTIONS = [
  { from: "grid", to: "panel", color: "#38bdf8" },
  { from: "panel", to: "bus", color: "#c084fc" },
  { from: "bus", to: "lights", color: "#34d399" },
];

interface EnergyPulse {
  from: EnergyNode["id"];
  to: EnergyNode["id"];
  color: string;
  progress: number;
  speed: number;
}

const EnergyFlowAnimation = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const pulsesRef = useRef<EnergyPulse[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const getControlPoint = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    height: number,
  ) => ({
    x: (from.x + to.x) / 2,
    y: Math.min(from.y, to.y) - height * 0.15,
  });

  const getQuadraticPoint = (
    t: number,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ) => {
    const inv = 1 - t;
    const x = inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x;
    const y = inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y;
    return { x, y };
  };

  const draw = useCallback(
    (timestamp: number) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const { width, height } = sizeRef.current;
      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      const nodeMap = ENERGY_NODES.map((node) => ({
        ...node,
        px: node.x * width,
        py: node.y * height,
      })).reduce<Record<string, { px: number; py: number; color: string; label: string; value: string }>>(
        (acc, node) => {
          acc[node.id] = node;
          return acc;
        },
        {},
      );

      ENERGY_CONNECTIONS.forEach((connection) => {
        const from = nodeMap[connection.from];
        const to = nodeMap[connection.to];
        if (!from || !to) return;
        const control = getControlPoint(from, to, height);
        ctx.strokeStyle = connection.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = connection.color;
        ctx.beginPath();
        ctx.moveTo(from.px, from.py);
        ctx.quadraticCurveTo(control.x, control.y, to.px, to.py);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      const delta = ((timestamp - (lastTimeRef.current ?? timestamp)) / 1000) * 0.6;
      pulsesRef.current.forEach((pulse) => {
        pulse.progress += delta * pulse.speed;
        if (pulse.progress > 1) pulse.progress = 0;
        const from = nodeMap[pulse.from];
        const to = nodeMap[pulse.to];
        if (!from || !to) return;
        const control = getControlPoint(from, to, height);
        const { x, y } = getQuadraticPoint(pulse.progress, from, control, to);
        ctx.fillStyle = pulse.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = pulse.color;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      Object.values(nodeMap).forEach((node) => {
        ctx.fillStyle = "rgba(15,23,42,0.9)";
        ctx.beginPath();
        ctx.ellipse(node.px, node.py, width * 0.08, height * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `${node.color}90`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "600 18px 'Space Grotesk'";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.px, node.py - 6);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "14px 'Space Grotesk'";
        ctx.fillText(node.value, node.px, node.py + 18);
      });

      lastTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(draw);
    },
    [],
  );

  useEffect(() => {
    if (!active) return;

    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const { offsetWidth, offsetHeight } = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = offsetWidth * dpr;
      canvasRef.current.height = offsetHeight * dpr;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      sizeRef.current = { width: offsetWidth, height: offsetHeight };
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    pulsesRef.current = ENERGY_CONNECTIONS.map((connection) => ({
      from: connection.from,
      to: connection.to,
      color: connection.color,
      progress: Math.random(),
      speed: 0.2 + Math.random() * 0.2,
    }));

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, draw]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const GlobalPanelMap = ({ inView }: GlobalPanelMapProps) => {
  const [selectedPanel, setSelectedPanel] = useState<PanelLocation>(PANEL_LOCATIONS[0]);
  const [activePanelId, setActivePanelId] = useState(PANEL_LOCATIONS[0].id);
  const [telemetry, setTelemetry] = useState({ load: 18.5, energy: 342, savings: 12.6 });

  const projectedPanels = useMemo(
    () =>
      PANEL_LOCATIONS.map((panel) => ({
        ...panel,
        point: projectToMap(panel.lat, panel.lon),
      })),
    [],
  );

  const controlCenterPoint = useMemo(
    () => projectToMap(CONTROL_CENTER.lat, CONTROL_CENTER.lon),
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const randomPanel = PANEL_LOCATIONS[Math.floor(Math.random() * PANEL_LOCATIONS.length)];
      setActivePanelId(randomPanel.id);
      setTelemetry((prev) => ({
        load: 18 + Math.random() * 2,
        energy: prev.energy + Math.random() * 2,
        savings: 12 + Math.random() * 2,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!inView) return;
    setActivePanelId(selectedPanel.id);
  }, [inView, selectedPanel.id]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="card-holographic rounded-4xl p-8 bg-gradient-to-br from-slate-900/50 to-slate-900/80 border border-cyan-500/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-cyan-400" />
          <div>
            <p className="text-cyan-300 text-sm uppercase tracking-[0.4em]">Real-Time Energy Flow</p>
            <h3 className="text-3xl font-bold text-white">Live Distribution Animation</h3>
          </div>
        </div>
        <div className="relative h-[360px] rounded-3xl bg-slate-950/80 border border-white/5 overflow-hidden">
          <EnergyFlowAnimation active={inView} />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            {
              label: "Active Load",
              value: `${telemetry.load.toFixed(1)} kW`,
              badge: "Live",
              color: "from-cyan-500 to-blue-500",
            },
            {
              label: "Energy Today",
              value: `${telemetry.energy.toFixed(1)} kWh`,
              badge: "Measured",
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Savings",
              value: `${telemetry.savings.toFixed(1)} %`,
              badge: "Optimized",
              color: "from-emerald-500 to-green-500",
            },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/5 p-4 bg-slate-900/60">
              <span className="text-xs uppercase text-gray-400 tracking-widest">{metric.label}</span>
              <p className="text-3xl font-bold text-white mt-2">{metric.value}</p>
              <span
                className={`inline-flex text-xs mt-3 px-3 py-1 rounded-full bg-gradient-to-r ${metric.color} text-white/90`}
              >
                {metric.badge}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="card-holographic rounded-4xl p-8 bg-gradient-to-br from-slate-900/50 to-slate-900/80 border border-blue-500/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <Map className="w-6 h-6 text-blue-400" />
          <div>
            <p className="text-blue-300 text-sm uppercase tracking-[0.4em]">
              National Coverage Map
            </p>
            <h3 className="text-3xl font-bold text-white">Panel Locations & Connectivity</h3>
          </div>
        </div>

        <div className="relative h-[420px] rounded-3xl overflow-hidden border border-white/5 bg-slate-950/80">
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-full">
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="45%" r="70%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#020617" stopOpacity="1" />
              </radialGradient>
              <linearGradient id="mapFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#mapGlow)" />

            <g opacity="0.15">
              {Array.from({ length: 10 }).map((_, idx) => (
                <line
                  key={`v-${idx}`}
                  x1={(MAP_WIDTH / 10) * idx}
                  y1={0}
                  x2={(MAP_WIDTH / 10) * idx}
                  y2={MAP_HEIGHT}
                  stroke="#1e293b"
                  strokeWidth={1}
                />
              ))}
              {Array.from({ length: 8 }).map((_, idx) => (
                <line
                  key={`h-${idx}`}
                  x1={0}
                  y1={(MAP_HEIGHT / 8) * idx}
                  x2={MAP_WIDTH}
                  y2={(MAP_HEIGHT / 8) * idx}
                  stroke="#1e293b"
                  strokeWidth={1}
                />
              ))}
            </g>

            <g transform="translate(-40,10) scale(1.2)">
              <path d={INDIA_PATH} fill="url(#mapFill)" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth={3} />
            </g>

            {projectedPanels.map((panel) => {
              const path = buildArcPath(controlCenterPoint, panel.point);
              const color = panel.type === "gprs" ? "#38bdf8" : "#a855f7";
              return (
                <g key={`arc-${panel.id}`}>
                  <path d={path} stroke={`${color}33`} strokeWidth={4} fill="none" />
                  <motion.path
                    d={path}
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray="8 12"
                    fill="none"
                    animate={{ strokeDashoffset: [0, -120] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              );
            })}

            <g transform={`translate(${controlCenterPoint.x}, ${controlCenterPoint.y})`}>
              <circle r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth={3} />
              <text
                y={-16}
                textAnchor="middle"
                fill="#fcd34d"
                style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.2em" }}
              >
                NOC
              </text>
            </g>

            {projectedPanels.map((panel) => {
              const color = panel.type === "gprs" ? "#38bdf8" : "#a855f7";
              const isActive = panel.id === activePanelId || panel.id === selectedPanel.id;
              return (
                <g
                  key={panel.id}
                  transform={`translate(${panel.point.x}, ${panel.point.y})`}
                  onClick={() => setSelectedPanel(panel)}
                  className="cursor-pointer"
                >
                  {isActive && (
                    <>
                      <motion.circle
                        r={20}
                        fill={color}
                        fillOpacity={0.15}
                        animate={{ r: [16, 24], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      />
                      <text
                        y={-18}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        {panel.city}
                      </text>
                    </>
                  )}
                  <circle r={isActive ? 8 : 6} fill={color} stroke="#0f172a" strokeWidth={2} />
                </g>
              );
            })}
          </svg>

          <div className="absolute top-4 right-4 flex gap-3 text-xs">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> GPRS/GSM
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> LoRa Mesh
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm uppercase text-gray-400 tracking-[0.3em]">Selected Panel</p>
              <h4 className="text-2xl font-semibold text-white">{selectedPanel.name}</h4>
              <p className="text-gray-400">{selectedPanel.city}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest ${
                selectedPanel.type === "gprs"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40"
                  : "bg-purple-500/20 text-purple-200 border border-purple-500/40"
              }`}
            >
              {selectedPanel.type === "gprs" ? "GPRS" : "LoRa"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Lights On", value: selectedPanel.lightsOn },
              { label: "Voltage", value: `${selectedPanel.voltage} V` },
              { label: "Current", value: `${selectedPanel.current} A` },
              { label: "Power Factor", value: selectedPanel.pf.toFixed(2) },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-slate-900/70 p-4">
                <p className="text-xs uppercase text-gray-500 tracking-widest">{item.label}</p>
                <p className="text-xl font-semibold text-white mt-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GlobalPanelMap;
