import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const solid =
  "h-9 gap-1.5 rounded-lg border border-[#0a4fb8] bg-linear-to-b from-[#1f6fe0] to-[#0a54c4] px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.15)] transition-colors hover:from-[#2a7af0] hover:to-[#0d5ed6] active:translate-y-px active:shadow-inner focus-visible:ring-2 focus-visible:ring-[#1f6fe0]/40 focus-visible:ring-offset-2";

// Outline on white / near-white surfaces
const outline =
  "h-9 gap-1.5 rounded-lg border border-[#1f6fe0]/40 bg-white px-4 text-sm font-medium text-[#0a54c4] " +
  "shadow-[0_1px_2px_rgb(10_84_196/0.06)] transition-colors " +
  "hover:border-[#1f6fe0]/70 hover:bg-[#f3f8ff] hover:text-[#0847a3] " +
  "active:translate-y-px active:bg-[#e8f1ff] " +
  "focus-visible:ring-2 focus-visible:ring-[#1f6fe0]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
  "disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none";

// Outline on a blue surface (unchanged in spirit, ring offset matches the blue)
const outlineOnBlue =
  "h-9 gap-1.5 rounded-lg border border-white/55 px-4 text-sm font-medium text-white shadow-none transition-colors " +
  "hover:border-white/80 hover:bg-white/12 active:translate-y-px " +
  "focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a54c4]";
const solidOnBlue =
  "h-9 gap-1.5 rounded-lg border border-white bg-white px-4 text-sm font-semibold text-[#0a54c4] shadow-[0_1px_2px_rgb(0_0_0/0.18)] transition-colors hover:bg-white/90 active:translate-y-px focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a54c4]";

interface CustomBtnProps {
  text?: string;
  type?: "submit" | "button" | "reset";
  to?: string;
  variant?: "solid" | "outline";
  tone?: "light" | "onBlue";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default function CustomBtn({
  text = "Submit",
  type = "submit",
  to,
  variant = "solid",
  tone = "light",
  onClick,
  className,
  disabled = false,
}: CustomBtnProps) {
  const styles =
    tone === "onBlue"
      ? variant === "solid"
        ? solidOnBlue
        : outlineOnBlue
      : variant === "solid"
        ? solid
        : outline;

  const cls = className ? `${styles} ${className}` : styles;

  if (to) {
    return (
      <Button asChild onClick={onClick} className={cls} disabled={disabled}>
        <Link to={to}>{text}</Link>
      </Button>
    );
  }

  return (
    <Button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {text}
    </Button>
  );
}
