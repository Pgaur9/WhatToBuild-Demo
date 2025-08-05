"use client";

import React, { forwardRef, useRef } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

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
      className="relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex size-full max-h-[400px] max-w-3xl flex-col items-stretch justify-between gap-16">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <div className="relative w-10 h-10">
              <Image 
                src="https://cdn.worldvectorlogo.com/logos/appwrite.svg" 
                alt="Appwrite logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </Circle>
          <Circle ref={div5Ref}>
            <div className="relative w-10 h-10">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg" 
                alt="TensorFlow logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </Circle>
          <Circle ref={div6Ref}>
            <div className="relative w-10 h-10">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/1/10/PyTorch_logo_icon.svg" 
                alt="PyTorch logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <div className="relative w-10 h-10">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg" 
                alt="Linux logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </Circle>
          <Circle ref={div4Ref} className="size-24 bg-gradient-to-br from-black/70 to-black/50 border-white/20 shadow-[0_0_40px_0px_rgba(120,120,255,0.5)]">
            <div className="relative w-16 h-16">
              <Image 
                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                alt="GitHub logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </Circle>
          <Circle ref={div3Ref}>
            <div className="relative w-10 h-10">
              <Image 
                src="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png" 
                alt="Supabase logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between mx-auto w-3/4">
          <Circle ref={div7Ref}>
            <div className="relative w-10 h-10">
              <Image 
                src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" 
                alt="Docker logo" 
                fill 
                className="object-contain" 
              />
            </div>
          </Circle>
          <Circle ref={div8Ref}>
            <div className="relative w-10 h-10">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/d/d2/Mozilla_logo.svg" 
                alt="Mozilla logo" 
                fill 
                className="object-contain" 
              />
            </div>
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
