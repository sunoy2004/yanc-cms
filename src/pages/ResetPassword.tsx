import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please enter the same password in both fields.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Use at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (!token) {
      toast({
        title: 'Invalid link',
        description: 'This reset link is missing a token. Request a new one from the login page.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(authApi('/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: 'Reset failed',
          description: data?.message || data?.error || 'Link may be expired. Request a new one.',
          variant: 'destructive',
        });
        return;
      }
      setSuccess(true);
      toast({
        title: 'Password reset',
        description: data?.message || 'You can now sign in with your new password.',
      });
    } catch {
      toast({
        title: 'Request failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid reset link</h1>
          <p className="text-muted-foreground">
            This link is missing a token. Use the “Forgot password?” link on the login page to get a new one.
          </p>
          <Button asChild>
            <Link to="/forgot-password">Get reset link</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Password updated</h1>
          <p className="text-muted-foreground">You can now sign in with your new password.</p>
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary to-primary/90 lg:flex lg:flex-col lg:justify-between lg:p-12 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-lg">
            <span className="text-lg font-bold text-accent-foreground">Y</span>
          </div>
          <span className="text-xl font-semibold text-primary-foreground tracking-tight">YANC CMS</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">Set new password</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-md">
            Choose a strong password that you don’t use elsewhere.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60 relative z-10">© {new Date().getFullYear()} YANC.</p>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 bg-background">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <h2 className="text-3xl font-bold text-foreground tracking-tight">New password</h2>
          <p className="mt-3 text-muted-foreground">Enter your new password below (at least 8 characters).</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-11 h-11 rounded-xl"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 h-11 rounded-xl"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
