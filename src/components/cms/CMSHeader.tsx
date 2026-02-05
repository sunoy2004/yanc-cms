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
 import { Avatar, AvatarFallback } from '@/components/ui/avatar';
 import { useAuth } from '@/contexts/AuthContext';
 import { cn } from '@/lib/utils';
 
 interface CMSHeaderProps {
   sidebarCollapsed?: boolean;
 }
 
 export function CMSHeader({ sidebarCollapsed = false }: CMSHeaderProps) {
   const { user, logout } = useAuth();
 
   const getInitials = (name: string) => {
     return name
       .split(' ')
       .map((n) => n[0])
       .join('')
       .toUpperCase()
       .slice(0, 2);
   };
 
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
         <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted/60 transition-colors">
           <Bell className="h-5 w-5" />
           <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
         </Button>
 
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
             <DropdownMenuItem className="rounded-lg cursor-pointer">
               <User className="mr-2 h-4 w-4" />
               Profile
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