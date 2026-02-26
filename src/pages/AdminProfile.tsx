import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
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
    // Also load users managed by this admin
    loadManagedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin-only user creation state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [lastCreatedPassword, setLastCreatedPassword] = useState<string | null>(null);
  const [lastCreatedUsername, setLastCreatedUsername] = useState<string | null>(null);
  const [managedUsers, setManagedUsers] = useState<Array<{ id: number; email: string; name: string | null; username: string; role: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadManagedUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${apiBase.endsWith("/api") ? apiBase : apiBase + "/api"}/auth/users`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load users");
      }
      setManagedUsers(
        (data as any[]).map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name ?? null,
          username: u.username,
          role: u.role,
        }))
      );
    } catch (err: any) {
      console.warn("Failed to load managed users", err?.message || err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    setCreatingUser(true);
    setLastCreatedPassword(null);
    setLastCreatedUsername(null);
    try {
      const res = await fetch(`${apiBase.endsWith("/api") ? apiBase : apiBase + "/api"}/auth/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.message || data?.error || `Failed to create user (${res.status})`;
        throw new Error(message);
      }
      setLastCreatedPassword(data.initialPassword || null);
      setLastCreatedUsername(data.username || null);
      setNewUserEmail("");
      setNewUserName("");
      loadManagedUsers();
      toast({
        title: "User created",
        description: "A new CMS user has been created. Share the temporary password with them securely.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this user? They will no longer be able to access the CMS.")) {
      return;
    }
    try {
      const res = await fetch(`${apiBase.endsWith("/api") ? apiBase : apiBase + "/api"}/auth/users/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ userId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to delete user");
      }
      setManagedUsers((prev) => prev.filter((u) => u.id !== id));
      toast({
        title: "User removed",
        description: "The user can no longer access the CMS.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSavingProfile(true);
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
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New password and confirm do not match", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
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
      setSavingPassword(false);
    }
  };

  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">You do not have permission to view the admin profile.</p>
      </div>
    );
  }

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

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label>Name</Label>
          <Input value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={profile.email} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} />
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={savingProfile}>{savingProfile ? "Saving..." : "Save Profile"}</Button>
        </div>
      </form>

      <hr />

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
          <Button type="button" onClick={handleChangePassword} disabled={savingPassword}>{savingPassword ? "Submitting..." : "Change Password"}</Button>
        </div>
      </form>

      <hr />

      {/* Admin-only user management */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Create CMS User</h2>
        <p className="text-sm text-muted-foreground">
          Add new users who can access the CMS. A temporary password will be generated automatically and emailed to
          them. Share it with them securely so they can log in and change it.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="user@gmail.com"
            />
          </div>
          <div className="md:col-span-1">
            <Label>Name (optional)</Label>
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="User Name"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={handleCreateUser} disabled={creatingUser || !newUserEmail.trim()}>
            {creatingUser ? "Creating..." : "Create User"}
          </Button>
        </div>
        {lastCreatedPassword && (
          <div className="rounded-md border border-dashed border-border p-3 text-sm bg-muted/40">
            <p className="font-medium mb-1">Temporary credentials</p>
            {lastCreatedUsername && (
              <p>
                <span className="text-muted-foreground">Username:</span> <span className="font-mono">{lastCreatedUsername}</span>
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Temporary password:</span>{" "}
              <span className="font-mono">{lastCreatedPassword}</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              The user should log in and change their password from their profile page as soon as possible.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Users you manage</h3>
          {loadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading users...</span>
            </div>
          ) : managedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users created yet.</p>
          ) : (
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1.5fr,1.5fr,1fr,auto] gap-3 bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground">
                <span>Name</span>
                <span>Email</span>
                <span>Username</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-border/60">
                {managedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1.5fr,1.5fr,1fr,auto] gap-3 px-4 py-2 text-xs items-center"
                  >
                    <span>{u.name || "—"}</span>
                    <span className="truncate">{u.email}</span>
                    <span className="font-mono text-[11px]">{u.username}</span>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

