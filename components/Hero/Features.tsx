/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  FaPlay, FaChevronRight, FaRocket, FaCode,
  FaEye, FaSearch, FaUsers
} from 'react-icons/fa';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Glow from "@/components/ui/glow";
import { GoodText1 } from './GoodText';

const Features = ({ forceDarkMode = true }) => {
  const [activeFeature, setActiveFeature] = useState('idea-to-repo');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const premiumFeatures = [
    {
      id: 'idea-to-repo',
      title: "Your Random Idea to GitHub Repo",
      description: "Transform your creative ideas into structured GitHub repositories with AI-powered project scaffolding",
      icon: <FaRocket />,
      videoSrc: "https://res.cloudinary.com/duy8dp4tq/video/upload/v1754477364/qvsrnneoe154uunnsy1i.mp4",
      posterSrc: "https://www.solidbackgrounds.com/images/1280x720/1280x720-black-solid-color-background.jpg"
    },
    {
      id: 'analyze-repo',
      title: "Analyze GitHub Repository",
      description: "Deep dive into repository structure, analyze code quality, dependencies, and get comprehensive insights",
      icon: <FaCode />,
      videoSrc: "https://res.cloudinary.com/duy8dp4tq/video/upload/v1751725107/nactlyoprqxqpqko9fej.mp4",
      posterSrc: "https://www.solidbackgrounds.com/images/1280x720/1280x720-black-solid-color-background.jpg"
    },
    {
      id: 'visualize-repo',
      title: "Visualize GitHub Repository",
      description: "Generate interactive flow diagrams and visual representations of repository architecture",
      icon: <FaEye />,
      videoSrc: "https://res.cloudinary.com/duy8dp4tq/video/upload/v1751725107/nactlyoprqxqpqko9fej.mp4",
      posterSrc: "https://www.solidbackgrounds.com/images/1280x720/1280x720-black-solid-color-background.jpg"
    },
    {
      id: 'find-repos',
      title: "Find Best Open Source Repos to Contribute",
      description: "Discover good first issues, bounty issues, and major contributions across different programming languages",
      icon: <FaSearch />,
      videoSrc: "https://res.cloudinary.com/duy8dp4tq/video/upload/v1751725107/nactlyoprqxqpqko9fej.mp4",
      posterSrc: "https://www.solidbackgrounds.com/images/1280x720/1280x720-black-solid-color-background.jpg"
    },
    {
      id: 'compare-devs',
      title: "Compare GitHub Devs and See Who Wins",
      description: "Compare GitHub profiles, analyze contribution patterns, and visualize developer statistics side by side",
      icon: <FaUsers />,
      videoSrc: "https://res.cloudinary.com/duy8dp4tq/video/upload/v1751725107/nactlyoprqxqpqko9fej.mp4",
      posterSrc: "https://www.solidbackgrounds.com/images/1280x720/1280x720-black-solid-color-background.jpg"
    }
  ];

  const handleFeatureClick = (id: string) => {
    setActiveFeature(id);
    setVideoLoaded(false);
  };

  const activeFeatureData = premiumFeatures.find(f => f.id === activeFeature);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Glow Effect */}
      <Glow variant="center" className="opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white transform-gpu">
                EXPLORE{' '}
                <span className="inline-block align-middle"><GoodText1 /></span>
              </h2>
            </div>
          </div>
          <p className="max-w-3xl mx-auto text-lg text-white/70 leading-relaxed">
            Discover powerful tools to transform your GitHub workflow and unlock your development potential
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Feature List */}
          <div className="flex flex-col gap-4">
            {premiumFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className={`group relative cursor-pointer transition-all duration-300 rounded-2xl md:rounded-3xl overflow-hidden ${
                  activeFeature === feature.id 
                    ? 'scale-105 z-20 border-blue-400/30 -translate-y-1 shadow-[0_0_16px_2px_rgba(80,180,255,0.18)] bg-black/60' 
                    : 'hover:scale-105 hover:border-white/20'
                }`}
                style={
                  activeFeature === feature.id
                    ? {
                        borderColor: 'rgba(80,180,255,0.30)',
                        background: 'rgba(10,20,40,0.85)',
                        transform: 'scale(1.05) translateY(-4px)'
                      }
                    : undefined
                }
                onClick={() => handleFeatureClick(feature.id)}
              >
                <div className="relative rounded-2xl border border-white/10 p-2 transition-all duration-300 hover:border-white/20 md:rounded-3xl md:p-3">
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
                    <div className="flex items-center">
                      <div className="w-fit rounded-lg border border-white/20 bg-white/5 p-2 backdrop-blur-sm mr-4">
                        <div className="h-4 w-4 text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-white">
                          {feature.title}
                        </h3>
                      </div>
                      <div className={`transition-all duration-300 transform ${
                        activeFeature === feature.id 
                          ? 'text-white translate-x-2' 
                          : 'text-white/50 group-hover:text-white/70 group-hover:translate-x-1'
                      }`}>
                        <FaChevronRight />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video Section */}
          <div className="col-span-2">
            <div 
              className="relative rounded-2xl border border-white/10 p-2 transition-all duration-300 hover:border-white/20 md:rounded-3xl md:p-3 group"
              style={{
                transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg)',
              }}
            >
              <GlowingEffect
                blur={0}
                borderWidth={2}
                spread={60}
                glow={true}
                disabled={false}
                proximity={48}
                inactiveZone={0.01}
              />
              <div className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
              <div className="relative aspect-video w-full">
                <video 
                  key={activeFeatureData?.videoSrc}
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={activeFeatureData?.posterSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoLoaded(true)}
                >
                  <source src={activeFeatureData?.videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                
              </div>

                <div className="p-6 bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-fit rounded-lg border border-white/20 bg-white/5 p-2 backdrop-blur-sm mr-3">
                      <div className="h-4 w-4 text-white">
                        {activeFeatureData?.icon}
                      </div>
                    </div>
                    <h3 className="-tracking-4 pt-0.5 font-sans text-2xl/[1.875rem] font-semibold text-balance text-white">{activeFeatureData?.title}</h3>
                  </div>
                  <p className="font-sans text-base/[1.375rem] text-white/70 leading-relaxed">{activeFeatureData?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        
      </div>
    </section>
  );
};

export default Features;