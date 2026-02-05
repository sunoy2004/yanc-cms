 import { cn } from '@/lib/utils';
 import { LucideIcon } from 'lucide-react';
 
 interface StatCardProps {
   title: string;
   value: string | number;
   description?: string;
   icon: LucideIcon;
   trend?: {
     value: number;
     isPositive: boolean;
   };
   className?: string;
 }
 
 export function StatCard({
   title,
   value,
   description,
   icon: Icon,
   trend,
   className,
 }: StatCardProps) {
   return (
     <div className={cn('cms-stat-card hover-lift', className)}>
       <div className="flex items-start justify-between">
         <div className="cms-icon-container cms-icon-container-md cms-icon-primary rounded-xl">
           <Icon className="h-5 w-5" />
         </div>
         {trend && (
           <span
             className={cn(
               'cms-badge',
               trend.isPositive ? 'cms-badge-success' : 'cms-badge-destructive'
             )}
           >
             {trend.isPositive ? '+' : ''}{trend.value}%
           </span>
         )}
       </div>
       <div className="mt-4 relative z-10">
         <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
         <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
         {description && (
           <p className="mt-1.5 text-xs text-muted-foreground/80">{description}</p>
         )}
       </div>
     </div>
   );
 }