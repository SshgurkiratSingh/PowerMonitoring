'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';

interface RedundancyProps {
  inView: boolean;
}

export default function RedundancyVisualization({ inView }: RedundancyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failureMode, setFailureMode] = useState<'none' | 'gprs' | 'lora'>('none');

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

    const nodes = {
      device: { x: width * 0.15, y: height * 0.5, label: 'ESP32\nDevice', color: '#06b6d4', radius: 50 },
      gprs: { x: width * 0.4, y: height * 0.3, label: 'GPRS\nModule', color: '#10b981', radius: 45, active: true },
      lora: { x: width * 0.4, y: height * 0.7, label: 'LoRa\nModule', color: '#8b5cf6', radius: 45, active: true },
      gateway: { x: width * 0.65, y: height * 0.5, label: 'Gateway', color: '#f59e0b', radius: 50 },
      cloud: { x: width * 0.85, y: height * 0.5, label: 'Cloud', color: '#3b82f6', radius: 50 }
    };

    // Simulate failures
    if (failureMode === 'gprs') {
      nodes.gprs.active = false;
    } else if (failureMode === 'lora') {
      nodes.lora.active = false;
    } else {
      nodes.gprs.active = true;
      nodes.lora.active = true;
    }

    class DataPacket {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      path: string;
      color: string;
      size: number;
      speed: number;
      progress: number;
      waypoints: Array<{x: number; y: number}>;
      currentWaypoint: number;

      constructor(path: 'gprs' | 'lora') {
        this.path = path;
        this.progress = 0;
        this.currentWaypoint = 0;
        this.size = 8;
        this.speed = 0.015;

        if (path === 'gprs' && nodes.gprs.active) {
          this.waypoints = [
            { x: nodes.device.x, y: nodes.device.y },
            { x: nodes.gprs.x, y: nodes.gprs.y },
            { x: nodes.gateway.x, y: nodes.gateway.y },
            { x: nodes.cloud.x, y: nodes.cloud.y }
          ];
          this.color = '#10b981';
        } else if (path === 'lora' || !nodes.gprs.active) {
          this.waypoints = [
            { x: nodes.device.x, y: nodes.device.y },
            { x: nodes.lora.x, y: nodes.lora.y },
            { x: nodes.gateway.x, y: nodes.gateway.y },
            { x: nodes.cloud.x, y: nodes.cloud.y }
          ];
          this.color = '#8b5cf6';
        } else {
          this.waypoints = [{ x: nodes.device.x, y: nodes.device.y }];
          this.color = '#ef4444';
        }

        this.x = this.waypoints[0].x;
        this.y = this.waypoints[0].y;
        this.targetX = this.waypoints[0].x;
        this.targetY = this.waypoints[0].y;
      }

      update() {
        if (this.currentWaypoint >= this.waypoints.length - 1) {
          this.progress = 0;
          this.currentWaypoint = 0;
          this.x = this.waypoints[0].x;
          this.y = this.waypoints[0].y;
          return;
        }

        const current = this.waypoints[this.currentWaypoint];
        const next = this.waypoints[this.currentWaypoint + 1];

        this.progress += this.speed;
        if (this.progress >= 1) {
          this.progress = 0;
          this.currentWaypoint++;
          if (this.currentWaypoint >= this.waypoints.length - 1) return;
        }

        const nextPoint = this.waypoints[this.currentWaypoint + 1];
        const currentPoint = this.waypoints[this.currentWaypoint];
        
        this.x = currentPoint.x + (nextPoint.x - currentPoint.x) * this.progress;
        this.y = currentPoint.y + (nextPoint.y - currentPoint.y) * this.progress;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Arrow
        if (this.currentWaypoint < this.waypoints.length - 1) {
          const next = this.waypoints[this.currentWaypoint + 1];
          const angle = Math.atan2(next.y - this.y, next.x - this.x);
          
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(angle);
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(this.size + 3, 0);
          ctx.lineTo(this.size - 3, -4);
          ctx.lineTo(this.size - 3, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        ctx.shadowBlur = 0;
      }
    }

    const packets: DataPacket[] = [];
    let packetSpawnTimer = 0;

    let time = 0;
    let animationId: number;

    const drawNode = (node: any, time: number) => {
      const pulse = Math.sin(time / 500) * 5;
      const isActive = node.active !== undefined ? node.active : true;

      // Outer glow
      ctx.globalAlpha = isActive ? 0.3 : 0.1;
      ctx.fillStyle = isActive ? node.color : '#6b7280';
      ctx.shadowBlur = isActive ? 50 : 20;
      ctx.shadowColor = isActive ? node.color : '#6b7280';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 25 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, isActive ? node.color : '#6b7280');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.shadowBlur = isActive ? 40 : 20;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Status indicator
      if (node.active !== undefined) {
        const statusColor = isActive ? '#10b981' : '#ef4444';
        ctx.fillStyle = statusColor;
        ctx.shadowBlur = 15;
        ctx.shadowColor = statusColor;
        ctx.beginPath();
        ctx.arc(node.x + node.radius - 12, node.y - node.radius + 12, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.font = 'bold 16px SF Pro Display, Inter, Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      const labels = node.label.split('\n');
      labels.forEach((label: string, i: number) => {
        ctx.fillText(label, node.x, node.y - 5 + (i * 18));
      });
    };

    const drawConnections = () => {
      const connections = [
        { from: nodes.device, to: nodes.gprs, active: nodes.gprs.active, color: '#10b981' },
        { from: nodes.device, to: nodes.lora, active: nodes.lora.active, color: '#8b5cf6' },
        { from: nodes.gprs, to: nodes.gateway, active: nodes.gprs.active, color: '#10b981' },
        { from: nodes.lora, to: nodes.gateway, active: nodes.lora.active, color: '#8b5cf6' },
        { from: nodes.gateway, to: nodes.cloud, active: true, color: '#f59e0b' }
      ];

      connections.forEach(conn => {
        ctx.strokeStyle = conn.active ? conn.color : '#374151';
        ctx.lineWidth = conn.active ? 4 : 2;
        ctx.globalAlpha = conn.active ? 0.6 : 0.2;
        ctx.shadowBlur = conn.active ? 20 : 0;
        ctx.shadowColor = conn.color;
        ctx.setLineDash(conn.active ? [10, 5] : [5, 5]);
        ctx.lineDashOffset = conn.active ? -time / 30 : 0;

        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      });

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      time += 16;
      ctx.fillStyle = 'rgba(3, 7, 18, 0.15)';
      ctx.fillRect(0, 0, width, height);

      drawConnections();

      // Spawn packets
      packetSpawnTimer++;
      if (packetSpawnTimer > 50) {
        packetSpawnTimer = 0;
        const primaryPath = Math.random() > 0.5 ? 'gprs' : 'lora';
        packets.push(new DataPacket(primaryPath));
      }

      // Update and draw packets
      packets.forEach((packet, idx) => {
        packet.update();
        packet.draw(ctx);
        if (packet.currentWaypoint >= packet.waypoints.length - 1 && packet.progress >= 0.9) {
          packets.splice(idx, 1);
        }
      });

      Object.values(nodes).forEach(node => drawNode(node, time));

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [inView, failureMode]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1 }}
        className="relative w-full card-glass rounded-3xl p-8 overflow-hidden border border-green-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5"></div>
        <canvas
          ref={canvasRef}
          className="w-full h-[450px] rounded-2xl relative z-10"
        />
        <div className="mt-6 text-center text-gray-300 relative z-10">
          <p className="text-lg font-medium">Dual-Path Communication with Automatic Failover</p>
        </div>
      </motion.div>

      {/* Control Panel */}
      <div className="grid grid-cols-3 gap-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          onClick={() => setFailureMode('none')}
          className={`card-holographic rounded-2xl p-6 text-left transition-all ${
            failureMode === 'none' ? 'ring-2 ring-green-400' : ''
          }`}
        >
          <Shield className="w-10 h-10 text-green-400 mb-3" />
          <h4 className="text-xl font-bold text-white mb-2">Normal Operation</h4>
          <p className="text-gray-400 mb-3">Both GPRS and LoRa paths active</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">100% Redundancy</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          onClick={() => setFailureMode('gprs')}
          className={`card-holographic rounded-2xl p-6 text-left transition-all ${
            failureMode === 'gprs' ? 'ring-2 ring-orange-400' : ''
          }`}
        >
          <AlertTriangle className="w-10 h-10 text-orange-400 mb-3" />
          <h4 className="text-xl font-bold text-white mb-2">GPRS Failure</h4>
          <p className="text-gray-400 mb-3">Automatic failover to LoRa path</p>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-medium">LoRa Backup Active</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          onClick={() => setFailureMode('lora')}
          className={`card-holographic rounded-2xl p-6 text-left transition-all ${
            failureMode === 'lora' ? 'ring-2 ring-orange-400' : ''
          }`}
        >
          <AlertTriangle className="w-10 h-10 text-orange-400 mb-3" />
          <h4 className="text-xl font-bold text-white mb-2">LoRa Failure</h4>
          <p className="text-gray-400 mb-3">Automatic failover to GPRS path</p>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">GPRS Backup Active</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
