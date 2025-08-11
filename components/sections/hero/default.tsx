"use client";

import { ArrowRightIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Defer heavy, below-the-fold components to client after first paint
const MagicBean = dynamic(() => import("@/components/Hero/MagicBean").then(m => ({ default: m.MagicBean })), {
  ssr: false,
  loading: () => null,
});
const FeaturesLazy = dynamic(() => import("@/components/Hero/Features"), {
  ssr: false,
  loading: () => null,
});
const CompareCardLazy = dynamic(() => import("@/components/Hero/ComapringThEDevCard").then(m => ({ default: m.CompareCard })), {
  ssr: false,
  loading: () => null,
});
const ReadmeLazy = dynamic(() => import("@/components/Hero/Readme"), {
  ssr: false,
  loading: () => null,
});
const Section2Lazy = dynamic(() => import("@/components/Hero/Section2"), {
  ssr: false,
  loading: () => null,
});
const FooterLazy = dynamic(() => import("@/components/Hero/Footer"), {
  ssr: false,
  loading: () => null,
});

import { cn } from "@/lib/utils";


import { Badge } from "../../ui/badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button, type ButtonProps } from "../../ui/button";
import Glow from "../../ui/glow";
import { Mockup, MockupFrame } from "../../ui/mockup";
import { PointerHighlight } from "../../ui/pointer-highlight";
import Screenshot from "../../ui/screenshot";
import Section from "@/components/ui/Section";

// Features & Readme are lazy-loaded above
interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title = "What to Build?",
  description = "Enter a concept to discover and analyze relevant open-source projects.",
  mockup = (
    <Screenshot
      srcLight="/GithubImages/search.png"
      srcDark="/GithubImages/search.png"
      alt="Search UI app screenshot"
      width={1248}
      height={765}
      className="w-full"
    />
  ),
  badge = (
    <Badge variant="outline" className="animate-appear">
      <span className="text-muted-foreground">
        New version of Launch UI is out!
      </span>
      <a href="https://www.launchuicomponents.com/" className="flex items-center gap-1">
        Get started
        <ArrowRightIcon className="size-3" />
      </a>
    </Badge>
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buttons = [
   
  ],
  className,
}: HeroProps) {
  // Mount gate to defer heavy components until after first paint/idle
  const [deferHeavy, setDeferHeavy] = useState(false);
  // Cache-buster for Peerlist embed image: stable during session, refreshes on full page reload
  const [peerlistCB] = useState(() => Date.now());
  useEffect(() => {
    // Prefer idle; fallback to timeout for broader support (typed shims)
    type RIC = (cb: () => void) => number;
    type CIC = (id: number) => void;
    const w = window as unknown as {
      requestIdleCallback?: RIC;
      cancelIdleCallback?: CIC;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setDeferHeavy(true));
      return () => {
        if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(() => setDeferHeavy(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  // Smooth scroll perf: toggle a root .scrolling class while user scrolls
  useEffect(() => {
    const root = document.documentElement;
    let scrollTimeout: number | null = null;
    const onScroll = () => {
      if (!root.classList.contains('scrolling')) root.classList.add('scrolling');
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        root.classList.remove('scrolling');
        scrollTimeout = null;
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    return () => {
      window.removeEventListener('scroll', onScroll as EventListener);
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0 pt-20 md:pt-28",
        className,
      )}
    >
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {badge !== false && badge}
          <h1 className="animate-appear from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-gradient-to-r bg-clip-text text-3xl leading-tight font-semibold text-balance text-white drop-shadow-2xl sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight">
            What to <span className="inline-block align-middle"><PointerHighlight rectangleClassName="border-2 border-blue-400" pointerClassName="text-blue-400" containerClassName="inline-block align-middle"><span className="font-bold text-white-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] transform hover:scale-110 transition-all duration-300" style={{
              textShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 4px 8px rgba(0, 0, 0, 0.5)',
              transform: 'perspective(1000px) rotateX(-10deg) rotateY(5deg)',
              filter: 'drop-shadow(0 8px 16px rgba(59, 130, 246, 0.3))'
            }}>Build?</span></PointerHighlight></span>
          </h1>
          <p className="text-md animate-appear text-muted-foreground relative z-10 max-w-[740px] font-medium text-balance opacity-0 delay-100 sm:text-xl">
            {description}
          </p>
          {/* Removed Search Projects button */}
          {mockup !== false && (
            <div className="relative w-full pt-12 pb-10">
              <a href="/search" className="block">
                <MockupFrame
                  className="animate-appear opacity-0 delay-700"
                  size="small"
                >
                  <Mockup
                    type="responsive"
                    className="bg-background/90 w-full rounded-xl border-0"
                  >
                    {mockup}
                  </Mockup>
                </MockupFrame>
              </a>
              <Glow
                variant="top"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          )}
        </div>
      </div>

      {deferHeavy && <MagicBean />}

      <div>
        {deferHeavy && <FeaturesLazy forceDarkMode={true} />}
      </div>
      
      {/* BentoCrad section with same Hero background */}
      {/* <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-container mx-auto">
          <BentoCrad />
        </div>
      
      </div> */}
      {/* <CanvasCard /> */}

       

      {deferHeavy && <CompareCardLazy />}

      {deferHeavy && <ReadmeLazy />}
      
      {deferHeavy && <Section2Lazy />}

     

      {/* <RollingText /> */}

     
      
       {deferHeavy && <FooterLazy />}

      {/* Landing-only fixed Peerlist badge bottom-right */}
      <a
        href="https://peerlist.io/bytehumi/project/what-to-build"
        target="_blank"
        rel="noreferrer"
        aria-label="What to Build on Peerlist"
        className="fixed top-4 sm:top-6 md:top-8 right-4 z-[60] opacity-90 hover:opacity-100 transition-opacity"
      >
        <div
          className={
            cn(
              "group relative overflow-hidden rounded-2xl",
             
              "transition-all duration-300"
            )
          }
        >
          {/* Content image */}
          <img
            src={`https://peerlist.io/api/v1/projects/embed/PRJHKKD8BD7OG6OMMCQQPROKJDEMME?showUpvote=true&theme=dark&_cb=${peerlistCB}`}
            alt="What to Build on Peerlist"
            className="h-12 sm:h-14 md:h-16 w-auto select-none rounded-2xl"
            loading="lazy"
            decoding="async"
            style={{ filter: "saturate(1.04) contrast(1.04)" }}
          />

          {/* Internal glass gloss (slightly stronger on hover) */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_18%,transparent_45%)] mix-blend-overlay opacity-75 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Inset borders and depth inside the badge */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 10px 20px rgba(255,255,255,0.06), inset 0 -12px 24px rgba(0,0,0,0.35)"
            }}
          />

          {/* Sleek neutral hover sheen (no colors) */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 38%, transparent 70%)",
            }}
          />
        </div>
      </a>

    </Section>
  );
}
