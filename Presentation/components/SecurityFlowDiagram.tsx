"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface SecurityFlowProps {
  inView: boolean;
}

export default function SecurityFlowDiagram({ inView }: SecurityFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const layers = [
      {
        x: width * 0.1,
        y: height * 0.5,
        label: "Device",
        sublabel: "AES-256",
        color: "#ef4444",
        icon: "🔐",
      },
      {
        x: width * 0.3,
        y: height * 0.5,
        label: "TLS 1.3",
        sublabel: "Transport",
        color: "#f59e0b",
        icon: "🛡️",
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        label: "JWT",
        sublabel: "Auth",
        color: "#10b981",
        icon: "🎫",
      },
      {
        x: width * 0.7,
        y: height * 0.5,
        label: "RBAC",
        sublabel: "Access",
        color: "#3b82f6",
        icon: "👤",
      },
      {
        x: width * 0.9,
        y: height * 0.5,
        label: "Audit",
        sublabel: "Logging",
        color: "#8b5cf6",
        icon: "📝",
      },
    ];

    class SecurityPacket {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      color: string;
      progress: number;
      size: number;

      constructor(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        color: string
      ) {
        this.x = startX;
        this.y = startY;
        this.targetX = endX;
        this.targetY = endY;
        this.color = color;
        this.progress = 0;
        this.size = 8;
      }

      update() {
        this.progress += 0.01;
        if (this.progress > 1) this.progress = 0;
        this.x = this.x + (this.targetX - this.x) * this.progress;
        this.y = this.y + (this.targetY - this.y) * this.progress;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Lock icon effect
        ctx.globalAlpha = 0.6;
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🔒", this.x, this.y + 5);
        ctx.shadowBlur = 0;
      }
    }

    const packets: SecurityPacket[] = [];
    for (let i = 0; i < layers.length - 1; i++) {
      packets.push(
        new SecurityPacket(
          layers[i].x,
          layers[i].y,
          layers[i + 1].x,
          layers[i + 1].y,
          layers[i].color
        )
      );
    }

    let time = 0;
    let animationId: number;

    const drawLayer = (layer: any, time: number) => {
      const pulse = Math.sin(time / 500) * 5;

      // Outer glow
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = layer.color;
      ctx.shadowBlur = 40;
      ctx.shadowColor = layer.color;
      ctx.beginPath();
      ctx.arc(layer.x, layer.y, 50 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      const gradient = ctx.createRadialGradient(
        layer.x,
        layer.y,
        0,
        layer.x,
        layer.y,
        40
      );
      gradient.addColorStop(0, layer.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(layer.x, layer.y, 40, 0, Math.PI * 2);
      ctx.fill();

      // Icon
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(layer.icon, layer.x, layer.y + 8);

      // Label
      ctx.font = "bold 16px SF Pro Display, Inter, Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(layer.label, layer.x, layer.y - 60);

      // Sublabel
      ctx.font = "12px SF Pro Display, Inter, Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText(layer.sublabel, layer.x, layer.y - 45);
    };

    const drawConnections = () => {
      for (let i = 0; i < layers.length - 1; i++) {
        const start = layers[i];
        const end = layers[i + 1];

        ctx.strokeStyle = start.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = start.color;

        ctx.beginPath();
        ctx.moveTo(start.x + 40, start.y);
        ctx.lineTo(end.x - 40, end.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    const animate = () => {
      time += 16;
      ctx.fillStyle = "rgba(3, 7, 18, 0.15)";
      ctx.fillRect(0, 0, width, height);

      drawConnections();
      layers.forEach((layer) => drawLayer(layer, time));

      packets.forEach((packet) => {
        packet.update();
        packet.draw(ctx);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [inView]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1 }}
      className="relative w-full card-glass rounded-3xl p-8 overflow-hidden border border-green-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5"></div>
      <canvas
        ref={canvasRef}
        className="w-full h-[400px] rounded-2xl relative z-10"
      />
      <div className="mt-6 text-center text-gray-400 relative z-10">
        <p className="text-lg">
          End-to-end security flow with multi-layer protection
        </p>
      </div>
    </motion.div>
  );
}
