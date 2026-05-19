"use client";
import { Globe } from "lucide-react";

export default function LanguageBadge() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-lg">
      <Globe className="h-4 w-4 text-amber-600 flex-shrink-0" />
      <p className="text-xs text-amber-800">
        Sidekick answers in <strong>50+ languages</strong> -- workers can text in Spanish, Mandarin, Tagalog, Vietnamese, and more. No setup required.
      </p>
    </div>
  );
}
