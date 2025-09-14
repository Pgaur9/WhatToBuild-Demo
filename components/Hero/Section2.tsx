/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { 
  FaRocket, FaSearch, FaChartLine, FaGithub, FaCode, FaStar, 
  FaUsers, FaBrain, FaEye, FaFilter, FaLightbulb, FaBalanceScale,
  FaPlay, FaArrowRight, FaExternalLinkAlt
} from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';


const Section2 = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main feature cards showcasing your website's capabilities
  const mainFeatures = [
    {
      id: 'analyze',
      title: "Deep Code Analysis",
      description: "Get comprehensive insights into repository structure, dependencies, and code quality metrics.",
      icon: <FaChartLine className="h-6 w-6" />,
      href: "/analyze",
      demo: "Analyze any GitHub repository in seconds",
      features: [
        { icon: <FaCode />, text: "File Structure" },
        { icon: <FaChartLine />, text: "Metrics & Stats" },
        { icon: <FaUsers />, text: "Contributor Insights" },
        { icon: <FaEye />, text: "Visual Diagrams" }
      ],
      gradient: "from-purple-600/20 via-pink-500/20 to-purple-600/20"
    },
    {
      id: 'readme',
      title: "README Generator",
      description: "Generate high-quality README files with AI-powered analysis and live preview editing.",
      icon: <FaCode className="h-6 w-6" />,
      href: "/readme",
      demo: "Generate README for any repository",
      features: [
        { icon: <FaBrain />, text: "AI-Powered" },
        { icon: <FaEye />, text: "Live Preview" },
        { icon: <FaGithub />, text: "PR Creation" },
        { icon: <FaRocket />, text: "Instant Draft" }
      ],
      gradient: "from-green-600/20 via-teal-500/20 to-green-600/20"
    },
    {
      id: 'visualize',
      title: "Architecture Visualization",
      description: "Interactive flow diagrams and dependency graphs for better project understanding.",
      icon: <FaEye className="h-6 w-6" />,
      href: "/visualize",
      demo: "Visualize repository architecture",
      features: [
        { icon: <FaEye />, text: "Flow Diagrams" },
        { icon: <FaChartLine />, text: "Dependencies" },
        { icon: <FaCode />, text: "Structure Maps" },
        { icon: <FaRocket />, text: "Interactive" }
      ],
      gradient: "from-blue-600/20 via-cyan-500/20 to-blue-600/20"
    }
  ];

  // Secondary feature cards for additional capabilities
  const secondaryFeatures = [
    {
      title: "Technology Stack Detection",
      description: "Automatic identification of frameworks, libraries, and development tools used.",
      icon: <FaCode className="h-5 w-5" />,
      badge: "Smart"
    },
    {
      title: "Dependency Mapping",
      description: "Visualize project dependencies and relationships for better understanding.",
      icon: <FaEye className="h-5 w-5" />,
      badge: "Visual"
    },
    {
      title: "File Content Summarization",
      description: "AI-powered summaries of key source files and project structure.",
      icon: <FaBrain className="h-5 w-5" />,
      badge: "AI-Powered"
    },
    {
      title: "Contributor Insights",
      description: "Analyze team composition, contribution patterns, and development activity.",
      icon: <FaUsers className="h-5 w-5" />,
      badge: "Analytics"
    }
  ];

  const floatingElements = [
    { icon: <FaGithub />, x: '10%', y: '15%', delay: '0s', duration: '8s' },
    { icon: <FaCode />, x: '90%', y: '20%', delay: '1s', duration: '6s' },
    { icon: <FaStar />, x: '15%', y: '80%', delay: '2s', duration: '7s' },
    { icon: <FaRocket />, x: '85%', y: '75%', delay: '1.5s', duration: '9s' },
    { icon: <FaBrain />, x: '50%', y: '10%', delay: '0.5s', duration: '5s' },
    { icon: <FaUsers />, x: '5%', y: '50%', delay: '2.5s', duration: '6.5s' }
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-10 md:pt-10 md:pb-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center">
          <CardSpotlight
            className="h-auto w-full max-w-2xl mx-auto group"
            radius={500}
            color="#1e40af"
          >
            <div className="relative z-10 text-center py-6 md:py-7">
             
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Build Something Amazing?
              </h3>
              <p className="text-white/70 mb-6 md:mb-7 text-lg">
                Start exploring repositories, analyzing code, and discovering your next great project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/search">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    <FaSearch className="mr-2 h-5 w-5" />
                    Start Searching
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8">
                    <FaBalanceScale className="mr-2 h-5 w-5" />
                    Compare Developers
                  </Button>
                </Link>
              </div>
            </div>
          </CardSpotlight>
        </div>
      </div>

      {/* Background removed intentionally for a clean, transparent section */}
    </section>
  );
};

export default Section2;