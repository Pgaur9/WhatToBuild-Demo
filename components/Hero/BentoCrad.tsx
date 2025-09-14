"use client";

import { Search, BarChart3, GitCompare, Code, Eye } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Link from "next/link";

export function BentoCrad() {
  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-6 xl:max-h-[24rem] xl:grid-rows-2">
        <GridItem
          area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
          icon={<BarChart3 className="h-4 w-4 text-green-400" />}
          title="Analyze Repository"
          description="Deep dive into repository structure, analyze code files, view issues, and understand project architecture."
          href="/analyze"
        />

        <GridItem
          area="md:[grid-area:1/7/2/13] xl:[grid-area:1/5/2/9]"
          icon={<Code className="h-4 w-4 text-blue-400" />}
          title="Generate README"
          description="Create high-quality README files with AI-powered analysis, live preview editing, and GitHub PR integration."
          href="/readme"
        />

        <GridItem
          area="md:[grid-area:2/1/3/13] xl:[grid-area:1/9/3/13]"
          icon={<Eye className="h-4 w-4 text-cyan-400" />}
          title="Visualize Repository"
          description="Generate interactive flow diagrams and visual representations of repository architecture and dependencies."
          href="/visualize"
        />
      </ul>
    </div>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  href: string;
}

const GridItem = ({ area, icon, title, description, href }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <Link href={href} className="block h-full">
        <div className="relative h-full rounded-2xl border border-white/10 p-2 transition-all duration-300 hover:border-white/20 hover:scale-[1.02] md:rounded-3xl md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={2}
            spread={60}
            glow={true}
            disabled={false}
            proximity={48}
            inactiveZone={0.01}
          />
          <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-black/40 backdrop-blur-sm p-6 border border-white/5 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
            <div className="relative flex flex-1 flex-col justify-between gap-3">
              <div className="w-fit rounded-lg border border-white/20 bg-white/5 p-2 backdrop-blur-sm">
                {icon}
              </div>
              <div className="space-y-3">
                <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-white md:text-2xl/[1.875rem]">
                  {title}
                </h3>
                <p className="font-sans text-sm/[1.125rem] text-white/70 md:text-base/[1.375rem]">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};
