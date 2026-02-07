"use client";

import React, { useState } from "react";
import { User, UserRole } from "@/types";
import {
  UserPlus,
  Shield,
  User as UserIcon,
  MoreVertical,
  ShieldCheck,
  Mail,
  MapPin,
} from "lucide-react";
import Modal from "@/components/ui/Modal";

interface UsersClientProps {
  initialUsers: User[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users] = useState<User[]>(initialUsers);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case UserRole.OFFICER:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">
            User Management
          </h1>
          <p className="text-slate-400 text-sm">
            Control system access and manage law enforcement personnel.
          </p>
        </div>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <div
            key={user.id || user.email}
            className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-600/20">
                <UserIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-100">
                    {user.first_name} {user.last_name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadge(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail size={12} /> {user.email}
                  </p>
                  {user.force_number && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Shield size={12} /> {user.force_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">
                    Duty Status
                  </p>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-bold ${
                      user.is_on_duty ? "text-emerald-500" : "text-slate-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.is_on_duty
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : "bg-slate-500"
                      }`}
                    ></span>
                    {user.is_on_duty ? "ON DUTY" : "OFF DUTY"}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">
                    Security
                  </p>
                  <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
                    <ShieldCheck size={12} className="text-blue-400" /> 2FA
                    Active
                  </span>
                </div>
                {user.is_on_duty && user.last_known_lat && (
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">
                      Location
                    </p>
                    <span className="flex items-center gap-1 text-xs text-slate-300 font-medium tracking-tighter">
                      <MapPin size={12} className="text-red-400" /> ACTIVE
                      TRACKING
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors uppercase tracking-widest">
                  Edit Profile
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-200 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Create New Account"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddUserModalOpen(false);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              System Role
            </label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value={UserRole.OFFICER}>Field Officer</option>
              <option value={UserRole.ADMIN}>Administrator</option>
              <option value="DISPATCHER">Dispatcher</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Force Number
            </label>
            <input
              type="text"
              placeholder="ZRP-XXXXX"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              Create User Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
