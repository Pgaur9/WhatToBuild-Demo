"use client";

import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaCoffee } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/NiladriHazra',
      icon: <FaGithub className="h-5 w-5" />,
      color: 'text-white hover:text-gray-300'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/niladri-hazra-b573282a7/',
      icon: <FaLinkedin className="h-5 w-5" />,
      color: 'text-blue-400 hover:text-blue-300'
    },
    {
      name: 'Twitter',
      url: 'https://x.com/byteHumi',
      icon: <FaTwitter className="h-5 w-5" />,
      color: 'text-cyan-400 hover:text-cyan-300'
    },
    {
      name: 'Buy Me a Coffee',
      url: 'https://buymeacoffee.com/niladri',
      icon: <FaCoffee className="h-5 w-5" />,
      color: 'text-yellow-400 hover:text-yellow-300'
    }
  ];

  return (
    <footer className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black">
      {/* Enhanced Background Animations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse opacity-30"></div>
        
        {/* Floating particles with staggered animations */}
        <div className="absolute top-8 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-float"></div>
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-cyan-400/50 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-12 right-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-white/30 rounded-full animate-twinkle"></div>
        <div className="absolute top-1/3 right-1/6 w-1.5 h-1.5 bg-cyan-300/20 rounded-full animate-twinkle-delayed"></div>
        
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-cyan-900/5"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-950/10 to-transparent"></div>
      </div>

      {/* Multiple layered glow effects */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-blue-600/8 via-blue-600/3 to-transparent rounded-full blur-3xl opacity-70 animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-cyan-500/6 via-cyan-500/2 to-transparent rounded-full blur-2xl opacity-50"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Text Section with improved typography */}
          <div className="relative flex flex-col justify-center h-full space-y-8">
            <div className="space-y-8">
              <div className="relative">
                {/* Subtle text glow */}
                <div className="absolute inset-0 blur-lg">
                  <h3 className="font-sans text-4xl font-bold text-white/20">
                    What to Build?
                  </h3>
                </div>
                <h3 className="relative -tracking-wide font-sans text-4xl font-bold text-white mb-6 leading-tight">
                  What to Build?
                </h3>
                
                <p className="font-sans text-xl text-white/80 leading-relaxed max-w-lg">
                  Discover, analyze, and build amazing projects with detailed insights
                </p>
              </div>
              
              {/* Enhanced Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative w-fit rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur-md transition-all duration-500 hover:border-white/30 hover:bg-white/10 hover:scale-110 hover:-translate-y-1 ${link.color}`}
                    title={link.name}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Enhanced glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-current/0 via-current/20 to-current/0 opacity-0 group-hover:opacity-100 rounded-xl blur-md transition-all duration-500 transform group-hover:scale-150"></div>
                    <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 rounded-xl transition-all duration-300"></div>
                    
                    <div className="relative transform transition-transform duration-300 group-hover:rotate-6">
                      {link.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Enhanced Profile Section */}
          <div className="text-center lg:text-right">
            <div className="relative group rounded-3xl border border-white/10 p-3 transition-all duration-700 hover:border-white/25 hover:shadow-2xl hover:shadow-blue-500/10">
              {/* Multi-layer hover effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-yellow-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative flex flex-col lg:flex-row items-center gap-8 overflow-hidden rounded-2xl bg-black/60 backdrop-blur-md p-8 border border-white/8 transition-all duration-500 group-hover:bg-black/40">
                {/* Enhanced Profile Image */}
                <div className="relative flex-shrink-0 order-2 lg:order-1">
                  <div className="relative w-24 h-24 lg:w-28 lg:h-28">
                    {/* Animated border */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/50 via-cyan-400/50 to-yellow-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow blur-sm"></div>
                    
                    <div className="relative w-full h-full rounded-2xl border border-white/25 bg-white/10 p-1.5 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:scale-105 group-hover:border-white/40">
                      <img 
                        src="https://github.com/NiladriHazra.png" 
                        alt="Niladri Hazra"
                        className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl"></div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Profile Info */}
                <div className="flex-grow text-center lg:text-right order-1 lg:order-2 space-y-3">
                  <h3 className="relative font-sans text-2xl lg:text-3xl font-semibold text-white leading-tight transition-all duration-300 group-hover:text-white/95">
                    <span className="relative z-10">Created by Niladri</span>
                    <div className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                      <span className="text-blue-300">Created by Niladri </span>
                    </div>
                  </h3>
                  <p className="font-sans text-lg text-white/75 transition-colors duration-300 group-hover:text-white/85">
                    Software Engineer & Full Stack Developer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Copyright with separator */}
        <div className="mt-16">
          {/* Elegant separator */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-black px-4">
                <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="font-sans text-sm text-white/60 transition-colors duration-300 hover:text-white/80">
              © {new Date().getFullYear()} What to Build. Built with ❤️ by Niladri Hazra
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-8px) translateX(-3px); }
          50% { transform: translateY(-12px) translateX(4px); }
          75% { transform: translateY(-6px) translateX(-2px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(8px); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(15px) translateX(-6px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes twinkle-delayed {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite 2s;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite 1s;
        }
        
        .animate-float-reverse {
          animation: float-reverse 7s ease-in-out infinite 3s;
        }
        
        .animate-twinkle {
          animation: twinkle 4s ease-in-out infinite;
        }
        
        .animate-twinkle-delayed {
          animation: twinkle-delayed 5s ease-in-out infinite 1.5s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;