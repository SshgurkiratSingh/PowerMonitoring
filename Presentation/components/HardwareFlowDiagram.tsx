"use client";

import { motion } from "framer-motion";

const POWER_CHAIN = [
  {
    title: "3-Phase AC Input",
    detail: "Utility feed (L1/L2/L3 + N) feeds cabinet",
  },
  {
    title: "MCCB",
    detail: "Primary protection + manual isolation",
  },
  {
    title: "SPD",
    detail: "Clamps surges before electronics",
  },
  {
    title: "SMPS",
    detail: "24V/5V rails for logic + sensors",
  },
  {
    title: "Battery Backup",
    detail: "Keeps ESP32 + RTC alive on outage",
  },
];

const FLOW_COLUMNS = [
  {
    title: "RS485 Modbus Chain",
    accent: "from-cyan-500 to-blue-500",
    summary: "Multifunction Meter ↔ MAX485 ↔ ESP32",
    bullets: [
      "Differential A/B pair converted to TTL in-panel",
      "Poll window every 5 s over Modbus RTU",
      "Reads V, I, P, kWh, PF, Hz, THD",
    ],
  },
  {
    title: "ESP32 Core Runtime",
    accent: "from-purple-500 to-pink-500",
    summary: "8 software modules across UART/GPIO/I2C/ADC/PWM",
    bullets: [
      "Sensor polls every 1 s, queue aggregates 5 min",
      "Watchdog pins + brown-out monitor stay armed",
      "Fault state machine raises alerts immediately",
    ],
  },
  {
    title: "Sensor Suite",
    accent: "from-emerald-500 to-lime-500",
    summary: "Parallel sensing alongside RS485",
    bullets: [
      "Door reed switch for intrusion",
      "DHT22/DS18B20 temperature channel",
      "LDR twilight + current loop lamp status",
    ],
  },
  {
    title: "Real-Time Clock Stack",
    accent: "from-sky-500 to-indigo-500",
    summary: "DS3231 + NTP + battery coin cell",
    bullets: [
      "RTC over I2C maintains sub-±2 ppm drift",
      "NTP resync reenables after each GPRS link",
      "Time bus feeds automation kernel",
    ],
  },
  {
    title: "Schedule & Automation",
    accent: "from-orange-500 to-amber-500",
    summary: "Signed schedules from server",
    bullets: [
      "Server pushes schedule + signature",
      "ESP32 compares hashes, re-requests if mismatch",
      "Executes ON/OFF windows + condition rules",
    ],
  },
  {
    title: "Dual Communication Manager",
    accent: "from-teal-500 to-cyan-500",
    summary: "GPRS primary, LoRa standby",
    bullets: [
      "MQTT publish every 5 min on GPRS, 30 min heartbeat when idle",
      "LoRa mesh acks required; RSS-based route choice",
      "Server can force mode switch; manager honors override",
    ],
  },
  {
    title: "LoRa Mesh Fabric",
    accent: "from-fuchsia-500 to-purple-500",
    summary: "Peer discovery + best path",
    bullets: [
      "Neighbors ranked by RSS snapshots",
      "Multiple hops reach gateway concentrator",
      "Ack packets bubble back before close",
    ],
  },
  {
    title: "Alert & Fault Bus",
    accent: "from-rose-500 to-red-500",
    summary: "Continuous rule evaluation",
    bullets: [
      "Voltage window, overload, door, temp, PF, comm loss",
      "Alerts buffered with timestamps",
      "ESP32 publishes fault topics + drives LEDs",
    ],
  },
  {
    title: "Control Output Chain",
    accent: "from-yellow-500 to-orange-500",
    summary: "Relay → Contactor → Load",
    bullets: [
      "PWM/driver energizes relay coil",
      "MCCB + lamp contactor switching",
      "Panel LEDs + optional LCD echo states",
    ],
  },
];

const TIMELINE = [
  {
    label: "MFM Poll",
    interval: "5 s",
    detail: "RS485 snapshot + checksum",
  },
  {
    label: "Sensor Sweep",
    interval: "1 s",
    detail: "Door, temp, light, lamp",
  },
  {
    label: "Aggregation",
    interval: "5 min",
    detail: "Rolling averages + min/max",
  },
  {
    label: "MQTT Upload",
    interval: "5 min",
    detail: "Payload with signature + alert flags",
  },
];

const HardwareFlowDiagram = () => {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="rounded-4xl border border-white/10 bg-slate-950/70 p-8"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200 text-center">
          Hardware Flow Diagram
        </p>
        <h3 className="text-3xl md:text-4xl font-black text-white text-center mt-3">
          From 3-Phase Input to Mesh Alerts
        </h3>
        <p className="text-gray-300 text-center mt-4 max-w-3xl mx-auto">
          Visual walkthrough of how the RS485 meter, ESP32 controller, time base,
          schedules, dual comms, sensors, and control outputs interlock to keep
          CCMS nodes deterministic.
        </p>

        <div className="mt-8">
          <p className="text-sm text-gray-400 mb-3">Power Supply Chain</p>
          <div className="relative flex flex-wrap justify-between gap-4">
            {POWER_CHAIN.map((stage, idx) => (
              <div key={stage.title} className="flex-1 min-w-[180px]">
                <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/60 p-4 h-full">
                  <h4 className="text-white font-semibold text-lg">
                    {stage.title}
                  </h4>
                  <p className="text-sm text-gray-400 mt-2">{stage.detail}</p>
                  {idx < POWER_CHAIN.length - 1 && (
                    <span className="hidden lg:block absolute -right-5 top-1/2 h-px w-10 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {FLOW_COLUMNS.map((column) => (
            <motion.div
              key={column.title}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true, margin: "-50px" }}
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5"
            >
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${column.accent} text-white/90`}
              >
                {column.title}
              </div>
              <p className="text-white text-lg font-semibold mt-3">
                {column.summary}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-300 list-disc list-inside">
                {column.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200">
              Schedule Assurance Path
            </p>
            <h4 className="text-2xl text-white font-semibold mt-2">
              Signature comparison keeps automation aligned
            </h4>
            <div className="mt-6 space-y-4">
              {[
                "Server pushes signed schedule",
                "ESP32 validates signature + RTC frame",
                "Mismatch triggers sync protocol",
                "RTC + automation module drive ON/OFF execution",
              ].map((step, idx) => (
                <div
                  key={step}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="w-8 h-8 rounded-full border border-amber-400/60 text-amber-200 flex items-center justify-center font-semibold">
                    {idx + 1}
                  </span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200">
              Alert & Control Overlay
            </p>
            <h4 className="text-2xl text-white font-semibold mt-2">
              ESP32 issues faults before driving loads
            </h4>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-200">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-[0.3em]">
                  Alert Matrix
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  {[
                    "Voltage window",
                    "Current overload",
                    "Door tamper",
                    "High temperature",
                    "PF drop",
                    "Comm loss",
                  ].map((alert) => (
                    <li key={alert}>{alert}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-[0.3em]">
                  Control Path
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  {[
                    "Relay drives contactor",
                    "MCCB state feedback",
                    "Status LEDs",
                    "Optional LCD panel",
                  ].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-200">
            Data Processing Timeline
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {TIMELINE.map((event, idx) => (
              <div
                key={event.label}
                className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-4"
              >
                <p className="text-sm text-gray-400">{event.label}</p>
                <p className="text-3xl text-white font-bold">{event.interval}</p>
                <p className="text-sm text-gray-400 mt-2">{event.detail}</p>
                {idx < TIMELINE.length - 1 && (
                  <span className="hidden md:block absolute right-[-12px] top-1/2 h-px w-6 bg-gradient-to-r from-transparent via-white/40 to-transparent"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HardwareFlowDiagram;
