"use client";

import React, { forwardRef, useRef } from "react";
import Image from "next/image";


import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { Github, Dock, Gitlab, Slack, Chrome, TerminalSquare, Feather } from 'lucide-react';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-black/70 to-black/50 p-3 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(120,120,255,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_0px_rgba(120,120,255,0.4)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";


export function MagicBean() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);
  const div8Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[700px] w-full items-center justify-center overflow-hidden p-16"
      ref={containerRef}
    >
      <div className="flex size-full max-h-[600px] max-w-5xl flex-col items-stretch justify-between gap-24">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Gitlab className="w-10 h-10 text-white/80" />
          </Circle>
          <Circle ref={div5Ref}>
            <Dock className="w-10 h-10 text-white/80" />
          </Circle>
          <Circle ref={div6Ref}>
            <Slack className="w-10 h-10 text-white/80" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Chrome className="w-10 h-10 text-white/80" />
          </Circle>
          <Circle ref={div4Ref} className="size-24 bg-gradient-to-br from-black/70 to-black/50 border-white/20 shadow-[0_0_40px_0px_rgba(120,120,255,0.5)] flex items-center justify-center">
            <Github className="w-16 h-16 text-white/80" />
          </Circle>
          <Circle ref={div3Ref}>
            <TerminalSquare className="w-10 h-10 text-white/80" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between mx-auto w-3/4">
          <Circle ref={div7Ref}>
            <Feather className="w-10 h-10 text-white/80" />
          </Circle>
          <Circle ref={div8Ref}>
            <TerminalSquare className="w-10 h-10 text-white/80" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={-60}
        endYOffset={15}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div8Ref}
        toRef={div4Ref}
        curvature={60}
        endYOffset={15}
      />
    </div>
  );
}

// No longer needed as we're using direct image URLs
