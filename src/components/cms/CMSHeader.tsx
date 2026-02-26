import { useEffect, useState } from 'react';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLink } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface CMSHeaderProps {
  sidebarCollapsed?: boolean;
}

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'activity' | 'system';
};

export function CMSHeader({ sidebarCollapsed = false }: CMSHeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    // Fetch recent activity notifications
    const fetchActivity = async () => {
      try {
        const base = (import.meta.env.VITE_CMS_BASE_URL as string) || '';
        const res = await fetch(`${base}/api/activity?limit=5`);
        if (!res.ok) return;
        const data = await res.json();
        const items: NotificationItem[] = (data || []).map((act: any) => ({
          id: `activity-${act.contentType}-${act.id}-${act.timestamp}`,
          title: `${act.action?.toUpperCase?.() || 'UPDATE'} ${act.contentType}`,
          description: act.contentTitle || '',
          timestamp: act.timestamp,
          type: 'activity',
        }));
        setNotifications((prev) => {
          // Preserve any system notifications (like login) and merge new activity
          const system = prev.filter((n) => n.type === 'system');
          return [...system, ...items];
        });
      } catch {
        // ignore errors, keep existing notifications
      }
    };

    fetchActivity();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loginNotification: NotificationItem = {
      id: 'system-login',
      title: 'Logged in',
      description: `Welcome back${user?.name ? `, ${user.name}` : ''}.`,
      timestamp: new Date().toISOString(),
      type: 'system',
    };
    setNotifications((prev) => {
      // Avoid duplicate login notification
      const filtered = prev.filter((n) => n.id !== loginNotification.id);
      return [loginNotification, ...filtered];
    });
  }, [isAuthenticated, user?.name]);
 
   return (
     <header
       className={cn(
         'fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6 transition-all duration-300',
         sidebarCollapsed ? 'left-16' : 'left-64'
       )}
     >
       {/* Search */}
       <div className="flex items-center gap-4">
         <div className="relative">
           <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Search content..."
             className="w-72 pl-11 h-10 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
           />
         </div>
       </div>
 
      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted/60 transition-colors">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-lg border-border/60">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem className="text-xs text-muted-foreground">
                No recent notifications
              </DropdownMenuItem>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5">
                  <span className="text-xs font-medium">{n.title}</span>
                  {n.description && (
                    <span className="text-[11px] text-muted-foreground">{n.description}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground/70">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
 
         {/* User Menu */}
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" className="flex items-center gap-2.5 px-2.5 rounded-xl hover:bg-muted/60 transition-colors">
               <Avatar className="h-9 w-9 ring-2 ring-border/50">
                 <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                   {user ? getInitials(user.name) : 'U'}
                 </AvatarFallback>
               </Avatar>
               <div className="hidden text-left md:block">
                 <p className="text-sm font-medium leading-tight">{user?.name}</p>
                 <p className="text-xs text-muted-foreground capitalize leading-tight">{user?.role}</p>
               </div>
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/60">
             <DropdownMenuLabel>My Account</DropdownMenuLabel>
             <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors">
                <User className="mr-2 h-4 w-4" />
                Profile
              </NavLink>
            </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={logout} className="text-destructive rounded-lg cursor-pointer focus:text-destructive">
               <LogOut className="mr-2 h-4 w-4" />
               Log out
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
     </header>
   );
 }