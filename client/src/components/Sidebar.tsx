import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  Mic, 
  TrendingUp, 
  FileText, 
  PlusCircle, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard", active: location === "/dashboard" },
    { href: "/ssdc-transcripts", icon: Mic, label: "SSDC Transcripts", active: location === "/ssdc-transcripts" },
    { href: "/market-survey", icon: TrendingUp, label: "Market Survey", active: location === "/market-survey" },
    { href: "/business-forms", icon: FileText, label: "Business Forms", active: location === "/business-forms" },
    { href: "/create-form", icon: PlusCircle, label: "Create Form", active: location === "/create-form" },
  ];

  const adminItems = user?.isAdmin ? [
    { href: "/admin", icon: Settings, label: "Admin Panel", active: location === "/admin" },
  ] : [];

  const handleItemClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card dark:bg-card border-r border-border sidebar-shadow sidebar-transition z-40",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a 
                  className={cn(
                    "nav-link",
                    item.active ? "nav-link-active" : "nav-link-inactive"
                  )}
                  onClick={handleItemClick}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
            
            {adminItems.length > 0 && (
              <>
                <div className="pt-4 mt-6 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Admin
                  </p>
                  {adminItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a 
                        className={cn(
                          "nav-link",
                          item.active ? "nav-link-active" : "nav-link-inactive"
                        )}
                        onClick={handleItemClick}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
