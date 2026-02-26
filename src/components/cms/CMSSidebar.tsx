 import { useState } from 'react';
 import { NavLink, useLocation } from 'react-router-dom';
 import { cn } from '@/lib/utils';
 import {
   LayoutDashboard,
   Calendar,
   GraduationCap,
   Users,
   FileText,
   FolderOpen,
   Settings,
   ChevronDown,
   Sparkles,
   MessageSquareQuote,
   Phone,
   UserCog,
   Award,
   Globe,
   Mic,
   CalendarCheck,
   Images,
   Menu,
   X,
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
 } from '@/components/ui/collapsible';
 
 interface NavItem {
   title: string;
   href?: string;
   icon: React.ElementType;
   children?: NavItem[];
 }
 
 const navItems: NavItem[] = [
   { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Profile', href: '/profile', icon: UserCog },
   { title: 'Hero Content', href: '/hero', icon: Sparkles },
   {
     title: 'Events',
     icon: Calendar,
     children: [
       { title: 'Upcoming Events', href: '/events', icon: Calendar },
       { title: 'Past Events', href: '/events/past', icon: CalendarCheck },
       { title: 'Event Gallery', href: '/events/gallery', icon: Images },
     ],
   },
   { title: 'Programs', href: '/programs', icon: GraduationCap },
   { title: 'Mentor Talks', href: '/mentor-talks', icon: Mic },
   {
     title: 'Team Management',
     icon: Users,
     children: [
       { title: 'Executive Management', href: '/team/executive', icon: UserCog },
       { title: 'Cohort Founders', href: '/team/cohort-founders', icon: Users },
       { title: 'Advisory Board', href: '/team/advisory', icon: Award },
       { title: 'Global Mentors', href: '/team/mentors', icon: Globe },
     ],
   },
   {
     title: 'Content Sections',
     icon: FileText,
     children: [
       { title: 'About Us Management', href: '/content/about', icon: FileText },
       { title: 'Testimonials', href: '/content/testimonials', icon: MessageSquareQuote },
       { title: 'Contact Info', href: '/content/contact', icon: Phone },
     ],
   },
   { title: 'Media Library', href: '/media', icon: FolderOpen },
   { title: 'Settings', href: '/settings', icon: Settings },
 ];
 
 interface CMSSidebarProps {
   isCollapsed?: boolean;
   onToggle?: () => void;
 }
 
 export function CMSSidebar({ isCollapsed = false, onToggle }: CMSSidebarProps) {
   const location = useLocation();
   const [openSections, setOpenSections] = useState<string[]>(['Events', 'Team Management', 'Content Sections']);
 
   const toggleSection = (title: string) => {
     setOpenSections(prev =>
       prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
     );
   };
 
   const isActive = (href: string) => location.pathname === href;
   const isSectionActive = (children?: NavItem[]) =>
     children?.some(child => child.href && location.pathname === child.href);
 
   return (
     <aside
       className={cn(
         'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 shadow-xl',
         'max-h-screen overflow-hidden',
         isCollapsed ? 'w-16' : 'w-64'
       )}
     >
       {/* Logo Area */}
       <div className="flex h-16 items-center justify-between border-b border-sidebar-border/50 px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black shadow-lg overflow-hidden">
              <img
                src="/favicon.svg"
                alt="YANC logo"
                className="h-7 w-7"
              />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">YANC CMS</span>
          </div>
        )}
         <Button
           variant="ghost"
           size="icon"
           onClick={onToggle}
           className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition-all duration-200 active:scale-95"
         >
           {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
         </Button>
       </div>
 
       {/* Navigation */}
       <nav className="flex-1 overflow-y-auto p-3 pb-6 sidebar-constrained scrollbar-thin touch-pan-y">
         <ul className="space-y-1.5">
           {navItems.map((item) => (
             <li key={item.title}>
               {item.children ? (
                 <Collapsible
                   open={!isCollapsed && openSections.includes(item.title)}
                   onOpenChange={() => !isCollapsed && toggleSection(item.title)}
                 >
                   <CollapsibleTrigger asChild>
                     <button
                       className={cn(
                         'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                         'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                         isSectionActive(item.children) && 'bg-sidebar-accent text-sidebar-primary'
                       )}
                     >
                       <item.icon className="h-5 w-5 flex-shrink-0" />
                       {!isCollapsed && (
                         <>
                           <span className="flex-1 text-left">{item.title}</span>
                           <ChevronDown 
                             className={cn(
                               "h-4 w-4 transition-transform duration-200",
                               openSections.includes(item.title) ? "rotate-0" : "-rotate-90"
                             )} 
                           />
                         </>
                       )}
                     </button>
                   </CollapsibleTrigger>
                   <CollapsibleContent className="animate-accordion-down overflow-hidden">
                     <ul className="mt-1.5 space-y-1 pl-4 border-l border-sidebar-border/30 ml-5">
                       {item.children.map((child) => (
                         <li key={child.title}>
                           <NavLink
                             to={child.href!}
                             className={cn(
                               'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200',
                               'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                               isActive(child.href!) && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                             )}
                           >
                             <child.icon className="h-4 w-4 flex-shrink-0" />
                             {!isCollapsed && <span>{child.title}</span>}
                           </NavLink>
                         </li>
                       ))}
                     </ul>
                   </CollapsibleContent>
                 </Collapsible>
               ) : (
                 <NavLink
                   to={item.href!}
                   className={cn(
                     'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                     'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                     isActive(item.href!) && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                   )}
                 >
                   <item.icon className="h-5 w-5 flex-shrink-0" />
                   {!isCollapsed && <span>{item.title}</span>}
                 </NavLink>
               )}
             </li>
           ))}
         </ul>
       </nav>
     </aside>
   );
 }