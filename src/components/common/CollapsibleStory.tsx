"use client";

import { useState, type ReactNode } from "react";

/**
 * 可折叠叙事卡片：手机默认折叠正文、点「展开」滑下（slide-down），桌面默认展开。
 * 用于详情页的 story/intro，把长段落收起，让手机首屏更轻、布局更灵动。
 * dark=true 用于 theme-food 深底（半透白边卡 + 白字）；默认浅色卡。
 */
export function CollapsibleStory({
  eyebrow,
  title,
  children,
  className = "",
  dark = false,
}: {
  eyebrow: string;
  title?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cardBg = dark ? "bg-white/10 border-white/25" : "bg-white/55 border-white/50";
  const eyebrowColor = dark ? "text-[var(--page-highlight)]" : "text-[var(--hot)]";
  const titleColor = dark ? "text-white" : "var(--page-ink)";
  const toggleColor = dark ? "text-white" : "var(--page-ink)";
  return (
    <div className={`rounded-[1.25rem] border p-5 backdrop-blur sm:rounded-[1.5rem] sm:p-6 ${cardBg} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span className={`text-xs uppercase tracking-[0.28em] ${eyebrowColor}`}>{eyebrow}</span>
          {title && <span className="font-display ml-0 block text-lg leading-tight sm:text-xl" style={{ color: titleColor }}>{title}</span>}
        </span>
        <span className="shrink-0 text-sm font-semibold sm:hidden" style={{ color: toggleColor }}>{open ? "收起" : "展开"}</span>
      </button>
      {/* 桌面始终展开；手机点开才展开 */}
      <div className="hidden sm:mt-4 sm:block">{children}</div>
      {open && <div className="slide-down mt-4 sm:hidden">{children}</div>}
    </div>
  );
}
