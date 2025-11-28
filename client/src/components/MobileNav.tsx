import { Images, FileText, FolderOpen } from 'lucide-react';

export type MobileTab = 'data' | 'builder' | 'reports';

interface MobileNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  reportPagesCount: number;
  pdfsCount: number;
}

export function MobileNav({ activeTab, onTabChange, reportPagesCount, pdfsCount }: MobileNavProps) {
  const tabs = [
    { id: 'data' as MobileTab, label: 'Walk Data', icon: Images, badge: null },
    { id: 'builder' as MobileTab, label: 'Builder', icon: FileText, badge: reportPagesCount > 0 ? reportPagesCount : null },
    { id: 'reports' as MobileTab, label: 'Reports', icon: FolderOpen, badge: pdfsCount > 0 ? pdfsCount : null },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-wac-surface border-t border-wac-border safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors relative ${
                isActive 
                  ? 'text-wac-accent' 
                  : 'text-wac-textMuted'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-wac-accent text-wac-bg rounded-full px-1">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-wac-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
