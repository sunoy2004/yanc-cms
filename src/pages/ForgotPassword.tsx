import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSent(false);
    try {
      const res = await fetch(authApi('/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: 'Request failed',
          description: data?.message || 'Something went wrong. Try again.',
          variant: 'destructive',
        });
        return;
      }
      setSent(true);
      toast({
        title: 'Check your email',
        description: data?.message || 'If an account exists, you will receive a reset link shortly.',
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

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary to-primary/90 lg:flex lg:flex-col lg:justify-between lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-lg">
            <span className="text-lg font-bold text-accent-foreground">Y</span>
          </div>
          <span className="text-xl font-semibold text-primary-foreground tracking-tight">YANC CMS</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">Reset your password</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-md">
            Enter the email linked to your account and we’ll send you a link to set a new password.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60 relative z-10">© {new Date().getFullYear()} YANC.</p>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-md">
                <span className="text-lg font-bold text-primary-foreground">Y</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">YANC CMS</span>
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <h2 className="text-3xl font-bold text-foreground tracking-tight">Forgot password?</h2>
          <p className="mt-3 text-muted-foreground">
            Enter your account email and we’ll send you a reset link.
          </p>

          {sent ? (
            <div className="mt-8 p-4 rounded-xl bg-muted text-muted-foreground text-sm">
              If an account exists with that email, you’ll receive a link shortly. Check spam if you don’t see it.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-11 rounded-xl"
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
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
