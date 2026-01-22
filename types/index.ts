export enum UserRole {
  ADMIN = "ADMIN",
  OFFICER = "OFFICER",
  SUPERVISOR = "SUPERVISOR",
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  force_number?: string;
  unit_id?: string;
  is_officer: boolean;
  is_certified_pilot: boolean;
  is_on_duty: boolean;
  last_known_lat?: number;
  last_known_lon?: number;
}

export interface DroneStatus {
  id: number;
  drone_id: string;
  battery_level: number;
  signal_strength: number;
  status: "online" | "offline" | "maintenance" | "error" | "emergency";
  updated_at: string;
}

export interface DroneLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
}

export interface Drone {
  id: number;
  drone_id: string;
  name: string;
  model: string;
  serial_number: string;
  is_active: boolean;
  assigned_officer_name?: string;
  status?: DroneStatus;
  latest_location?: DroneLocation;
  created_at: string;
}

export interface Patrol {
  id: number;
  patrol_id?: string;
  drone_id: string;
  drone_name?: string;
  officer_name: string;
  start_time: string;
  end_time?: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "SCHEDULED" | "SUSPENDED";
  address_name?: string;
  patrol_config?: {
    speed_limit: number;
    flight_path: number[][];
  };
}

export interface Detection {
  id: number;
  drone: number;
  patrol: number;
  timestamp: string;
  vehicle_type: string;
  confidence: number;
  license_plate?: string;
  speed?: number;
  location: {
    coordinates: number[];
  };
}

export interface Violation {
  id: number | string;
  plate: string;
  violation_type: string;
  status: "NEW" | "PROCESSED" | "CITATION_SENT" | "APPEALED";
  fine_amount: string;
  description: string;
  image_snapshot: string;
  created_at: string;
}

export interface Vehicle {
  id: number | string;
  license_plate: string;
  make: string;
  model: string;
  color: string;
  owner_name: string;
  owner_phone_number: string;
  compliance_points: number;
  expiry_date: string;
  status: "ACTIVE" | "EXPIRED" | "STOLEN" | "SUSPENDED";
}

export interface LotteryEvent {
  id: number | string;
  name: string;
  pool_amount: string;
  minimum_points: number;
  status: "OPEN" | "DRAWN" | "CLOSED" | "CANCELLED";
  winners_count: number;
  draw_date: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: "violation" | "mission_update" | "system";
  is_read: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  total_drones: number;
  active_drones: number;
  total_patrols_today: number;
  total_detections_today: number;
  total_violations_today: number;
  pending_violations: number;
  compliance_rate: number;
}
