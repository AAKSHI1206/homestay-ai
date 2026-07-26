import { useState, useEffect } from "react";
import { Button, Input, Loader, useToast, Badge } from "../components/ui";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../api/authApi";

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const { toast } = useToast();

  // ── Profile Form State ────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // ── Password Form State ───────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // ── Handle Profile Update ─────────────────────────────────
  async function handleProfileSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setProfileError("Name and Email cannot be empty.");
      return;
    }
    setProfileError("");
    setSavingProfile(true);

    try {
      const res = await updateProfile(
        {
          name: name.trim(),
          email: email.trim(),
          avatar: avatar.trim(),
        },
        token
      );
      updateUser(res.data);
      toast("Profile updated successfully!", { type: "success" });
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
      toast(err.message || "Update failed.", { type: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  // ── Handle Password Change ────────────────────────────────
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordError("Both current and new password are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordError("");
    setSavingPassword(true);

    try {
      await changePassword(
        {
          currentPassword,
          newPassword,
        },
        token
      );
      toast("Password updated successfully!", { type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Failed to update password.");
      toast(err.message || "Password change failed.", { type: "error" });
    } finally {
      setSavingPassword(false);
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
          Account Settings & Profile
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Manage your personal host details, profile avatar image, and account security.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left column: User overview card */}
        <div className="md:col-span-4">
          <Card className="p-6 flex flex-col items-center text-center">
            {avatar ? (
              <img
                src={avatar}
                alt={user?.name || ""}
                className="h-24 w-24 rounded-full object-cover shadow-md border-2 border-brand-500"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-brand-500 to-brand-600 text-2xl font-extrabold text-white shadow-md">
                {initials}
              </div>
            )}
            <h2 className="mt-4 text-base font-bold text-stone-900 dark:text-white">
              {user?.name || "Host Account"}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {user?.email || ""}
            </p>
            <div className="mt-4">
              <Badge variant="featured" className="px-3 py-1 text-[11px]">
                🛡️ Verified Homestay Host
              </Badge>
            </div>
            {user?.createdAt && (
              <p className="mt-6 text-[11px] text-stone-400 dark:text-stone-500 border-t border-stone-100 pt-4 w-full dark:border-stone-800">
                Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </Card>
        </div>

        {/* Right column: Forms */}
        <div className="md:col-span-8 flex flex-col gap-8">
          {/* Profile Information Form */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Personal Information
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Update your full name and public email address.
            </p>

            <form onSubmit={handleProfileSubmit} className="mt-5 flex flex-col gap-4">
              {profileError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                  {profileError}
                </div>
              )}
              <Input
                label="Full Name"
                placeholder="e.g. Aakshi Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Avatar Image URL (Optional)"
                placeholder="https://images.unsplash.com/photo-..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
              <p className="text-[11px] text-stone-400 -mt-2">
                Provide a direct URL to an image file (PNG, JPG, WebP) to display as your profile icon.
              </p>
              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? <Loader size="sm" label="Saving..." /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Password Form */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Security & Password
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ensure your account uses a strong password (at least 6 characters).
            </p>

            <form onSubmit={handlePasswordSubmit} className="mt-5 flex flex-col gap-4">
              {passwordError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                  {passwordError}
                </div>
              )}
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" variant="secondary" disabled={savingPassword}>
                  {savingPassword ? (
                    <Loader size="sm" label="Updating..." />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
