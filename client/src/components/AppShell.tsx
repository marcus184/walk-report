import type { ReactNode } from 'react';
import { User, Command, Menu } from 'lucide-react';
import { useState } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="h-full flex flex-col bg-wac-bg">
      <header className="flex-shrink-0 h-14 md:h-16 border-b border-wac-border bg-wac-surface/50 backdrop-blur-sm">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/wac-logo.png" 
              alt="WAC Logo" 
              className="h-8 md:h-10 w-auto object-contain"
            />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full bg-wac-surface border border-wac-border">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-wac-textMuted hidden md:inline">Connected to WAC-01</span>
              <span className="text-xs text-wac-accent">Live</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative flex-1">
                <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wac-textDim" />
                <input
                  type="text"
                  placeholder="Ask WAC..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm input-field"
                />
              </div>
            </div>
            
            <button className="btn-icon min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
