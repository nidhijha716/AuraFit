"use client";



import { useEffect, useRef, useState } from "react";



/** Landing hero video — uses v2 by default */

const VIDEO_SRC = "/v2.mp4";



export function HeroVideo() {

  const videoRef = useRef<HTMLVideoElement>(null);

  const [ready, setReady] = useState(false);



  useEffect(() => {

    const video = videoRef.current;

    if (!video) return;



    const prefersReducedMotion = window.matchMedia(

      "(prefers-reduced-motion: reduce)"

    ).matches;



    if (prefersReducedMotion) {

      video.pause();

      return;

    }



    video.play().catch(() => {});

  }, []);



  return (

    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#0a0c10]">

      <div

        className="absolute inset-0 transition-opacity duration-700"

        style={{ opacity: ready ? 0 : 1 }}

        aria-hidden

      />



      <video

        ref={videoRef}

        className="absolute inset-0 h-full w-full object-cover object-[center_30%] md:object-[center_35%]"

        autoPlay

        muted

        loop

        playsInline

        preload="auto"

        onCanPlay={() => setReady(true)}

        aria-hidden

      >

        <source src={VIDEO_SRC} type="video/mp4" />

      </video>



      <div

        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/70"

        aria-hidden

      />

    </div>

  );

}

