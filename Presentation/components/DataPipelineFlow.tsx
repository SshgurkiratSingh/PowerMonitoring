"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface DataPipelineProps {
  inView: boolean;
}

export default function DataPipelineFlow({ inView }: DataPipelineProps) {
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

    const stages = [
      {
        x: width * 0.15,
        y: height * 0.3,
        label: "Collection",
        desc: "Sensors",
        color: "#06b6d4",
        size: 60,
      },
      {
        x: width * 0.35,
        y: height * 0.25,
        label: "Processing",
        desc: "ESP32",
        color: "#8b5cf6",
        size: 70,
      },
      {
        x: width * 0.55,
        y: height * 0.35,
        label: "Transmission",
        desc: "GPRS/LoRa",
        color: "#f59e0b",
        size: 65,
      },
      {
        x: width * 0.75,
        y: height * 0.28,
        label: "Storage",
        desc: "MongoDB",
        color: "#10b981",
        size: 70,
      },
      {
        x: width * 0.85,
        y: height * 0.65,
        label: "Analytics",
        desc: "ML Engine",
        color: "#ec4899",
        size: 75,
      },
      {
        x: width * 0.65,
        y: height * 0.7,
        label: "Visualization",
        desc: "Dashboard",
        color: "#3b82f6",
        size: 65,
      },
    ];

    class DataStream {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      trail: Array<{ x: number; y: number }>;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 3 + Math.random() * 4;
        this.color = color;
        this.alpha = 0.8;
        this.trail = [];
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
          const point = this.trail[i];
          ctx.globalAlpha = (i / this.trail.length) * 0.3;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, this.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw particle
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const streams: DataStream[] = [];
    stages.forEach((stage) => {
      for (let i = 0; i < 15; i++) {
        streams.push(new DataStream(stage.x, stage.y, stage.color));
      }
    });

    let time = 0;
    let animationId: number;

    const drawStage = (stage: any, time: number) => {
      const pulse = Math.sin(time / 800) * 8;

      // Glow effect
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = stage.color;
      ctx.shadowBlur = 50;
      ctx.shadowColor = stage.color;
      ctx.beginPath();
      ctx.arc(stage.x, stage.y, stage.size + 30 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      const gradient = ctx.createRadialGradient(
        stage.x,
        stage.y,
        0,
        stage.x,
        stage.y,
        stage.size
      );
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.4, stage.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");

      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 40;
      ctx.shadowColor = stage.color;
      ctx.beginPath();
      ctx.arc(stage.x, stage.y, stage.size, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(stage.x, stage.y, stage.size - 15, 0, Math.PI * 2);
      ctx.stroke();

      // Text
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.font = "bold 18px SF Pro Display, Inter, Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(stage.label, stage.x, stage.y + 3);

      ctx.font = "13px SF Pro Display, Inter, Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(stage.desc, stage.x, stage.y + 20);
    };

    const drawFlowLines = (time: number) => {
      const pairs = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
      ];

      pairs.forEach(([startIdx, endIdx], pairIdx) => {
        const start = stages[startIdx];
        const end = stages[endIdx];

        const gradient = ctx.createLinearGradient(
          start.x,
          start.y,
          end.x,
          end.y
        );
        gradient.addColorStop(0, start.color);
        gradient.addColorStop(1, end.color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = start.color;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = -time / 20;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        // Add curved path
        const cpX =
          (start.x + end.x) / 2 + Math.sin(time / 1000 + pairIdx) * 50;
        const cpY =
          (start.y + end.y) / 2 + Math.cos(time / 1000 + pairIdx) * 50;
        ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);

        ctx.stroke();
        ctx.setLineDash([]);

        // Animated arrow
        const progress = (Math.sin(time / 1000 + pairIdx * 0.5) + 1) / 2;
        const arrowX = start.x + (end.x - start.x) * progress;
        const arrowY = start.y + (end.y - start.y) * progress;

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = end.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = end.color;
        ctx.beginPath();
        ctx.arc(arrowX, arrowY, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    };

    const animate = () => {
      time += 16;
      ctx.fillStyle = "rgba(3, 7, 18, 0.1)";
      ctx.fillRect(0, 0, width, height);

      streams.forEach((stream) => {
        stream.update();
        stream.draw(ctx);
      });

      drawFlowLines(time);
      stages.forEach((stage) => drawStage(stage, time));

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
      className="relative w-full card-glass rounded-3xl p-8 overflow-hidden border border-cyan-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
      <canvas
        ref={canvasRef}
        className="w-full h-[500px] rounded-2xl relative z-10"
      />
      <div className="mt-6 text-center text-gray-400 relative z-10">
        <p className="text-lg">
          Complete data pipeline from collection to visualization
        </p>
      </div>
    </motion.div>
  );
}
