"use client";

import React, { useState, useEffect } from "react";
import { User, UpdateUserRequest } from "@/types";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Building,
  BadgeCheck,
  Save,
  Loader2,
  Lock,
  Camera,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ProfileClientProps {
  initialUser: User;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<User>(initialUser);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateUserRequest>({
    first_name: initialUser.first_name,
    last_name: initialUser.last_name,
    phone_number: initialUser.phone_number,
    force_number: initialUser.force_number,
    unit_id: initialUser.unit_id,
    role: initialUser.role,
    is_2fa_enabled: initialUser.is_2fa_enabled,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isAdmin = initialUser.role === "admin";

  const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we'd upload to S3/Cloudinary.
    // Here we'll convert to base64 for the mock API / immediate preview.
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      // Set local preview immediately
      const previousAvatar = user.avatar;
      setUser((prev) => ({ ...prev, avatar: base64String }));

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("profile_picture", file);

        const response = await api.patch<User>("/users/me/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setUser(response);
        toast.success("Profile picture updated");

        // Update session with new avatar
        if (updateSession) {
          await updateSession({
            ...session,
            user: {
              ...session?.user,
              avatar: response.avatar,
            },
          });
        }
      } catch (error) {
        // Rollback on error
        setUser((prev) => ({ ...prev, avatar: previousAvatar }));
        toast.error("Failed to update profile picture");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handle2FAToggle = async () => {
    const newValue = !user.is_2fa_enabled;
    setLoading(true);
    try {
      const response = await api.patch<User>("/users/me/", {
        is_2fa_enabled: newValue,
      });
      setUser(response);
      setFormData((prev) => ({ ...prev, is_2fa_enabled: newValue }));
      toast.success(`2FA ${newValue ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      toast.error("Failed to update 2FA status");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/change-password/", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success("Password updated successfully");
      setShowPasswordForm(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail || "Failed to update password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.patch<User>("/users/me/", formData);
      setUser(response);
      setIsEditing(false);
      toast.success("Profile updated successfully");

      if (updateSession) {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            first_name: response.first_name,
            last_name: response.last_name,
            name: `${response.first_name} ${response.last_name}`.trim(),
            role: response.role,
          },
        });
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="relative h-48 rounded-3xl bg-linear-to-r from-primary/20 via-primary/10 to-transparent border border-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px]" />
        <div className="absolute bottom-0 left-0 w-full p-8 flex items-end gap-6 translate-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-card border-4 border-background flex items-center justify-center text-primary shadow-2xl overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={64} strokeWidth={1.5} />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpdate}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="flex-1 pb-4">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-wider">
                <Shield size={12} />
                {user.role}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                <Mail size={14} className="text-primary/60" />
                {user.email}
              </span>
            </div>
          </div>
          <div className="pb-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      first_name: user.first_name,
                      last_name: user.last_name,
                      phone_number: user.phone_number,
                      force_number: user.force_number,
                      unit_id: user.unit_id,
                      role: user.role,
                      is_2fa_enabled: user.is_2fa_enabled,
                    });
                  }}
                  className="px-6 py-2.5 bg-card border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
              <BadgeCheck className="text-primary" size={20} />
              Identity Information
            </h3>

            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-muted/30 border border-border/80 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-muted/30 border border-border/80 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border/80 rounded-xl text-sm font-medium text-muted-foreground cursor-not-allowed outline-none"
                  />
                  <Lock
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30"
                    size={14}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    placeholder="+263 77 123 4567"
                    className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/80 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
              Professional Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase ml-1">
                  Force Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={!isEditing || !isAdmin}
                    value={
                      isEditing
                        ? formData.force_number || ""
                        : user.force_number || "PENDING"
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, force_number: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-muted/30 border border-border/80 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                  {!isAdmin && (
                    <Lock
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30"
                      size={14}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase ml-1">
                  Assigned Unit
                </label>
                <div className="relative">
                  <Building
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <input
                    type="text"
                    disabled={!isEditing || !isAdmin}
                    value={
                      isEditing
                        ? formData.unit_id || ""
                        : user.unit_id || "NOT ASSIGNED"
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, unit_id: e.target.value })
                    }
                    className={`w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/80 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                  {!isAdmin && (
                    <Lock
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30"
                      size={14}
                    />
                  )}
                </div>
              </div>
            </div>

            {!isAdmin && (
              <p className="mt-4 text-[10px] text-muted-foreground italic flex items-center gap-1.5 ml-1">
                <Lock size={10} />
                Professional credentials can only be modified by a system
                administrator.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Status & Security */}
        <div className="space-y-6">
          <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm text-center">
            <div
              className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${user.is_on_duty ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
            >
              <div className="relative">
                <UserIcon size={32} />
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${session ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
                />
              </div>
            </div>
            <h4 className="font-black text-foreground tracking-tight">
              Active Status
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Currently {session ? "Online" : "Logged Off"}
            </p>
            <div
              className={`py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${session ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
            >
              {session ? "Available" : "Unavailable"}
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
            <h4 className="font-black text-foreground mb-4 flex items-center gap-2">
              <Lock className="text-primary" size={18} />
              Security
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-2xl border border-border">
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">
                    Two-Factor Auth
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {user.is_2fa_enabled ? "Active" : "Disabled"}
                  </p>
                </div>
                <button
                  onClick={handle2FAToggle}
                  disabled={loading}
                  className={`w-10 h-6 p-1 rounded-full relative transition-all duration-300 ${user.is_2fa_enabled ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-muted"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${user.is_2fa_enabled ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full py-3 px-4 bg-muted hover:bg-muted-foreground/10 text-foreground text-xs font-black uppercase tracking-wider rounded-2xl transition-colors border border-border"
              >
                {showPasswordForm ? "Cancel Update" : "Update Password"}
              </button>

              {showPasswordForm && (
                <form
                  onSubmit={handlePasswordUpdate}
                  className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current_password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-muted/30 border border-border/80 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-muted/30 border border-border/80 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm_password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-muted/30 border border-border/80 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Confirm New Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
