import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

interface SudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (success: boolean) => void;
}

export const SudoModal = ({ isOpen, onClose, onConfirm }: SudoModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/auth/sudo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onConfirm(true);
        onClose();
      } else {
        setError("Invalid sudo password");
        onConfirm(false);
      }
    } catch (err) {
      setError("An error occurred");
      onConfirm(false);
    }
    setPassword("");
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      classNames={{
        base: "bg-slate-900/90 backdrop-blur-md border border-slate-700",
        header: "border-b border-slate-700",
        body: "py-6",
        footer: "border-t border-slate-700",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-white">
          Sudo Authentication Required
        </ModalHeader>
        <ModalBody>
          <p className="text-slate-400 mb-4">
            This action requires elevated privileges. Please enter your sudo password.
          </p>
          <Input
            type="password"
            label="Sudo Password"
            placeholder="Enter sudo password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-white"
            classNames={{
              label: "text-slate-400",
              input: "bg-slate-800/50 border-slate-700",
            }}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="ghost"
            onPress={onClose}
            className="text-slate-200 hover:text-red-400"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};