"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Tag,
  Eraser,
  Hash,
  ArrowRightLeft,
  Trash2,
  Info,
  X as CloseIcon,
  Building2,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ConnectedAccount {
  id: string;
  provider: string; // instagram, tiktok, youtube, x, linkedin, threads, facebook
  name: string;
  handle: string;
  avatar?: string;
  isOrg?: boolean;
  group?: string;
  code?: string;
  profileUrl?: string;
  status?: "active" | "updating" | "sync_failed";
}

interface PlatformDef {
  id: string;
  name: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
  invertDark?: boolean;
  isComingSoon?: boolean;
  customIcon?: React.ReactNode;
  hint?: string;
  infoKey?: "instagram" | "facebook";
}

const PLATFORMS: PlatformDef[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "/images/platforms/instagram.svg",
    iconWidth: 28,
    iconHeight: 28,
    hint: "Only Business or Creator accounts can be connected",
    infoKey: "instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "/images/platforms/tiktok-light.svg",
    iconWidth: 28,
    iconHeight: 28,
    invertDark: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "/images/platforms/youtube.svg",
    iconWidth: 28,
    iconHeight: 20,
  },
  {
    id: "x",
    name: "X",
    icon: "/images/platforms/x-light.svg",
    iconWidth: 28,
    iconHeight: 28,
    invertDark: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "/images/platforms/linkedin.svg",
    iconWidth: 28,
    iconHeight: 28,
  },
  {
    id: "threads",
    name: "Threads",
    icon: "/images/platforms/threads.svg",
    iconWidth: 28,
    iconHeight: 28,
    invertDark: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "/images/platforms/facebook.svg",
    iconWidth: 28,
    iconHeight: 28,
    hint: "Only Facebook Pages can be connected",
    infoKey: "facebook",
  },
  {
    id: "blog",
    name: "Blog",
    icon: "",
    iconWidth: 28,
    iconHeight: 28,
    isComingSoon: true,
    customIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/90"
      >
        <path d="M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <path d="M4 11a9 9 0 0 1 9 9" />
      </svg>
    ),
  },
];

const INTEGRATIONS = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "/images/platforms/google-drive-logo.svg",
    width: 28,
    height: 28,
    statusText: "Connect Google Drive",
    isChecking: false,
    disabled: false,
  },
  {
    id: "figma",
    name: "Figma",
    icon: "/images/platforms/figma.svg",
    width: 19,
    height: 28,
    statusText: "Figma coming soon",
    disabled: true,
  },
  {
    id: "canva",
    name: "Canva",
    icon: "/images/platforms/canva.svg",
    width: 28,
    height: 28,
    statusText: "Coming soon",
    disabled: true,
  },
];

export function AccountsView() {
  // FAQs open states
  const [openFaq, setOpenFaq] = useState<{ [key: string]: boolean }>({});

  // Help dialog state
  const [activeHelp, setActiveHelp] = useState<"instagram" | "facebook" | null>(null);

  // Accounts list (starts with popular accounts or demo states)
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    {
      id: "x-1",
      provider: "x",
      name: "Alex Growth",
      handle: "@alexgrowth",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces",
      profileUrl: "https://x.com/alexgrowth",
      status: "active",
      code: "01",
    },
    {
      id: "li-1",
      provider: "linkedin",
      name: "Alex Rivers",
      handle: "Alex Rivers (Founder)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces",
      profileUrl: "https://linkedin.com/in/alexrivers",
      status: "active",
      group: "Founders HQ",
    },
  ]);

  // Loading state for each provider connect button
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [openMenuAccountId, setOpenMenuAccountId] = useState<string | null>(null);

  // Modal dialog states
  const [groupModalAccount, setGroupModalAccount] = useState<ConnectedAccount | null>(null);
  const [groupInput, setGroupInput] = useState("");

  const [codeModalAccount, setCodeModalAccount] = useState<ConnectedAccount | null>(null);
  const [codeInput, setCodeInput] = useState("");

  const [moveModalAccount, setMoveModalAccount] = useState<ConnectedAccount | null>(null);
  const [targetWorkspace, setTargetWorkspace] = useState("Alpha Ventures");

  const toggleFaq = (key: string) => {
    setOpenFaq((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts && data.accounts.length > 0) {
          const mapped: ConnectedAccount[] = data.accounts.map((a: any) => ({
            id: a.id,
            provider: a.provider,
            name: a.name || a.handle,
            handle: a.handle.startsWith("@") ? a.handle : `@${a.handle}`,
            avatar: a.avatar || undefined,
            profileUrl: `https://${a.provider}.com/${a.handle.replace("@", "")}`,
            status: a.status || "active",
          }));
          setAccounts(mapped);
        }
      })
      .catch((err) => console.error("Error loading accounts:", err));
  }, []);

  const handleConnect = async (providerId: string) => {
    setConnectingProvider(providerId);
    try {
      const platform = PLATFORMS.find((p) => p.id === providerId);
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          name: `Alex Growth (${platform?.name})`,
          handle: `@alex_${providerId}`,
          status: "active",
        }),
      });
      const data = await res.json();
      if (data.account) {
        const newAcc: ConnectedAccount = {
          id: data.account.id,
          provider: data.account.provider,
          name: data.account.name,
          handle: data.account.handle,
          profileUrl: `https://${providerId}.com/alexgrowth`,
          status: "active",
        };
        setAccounts((prev) => [newAcc, ...prev.filter((a) => a.id !== newAcc.id)]);
        toast.success(`Connected to ${platform?.name} successfully.`);
      }
    } catch (err) {
      toast.error("Failed to connect account");
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      await fetch(`/api/accounts?id=${accountId}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      setOpenMenuAccountId(null);
      toast.success("Account disconnected.");
    } catch (err) {
      toast.error("Failed to disconnect account");
    }
  };

  const handleUpdateProfile = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, status: "updating" } : a))
    );
    setOpenMenuAccountId(null);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, status: "active" } : a))
      );
      toast.success("Profile automatically updated");
    }, 1200);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupModalAccount) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === groupModalAccount.id ? { ...a, group: groupInput.trim() || undefined } : a))
    );
    toast.success(groupInput.trim() ? `Added to group "${groupInput.trim()}"` : "Removed from group");
    setGroupModalAccount(null);
  };

  const handleSaveCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeModalAccount) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === codeModalAccount.id ? { ...a, code: codeInput.trim() || undefined } : a))
    );
    toast.success(codeInput.trim() ? `Number set to ${codeInput.trim()}` : "Number cleared");
    setCodeModalAccount(null);
  };

  const handleMoveWorkspace = () => {
    if (!moveModalAccount) return;
    setAccounts((prev) => prev.filter((a) => a.id !== moveModalAccount.id));
    toast.success(`Account moved to "${targetWorkspace}".`);
    setMoveModalAccount(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 h-full bg-background font-sans min-w-0">
      {/* 1. Connected Accounts Title Row */}
      <div className="flex items-center gap-2.5 mb-6 shrink-0">
        <div className="flex items-center text-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7 shrink-0 text-foreground"
          >
            <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Connected Accounts
        </h1>
      </div>

        {/* 2. FAQ Accordion Grid */}
        <div className="mb-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* FAQ 1: Multiple accounts */}
            <div className="w-full">
              <div className="rounded-lg border bg-accent hover:bg-background dark:bg-input/50 dark:hover:bg-input/30 px-4 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq("multiple")}
                  className="flex flex-1 items-start justify-between gap-4 rounded-md py-4 transition-all outline-none text-left text-sm font-medium hover:no-underline w-full cursor-pointer"
                >
                  <span>Q. How do I connect multiple accounts on the same platform?</span>
                  <ChevronDown
                    className={`text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 ${
                      openFaq["multiple"] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq["multiple"] && (
                  <div className="pb-4 text-xs sm:text-sm text-muted-foreground space-y-2 border-t pt-3">
                    <p>
                      Log out of the social media account currently linked to reerts in your browser, then log in with
                      the account you want to add. After that, return to reerts and click the connect button for that
                      platform to link the new account.
                    </p>
                    <p className="font-semibold text-foreground">Example (Adding another X account):</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to x.com in your browser and log out of the currently signed-in X account (@my_first).</li>
                      <li>Log in with the X account you want to add (@my_second).</li>
                      <li>Return to reerts, open Accounts in the sidebar, and click the X connect button.</li>
                      <li>Complete the authorization, and @my_second will be linked.</li>
                    </ol>
                    <p>
                      This method works the same way for all platforms including Threads, Instagram, LinkedIn, and Facebook
                      Pages.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FAQ 2: Transfer workspace */}
            <div className="w-full">
              <div className="rounded-lg border bg-accent hover:bg-background dark:bg-input/50 dark:hover:bg-input/30 px-4 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq("transfer")}
                  className="flex flex-1 items-start justify-between gap-4 rounded-md py-4 transition-all outline-none text-left text-sm font-medium hover:no-underline w-full cursor-pointer"
                >
                  <span>Q. How do I transfer a connected account to another workspace?</span>
                  <ChevronDown
                    className={`text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 ${
                      openFaq["transfer"] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq["transfer"] && (
                  <div className="pb-4 text-xs sm:text-sm text-muted-foreground space-y-2 border-t pt-3">
                    <p>
                      Organization owners can move a social account to another workspace within the same organization. All
                      connected data (drafts, scheduled posts, published posts, brand voices, follower history, credit
                      transactions) moves together atomically.
                    </p>
                    <p className="font-semibold text-foreground">How to move an account:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to the Accounts page.</li>
                      <li>Click the connected account you want to move and open the dropdown menu.</li>
                      <li>Select &apos;Move to workspace&apos; (visible only to organization owners).</li>
                      <li>In the dialog, choose the target workspace within your organization.</li>
                      <li>Review the impact summary (number of drafts, posts, brand voices, etc. that will move).</li>
                      <li>Click &apos;Move account&apos; to complete the transfer.</li>
                    </ol>
                    <p className="text-xs opacity-80 pt-1">
                      Notes: Only organization owners can perform this action. Cross-organization moves are not allowed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Social Media Accounts Container */}
        <div className="rounded-lg border bg-sidebar text-card-foreground shadow-md divide-y divide-border">
          {PLATFORMS.map((platform) => {
            const platformAccounts = accounts.filter((a) => a.provider === platform.id);
            const isConnecting = connectingProvider === platform.id;

            return (
              <div key={platform.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Platform Icon column (fixed 32px width centered) */}
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {platform.customIcon ? (
                      platform.customIcon
                    ) : (
                      <Image
                        alt={platform.name}
                        src={platform.icon}
                        width={platform.iconWidth}
                        height={platform.iconHeight}
                        className={`shrink-0 ${platform.invertDark ? "dark:invert" : ""}`}
                        style={{
                          width: `${platform.iconWidth}px`,
                          height: platform.id === "youtube" ? "19.6875px" : `${platform.iconHeight}px`,
                          maxWidth: "none",
                        }}
                      />
                    )}
                  </div>

                  {/* Right Action column */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Connect Button */}
                    <button
                      type="button"
                      disabled={platform.isComingSoon || isConnecting}
                      onClick={() => !platform.isComingSoon && handleConnect(platform.id)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 bg-background shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 rounded-full border-dashed border hover:bg-primary/10 border-primary/30 dark:border-primary/40 mr-2 text-xs sm:px-3 sm:py-1 sm:gap-2 sm:text-sm cursor-pointer"
                    >
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                          <path d="M9 12h6" />
                          <path d="M12 9v6" />
                        </svg>
                      )}
                      <span>
                        {platform.isComingSoon
                          ? `Connect ${platform.name} (Coming soon)`
                          : `Connect ${platform.name}`}
                      </span>
                    </button>

                    {/* Connected Account Pills */}
                    {platformAccounts.map((acc) => {
                      const isMenuOpen = openMenuAccountId === acc.id;

                      return (
                        <div key={acc.id} className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setOpenMenuAccountId(isMenuOpen ? null : acc.id)}
                            className="rounded-full border-0 px-3 py-1 flex items-center gap-2 text-foreground text-xs sm:px-3 sm:py-1 sm:gap-2 sm:text-sm bg-primary/10 dark:bg-primary/10 hover:border-1 hover:border-dashed hover:border-primary/30 dark:hover:border-primary/40 transition-colors cursor-pointer"
                          >
                            {acc.isOrg && <Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
                            {acc.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={acc.avatar}
                                alt={acc.name}
                                width={18}
                                height={18}
                                className="rounded-full size-4.5 object-cover"
                              />
                            ) : (
                              <div className="size-4.5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                {acc.name[0]}
                              </div>
                            )}
                            <span className="font-medium">{acc.handle || acc.name}</span>
                            {acc.group && <span className="text-muted-foreground">· {acc.group}</span>}
                            {acc.code && (
                              <span className="text-[10px] font-mono bg-background px-1 py-0.2 rounded border">
                                #{acc.code}
                              </span>
                            )}
                            {acc.status === "updating" && (
                              <Loader2 className="size-3 animate-spin text-primary" />
                            )}
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenuAccountId(null)}
                              />
                              <div className="absolute left-0 mt-1.5 w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md z-50 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (acc.profileUrl) window.open(acc.profileUrl, "_blank");
                                    setOpenMenuAccountId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4 opacity-70" />
                                  <span>Open Profile</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateProfile(acc.id)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                                >
                                  <RefreshCw className="w-4 h-4 opacity-70" />
                                  <span>Update Profile</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGroupInput(acc.group || "");
                                    setGroupModalAccount(acc);
                                    setOpenMenuAccountId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                                >
                                  <Tag className="w-4 h-4 opacity-70" />
                                  <span>Set group</span>
                                </button>
                                {acc.group && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAccounts((prev) =>
                                        prev.map((a) => (a.id === acc.id ? { ...a, group: undefined } : a))
                                      );
                                      setOpenMenuAccountId(null);
                                      toast.success("Removed from group");
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                                  >
                                    <Eraser className="w-4 h-4 opacity-70" />
                                    <span>Remove from group</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCodeInput(acc.code || "");
                                    setCodeModalAccount(acc);
                                    setOpenMenuAccountId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                                >
                                  <Hash className="w-4 h-4 opacity-70" />
                                  <span>Set number</span>
                                </button>
                                {acc.code && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAccounts((prev) =>
                                        prev.map((a) => (a.id === acc.id ? { ...a, code: undefined } : a))
                                      );
                                      setOpenMenuAccountId(null);
                                      toast.success("Number cleared");
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                                  >
                                    <Eraser className="w-4 h-4 opacity-70" />
                                    <span>Clear number</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMoveModalAccount(acc);
                                    setOpenMenuAccountId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                                >
                                  <ArrowRightLeft className="w-4 h-4 opacity-70" />
                                  <span>Move between workspaces</span>
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDisconnect(acc.id)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-destructive/10 text-destructive text-left cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-4 h-4 opacity-70" />
                                  <span>Disconnect</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Hint text & info icon popover triggers */}
                    {platform.hint && (
                      <div className="ml-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{platform.hint}</span>
                        {platform.infoKey && (
                          <button
                            type="button"
                            onClick={() => setActiveHelp(platform.infoKey!)}
                            aria-label={`How to set up ${platform.name}`}
                            className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                          >
                            <Info className="size-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Integrations Container */}
        <div className="mt-6 rounded-lg border bg-sidebar text-card-foreground shadow-md">
          <h2 className="px-4 pt-4 pb-2 text-sm font-semibold text-muted-foreground">
            Integrations
          </h2>
          <div className="divide-y divide-border">
            {INTEGRATIONS.map((intg) => (
              <div key={intg.id} className="flex items-center gap-4 p-4">
                <div className="flex w-8 shrink-0 justify-center">
                  <Image
                    alt={intg.name}
                    src={intg.icon}
                    width={intg.width}
                    height={intg.height}
                    className="shrink-0 object-contain"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={intg.disabled}
                    onClick={() => {
                      if (!intg.disabled) {
                        toast.success("Google Drive connected");
                      }
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 bg-background shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 rounded-full border-dashed border hover:bg-primary/10 border-primary/30 dark:border-primary/40 mr-2 text-xs sm:px-3 sm:py-1 sm:gap-2 sm:text-sm cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                      <path d="M9 12h6" />
                      <path d="M12 9v6" />
                    </svg>
                    <span>{intg.statusText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* MODAL 1: Instagram Professional Account Guide */}
      {activeHelp === "instagram" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl relative space-y-4">
            <button
              type="button"
              onClick={() => setActiveHelp(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <CloseIcon className="size-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">How to switch to a professional account</h3>
              <p className="text-xs text-muted-foreground">Follow these quick steps inside the Instagram mobile app:</p>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-foreground/90">
              <li>Open the Instagram app and go to your profile</li>
              <li>Tap the menu (≡) at the top right → Settings and privacy</li>
              <li>Account type and tools → Switch to professional account</li>
              <li>Choose either Business or Creator</li>
            </ol>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Note: You don&apos;t need to link a Facebook Page.
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveHelp(null)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Facebook Page Guide */}
      {activeHelp === "facebook" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl relative space-y-4">
            <button
              type="button"
              onClick={() => setActiveHelp(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <CloseIcon className="size-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">If your Page isn&apos;t listed</h3>
              <p className="text-xs text-muted-foreground">Common reasons Facebook Pages do not appear:</p>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span>Personal profiles can&apos;t be connected — Meta doesn&apos;t provide a publishing API for them.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span>You need content-creation access on the Page to select it. Without it the Page still appears but is greyed out.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">•</span>
                <span>Check that you allowed the business your Page belongs to on the consent screen. Narrowing the business selection hides Pages outside it.</span>
              </li>
            </ul>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveHelp(null)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Set Group Dialog */}
      {groupModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveGroup}
            className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl relative space-y-4"
          >
            <button
              type="button"
              onClick={() => setGroupModalAccount(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <CloseIcon className="size-4" />
            </button>
            <div>
              <h3 className="text-base font-bold text-foreground">Set group</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Accounts in the same group appear together wherever you pick accounts.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Group name</label>
              <input
                type="text"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                placeholder="e.g. Client A, 01 HQ"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGroupModalAccount(null)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Set Number Code Dialog */}
      {codeModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveCode}
            className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl relative space-y-4"
          >
            <button
              type="button"
              onClick={() => setCodeModalAccount(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <CloseIcon className="size-4" />
            </button>
            <div>
              <h3 className="text-base font-bold text-foreground">Set number</h3>
              <p className="text-xs text-muted-foreground mt-1">
                An account with a number shows it in place of the profile photo. Clear the field and save to show the photo again.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Number</label>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="e.g. 07"
                maxLength={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring font-mono"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCodeModalAccount(null)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: Move to Workspace Dialog */}
      {moveModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl relative space-y-4">
            <button
              type="button"
              onClick={() => setMoveModalAccount(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <CloseIcon className="size-4" />
            </button>
            <div>
              <h3 className="text-base font-bold text-foreground">Move account to another workspace</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Connected drafts, posts, history, and credits move with the account. Pipeline branches stay in the source workspace and are detached and disabled.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-muted-foreground block mb-1">To</label>
                <select
                  value={targetWorkspace}
                  onChange={(e) => setTargetWorkspace(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:border-ring cursor-pointer"
                >
                  <option value="Alpha Ventures">Alpha Ventures</option>
                  <option value="Client Brand Beta">Client Brand Beta</option>
                  <option value="Personal Studio">Personal Studio</option>
                </select>
              </div>

              <div className="rounded-lg bg-muted/60 border p-3 space-y-1.5">
                <span className="font-semibold text-foreground block">Review what will change:</span>
                <ul className="space-y-1 text-muted-foreground list-disc pl-4 text-[11px]">
                  <li>Pipeline branches in the source workspace will be detached and disabled</li>
                  <li>Drafts, scheduled posts, and history records move atomically</li>
                  <li>Source workspace&apos;s default account will be cleared</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMoveModalAccount(null)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveWorkspace}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Move account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
