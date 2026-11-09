"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Modal } from "@/components/design-system/Modal";
import { PrimaryButton, SecondaryGlassButton } from "@/components/design-system/Buttons";
import { CATEGORIES_LIST } from "@/lib/mock/feed-data";

export const addSourceSchema = z.object({
  name: z.string().min(2, "Source name must be at least 2 characters").max(80),
  url: z.string().url("Must be a valid web or RSS feed URL"),
  category: z.string().min(1, "Please select a category"),
  platform: z.enum(["WEB", "X / POST", "REDDIT", "SECURITY", "RESEARCH", "NEWSLETTER"]),
});

export type AddSourceFormData = z.infer<typeof addSourceSchema>;

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: AddSourceFormData) => void;
}

export function AddSourceModal({ isOpen, onClose, onAdd }: AddSourceModalProps) {
  const [formData, setFormData] = useState<AddSourceFormData>({
    name: "",
    url: "",
    category: "Tech & AI",
    platform: "WEB",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addSourceSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onAdd(result.data);
    setFormData({
      name: "",
      url: "",
      category: "Tech & AI",
      platform: "WEB",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Content Source"
      description="Connect an RSS feed, X account, newsletter, or publication to monitor."
      footer={
        <>
          <SecondaryGlassButton type="button" onClick={onClose}>
            Cancel
          </SecondaryGlassButton>
          <PrimaryButton type="submit" form="add-source-form">
            Connect Source
          </PrimaryButton>
        </>
      }
    >
      <form id="add-source-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300">Source Name</label>
          <input
            type="text"
            placeholder="e.g. Ars Technica, MIT Technology Review"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: errors.name
                ? "1px solid rgba(239, 68, 68, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.14)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
            }}
            className="w-full text-xs text-neutral-200 placeholder-neutral-500 rounded-xl px-3 py-2 outline-none focus:border-[#C5F52A]/50 transition-colors"
          />
          {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
        </div>

        {/* URL input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300">Feed / Channel URL</label>
          <input
            type="url"
            placeholder="https://example.com/rss or https://x.com/username"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: errors.url
                ? "1px solid rgba(239, 68, 68, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.14)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
            }}
            className="w-full text-xs text-neutral-200 placeholder-neutral-500 rounded-xl px-3 py-2 outline-none focus:border-[#C5F52A]/50 transition-colors font-mono"
          />
          {errors.url && <p className="text-[11px] text-red-400">{errors.url}</p>}
        </div>

        {/* Platform & Category grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Platform Type</label>
            <select
              value={formData.platform}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  platform: e.target.value as AddSourceFormData["platform"],
                })
              }
              style={{
                background: "rgba(20, 24, 26, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
              }}
              className="w-full text-xs text-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-[#C5F52A]/50"
            >
              <option value="WEB">Web / RSS</option>
              <option value="X / POST">X / Twitter</option>
              <option value="REDDIT">Reddit</option>
              <option value="SECURITY">Security Feed</option>
              <option value="RESEARCH">Research Lab</option>
              <option value="NEWSLETTER">Newsletter</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                background: "rgba(20, 24, 26, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
              }}
              className="w-full text-xs text-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-[#C5F52A]/50"
            >
              {CATEGORIES_LIST.filter((c) => c !== "All Feeds").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

