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
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black">
      {/* Subtle Background Animations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute top-8 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-12 right-1/3 w-1 h-1 bg-cyan-400/40 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-8 right-1/4 w-2 h-2 bg-blue-400/20 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '2s'}}></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/3 via-transparent to-cyan-900/3"></div>
      </div>

      {/* Center glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-radial from-blue-600/5 via-blue-600/2 to-transparent rounded-full blur-3xl opacity-60"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 xl:gap-32 items-center">
          {/* Text Section */}
          <div className="relative flex flex-col justify-center h-full">
            <div className="space-y-6">
              <div>
                <h3 className="-tracking-4 pt-0.5 font-sans text-3xl/[2.25rem] font-bold text-balance text-white mb-4">
                  What to Build?
                </h3>
                
                <p className="font-sans text-lg/[1.5rem] text-white/70 mb-6 max-w-md">
                  Discover, analyze, and build amazing projects with AI-powered insights
                </p>
              </div>
              
              {/* Social Links with subtle enhancements */}
              <div className="flex gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group w-fit rounded-lg border border-white/20 bg-white/5 p-2.5 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-110 ${link.color}`}
                    title={link.name}
                  >
                    <div className="relative">
                      {/* Subtle glow on hover */}
                      <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-20 rounded blur-sm transition-opacity duration-300"></div>
                      <div className="relative">
                        {link.icon}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Profile Section */}
          <div className="text-center md:text-right">
            <div className="relative group rounded-2xl border border-white/10 p-2 transition-all duration-300 hover:border-white/20 md:rounded-3xl md:p-3">
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-yellow-400/10 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              <div className="relative flex flex-col md:flex-row items-center gap-6 overflow-hidden rounded-xl bg-black/40 backdrop-blur-sm p-6 border border-white/5 md:p-8">
                {/* Profile Image */}
                <div className="relative flex-shrink-0 order-2 md:order-1">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-white/20 bg-white/5 p-1 backdrop-blur-sm overflow-hidden transition-transform duration-300 hover:scale-105">
                    <img 
                      src="https://github.com/NiladriHazra.png" 
                      alt="Niladri Hazra"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="flex-grow text-center md:text-right order-1 md:order-2">
                  <h3 className="-tracking-4 pt-0.5 font-sans text-2xl/[1.875rem] font-semibold text-balance text-white mb-2">
                    Created by Niladri Hazra
                  </h3>
                  <p className="font-sans text-base/[1.375rem] text-white/70">
                    Software Engineer & Full Stack Developer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="font-sans text-sm text-white/50">
            © {new Date().getFullYear()} What to Build. Built with ❤️ by Niladri Hazra
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </footer>
  );
};

export default Footer;