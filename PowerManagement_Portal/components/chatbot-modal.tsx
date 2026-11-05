"use client";

import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

type SpecSection = {
  title: string;
  keywords: string[];
  bullets: string[];
};

const SPEC_SECTIONS: SpecSection[] = [
  {
    title: "Panel Hardware & Ratings",
    keywords: [
      "panel",
      "hardware",
      "mccb",
      "capacity",
      "device",
      "cabinet",
      "spec",
    ],
    bullets: [
      "CCMS panel rated for ~20 kW street-light feeders with 3-phase, 4-wire, 415 V, 50 Hz supply.",
      "Uses CPRI-approved outdoor enclosure with IP-rated fiber-glass front door, anti-tamper sensor, and secure meter compartment.",
      "Main incomer via MCCB TPN 63 A (with 63 A outgoing feeders) plus 40 kV SPD, providing surge and short-circuit protection.",
      "Each panel includes resin-cast CTs (100/5 A, 3 sets) and a class-1 multi-function digital energy meter dedicated to the GPRS controller.",
    ],
  },
  {
    title: "Communication & IoT Platform",
    keywords: [
      "gprs",
      "gsm",
      "iot",
      "communication",
      "cloud",
      "platform",
      "rf",
      "network",
    ],
    bullets: [
      "Hybrid IoT controller communicates over GPRS/GSM with optional RF fallback for dense deployments.",
      "Controller maintains local event logs on its LCD and uploads measurements (voltage, current, PF, energy) to the cloud portal.",
      "Each cabinet retains a backup power source that keeps the controller online for up to 48 hours during mains loss.",
      "Only authorized personnel can access the cloud dashboard to view data, configure panels, and acknowledge alerts.",
    ],
  },
  {
    title: "Energy Monitoring & CT/PT Settings",
    keywords: ["energy", "meter", "measurement", "ct", "pt", "ratio", "reading"],
    bullets: [
      "Multi-function meter measures three-phase voltage, current, power, power factor, frequency, and cumulative energy with class-1 accuracy.",
      "CT ratio is fixed at 100/5 A per phase, matching the specified resin-cast CT set and ensuring accurate feeder current capture.",
      "Dashboard supports live and historical consumption summaries so utilities can assess feeder loading and efficiency.",
    ],
  },
  {
    title: "Security & Password Protection",
    keywords: ["password", "security", "access", "protection", "login"],
    bullets: [
      "Two password levels: device-level keypad access for maintenance and cloud-portal credentials for supervisory control.",
      "Only whitelisted operators can modify schedules, change alarms, or send remote commands through the cloud UI.",
      "Passwords can be updated remotely, and the controller automatically disables unauthorized attempts.",
    ],
  },
  {
    title: "Remote Control & Scheduling",
    keywords: ["remote", "control", "schedule", "timing", "on", "off", "rtc"],
    bullets: [
      "Operators can send manual ON/OFF commands, dimming profiles, or reset instructions over GPRS without visiting the cabinet.",
      "Scheduler supports sunrise/sunset, astronomical, holiday, and custom twilight programs for group-based dimming.",
      "RTC (real-time clock) can be synced from the server so all CCMS cabinets follow identical switching times.",
    ],
  },
  {
    title: "Fault Reporting & Alerts",
    keywords: ["fault", "alert", "alarm", "status", "door", "tamper"],
    bullets: [
      "Controller raises alerts for low/high voltage, overload, phase loss, high temperature, or abnormal power-factor readings.",
      "Door-open and tamper sensors generate immediate notifications so teams know if the cabinet is accessed.",
      "Alerts are pushed to the dashboard, email/SMS (if configured), and remain in history until acknowledged.",
    ],
  },
  {
    title: "General Overview",
    keywords: ["hello", "hi", "overview", "summary", "ccms", "specification"],
    bullets: [
      "System covers supply, installation, testing, and commissioning of smart CCMS panels for street lighting.",
      "Each panel combines protection hardware, metering, GPRS/GSM communication, and IoT-based remote control.",
      "Primary goal is centralized monitoring with actionable alerts and automated schedules to cut energy costs.",
    ],
  },
];

const SIMPLE_LANGUAGE_TRIGGER_WORDS = ["explain", "simple", "meaning", "layman"];

const numberFormat = (value: number, digits = 1) =>
  isFinite(value) ? value.toLocaleString("en-IN", { maximumFractionDigits: digits }) : "0";

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return (await response.json()) as T;
};

const buildSpecResponse = (normalizedQuestion: string, simple: boolean) => {
  const matchedSections = SPEC_SECTIONS.filter((section) =>
    section.keywords.some((keyword) => normalizedQuestion.includes(keyword))
  );

  if (matchedSections.length === 0) return null;

  const structuredResponse = matchedSections
    .map((section) => {
      const header = `**${section.title}**`;
      const bullets = section.bullets.map((bullet) => `- ${bullet}`).join("\n");
      return `${header}\n${bullets}`;
    })
    .join("\n\n");

  if (!simple) return structuredResponse;

  const plainLanguageNote =
    "\n\n**Plain Language Note**\n- Each CCMS panel is essentially a smart street-light controller that measures energy, talks to the control room via mobile data, and lets authorized teams switch lights or change schedules remotely.";

  return `${structuredResponse}${plainLanguageNote}`;
};

const DATA_RESPONDERS = [
  {
    keywords: [
      "stat",
      "status",
      "power",
      "energy",
      "online",
      "offline",
      "fleet",
      "network",
      "health",
      "consumption",
      "savings",
    ],
    handler: async () => {
      const data = await fetchJson<any>("/api/dashboard/stats");
      const stats = data.dashboardStats || data;
      const total = stats.totalDevices ?? data.deviceStats?.reduce((sum: number, s: any) => sum + s._count, 0) ?? 0;
      return `**Live Fleet Metrics**\n- Devices online/offline: ${stats.onlineDevices}/${stats.offlineDevices}\n- Fault/Maintenance: ${stats.faultDevices} fault, ${stats.maintenanceDevices} queued\n- Total active alerts: ${stats.activeAlerts}\n- Critical alerts: ${stats.criticalAlerts}\n- Instantaneous load: ${numberFormat(stats.totalPower, 2)} kW | Energy today: ${numberFormat(stats.totalEnergy, 2)} kWh\n- Network health: ${numberFormat(stats.networkHealth, 1)}% across ${total} devices`;
    },
  },
  {
    keywords: ["alert", "fault", "alarm", "critical", "warning", "event"],
    handler: async () => {
      const data = await fetchJson<any>("/api/dashboard/stats");
      const alerts = data.latestAlerts || [];
      if (!alerts.length) {
        return "**Alerts**\n- No active alerts were reported by the controllers in the latest poll.";
      }
      const topFive = alerts.slice(0, 5);
      const bulletList = topFive
        .map(
          (alert: any) =>
            `- [${alert.level}] ${alert.message} (${alert.device?.deviceId ?? "device"}) at ${new Date(
              alert.createdAt
            ).toLocaleString()}`
        )
        .join("\n");
      return `**Active Alerts Snapshot**\n${bulletList}\n- Total alerts tracked in feed: ${alerts.length}`;
    },
  },
  {
    keywords: ["location", "map", "coordinate", "site", "panel", "device", "deployment"],
    handler: async () => {
      const data = await fetchJson<any>("/api/devices/locations");
      if (!data.devices?.length) {
        return "**Location Data**\n- No CCMS devices with coordinates were found. Ensure telemetry has been synced.";
      }
      const mostCritical = data.devices.find((device: any) => device.alertLevel === "CRITICAL") ?? data.devices[0];
      const summary = `- Total devices tracked: ${data.total}\n- Sample device ${mostCritical.deviceId} at ${mostCritical.address} is ${mostCritical.status} with ${numberFormat(
        mostCritical.currentPower,
        2
      )} kW draw.`;
      return `**Deployment Overview**\n${summary}`;
    },
  },
];

const getDataResponse = async (normalizedQuestion: string) => {
  for (const responder of DATA_RESPONDERS) {
    if (responder.keywords.some((keyword) => normalizedQuestion.includes(keyword))) {
      try {
        return await responder.handler();
      } catch (error) {
        console.error("Chatbot data handler failed:", error);
        return "**Data Request Error**\n- Unable to retrieve live data right now. Please retry or check API connectivity.";
      }
    }
  }
  return null;
};

const GENERAL_FALLBACK =
  "**General Guidance**\n- I can answer about CCMS hardware, communication, schedules, alerts, or interpret live telemetry from the portal APIs.\n- Try questions like “show latest alerts”, “how many panels are online”, or “explain MCCB requirement in simple terms.”";

const getAssistantResponse = async (question: string) => {
  const normalizedQuestion = question.trim().toLowerCase();
  if (!normalizedQuestion) {
    return "Please enter a question so I can look up the relevant CCMS information.";
  }

  const dataResponse = await getDataResponse(normalizedQuestion);
  if (dataResponse) return dataResponse;

  const requiresSimpleLanguage = SIMPLE_LANGUAGE_TRIGGER_WORDS.some((word) =>
    normalizedQuestion.includes(word)
  );

  const specResponse = buildSpecResponse(normalizedQuestion, requiresSimpleLanguage);
  if (specResponse) return specResponse;

  return GENERAL_FALLBACK;
};

export const ChatbotModal = ({ isOpen, onClose }: ChatbotModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "**CCMS Operations Assistant**\n- Ask about hardware specs, IoT communication, password policy, energy metering, or live fleet status.\n- I can combine documented requirements with live telemetry from the CCMS APIs.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const question = inputValue.trim();
    if (!question) return;

    setIsSending(true);
    setMessages((prev) => [...prev, { role: "user", content: question }]);

    try {
      const reply = await getAssistantResponse(question);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Chatbot failed to respond:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "**Assistant Error**\n- I couldn't process that request just now. Please try again or refine the question.",
        },
      ]);
    } finally {
      setInputValue("");
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "bg-slate-900/95 border border-slate-800",
        header: "border-b border-slate-800",
        footer: "border-t border-slate-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-white">
          CCMS Specification Chatbot
        </ModalHeader>
        <ModalBody>
          <div className="text-sm text-slate-400 bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <p className="font-semibold text-slate-200 mb-1">Usage Tips</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Ask about CCMS hardware, GPRS/GSM communication, security, or
                operating procedures.
              </li>
              <li>
                I can also summarize live fleet data (power, alerts, locations)
                using the portal&apos;s APIs.
              </li>
              <li>
                For plain-language explanations, include words like “explain” or
                “simple”.
              </li>
            </ul>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg p-3 text-sm ${
                  message.role === "user"
                    ? "bg-sky-900/40 text-sky-100 border border-sky-700/40"
                    : "bg-slate-800/60 text-slate-100 border border-slate-700/60"
                }`}
              >
                <p className="text-xs uppercase tracking-wide mb-2 opacity-70">
                  {message.role === "user" ? "User Query" : "Assistant Reply"}
                </p>
                {message.content.split("\n").map((line, lineIndex) => (
                  <p key={lineIndex} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div>
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about MCCB rating, GPRS communication, password policy, CT ratio, scheduling, etc."
              className="w-full rounded-lg bg-slate-800/80 border border-slate-700 text-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none h-24"
            />
            <p className="text-xs text-slate-500 mt-2">
              Press Enter to send, Shift+Enter for a new line.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            color="danger"
            onPress={onClose}
            className="text-slate-200 hover:text-red-400"
          >
            Close
          </Button>
          <Button
            color="primary"
            onPress={handleSend}
            isDisabled={!inputValue.trim() || isSending}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white disabled:opacity-60"
          >
            {isSending ? "Preparing Reply..." : "Send"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

