"use client";

import { ArrowRightIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Testimonials } from "@/components/Hero/Testimonials";
import GitHubStarBadge from "@/components/Hero/GitHubStarBadge";


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
  // Skeleton loading states for badges
  const [peerlistLoaded, setPeerlistLoaded] = useState(true);
  const [productHuntLoaded, setProductHuntLoaded] = useState(true);
  // Retry logic states
  const [peerlistAttempt, setPeerlistAttempt] = useState(0);
  const [productHuntAttempt, setProductHuntAttempt] = useState(0);
  const [peerlistTs, setPeerlistTs] = useState(() => Date.now());
  const [productHuntTs, setProductHuntTs] = useState(() => Date.now());

  // If an image hasn't loaded in time, retry with a fresh cache-buster (max 3 retries)
  useEffect(() => {
    if (peerlistLoaded || peerlistAttempt >= 1) return;
    const timeout = window.setTimeout(() => {
      setPeerlistAttempt((a) => a + 1);
      setPeerlistTs(Date.now());
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [peerlistLoaded, peerlistAttempt]);

  useEffect(() => {
    if (productHuntLoaded || productHuntAttempt >= 1) return;
    const timeout = window.setTimeout(() => {
      setProductHuntAttempt((a) => a + 1);
      setProductHuntTs(Date.now());
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [productHuntLoaded, productHuntAttempt]);
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
      {/* Top-right GitHub star badge for homepage */}
      <div className="pointer-events-auto fixed right-4 top-4 z-40 hidden sm:block">
        <GitHubStarBadge repoFullName="NiladriHazra/WhatToBuild" />
      </div>
      {/* Mobile placement: floating bottom-right to avoid header overlap */}
      <div className="sm:hidden fixed right-3 bottom-3 z-40">
        <GitHubStarBadge repoFullName="NiladriHazra/WhatToBuild" compact />
      </div>
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-8">
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
          {/* Badges: Peerlist + Product Hunt, below description */}
          <div className="animate-appear opacity-0 delay-200 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 relative z-20">
            {/* Peerlist badge (styled) */}
            <a
              href="https://peerlist.io/bytehumi/project/what-to-build"
              target="_blank"
              rel="noreferrer"
              aria-label="What to Build on Peerlist"
              className="block cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <div className="w-[250px] h-14 rounded-2xl bg-gray-900/40 backdrop-blur-md overflow-hidden">
                <img
                  src={`/api/badges/peerlist?cb=${peerlistCB}-${peerlistTs}-${peerlistAttempt}`}
                  alt="What to build"
                  width={250}
                  height={56}
                  style={{ width: "100%", height: "100%", objectFit: "cover", clipPath: "inset(1px round 12px)" }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => {
                    if (peerlistAttempt < 1) {
                      setPeerlistAttempt((a) => a + 1);
                      setPeerlistTs(Date.now());
                    } else {
                      setPeerlistLoaded(true);
                    }
                  }}
                />
              </div>
            </a>

            {/* Product Hunt badge (styled) */}
            <a
              href="https://www.producthunt.com/products/what-to-build-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-what&#0045;to&#0045;build&#0045;2"
              target="_blank"
              rel="noreferrer"
              aria-label="What To Build – Featured on Product Hunt"
              className="block cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <div className="w-[250px] h-14 rounded-2xl bg-gray-900/40 backdrop-blur-md overflow-hidden">
                <img
                  src={`/api/badges/producthunt?t=${peerlistCB}-${productHuntTs}-${productHuntAttempt}`}
                  alt="What To Build - Concept to discover & analyze relevant open-source projects | Product Hunt"
                  width={250}
                  height={56}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => {
                    if (productHuntAttempt < 1) {
                      setProductHuntAttempt((a) => a + 1);
                      setProductHuntTs(Date.now());
                    } else {
                      setProductHuntLoaded(true);
                    }
                  }}
                />
              </div>
            </a>
          </div>
          {mockup !== false && (
            <div className="relative w-full pt-6 pb-6">
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

      {deferHeavy && <Testimonials />}
      
      {deferHeavy && <Section2Lazy />}

     

      {/* <RollingText /> */}

     
      
       {deferHeavy && <FooterLazy />}
    </Section>
  );
}
