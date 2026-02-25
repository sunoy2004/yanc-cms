import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function resolveApiBase() {
  const viteApi = (import.meta.env.VITE_API_URL as string) || "";
  const cmsApi = (import.meta.env.VITE_CMS_API_URL as string) || "";
  const cmsBase = (import.meta.env.VITE_CMS_BASE_URL as string) || "";
  if (viteApi && viteApi.trim() !== "") return viteApi.replace(/\/+$/, "");
  if (cmsApi && cmsApi.trim() !== "") return cmsApi.replace(/\/+$/, "");
  if (cmsBase && cmsBase.trim() !== "") return cmsBase.replace(/\/+$/, "");
  return "http://localhost:8080";
}

export default function AdminProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = localStorage.getItem("yanc_cms_token");
  const apiBase = resolveApiBase();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase.endsWith("/api") ? apiBase : apiBase + "/api"}/auth/me`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          // Backend may not provide /me - handle gracefully
          throw new Error(`Profile endpoint not available (${res.status})`);
        }
        const data = await res.json();
        setProfile({
          name: data.name || data.username || "",
          email: data.email || "",
        });
      } catch (err: any) {
        console.warn("Could not fetch profile:", err?.message || err);
        toast({
          title: "Profile unavailable",
          description: "Profile endpoint not available on backend. You can still attempt password change.",
          variant: "warning",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${apiBase.endsWith("/api") ? apiBase : apiBase + "/api"}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        throw new Error(err || `Failed to save (${res.status})`);
      }
      toast({ title: "Saved", description: "Profile updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New password and confirm do not match", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${apiBase.endsWith("/api") ? apiBase : apiBase + "/api"}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        throw new Error(err || `Failed to change password (${res.status})`);
      }
      toast({ title: "Success", description: "Password changed. Please log in again." });
      // Optionally, clear local session
      localStorage.removeItem("yanc_cms_token");
      localStorage.removeItem("yanc_cms_user");
      setTimeout(() => (window.location.href = "/login"), 800);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Password change failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Admin Profile</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={profile.email} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
        </div>
      </form>

      <hr />

      <form onSubmit={handleChangePassword} className="space-y-4">
        <h2 className="text-lg font-medium">Change Password</h2>
        <div>
          <Label>Current Password</Label>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div>
          <Label>New Password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Submitting..." : "Change Password"}</Button>
        </div>
      </form>
    </div>
  );
}

