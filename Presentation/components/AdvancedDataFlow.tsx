'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DataFlowProps {
  inView: boolean;
}

export default function AdvancedDataFlow({ inView }: DataFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!inView || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const nodes = [
      { x: width * 0.12, y: height * 0.5, label: 'ESP32', color: '#06b6d4', type: 'device', signalStrength: 100 },
      { x: width * 0.32, y: height * 0.25, label: 'GPRS', color: '#10b981', type: 'gprs', signalStrength: 95 },
      { x: width * 0.32, y: height * 0.75, label: 'LoRa 1', color: '#8b5cf6', type: 'lora', signalStrength: 85 },
      { x: width * 0.48, y: height * 0.68, label: 'LoRa 2', color: '#a78bfa', type: 'lora', signalStrength: 60 },
      { x: width * 0.62, y: height * 0.75, label: 'LoRa 3', color: '#c4b5fd', type: 'lora', signalStrength: 40 },
      { x: width * 0.75, y: height * 0.5, label: 'Gateway', color: '#f59e0b', type: 'gateway', signalStrength: 100 },
      { x: width * 0.92, y: height * 0.5, label: 'Cloud', color: '#3b82f6', type: 'cloud', signalStrength: 100 },
    ];

    class Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      speed: number;
      size: number;
      color: string;
      trail: Array<{ x: number; y: number }>;
      routeIndex: number;
      route: number[];
      type: 'data' | 'ping' | 'ack';
      packetId: string;
      startTime: number;

      constructor(route: number[], color: string, type: 'data' | 'ping' | 'ack' = 'data') {
        this.route = route;
        this.routeIndex = 0;
        this.color = color;
        this.type = type;
        this.speed = type === 'ping' ? 3 : type === 'ack' ? 3.5 : 2;
        this.size = type === 'ping' ? 4 : type === 'ack' ? 4 : 6;
        this.trail = [];
        this.packetId = Math.random().toString(36).substring(7);
        this.startTime = Date.now();
        this.x = nodes[route[0]].x;
        this.y = nodes[route[0]].y;
        this.targetX = nodes[route[1]].x;
        this.targetY = nodes[route[1]].y;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > (this.type === 'data' ? 30 : 15)) this.trail.shift();

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.speed) {
          this.routeIndex++;
          if (this.routeIndex >= this.route.length - 1) {
            this.routeIndex = this.route.length - 1;
            return;
          }
          this.targetX = nodes[this.route[this.routeIndex + 1]].x;
          this.targetY = nodes[this.route[this.routeIndex + 1]].y;
        } else {
          this.x += (dx / dist) * this.speed;
          this.y += (dy / dist) * this.speed;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
          const alpha = (i / this.trail.length) * (this.type === 'data' ? 0.5 : 0.3);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw main particle
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.type === 'data' ? 20 : 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        
        if (this.type === 'ping') {
          // Draw ping as circle with ring
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
          ctx.stroke();
        } else if (this.type === 'ack') {
          // Draw ACK as diamond
          ctx.beginPath();
          ctx.moveTo(this.x, this.y - this.size);
          ctx.lineTo(this.x + this.size, this.y);
          ctx.lineTo(this.x, this.y + this.size);
          ctx.lineTo(this.x - this.size, this.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Draw data packet as hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = this.x + this.size * Math.cos(angle);
            const py = this.y + this.size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      isComplete() {
        return this.routeIndex >= this.route.length - 1 && Date.now() - this.startTime > 500;
      }
    }

    const particles: Particle[] = [];
    let particleSpawnTimer = 0;
    let pingTimer = 0;

    // LoRa mesh routes based on signal strength
    const loraRoutes = [
      [0, 2, 5, 6], // Device -> LoRa 1 -> Gateway -> Cloud (direct, strong signal 85%)
      [0, 2, 3, 5, 6], // Device -> LoRa 1 -> LoRa 2 -> Gateway -> Cloud (medium 60%)
      [0, 2, 3, 4, 5, 6], // Device -> LoRa 1 -> LoRa 2 -> LoRa 3 -> Gateway -> Cloud (weak 40%, full mesh)
    ];

    const drawNode = (node: any, time: number) => {
      const pulse = Math.sin(time / 1000) * 8;

      // Outer glow
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = node.color;
      ctx.shadowBlur = 40;
      ctx.shadowColor = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 35 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 30);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, node.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 30, 0, Math.PI * 2);
      ctx.fill();

      // Signal strength indicator for LoRa nodes
      if (node.type === 'lora') {
        const signalBars = Math.ceil((node.signalStrength / 100) * 4);
        const barWidth = 3;
        const barSpacing = 2;
        const startX = node.x - 8;
        const baseY = node.y + 45;

        for (let i = 0; i < 4; i++) {
          const barHeight = 5 + i * 3;
          ctx.fillStyle = i < signalBars ? node.color : '#374151';
          ctx.globalAlpha = i < signalBars ? 0.9 : 0.3;
          ctx.shadowBlur = 0;
          ctx.fillRect(startX + i * (barWidth + barSpacing), baseY - barHeight, barWidth, barHeight);
        }
      }

      // Label
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 14px SF Pro Display, Inter, Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
      
      // Show signal strength percentage for LoRa
      if (node.type === 'lora') {
        ctx.font = '10px SF Pro Display, Inter, Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.shadowBlur = 3;
        ctx.fillText(`${node.signalStrength}%`, node.x, node.y + 60);
      }
      
      ctx.shadowBlur = 0;
    };

    const drawConnections = (time: number) => {
      const connections = [
        { from: 0, to: 1, label: 'GPRS Direct', type: 'gprs', strength: 1 },
        { from: 1, to: 5, label: '', type: 'gprs', strength: 1 },
        { from: 0, to: 2, label: 'LoRa Mesh', type: 'lora', strength: 0.85 },
        { from: 2, to: 3, label: '', type: 'lora', strength: 0.6 },
        { from: 3, to: 4, label: '', type: 'lora', strength: 0.4 },
        { from: 2, to: 5, label: '', type: 'lora', strength: 0.85 }, // LoRa 1 direct to gateway
        { from: 3, to: 5, label: '', type: 'lora', strength: 0.6 }, // LoRa 2 to gateway
        { from: 4, to: 5, label: '', type: 'lora', strength: 0.4 }, // LoRa 3 to gateway (weak)
        { from: 5, to: 6, label: 'Internet', type: 'internet', strength: 1 },
      ];

      connections.forEach((conn) => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];

        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        gradient.addColorStop(0, from.color);
        gradient.addColorStop(1, to.color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = conn.type === 'gprs' ? 4 : 3;
        ctx.globalAlpha = conn.strength * 0.5;
        ctx.shadowBlur = conn.type === 'gprs' ? 20 : 15;
        ctx.shadowColor = from.color;
        ctx.setLineDash(conn.type === 'gprs' ? [15, 5] : [10, 10]);
        ctx.lineDashOffset = -time / 30;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Draw connection label
        if (conn.label) {
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          ctx.globalAlpha = 0.8;
          ctx.font = '12px SF Pro Display, Inter, Arial';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 3;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.fillText(conn.label, midX, midY - 10);
        }

        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      });
    };

    let time = 0;
    let animationId: number;

    const animate = () => {
      time += 16;
      ctx.fillStyle = 'rgba(3, 7, 18, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Spawn data packets
      particleSpawnTimer++;
      if (particleSpawnTimer > 80) {
        particleSpawnTimer = 0;
        
        // Spawn GPRS packet (direct path)
        if (Math.random() > 0.3) {
          particles.push(new Particle([0, 1, 5, 6], '#10b981', 'data'));
        }
        
        // Spawn LoRa packets (mesh routing based on signal strength)
        if (Math.random() > 0.2) {
          const routeChoice = Math.random();
          if (routeChoice < 0.5) {
            // Strong signal - direct route
            particles.push(new Particle(loraRoutes[0], '#8b5cf6', 'data'));
          } else if (routeChoice < 0.8) {
            // Medium signal - via one relay
            particles.push(new Particle(loraRoutes[1], '#a78bfa', 'data'));
          } else {
            // Weak signal - full mesh route
            particles.push(new Particle(loraRoutes[2], '#c4b5fd', 'data'));
          }
        }
      }

      // Spawn ping packets
      pingTimer++;
      if (pingTimer > 120) {
        pingTimer = 0;
        
        // GPRS ping
        particles.push(new Particle([0, 1, 5], '#10b981', 'ping'));
        // Ping response (ACK)
        setTimeout(() => {
          particles.push(new Particle([5, 1, 0], '#10b981', 'ack'));
        }, 500);
        
        // LoRa mesh ping (check all nodes)
        particles.push(new Particle([0, 2, 3], '#8b5cf6', 'ping'));
        setTimeout(() => {
          particles.push(new Particle([3, 2, 0], '#8b5cf6', 'ack'));
        }, 600);
        
        particles.push(new Particle([0, 2, 3, 4], '#a78bfa', 'ping'));
        setTimeout(() => {
          particles.push(new Particle([4, 3, 2, 0], '#a78bfa', 'ack'));
        }, 800);
      }

      drawConnections(time);
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        
        // Remove completed particles
        if (particles[i].isComplete()) {
          particles.splice(i, 1);
        }
      }

      nodes.forEach(node => drawNode(node, time));

      // Draw legend
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(17, 24, 39, 0.8)';
      ctx.fillRect(width - 180, 10, 170, 110);
      
      ctx.font = 'bold 12px SF Pro Display, Inter, Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 0;
      ctx.fillText('Packet Types:', width - 170, 30);
      
      // Data packet
      ctx.fillStyle = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = width - 150 + 5 * Math.cos(angle);
        const py = 45 + 5 * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px SF Pro Display, Inter, Arial';
      ctx.fillText('Data Packet', width - 135, 48);
      
      // Ping packet
      ctx.fillStyle = '#10b981';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10b981';
      ctx.beginPath();
      ctx.arc(width - 150, 70, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width - 150, 70, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Ping Request', width - 135, 73);
      
      // ACK packet
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(width - 150, 85);
      ctx.lineTo(width - 146, 90);
      ctx.lineTo(width - 150, 95);
      ctx.lineTo(width - 154, 90);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('ACK Response', width - 135, 93);

      ctx.globalAlpha = 1;

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
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <canvas
        ref={canvasRef}
        className="w-full h-[500px] rounded-2xl relative z-10"
      />
      <div className="mt-8 text-center text-gray-300 relative z-10">
        <p className="text-lg font-medium">GPRS Direct Communication vs LoRa Mesh Routing with Signal-Based Path Selection</p>
        <p className="text-sm text-gray-400 mt-2">LoRa nodes with weak signal relay through stronger nodes • Real-time ping/ACK monitoring</p>
      </div>
    </motion.div>
  );
}
