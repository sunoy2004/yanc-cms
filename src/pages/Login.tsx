 import { useState } from 'react';
 import { Navigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Loader2, Lock, Mail } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
 
 export default function Login() {
   const { login, isAuthenticated, isLoading: authLoading } = useAuth();
   const { toast } = useToast();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);
 
   if (authLoading) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (isAuthenticated) {
     return <Navigate to="/dashboard" replace />;
   }
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
 
     try {
       await login(email, password);
       toast({
         title: 'Welcome back!',
         description: 'You have successfully logged in.',
       });
     } catch (error) {
       toast({
         title: 'Login failed',
         description: 'Invalid email or password. Please try again.',
         variant: 'destructive',
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <div className="flex min-h-screen">
       {/* Left side - Branding */}
       <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary to-primary/90 lg:flex lg:flex-col lg:justify-between lg:p-12 relative overflow-hidden">
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
         
         <div className="flex items-center gap-3 relative z-10">
           <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-lg">
             <span className="text-lg font-bold text-accent-foreground">Y</span>
           </div>
           <span className="text-xl font-semibold text-primary-foreground tracking-tight">YANC CMS</span>
         </div>
         <div className="relative z-10">
           <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
             Content Management
             <br />
             Made Simple
           </h1>
           <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed max-w-md">
             Manage your website content with an intuitive, powerful dashboard.
             Create, edit, and publish with ease.
           </p>
           <div className="mt-8 flex gap-6">
             <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
               <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
               Real-time updates
             </div>
             <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
               <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
               Media library
             </div>
           </div>
         </div>
         <p className="text-sm text-primary-foreground/60 relative z-10">
           © {new Date().getFullYear()} YANC. All rights reserved.
         </p>
       </div>
 
       {/* Right side - Login Form */}
       <div className="flex w-full items-center justify-center p-8 lg:w-1/2 bg-background">
         <div className="w-full max-w-md animate-fade-in">
           <div className="mb-10 lg:hidden">
             <div className="flex items-center gap-3">
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-md">
                 <span className="text-lg font-bold text-primary-foreground">Y</span>
               </div>
               <span className="text-xl font-semibold tracking-tight">YANC CMS</span>
             </div>
           </div>
 
           <div className="mb-10">
             <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h2>
             <p className="mt-3 text-muted-foreground">
               Enter your credentials to access the admin dashboard.
             </p>
           </div>
 
           <form onSubmit={handleSubmit} className="space-y-7">
             <div className="space-y-2.5">
               <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input
                   id="email"
                   type="email"
                   placeholder="admin@yanc.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="pl-11 h-11 rounded-xl border-border/80 focus:border-accent transition-colors"
                   required
                 />
               </div>
             </div>
 
             <div className="space-y-2.5">
               <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input
                   id="password"
                   type="password"
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="pl-11 h-11 rounded-xl border-border/80 focus:border-accent transition-colors"
                   required
                 />
               </div>
             </div>
 
             <Button 
               type="submit" 
               className="w-full h-11 rounded-xl font-medium text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]" 
               disabled={isLoading}
             >
               {isLoading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Signing in...
                 </>
               ) : (
                 'Sign in'
               )}
             </Button>
           </form>
 
           <div className="mt-10 rounded-xl border border-border/60 bg-muted/30 p-5">
             <p className="text-sm font-semibold text-foreground">Demo Credentials</p>
             <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
               Email: admin@yanc.com
               <br />
               Password: admin123
             </p>
           </div>
         </div>
       </div>
     </div>
   );
 }