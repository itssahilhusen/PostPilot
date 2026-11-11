"use client";

import React, { useState } from "react";
import {
  MediaChannel,
  MediaItem,
  MEDIA_CHANNELS,
  INITIAL_MEDIA_ITEMS,
} from "@/lib/mock/media-data";
import { useToast } from "@/components/design-system/Toast";
import { cn } from "@/lib/utils";
import { MediaFileCard } from "./MediaFileCard";

export function MediaLibraryView() {
  const { toast } = useToast();

  const addToast = ({
    title,
    description,
    variant = "success",
  }: {
    title: string;
    description?: string;
    variant?: "success" | "error" | "info";
  }) => {
    toast(description ? `${title}: ${description}` : title, variant);
  };

  // State
  const [channels, setChannels] = useState<MediaChannel[]>(MEDIA_CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("instagram");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos" | "carousels" | "audio">("all");
  const [sortOption, setSortOption] = useState<"recent" | "size" | "linked" | "name">("recent");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Modals & Context Menus
  const [activeModalItem, setActiveModalItem] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const [showMobileChannels, setShowMobileChannels] = useState(false);

  // New Media Upload State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<MediaItem["type"]>("images");
  const [uploadPlacement, setUploadPlacement] = useState("Instagram Post");
  const [uploadChannelId, setUploadChannelId] = useState("instagram");

  // Filtered & Sorted Items
  const filteredItems = mediaItems.filter((item) => {
    if (activeTab !== "all" && item.type !== activeTab) {
      return false;
    }
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === "recent") {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
    if (sortOption === "size") {
      return parseFloat(b.fileSize) - parseFloat(a.fileSize);
    }
    if (sortOption === "linked") {
      return (b.linkedPostsCount || 0) - (a.linkedPostsCount || 0);
    }
    if (sortOption === "name") {
      return a.fileName.localeCompare(b.fileName);
    }
    return 0;
  });

  // Selection toggle
  const handleToggleSelect = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Channel Selection
  const handleSelectChannel = (channel: MediaChannel) => {
    setSelectedChannelId(channel.id);
    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        active: c.id === channel.id,
      }))
    );
    addToast({
      title: `${channel.name} Selected`,
      description: channel.connected
        ? `Viewing active media library for ${channel.name}`
        : `Ready to connect and upload assets to ${channel.name}`,
      variant: "info",
    });
  };

  // Upload handler
  const handleCreateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      addToast({
        title: "Title Required",
        description: "Please enter a file name or title for the asset",
        variant: "error",
      });
      return;
    }

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: uploadTitle.trim(),
      fileName: `${uploadTitle.trim().replace(/\s+/g, "_")}.${uploadType === "carousels" ? "pdf" : uploadType === "videos" ? "mp4" : uploadType === "audio" ? "mp3" : "png"}`,
      fileExt: uploadType === "carousels" ? "pdf" : uploadType === "videos" ? "mp4" : uploadType === "audio" ? "mp3" : "png",
      resolution: "1080 × 1080 px",
      fileSize: "3.2 MB",
      badgeFormat: uploadType === "carousels" ? "PDF CAROUSEL" : uploadType === "videos" ? "4K REEL" : "HD PNG",
      type: uploadType,
      channelId: uploadChannelId,
      channelName: channels.find((c) => c.id === uploadChannelId)?.name || "Instagram",
      placement: uploadPlacement,
      tag: "Ready",
      tagColor: "neutral",
      uploaderName: "Jane Cooper",
      uploaderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      formattedDate: "Just now",
      imageUrl:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
      altText: uploadTitle.trim(),
      selected: false,
      linkedPostsCount: 0,
      uploadedAt: new Date().toISOString(),
      dimensions: { width: 1080, height: 1080 },
    };

    setMediaItems((prev) => [newItem, ...prev]);
    setShowUploadModal(false);
    setUploadTitle("");
    addToast({
      title: "Asset Uploaded",
      description: `${newItem.fileName} has been added to your media library`,
      variant: "success",
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    setMediaItems((prev) => prev.filter((i) => i.id !== itemId));
    setOpenCardMenuId(null);
    if (activeModalItem?.id === itemId) {
      setActiveModalItem(null);
    }
    addToast({
      title: "Asset Removed",
      description: "Media item has been deleted from library",
      variant: "info",
    });
  };

  // Render Channel Icon
  const renderChannelIcon = (type: MediaChannel["iconType"]) => {
    switch (type) {
      case "instagram":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case "facebook":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case "threads":
        return <span className="text-lg font-bold">@</span>;
      case "twitter":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case "tiktok":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        );
      case "linkedin":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        );
      case "youtube":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case "pinterest":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.94-.12-2.4.02-3.43l1.04-4.4s-.26-.53-.26-1.32c0-1.24.72-2.16 1.61-2.16.76 0 1.13.57 1.13 1.26 0 .77-.49 1.91-.74 2.97-.21.89.44 1.61 1.31 1.61 1.58 0 2.8-1.66 2.8-4.06 0-2.12-1.52-3.6-3.7-3.6-2.52 0-4 1.89-4 3.84 0 .76.29 1.58.66 2.03.07.09.08.17.06.26l-.25 1.02c-.04.16-.14.22-.32.14-1.18-.55-1.92-2.27-1.92-3.66 0-2.98 2.16-5.71 6.24-5.71 3.28 0 5.82 2.34 5.82 5.46 0 3.26-2.05 5.88-4.9 5.88-.96 0-1.86-.5-2.17-1.09l-.59 2.25c-.21.82-.79 1.85-1.18 2.48A11.98 11.98 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
          </svg>
        );
    }
  };

  // Render Dog-Ear Folded Document Icon (Matching user reference image exactly)
  const renderDocumentIcon = (ext?: MediaItem["fileExt"]) => {
    switch (ext) {
      case "pdf":
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#DC2626"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#EF4444"
                opacity="0.95"
              />
              <text
                x="18"
                y="30"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.03em"
              >
                PDF
              </text>
            </svg>
          </div>
        );

      case "docx":
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#E2E8F0"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />
              <rect x="5.5" y="18" width="13" height="15" rx="2" fill="#2563EB" />
              <text
                x="12"
                y="29.5"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
              >
                W
              </text>
              <line x1="22" y1="20" x2="30" y2="20" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="24.5" x2="30" y2="24.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="29" x2="30" y2="29" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );

      case "xlsx":
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#E2E8F0"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />
              <rect x="5.5" y="18" width="13" height="15" rx="2" fill="#059669" />
              <text
                x="12"
                y="29.5"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
              >
                X
              </text>
              <line x1="22" y1="20" x2="30" y2="20" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="24.5" x2="30" y2="24.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="29" x2="30" y2="29" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );

      case "ai":
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#1C1105"
                stroke="#D97706"
                strokeWidth="1.2"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#D97706"
                opacity="0.9"
              />
              <text
                x="18"
                y="26"
                fill="#F59E0B"
                fontSize="13"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
              >
                Ai
              </text>
              <text
                x="18"
                y="37"
                fill="#FFFFFF"
                fontSize="7"
                fontWeight="700"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.05em"
              >
                AI
              </text>
            </svg>
          </div>
        );

      case "psd":
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#031628"
                stroke="#0284C7"
                strokeWidth="1.2"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#0284C7"
                opacity="0.9"
              />
              <text
                x="18"
                y="26"
                fill="#38BDF8"
                fontSize="13"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
              >
                Ps
              </text>
              <text
                x="18"
                y="37"
                fill="#FFFFFF"
                fontSize="7"
                fontWeight="700"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.05em"
              >
                PSD
              </text>
            </svg>
          </div>
        );

      case "mp4":
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#6D28D9"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#8B5CF6"
                opacity="0.9"
              />
              <text
                x="18"
                y="30"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.02em"
              >
                MP4
              </text>
            </svg>
          </div>
        );

      case "mp3":
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#BE185D"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#EC4899"
                opacity="0.9"
              />
              <text
                x="18"
                y="30"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.02em"
              >
                MP3
              </text>
            </svg>
          </div>
        );

      default:
        return (
          <div className="relative shrink-0 select-none drop-shadow-sm">
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H23L36 13V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                fill="#0F766E"
              />
              <path
                d="M23 0V11C23 12.1046 23.8954 13 25 13H36L23 0Z"
                fill="#14B8A6"
                opacity="0.9"
              />
              <text
                x="18"
                y="30"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.02em"
              >
                PNG
              </text>
            </svg>
          </div>
        );
    }
  };

  return (
    <>
      {/* Mobile Channel Drawer Backdrop */}
      {showMobileChannels && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileChannels(false)}
        />
      )}

      {/* ============================================================== */}
      {/* MAIN MEDIA WORKSPACE: SEPARATE SOCIAL SIDEBAR + TOPBAR + GRID */}
      {/* ============================================================== */}
      <main className="flex-1 h-full flex flex-row gap-3 overflow-hidden select-none relative">
        {/* ============================================================== */}
        {/* 1. SEPARATE SOCIAL CHANNELS SIDEBAR (Similar to Workflow)      */}
        {/* ============================================================== */}
        <aside
          className={cn(
            "w-[300px] h-full rounded-2xl flex flex-col justify-between shrink-0 overflow-hidden transition-all z-20",
            showMobileChannels
              ? "fixed inset-y-3 left-3 z-40 w-80 flex rounded-2xl shadow-2xl border border-white/20 bg-neutral-950/95 backdrop-blur-2xl"
              : "hidden lg:flex"
          )}
          style={{
            background: "rgba(14, 18, 19, 0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow:
              "rgba(0, 0, 0, 0.5) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
          }}
        >
          {/* Mobile Header Close */}
          {showMobileChannels && (
            <div className="flex items-center justify-between p-3 border-b border-white/10 lg:hidden">
              <h3 className="text-xs font-bold text-white">Select Channel</h3>
              <button
                type="button"
                onClick={() => setShowMobileChannels(false)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Channels Cards Scrollable Grid / List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
            {channels.map((ch) => {
              const isActive = ch.active || selectedChannelId === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch)}
                  className={cn(
                    "p-3 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all relative",
                    isActive
                      ? "bg-[#16191B] border-2 border-brand-lime"
                      : "bg-[#141718] border border-white/10 hover:border-white/20"
                  )}
                  style={
                    isActive
                      ? {
                        background: "rgba(22, 26, 28, 0.85)",
                        boxShadow: "rgba(197, 245, 42, 0.12) 0px 0px 18px",
                      }
                      : {
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                      }
                  }
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
                      <span className="text-[9px] text-brand-lime font-medium uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                  )}

                  {/* Channel Circle Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 shadow-md",
                      ch.brandColor ? "" : "bg-black border border-white/20"
                    )}
                    style={{
                      background: ch.gradient || ch.brandColor,
                    }}
                  >
                    {renderChannelIcon(ch.iconType)}
                  </div>

                  <h4 className={cn("text-xs font-bold text-white", isActive ? "font-bold" : "font-semibold")}>
                    {ch.name}
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">{ch.subtitle}</p>

                  {/* Add Media Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadChannelId(ch.id);
                      setShowUploadModal(true);
                    }}
                    className={cn(
                      "mt-2 px-3 py-1 rounded-lg text-[10px] font-semibold transition-all w-full flex items-center justify-center space-x-1 border border-dashed",
                      isActive
                        ? "bg-brand-lime/10 border-brand-lime text-brand-lime hover:bg-brand-lime/20"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/20 hover:border-brand-lime"
                    )}
                  >
                    <span className="font-bold">+</span>
                    <span>Add Media</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick channel upload trigger button at bottom */}
          <div className="p-3 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-brand-lime/40 bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>+ Upload to Channel</span>
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* 2. RIGHT MAIN MEDIA CONTENT AREA (Topbar + Media Grid)         */}
        {/* ============================================================== */}
        <div className="flex-1 h-full flex flex-col gap-3 overflow-hidden">
          {/* Separate Floating Topbar (Topbar UI Style) */}
          <div
            className="h-14 px-4 flex items-center justify-between shrink-0 select-none rounded-2xl"
            style={{
              background: "rgba(14, 18, 19, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              boxShadow:
                "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.12) 0px 1px 0px inset",
            }}
          >
            {/* Filter Tabs & Sort Row */}
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center space-x-1.5 text-xs overflow-x-auto max-w-full pb-0.5 shrink min-w-0">
                {/* Mobile channel drawer toggle pill */}
                <button
                  type="button"
                  onClick={() => setShowMobileChannels(!showMobileChannels)}
                  className="lg:hidden px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-neutral-300 hover:text-white flex items-center space-x-1"
                >
                  <span>Channels</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                </button>

                {/* All Media */}
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center space-x-1.5 text-xs cursor-pointer",
                    activeTab === "all"
                      ? "text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                  style={
                    activeTab === "all"
                      ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                      }
                      : {
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }
                  }
                >
                  <span>All Media</span>
                  <span className="bg-brand-lime text-black font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    134
                  </span>
                </button>

                {/* Images */}
                <button
                  type="button"
                  onClick={() => setActiveTab("images")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 text-xs cursor-pointer",
                    activeTab === "images"
                      ? "text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                  style={
                    activeTab === "images"
                      ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                      }
                      : {
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }
                  }
                >
                  <span>Images</span>
                  <span className="text-white/40 text-[11px]">(124)</span>
                </button>

                {/* Videos & Reels */}
                <button
                  type="button"
                  onClick={() => setActiveTab("videos")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 text-xs cursor-pointer",
                    activeTab === "videos"
                      ? "text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                  style={
                    activeTab === "videos"
                      ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                      }
                      : {
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }
                  }
                >
                  <span>Videos &amp; Reels</span>
                  <span className="text-white/40 text-[11px]">(38)</span>
                </button>

                {/* Carousels */}
                <button
                  type="button"
                  onClick={() => setActiveTab("carousels")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 text-xs cursor-pointer",
                    activeTab === "carousels"
                      ? "text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                  style={
                    activeTab === "carousels"
                      ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                      }
                      : {
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }
                  }
                >
                  <span>Carousels</span>
                  <span className="text-white/40 text-[11px]">(16)</span>
                </button>

                {/* Audio & SFX */}
                <button
                  type="button"
                  onClick={() => setActiveTab("audio")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 text-xs cursor-pointer",
                    activeTab === "audio"
                      ? "text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                  style={
                    activeTab === "audio"
                      ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                      }
                      : {
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }
                  }
                >
                  <span>Audio &amp; SFX</span>
                  <span className="text-white/40 text-[11px]">(8)</span>
                </button>
              </div>

              {/* Right: Sort Dropdown & Add New Action (Matching Reference Image) */}
              <div className="flex items-center space-x-2 relative shrink-0">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs text-white/90 hover:text-white transition-colors cursor-pointer"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      boxShadow: "rgba(255, 255, 255, 0.08) 0px 1px 1px inset",
                    }}
                  >
                    <span className="text-white/50">Sort:</span>
                    <span className="text-white font-medium">
                      {sortOption === "recent"
                        ? "Recently Added"
                        : sortOption === "size"
                          ? "Largest File"
                          : sortOption === "linked"
                            ? "Most Linked"
                            : "Alphabetical"}
                    </span>
                    <svg
                      className={cn(
                        "w-3.5 h-3.5 ml-0.5 text-white/40 transition-transform",
                        isSortOpen ? "rotate-180" : ""
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>

                  {isSortOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 w-44 py-1 z-30 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                      style={{
                        background: "rgba(18, 20, 22, 0.95)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                      }}
                    >
                      {[
                        { key: "recent", label: "Recently Added" },
                        { key: "size", label: "Largest File" },
                        { key: "linked", label: "Most Linked" },
                        { key: "name", label: "Alphabetical" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setSortOption(opt.key as any);
                            setIsSortOpen(false);
                            addToast({
                              title: "Sorted",
                              description: `Ordered assets by ${opt.label}`,
                              variant: "info",
                            });
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer",
                            sortOption === opt.key
                              ? "bg-white/10 text-brand-lime font-medium"
                              : "text-neutral-300 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Button (Matching reference topbar) */}
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-brand-limeHover text-black transition-all shadow-sm cursor-pointer"
                  title="Upload New Content Asset"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                  <span>Add New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Separate Floating Media Cards Grid (Matching User Reference Image UI in Dark Mode) */}
          <div
            className="flex-1 overflow-y-auto p-4 rounded-2xl relative"
            style={{
              background: "rgba(14, 18, 19, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              boxShadow:
                "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
            }}
          >
            {/* Separate Floating Media Cards Grid (Matching User Reference Image UI in Dark Mode) */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              }}
            >
              {sortedItems.map((item) => (
                <MediaFileCard
                  key={item.id}
                  item={item}
                  isSelected={!!item.selected}
                  isMenuOpen={openCardMenuId === item.id}
                  onSelectToggle={(e) => handleToggleSelect(item.id, e)}
                  onOpenModal={(modalItem) => setActiveModalItem(modalItem)}
                  onToggleMenu={() =>
                    setOpenCardMenuId(openCardMenuId === item.id ? null : item.id)
                  }
                  onCloseMenu={() => setOpenCardMenuId(null)}
                  onDeleteItem={handleDeleteItem}
                  onCopyUrl={(url) => {
                    navigator.clipboard?.writeText(url);
                    addToast({
                      title: "URL Copied",
                      description: "Asset URL copied to clipboard",
                      variant: "info",
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: Media Detail Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl p-6 text-white shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="truncate pr-4">
                <h3 className="text-sm font-bold text-white truncate">{activeModalItem.fileName}</h3>
                <p className="text-xs text-neutral-400">{activeModalItem.placement}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Media Preview Box */}
            <div className="my-4 rounded-xl overflow-hidden h-72 bg-black flex items-center justify-center border border-white/10 relative">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.altText}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                <span className="bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90 px-2.5 py-0.5 rounded-full border border-white/20">
                  {activeModalItem.badgeFormat}
                </span>
                <span className="bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/70 px-2 py-0.5 rounded-full border border-white/20">
                  {activeModalItem.fileSize}
                </span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                  Resolution
                </span>
                <span className="text-white font-medium">{activeModalItem.resolution}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Channel</span>
                <span className="text-white font-medium">{activeModalItem.channelName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Asset Status</span>
                <span className="text-brand-lime font-medium">{activeModalItem.tag}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                  Linked Posts
                </span>
                <span className="text-white font-medium">
                  {activeModalItem.linkedPostsCount || 1} Published / Scheduled
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDeleteItem(activeModalItem.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete Asset
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeModalItem.imageUrl);
                    addToast({
                      title: "URL Copied",
                      description: "Asset link ready to share or embed",
                      variant: "info",
                    });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToast({
                      title: "Asset Attached",
                      description: `Attached ${activeModalItem.fileName} to new draft post`,
                      variant: "success",
                    });
                    setActiveModalItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-lg transition-colors"
                >
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload Media Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6 text-white shadow-2xl border border-white/15"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Upload New Asset</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUpload} className="mt-4 space-y-4">
              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-white/20 hover:border-brand-lime rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/5">
                <svg
                  className="w-8 h-8 mx-auto text-neutral-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <p className="text-xs text-neutral-200 font-medium">Click to select or drag and drop</p>
                <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG, MP4, GIF up to 50MB</p>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Asset Title</label>
                <input
                  type="text"
                  placeholder="e.g. Smeraldo_Emerald_Promo"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Channel Destination</label>
                <select
                  value={uploadChannelId}
                  onChange={(e) => setUploadChannelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Placement / Category</label>
                <select
                  value={uploadPlacement}
                  onChange={(e) => setUploadPlacement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                >
                  <option value="Instagram Post">Instagram Post (Feed)</option>
                  <option value="Instagram Reel">Instagram Reel (9:16)</option>
                  <option value="Instagram Story">Instagram Story (9:16)</option>
                  <option value="Master Asset">Master Asset</option>
                  <option value="Product Hero">Product Hero</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-md transition-colors"
                >
                  Upload Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

