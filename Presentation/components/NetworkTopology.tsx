"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface NetworkTopologyProps {
  inView: boolean;
}

export default function NetworkTopology({ inView }: NetworkTopologyProps) {
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

    // Central gateway
    const gateway = {
      x: width / 2,
      y: height / 2,
      radius: 50,
      label: "Gateway",
      color: "#8b5cf6",
    };

    // Edge devices in a circle
    const devices: Array<{
      x: number;
      y: number;
      radius: number;
      label: string;
      color: string;
      angle: number;
      status: string;
    }> = [];
    const deviceCount = 12;
    const radius = Math.min(width, height) * 0.35;

    for (let i = 0; i < deviceCount; i++) {
      const angle = (i / deviceCount) * Math.PI * 2;
      devices.push({
        x: gateway.x + Math.cos(angle) * radius,
        y: gateway.y + Math.sin(angle) * radius,
        radius: 25,
        label: `ESP32-${i + 1}`,
        color: i % 2 === 0 ? "#06b6d4" : "#10b981",
        angle: angle,
        status: Math.random() > 0.2 ? "active" : "standby",
      });
    }

    class NetworkPacket {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      speed: number;
      color: string;
      size: number;

      constructor(
        startX: number,
        startY: number,
        targetX: number,
        targetY: number,
        color: string
      ) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 0.02 + Math.random() * 0.03;
        this.color = color;
        this.size = 4 + Math.random() * 3;
      }

      update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          // Reset to random device
          const device = devices[Math.floor(Math.random() * devices.length)];
          this.x = device.x;
          this.y = device.y;
          this.targetX = gateway.x;
          this.targetY = gateway.y;
        } else {
          this.x += dx * this.speed;
          this.y += dy * this.speed;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const packets: NetworkPacket[] = [];
    devices.forEach((device) => {
      if (device.status === "active") {
        for (let i = 0; i < 2; i++) {
          packets.push(
            new NetworkPacket(
              device.x,
              device.y,
              gateway.x,
              gateway.y,
              device.color
            )
          );
        }
      }
    });

    let time = 0;
    let animationId: number;

    const drawNode = (node: any, time: number, isGateway = false) => {
      const pulse = Math.sin(time / 600) * 5;

      // Outer glow
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = node.color;
      ctx.shadowBlur = isGateway ? 60 : 40;
      ctx.shadowColor = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 20 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Main node
      const gradient = ctx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        node.radius
      );
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.5, node.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");

      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // Status indicator
      if (!isGateway) {
        const statusColor = node.status === "active" ? "#10b981" : "#6b7280";
        ctx.globalAlpha = 1;
        ctx.fillStyle = statusColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = statusColor;
        ctx.beginPath();
        ctx.arc(
          node.x + node.radius - 8,
          node.y - node.radius + 8,
          5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Label
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.font = isGateway
        ? "bold 18px SF Pro Display, Inter, Arial"
        : "bold 13px SF Pro Display, Inter, Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y);
      ctx.shadowBlur = 0;
    };

    const drawConnections = (time: number) => {
      devices.forEach((device, idx) => {
        const gradient = ctx.createLinearGradient(
          device.x,
          device.y,
          gateway.x,
          gateway.y
        );
        gradient.addColorStop(0, device.color);
        gradient.addColorStop(1, gateway.color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = device.status === "active" ? 3 : 1.5;
        ctx.globalAlpha = device.status === "active" ? 0.5 : 0.2;
        ctx.shadowBlur = device.status === "active" ? 20 : 5;
        ctx.shadowColor = device.color;
        ctx.setLineDash(device.status === "active" ? [8, 4] : [10, 10]);
        ctx.lineDashOffset = device.status === "active" ? -time / 30 : 0;

        ctx.beginPath();
        ctx.moveTo(device.x, device.y);
        ctx.lineTo(gateway.x, gateway.y);
        ctx.stroke();
      });

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    };

    const drawMeshConnections = (time: number) => {
      // Connect nearby devices
      for (let i = 0; i < devices.length; i++) {
        for (let j = i + 1; j < devices.length; j++) {
          const dx = devices[j].x - devices[i].x;
          const dy = devices[j].y - devices[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius * 0.75) {
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.15;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#3b82f6";
            ctx.beginPath();
            ctx.moveTo(devices[i].x, devices[i].y);
            ctx.lineTo(devices[j].x, devices[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      time += 16;
      ctx.fillStyle = "rgba(3, 7, 18, 0.15)";
      ctx.fillRect(0, 0, width, height);

      drawMeshConnections(time);
      drawConnections(time);

      packets.forEach((packet) => {
        packet.update();
        packet.draw(ctx);
      });

      devices.forEach((device) => drawNode(device, time));
      drawNode(gateway, time, true);

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
      className="relative w-full card-glass rounded-3xl p-8 overflow-hidden border border-blue-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <canvas
        ref={canvasRef}
        className="w-full h-[500px] rounded-2xl relative z-10"
      />
      <div className="mt-6 text-center text-gray-300 relative z-10">
        <p className="text-lg font-medium">
          Mesh network topology with 12 ESP32 devices and central gateway
        </p>
      </div>
    </motion.div>
  );
}
