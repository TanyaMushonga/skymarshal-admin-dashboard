"use client";

import React, { useState, useEffect } from "react";
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from "@/types";
import {
  UserPlus,
  Shield,
  User as UserIcon,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Mail,
  MapPin,
  Phone,
  Award,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/hooks/useDebounce";

interface UsersClientProps {
  initialUsers: User[];
  initialPagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export default function UsersClient({
  initialUsers,
  initialPagination,
}: UsersClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 500);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [pagination, setPagination] = useState(
    initialPagination || { count: 0, next: null, previous: null },
  );

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: "",
    first_name: "",
    last_name: "",
    role: UserRole.OFFICER,
    force_number: "",
    unit_id: "",
    phone_number: "",
    is_certified_pilot: false,
    pilot_license_number: "",
    license_expiry_date: "",
    is_2fa_enabled: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");

  const fetchUsers = async (search?: string, page?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (page) params.set("page", page.toString());

      const response = await api.get<any>(`/users/?${params.toString()}`);

      if (Array.isArray(response)) {
        setUsers(response);
        setPagination({ count: response.length, next: null, previous: null });
      } else if (response && "results" in response) {
        setUsers(response.results || []);
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = params.get("search") || "";

    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/users?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/users?${params.toString()}`);
  };

  const handleRefresh = () => {
    fetchUsers(searchQuery, currentPage);
    router.refresh();
  };

  const openCreateModal = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      role: UserRole.OFFICER,
      force_number: "",
      unit_id: "",
      phone_number: "",
      is_certified_pilot: false,
      pilot_license_number: "",
      license_expiry_date: "",
      is_2fa_enabled: false,
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      force_number: user.force_number || "",
      unit_id: user.unit_id || "",
      phone_number: user.phone_number || "",
      is_certified_pilot: user.is_certified_pilot,
      pilot_license_number: user.pilot_license_number || "",
      license_expiry_date: user.license_expiry_date || "",
      is_2fa_enabled: user.is_2fa_enabled || false,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Clean up form data - remove empty strings
      const cleanData: any = {
        email: formData.email,
        role: formData.role,
      };

      if (formData.first_name) cleanData.first_name = formData.first_name;
      if (formData.last_name) cleanData.last_name = formData.last_name;
      if (formData.force_number) cleanData.force_number = formData.force_number;
      if (formData.unit_id) cleanData.unit_id = formData.unit_id;
      if (formData.phone_number) cleanData.phone_number = formData.phone_number;
      if (formData.is_certified_pilot) {
        cleanData.is_certified_pilot = true;
        if (formData.pilot_license_number)
          cleanData.pilot_license_number = formData.pilot_license_number;
        if (formData.license_expiry_date)
          cleanData.license_expiry_date = formData.license_expiry_date;
      }
      if (formData.is_2fa_enabled) cleanData.is_2fa_enabled = true;

      await api.post<User>("/users/", cleanData);
      toast.success(
        "User created successfully! A welcome email has been sent with the temporary password.",
      );
      setIsCreateModalOpen(false);
      await fetchUsers(searchQuery, currentPage);
      router.refresh();
    } catch (error: any) {
      // Error toast is handled by API client
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);

    try {
      // Only send changed fields
      const updateData: UpdateUserRequest = {};

      if (formData.first_name !== selectedUser.first_name)
        updateData.first_name = formData.first_name;
      if (formData.last_name !== selectedUser.last_name)
        updateData.last_name = formData.last_name;
      if (formData.role !== selectedUser.role) updateData.role = formData.role;
      if (formData.force_number !== selectedUser.force_number)
        updateData.force_number = formData.force_number;
      if (formData.unit_id !== selectedUser.unit_id)
        updateData.unit_id = formData.unit_id;
      if (formData.phone_number !== selectedUser.phone_number)
        updateData.phone_number = formData.phone_number;
      if (formData.is_certified_pilot !== selectedUser.is_certified_pilot)
        updateData.is_certified_pilot = formData.is_certified_pilot;
      if (formData.pilot_license_number !== selectedUser.pilot_license_number)
        updateData.pilot_license_number = formData.pilot_license_number;
      if (formData.license_expiry_date !== selectedUser.license_expiry_date)
        updateData.license_expiry_date = formData.license_expiry_date;
      if (formData.is_2fa_enabled !== selectedUser.is_2fa_enabled)
        updateData.is_2fa_enabled = formData.is_2fa_enabled;

      await api.patch<User>(`/users/${selectedUser.id}/`, updateData);
      toast.success("User updated successfully!");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await fetchUsers(searchQuery, currentPage);
      router.refresh();
    } catch (error: any) {
      // Error toast is handled by API client
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleteDialogOpen(false);
    setDeletingUserId(selectedUser.id);

    try {
      await api.delete(`/users/${selectedUser.id}/`);
      toast.success("User deleted successfully");
      setSelectedUser(null);
      await fetchUsers(searchQuery, currentPage);
      router.refresh();
    } catch (error: any) {
      // Error toast is handled by API client
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "officer":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "dispatcher":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const isLicenseExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isLicenseExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const totalPages = Math.ceil(pagination.count / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and access control.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, or force number..."
            className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/60 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  User
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Force Number
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Certifications
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : users.filter((user) => user.email !== session?.user?.email)
                  .length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </td>
                </tr>
              ) : (
                users
                  .filter((user) => user.email !== session?.user?.email)
                  .map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail size={10} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {user.force_number ? (
                          <span className="flex items-center gap-1">
                            <Shield
                              size={12}
                              className="text-muted-foreground"
                            />
                            {user.force_number}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`flex items-center gap-1.5 text-xs font-medium ${
                              user.is_on_duty
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.is_on_duty
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                  : "bg-muted-foreground"
                              }`}
                            ></span>
                            {user.is_on_duty ? "On Duty" : "Off Duty"}
                          </span>
                          {user.is_2fa_enabled && (
                            <span className="flex items-center gap-1 text-xs text-primary">
                              <ShieldCheck size={12} />
                              2FA Enabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_certified_pilot ? (
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-xs text-primary">
                              <Award size={12} />
                              Certified Pilot
                            </span>
                            {user.license_expiry_date && (
                              <span
                                className={`text-xs ${
                                  isLicenseExpired(user.license_expiry_date)
                                    ? "text-destructive"
                                    : isLicenseExpiringSoon(
                                          user.license_expiry_date,
                                        )
                                      ? "text-amber-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {isLicenseExpired(user.license_expiry_date)
                                  ? "Expired"
                                  : isLicenseExpiringSoon(
                                        user.license_expiry_date,
                                      )
                                    ? "Expiring Soon"
                                    : `Exp: ${new Date(user.license_expiry_date).toLocaleDateString()}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all text-sm border border-primary/20"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteDialog(user)}
                            disabled={deletingUserId === user.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-destructive/20"
                          >
                            {deletingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card border border-border rounded-lg px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages} ({pagination.count} total
            users)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.previous || loading}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.next || loading}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
        size="xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={UserRole.OFFICER}>Officer</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.DISPATCHER}>Dispatcher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Force Number
              </label>
              <input
                type="text"
                value={formData.force_number}
                onChange={(e) =>
                  setFormData({ ...formData, force_number: e.target.value })
                }
                placeholder="OF-12345"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Unit ID
              </label>
              <input
                type="text"
                value={formData.unit_id}
                onChange={(e) =>
                  setFormData({ ...formData, unit_id: e.target.value })
                }
                placeholder="UNIT-ALPHA"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                placeholder="+263771234567"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_certified_pilot}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_certified_pilot: e.target.checked,
                  })
                }
                className="rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">
                Certified Drone Pilot
              </span>
            </label>

            {formData.is_certified_pilot && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Pilot License Number
                  </label>
                  <input
                    type="text"
                    value={formData.pilot_license_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pilot_license_number: e.target.value,
                      })
                    }
                    placeholder="DPL-2024-001"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.license_expiry_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_expiry_date: e.target.value,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_2fa_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, is_2fa_enabled: e.target.checked })
                }
                className="rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">
                Enable Two-Factor Authentication
              </span>
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Edit User"
        size="xl"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-muted-foreground outline-none cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={UserRole.OFFICER}>Officer</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.DISPATCHER}>Dispatcher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Force Number
              </label>
              <input
                type="text"
                value={formData.force_number}
                onChange={(e) =>
                  setFormData({ ...formData, force_number: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Unit ID
              </label>
              <input
                type="text"
                value={formData.unit_id}
                onChange={(e) =>
                  setFormData({ ...formData, unit_id: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_certified_pilot}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_certified_pilot: e.target.checked,
                  })
                }
                className="rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">
                Certified Drone Pilot
              </span>
            </label>

            {formData.is_certified_pilot && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Pilot License Number
                  </label>
                  <input
                    type="text"
                    value={formData.pilot_license_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pilot_license_number: e.target.value,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.license_expiry_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_expiry_date: e.target.value,
                      })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_2fa_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, is_2fa_enabled: e.target.checked })
                }
                className="rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">
                Enable Two-Factor Authentication
              </span>
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
              className="flex-1 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.first_name} ${selectedUser?.last_name}? This action cannot be undone.`}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}
