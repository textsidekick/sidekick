"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AssetPhoto = {
  id: string;
  asset_id: string;
  photo_url: string;
  issue_description: string | null;
  reported_by_phone: string | null;
  created_at: string;
};

export function AssetPhotoGallery({ assetId }: { assetId: string }) {
  const [photos, setPhotos] = useState<AssetPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/assets/${assetId}/photos?limit=20`);
        if (!res.ok) return;
        const json = await res.json();
        if (!ignore) setPhotos(json.photos || []);
      } catch {
        // silent
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [assetId]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(
    () => setLightbox((i) => (i !== null && i < photos.length - 1 ? i + 1 : i)),
    [photos.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, closeLightbox, prev, next]);

  if (loading) {
    return (
      <div className="rounded-xl border border-black/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Images className="h-4 w-4" /> Photos
        </div>
        <div className="mt-2 text-sm text-black/40">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-black/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Images className="h-4 w-4" /> Photos
        </div>

        {photos.length === 0 ? (
          <div className="mt-2 text-sm text-black/50">
            No photos yet. When workers report issues with photos, they&apos;ll appear here.
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(idx);
                }}
                className="relative aspect-square rounded-lg overflow-hidden bg-black/5 hover:ring-2 hover:ring-black/20 transition group"
              >
                <img
                  src={p.photo_url}
                  alt={p.issue_description || "Asset photo"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {p.issue_description && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition">
                    <div className="text-[10px] text-white line-clamp-2">{p.issue_description}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <img
              src={photos[lightbox].photo_url}
              alt={photos[lightbox].issue_description || "Asset photo"}
              className="w-full rounded-xl max-h-[70vh] object-contain bg-black"
            />

            <div className="mt-3 text-white">
              {photos[lightbox].issue_description && (
                <div className="text-sm">{photos[lightbox].issue_description}</div>
              )}
              <div className="text-xs text-white/60 mt-1">
                {new Date(photos[lightbox].created_at).toLocaleString()}
                {photos[lightbox].reported_by_phone && (
                  <> · Reported by {photos[lightbox].reported_by_phone}</>
                )}
              </div>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  disabled={lightbox === 0}
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition",
                    lightbox === 0 && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  disabled={lightbox === photos.length - 1}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition",
                    lightbox === photos.length - 1 && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
