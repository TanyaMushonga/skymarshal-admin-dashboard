"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface RegisterVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterVehicleModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    license_plate: "",
    owner_name: "",
    owner_phone_number: "",
    make: "",
    model: "",
    color: "",
    status: "ACTIVE",
    expiry_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/vehicle-lookup/", formData);
      toast.success("Vehicle registered successfully");
      onSuccess();
      onClose();
      setFormData({
        license_plate: "",
        owner_name: "",
        owner_phone_number: "",
        make: "",
        model: "",
        color: "",
        status: "ACTIVE",
        expiry_date: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to register vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Vehicle"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              License Plate
            </label>
            <input
              required
              placeholder="e.g. ABC-123"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.license_plate}
              onChange={(e) =>
                setFormData({ ...formData, license_plate: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Status
            </label>
            <select
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="STOLEN">Stolen</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Owner Name
            </label>
            <input
              required
              placeholder="Full Name"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.owner_name}
              onChange={(e) =>
                setFormData({ ...formData, owner_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Owner Phone
            </label>
            <input
              required
              type="tel"
              placeholder="+1234567890"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.owner_phone_number}
              onChange={(e) =>
                setFormData({ ...formData, owner_phone_number: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Make
            </label>
            <input
              required
              placeholder="e.g. Toyota"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.make}
              onChange={(e) =>
                setFormData({ ...formData, make: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Model
            </label>
            <input
              required
              placeholder="e.g. Camry"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Color
            </label>
            <input
              required
              placeholder="e.g. Silver"
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Registration Expiry Date
          </label>
          <input
            required
            type="date"
            className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={formData.expiry_date}
            onChange={(e) =>
              setFormData({ ...formData, expiry_date: e.target.value })
            }
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
