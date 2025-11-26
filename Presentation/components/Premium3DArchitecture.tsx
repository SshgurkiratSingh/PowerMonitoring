"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ArchProps {
  inView: boolean;
}

export default function Premium3DArchitecture({ inView }: ArchProps) {
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
        x: width * 0.15,
        y: height * 0.5,
        label: "EDGE LAYER",
        sublabels: ["ESP32", "Sensors", "MCCB", "CT"],
        color: "#ef4444",
        radius: 80,
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        label: "CLOUD LAYER",
        sublabels: ["AWS EC2", "MongoDB", "MQTT", "REST API"],
        color: "#3b82f6",
        radius: 100,
      },
      {
        x: width * 0.85,
        y: height * 0.5,
        label: "UI LAYER",
        sublabels: ["Next.js", "Dashboard", "Maps", "Analytics"],
        color: "#f59e0b",
        radius: 80,
      },
    ];

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      angle: number;

      constructor(baseX: number, baseY: number, color: string) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100;
        this.baseX = baseX;
        this.baseY = baseY;
        this.x = baseX + Math.cos(angle) * distance;
        this.y = baseY + Math.sin(angle) * distance;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 2 + Math.random() * 3;
        this.color = color;
        this.angle = angle;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        const dx = this.x - this.baseX;
        const dy = this.y - this.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 120) {
          this.vx *= -0.5;
          this.vy *= -0.5;
        }

        this.angle += 0.01;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    layers.forEach((layer) => {
      for (let i = 0; i < 40; i++) {
        particles.push(new Particle(layer.x, layer.y, layer.color));
      }
    });

    let time = 0;
    let animationId: number;

    const drawLayer = (layer: any, time: number) => {
      const pulse = Math.sin(time / 1000) * 10;

      // Outer glow
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = layer.color;
      ctx.shadowBlur = 60;
      ctx.shadowColor = layer.color;
      ctx.beginPath();
      ctx.arc(layer.x, layer.y, layer.radius + 40 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Middle ring
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(layer.x, layer.y, layer.radius + 20, 0, Math.PI * 2);
      ctx.stroke();

      // Main circle
      ctx.globalAlpha = 0.9;
      const gradient = ctx.createRadialGradient(
        layer.x,
        layer.y,
        0,
        layer.x,
        layer.y,
        layer.radius
      );
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.5, layer.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(layer.x, layer.y, layer.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(layer.x, layer.y, layer.radius - 20, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px SF Pro Display, Inter, Arial";
      ctx.textAlign = "center";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.fillText(layer.label, layer.x, layer.y - 10);

      // Sublabels
      ctx.font = "14px SF Pro Display, Inter, Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      layer.sublabels.forEach((sub: string, i: number) => {
        ctx.fillText(sub, layer.x, layer.y + 15 + i * 18);
      });
      ctx.shadowBlur = 0;
    };

    const drawConnections = (time: number) => {
      for (let i = 0; i < layers.length - 1; i++) {
        const start = layers[i];
        const end = layers[i + 1];

        // Animated beam
        const gradient = ctx.createLinearGradient(
          start.x,
          start.y,
          end.x,
          end.y
        );
        gradient.addColorStop(0, start.color);
        gradient.addColorStop(1, end.color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.6;
        ctx.shadowBlur = 20;
        ctx.shadowColor = start.color;
        ctx.setLineDash([15, 15]);
        ctx.lineDashOffset = -time / 30;

        ctx.beginPath();
        ctx.moveTo(start.x + start.radius, start.y);
        ctx.lineTo(end.x - end.radius, end.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Data pulse
        const progress = (Math.sin(time / 1000 + i) + 1) / 2;
        const pulseX = start.x + (end.x - start.x) * progress;
        const pulseY = start.y + (end.y - start.y) * progress;

        ctx.globalAlpha = 1;
        ctx.fillStyle = end.color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = end.color;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }
    };

    const animate = () => {
      time += 16;
      ctx.fillStyle = "rgba(3, 7, 18, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      drawConnections(time);
      layers.forEach((layer) => drawLayer(layer, time));

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
      className="relative w-full card-glass rounded-3xl p-8 overflow-hidden border border-purple-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5"></div>
      <canvas
        ref={canvasRef}
        className="w-full h-[500px] rounded-2xl relative z-10"
      />
      <div className="mt-8 text-center text-gray-400 relative z-10">
        <p className="text-lg">
          Real-time data flow visualization across all layers
        </p>
      </div>
    </motion.div>
  );
}
