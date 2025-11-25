"use client";

import { useState } from "react";
import { Button } from "@heroui/button";

import { ChatbotModal } from "./chatbot-modal";
import { HelpCircleIcon } from "./icons";

export const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatbotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Button
        isIconOnly
        aria-label="Open CCMS assistant"
        onPress={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl border border-sky-300/40 hover:scale-105 transition-transform"
      >
        <HelpCircleIcon size={26} />
      </Button>
    </>
  );
};

