export enum UserRole {
  ADMIN = "admin",
  OFFICER = "officer",
  DISPATCHER = "dispatcher",
}

export interface User {
  id: string; // UUID from API
  email: string;
  first_name: string;
  last_name: string;
  role: string; // "admin", "officer", or "dispatcher"
  force_number?: string;
  unit_id?: string;
  is_officer: boolean;
  is_certified_pilot: boolean;
  pilot_license_number?: string;
  license_expiry_date?: string;
  phone_number?: string;
  is_2fa_enabled?: boolean;
  requires_password_change?: boolean;
  is_on_duty: boolean;
  last_known_lat?: number;
  last_known_lon?: number;
  avatar?: string;
}

export interface CreateUserRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  force_number?: string;
  unit_id?: string;
  phone_number?: string;
  is_certified_pilot?: boolean;
  pilot_license_number?: string;
  license_expiry_date?: string;
  is_2fa_enabled?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  force_number?: string;
  unit_id?: string;
  phone_number?: string;
  is_certified_pilot?: boolean;
  pilot_license_number?: string;
  license_expiry_date?: string;
  is_2fa_enabled?: boolean;
  avatar?: string;
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
  drone_id_str?: string; // Some backends use this field name
  officer: number | string; // Database ID of the assigned officer
  officer_name: string; // Email or name of the officer (Read-only)
  officer_email?: string; // Alternate field used by some backends
  start_time: string; // ISO 8601 format
  end_time: string | null; // ISO 8601 format or null if ACTIVE
  patrol_config: {
    speed_limit?: number;
    restricted_zones?: any[];
    [key: string]: any;
  };
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";

  // Live Telemetry (included in ACTIVE patrols)
  latest_location?: DroneLocation | null;
  battery_level?: number;
  status_display?: "online" | "offline" | "error";
  flight_duration_seconds?: number;
  detection_count?: number;
  violation_count?: number;

  created_at: string;
}

export interface VideoStream {
  id: number | string;
  stream_id: string;
  drone: number | string;
  drone_id: string;
  drone_name: string;
  rtsp_url: string;
  is_active: boolean;
  frame_rate: number;
  resolution: string;
  is_streaming: boolean;
  active_session_id: string | null;
  active_patrol: {
    id: number | string;
    status: string;
    officer_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Detection {
  id: number;
  drone: number;
  patrol: string | null; // UUID or null
  timestamp: string;
  frame_number: number;
  vehicle_type: string;
  confidence: number;
  box_coordinates: number[]; // [x1, y1, x2, y2]
  track_id: number | null;
  license_plate?: string | null;
  speed?: number | null;
  location: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  } | null;
  altitude?: number | null;
  created_at: string;
  updated_at: string;
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
  recipient: string;
  title: string;
  message: string;
  notification_type:
    | "stream_health"
    | "mission_update"
    | "system_alert"
    | "general";
  is_read: boolean;
  read_at: string | null;
  related_object_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  violations_today: number;
  active_patrols: number;
  avg_compliance_score: number;
  system_status: "OPERATIONAL" | "WARNING" | "ERROR";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "ALLOCATION" | "SAFETY" | "MAINTENANCE" | "POLICY";
  confidence_score: number;
  is_active: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

export interface DashboardOverview {
  metrics: DashboardMetrics;
  recommendations: Recommendation[];
}

export interface TrafficMetrics {
  id: number;
  timestamp: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  drone_id: string;
  vehicle_count: number;
  car_count: number;
  truck_count: number;
  motorcycle_count: number;
  bus_count: number;
  average_speed: number;
  max_speed: number;
  min_speed: number;
  speed_variance: number;
  violation_count: number;
  citation_count: number;
  sample_size: number;
}

export interface HeatMapCell {
  lat: number;
  lon: number;
  value: number;
}

export interface HeatMap {
  id: number;
  date: string;
  hour: number;
  metric_type: "speed" | "volume" | "violations";
  location_grid: {
    grid_size: number;
    cells: HeatMapCell[];
  };
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
  created_at: string;
}

export interface TrafficPattern {
  id: number;
  pattern_type: "peak_hour" | "congestion" | "accident_prone";
  location: {
    type: string;
    coordinates: [number, number];
  };
  location_name: string;
  days_of_week: number[];
  start_hour: number;
  end_hour: number;
  avg_vehicle_count: number;
  avg_speed: number;
  violation_rate: number;
  confidence_score: number;
  sample_size: number;
  recommendations: string;
  created_at: string;
}

export interface AnalyticsReport {
  id: string;
  report_type: "daily" | "weekly" | "monthly" | "custom";
  title: string;
  start_date: string;
  end_date: string;
  report_data: Record<string, any>;
  summary: string;
  pdf_file: string;
  excel_file: string;
  generated_by: string;
  is_public: boolean;
  created_at: string;
}

export interface OfficerStats {
  officer: string;
  hours_patrolled_this_week: number;
  violations_issued: number;
  assigned_zone_risk_level: string;
  performance_rating: number;
}

export interface Lottery {
  id: number;
  name: string;
  draw_date: string;
  pool_amount: string;
  minimum_points: number;
  status: "OPEN" | "DRAWN" | "PAID";
  warnings: string;
  winners: string[];
  created_at: string;
  updated_at: string;
}

export interface ComplianceScore {
  id: number;
  vehicle: string;
  safe_driving_points: number;
  last_observation: string;
}

export interface LotteryDrawResult {
  status: string;
  pool: number;
  winners_count: number;
  winners: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
