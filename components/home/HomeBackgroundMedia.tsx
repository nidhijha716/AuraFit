"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DashboardAmbientBackground } from "@/components/home/DashboardAmbientBackground";
import { homeMediaConfig } from "@/lib/config/homeMedia";

export function HomeBackgroundMedia() {
  const { type, videoSrc, imageSrc, posterSrc, objectPosition, overlayOpacity } =
    homeMediaConfig;

  if (type === "ambient") {
    return <DashboardAmbientBackground />;
  }

  return (
    <MediaBackground
      type={type}
      videoSrc={videoSrc}
      imageSrc={imageSrc}
      posterSrc={posterSrc}
      objectPosition={objectPosition}
      overlayOpacity={overlayOpacity}
    />
  );
}

function MediaBackground({
  type,
  videoSrc,
  imageSrc,
  posterSrc,
  objectPosition,
  overlayOpacity,
}: {
  type: "video" | "image";
  videoSrc: string;
  imageSrc: string;
  posterSrc?: string;
  objectPosition?: string;
  overlayOpacity?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(type === "image");

  useEffect(() => {
    if (type !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      video.pause();
      setReady(true);
      return;
    }

    video.play().catch(() => setReady(true));
  }, [type, videoSrc]);

  useEffect(() => {
    if (type === "video") setReady(false);
  }, [type, videoSrc]);

  const scrimOpacity = (overlayOpacity ?? 78) / 100;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#121820]"
      aria-hidden
    >
      {type === "video" ? (
        <>
          {posterSrc && !ready && (
            <Image
              src={posterSrc}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition }}
              priority
              unoptimized
            />
          )}
          <video
            key={videoSrc}
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ objectPosition, opacity: ready ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={posterSrc}
            onCanPlay={() => setReady(true)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </>
      ) : (
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition }}
          priority
          unoptimized
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(10,12,16,${scrimOpacity * 0.9}) 0%, rgba(18,24,32,${scrimOpacity * 0.75}) 50%, rgba(26,36,56,${scrimOpacity * 0.92}) 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(240,180,138,0.1) 0%, transparent 55%)",
        }}
      />
    </div>
  );
}
