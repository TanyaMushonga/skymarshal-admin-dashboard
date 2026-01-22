import React from "react";
import {
  LayoutDashboard,
  Plane,
  Map as MapIcon,
  History,
  Eye,
  AlertTriangle,
  Car,
  Users,
  BarChart3,
  Award,
  Bell,
} from "lucide-react";

export const API_BASE_URL = "http://localhost:8000/api/v1/";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  { label: "Drone Fleet", icon: <Plane size={20} />, path: "/drones" },
  { label: "Live Map", icon: <MapIcon size={20} />, path: "/map" },
  { label: "Patrols", icon: <History size={20} />, path: "/patrols" },
  { label: "Detections", icon: <Eye size={20} />, path: "/detections" },
  {
    label: "Violations",
    icon: <AlertTriangle size={20} />,
    path: "/violations",
  },
  { label: "Vehicles", icon: <Car size={20} />, path: "/vehicles" },
  { label: "Users", icon: <Users size={20} />, path: "/users" },
  { label: "Analytics", icon: <BarChart3 size={20} />, path: "/analytics" },
  { label: "Compliance", icon: <Award size={20} />, path: "/compliance" },
  { label: "Notifications", icon: <Bell size={20} />, path: "/notifications" },
];

export const MOCK_METRICS = {
  total_drones: 12,
  active_drones: 8,
  total_patrols_today: 15,
  total_detections_today: 342,
  total_violations_today: 28,
  pending_violations: 45,
  compliance_rate: 0.92,
};
