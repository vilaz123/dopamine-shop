"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useShareStore } from "@/stores/share-store";
import { Button } from "@/components/ui/Button";
import { withBasePath } from "@/lib/utils/path";

export function ShareButton({ type, title, text, className }: { type: "invite" | "product" | "order" | "asset_summary" | "community_post" | "profile"; title: string; text: string; className?: string }) {
  const user = useAuthStore((state) => state.user);
  const createShare = useShareStore((state) => state.createShare);
  const [shareText, setShareText] = useState("");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const base = typeof window === "undefined" ? "" : withBasePath("/");
  const userId = user?.id ?? "guest";

  const fallbackUrl = useMemo(() => `${origin}${base}`, [origin, base]);

  async function share() {
    const item = createShare({ userId, type, title, text, url: fallbackUrl });
    const url = `${origin}${base}?share=${item.code}`;
    const content = `${title}\n${text}\n分享码：${item.code}\n${url}`;
    setShareText(content);
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${text}\n分享码：${item.code}`, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard?.writeText(content);
  }

  return (
    <div>
      <Button type="button" className={className} onClick={share}>一键分享</Button>
      {shareText && <textarea readOnly value={shareText} className="mt-3 h-28 w-full rounded-2xl border border-black/10 bg-white/70 p-3 text-xs text-black" />}
    </div>
  );
}
