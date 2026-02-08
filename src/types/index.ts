export enum UserRole {
  ADMIN = "ADMIN",
  OFFICER = "OFFICER",
  SUPERVISOR = "SUPERVISOR",
}

export interface User {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  role: string; // Changed from UserRole enum to string to match API "officer" vs "OFFICER"
  force_number?: string;
  unit_id?: string;
  is_officer: boolean;
  is_certified_pilot: boolean;
  pilot_license_number?: string;
  phone_number?: string;
  is_on_duty: boolean;
  last_known_lat?: number;
  last_known_lon?: number;
}

export interface DroneStatus {
  battery_level: number;
  signal_strength: number;
  status: "online" | "offline" | "maintenance" | "error";
}

export interface DroneLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
}

export interface Drone {
  id: number | string;
  drone_id: string; // Unique Identifier used in URLs (e.g., "DRONE-001")
  name: string;
  model: string;
  serial_number: string;
  is_active: boolean;
  assigned_officer: number | null; // ID of the assigned user
  assigned_officer_name: string; // Read-only helper
  status: DroneStatus;
  latest_location: DroneLocation | null;
  created_at: string;
  updated_at: string;
}

export interface Patrol {
  id: number | string;
  drone: number | string; // Database ID of the drone
  drone_id: string; // Unique Identifier (e.g., "DRONE-001")
  officer: number | string; // Database ID of the assigned officer
  officer_name: string; // Email or name of the officer (Read-only)
  start_time: string; // ISO 8601 format
  end_time: string | null; // ISO 8601 format or null if ACTIVE
  patrol_config: {
    speed_limit?: number;
    restricted_zones?: any[];
    [key: string]: any;
  };
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  created_at: string;
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

export interface ViolationEvidenceMeta {
  speed_detected?: number;
  speed_limit?: number;
  location?: string;
  [key: string]: any;
}

export interface Violation {
  id: string; // UUID
  detection: string; // UUID
  patrol: string; // UUID
  violation_type: string;
  status: "NEW" | "PROCESSED" | "CITATION_SENT" | "DISMISSED";
  fine_amount: string;
  description: string;
  video_clip: string;
  image_snapshot: string;
  evidence_meta: ViolationEvidenceMeta;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string; // UUID
  license_plate: string;
  make: string;
  model: string;
  color: string;
  owner_name: string;
  owner_phone_number: string;
  compliance_points?: number;
  expiry_date: string;
  status: "ACTIVE" | "EXPIRED" | "STOLEN" | "SUSPENDED";
  created_at?: string;
}

export interface VehicleStatistics {
  total_detections: number;
  total_violations: number;
  total_fines_outstanding: number;
}

export interface VehicleDetection {
  id: string;
  timestamp: string;
  speed: number;
  location: [number, number]; // [longitude, latitude]
  drone_id: string;
}

export interface VehicleViolation {
  id: string;
  type: string;
  status: string;
  fine: number;
  timestamp: string;
  video_url: string;
}

export interface VehicleHistory {
  vehicle: Vehicle;
  statistics: VehicleStatistics;
  recent_detections: VehicleDetection[];
  violations_history: VehicleViolation[];
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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
