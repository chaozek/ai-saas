"use client"

import { ChevronDown } from "lucide-react";

export const ScrollIndicator = () => {
  const scrollToNextSection = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute bottom-8 right-8 animate-bounce">
      <div
        onClick={scrollToNextSection}
        className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
      >
        <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
        <div className="relative">
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
            <div className="w-1 h-3 bg-current rounded-full mt-2 animate-pulse"></div>
          </div>
          <ChevronDown className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 animate-bounce" />
        </div>
      </div>
    </div>
  );
};