"use client";

import React from "react";
import { Modal } from "./Modal";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <SecondaryButton size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className={isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : undefined}
          >
            {confirmLabel}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex items-start gap-3.5 py-1">
        {isDestructive && (
          <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <p className="text-xs text-[var(--muted)] leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}

