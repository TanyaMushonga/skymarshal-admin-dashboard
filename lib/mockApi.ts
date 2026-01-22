import {
  User,
  UserRole,
  Drone,
  Patrol,
  Detection,
  Violation,
  DashboardMetrics,
  Vehicle,
  LotteryEvent,
  Notification,
} from "@/types";
import { MOCK_METRICS } from "@/lib/constants";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    await sleep(500);
    return MOCK_METRICS;
  },

  getDrones: async (): Promise<Drone[]> => {
    await sleep(400);
    return [
      {
        id: 1,
        drone_id: "DRN-001",
        name: "Eagle One",
        model: "DJI Mavic 3",
        serial_number: "SN-2024-001",
        is_active: true,
        assigned_officer_name: "Jane Smith",
        status: {
          id: 1,
          drone_id: "DRN-001",
          battery_level: 85,
          signal_strength: 92,
          status: "online",
          updated_at: new Date().toISOString(),
        },
        latest_location: {
          latitude: -17.8292,
          longitude: 31.0522,
          altitude: 150.5,
          timestamp: new Date().toISOString(),
        },
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        drone_id: "DRN-002",
        name: "Hawk Eye",
        model: "DJI Mavic 3",
        serial_number: "SN-2024-002",
        is_active: true,
        assigned_officer_name: "John Doe",
        status: {
          id: 2,
          drone_id: "DRN-002",
          battery_level: 42,
          signal_strength: 78,
          status: "online",
          updated_at: new Date().toISOString(),
        },
        latest_location: {
          latitude: -17.835,
          longitude: 31.06,
          altitude: 120.0,
          timestamp: new Date().toISOString(),
        },
        created_at: "2024-01-16T11:00:00Z",
      },
      {
        id: 3,
        drone_id: "DRN-003",
        name: "Falcon Zero",
        model: "DJI Air 3",
        serial_number: "SN-2024-003",
        is_active: false,
        status: {
          id: 3,
          drone_id: "DRN-003",
          battery_level: 0,
          signal_strength: 0,
          status: "offline",
          updated_at: new Date().toISOString(),
        },
        created_at: "2024-01-18T09:00:00Z",
      },
    ];
  },

  getPatrols: async (): Promise<Patrol[]> => {
    await sleep(300);
    return [
      {
        id: 157,
        drone_id: "DRN-001",
        officer_name: "officer1@skymarshal.com",
        start_time: "2024-01-22T10:45:00Z",
        status: "ACTIVE",
        patrol_config: {
          speed_limit: 60,
          flight_path: [
            [31.05, -17.82],
            [31.06, -17.83],
          ],
        },
      },
    ];
  },

  getViolations: async (): Promise<Violation[]> => {
    await sleep(600);
    return [
      {
        id: 234,
        plate: "ABC 1234",
        violation_type: "SPEEDING",
        status: "NEW",
        fine_amount: "150.00",
        description: "Vehicle exceeded speed limit by 12.5 km/h",
        image_snapshot: "https://picsum.photos/seed/violation1/400/300",
        created_at: "2024-01-22T10:47:35Z",
      },
      {
        id: 235,
        plate: "XYZ 9876",
        violation_type: "RED_LIGHT",
        status: "PROCESSED",
        fine_amount: "200.00",
        description: "Ran red light at Intersection B",
        image_snapshot: "https://picsum.photos/seed/violation2/400/300",
        created_at: "2024-01-22T11:20:00Z",
      },
    ];
  },

  getDetections: async (): Promise<Detection[]> => {
    await sleep(400);
    return [
      {
        id: 1,
        drone: 1,
        patrol: 157,
        timestamp: new Date().toISOString(),
        vehicle_type: "car",
        confidence: 0.98,
        license_plate: "K-9922",
        speed: 55,
        location: { coordinates: [31.052, -17.831] },
      },
      {
        id: 2,
        drone: 1,
        patrol: 157,
        timestamp: new Date().toISOString(),
        vehicle_type: "truck",
        confidence: 0.94,
        license_plate: "T-8811",
        speed: 72,
        location: { coordinates: [31.055, -17.835] },
      },
    ];
  },

  getVehicles: async (): Promise<Vehicle[]> => {
    await sleep(500);
    return [
      {
        id: 1,
        license_plate: "ABC 1234",
        owner_name: "Michael Johnson",
        owner_phone_number: "+263771234000",
        make: "Toyota",
        model: "Corolla",
        color: "Silver",
        status: "ACTIVE",
        expiry_date: "2025-06-30",
        compliance_points: 45,
      },
      {
        id: 2,
        license_plate: "XYZ 9876",
        owner_name: "Sarah Williams",
        owner_phone_number: "+263771234001",
        make: "Mazda",
        model: "CX-5",
        color: "Red",
        status: "EXPIRED",
        expiry_date: "2023-12-31",
        compliance_points: 12,
      },
      {
        id: 3,
        license_plate: "HOT 0001",
        owner_name: "Stolen Vehicle Record",
        owner_phone_number: "N/A",
        make: "VW",
        model: "Golf 7",
        color: "Black",
        status: "STOLEN",
        expiry_date: "2025-01-01",
        compliance_points: 0,
      },
    ];
  },

  getUsers: async (): Promise<User[]> => {
    await sleep(400);
    return [
      {
        id: 1,
        email: "admin@skymarshal.com",
        first_name: "John",
        last_name: "Doe",
        role: UserRole.ADMIN,
        is_officer: false,
        is_certified_pilot: false,
        is_on_duty: true,
      },
      {
        id: 2,
        email: "officer1@skymarshal.com",
        first_name: "Jane",
        last_name: "Smith",
        role: UserRole.OFFICER,
        force_number: "ZRP-12345",
        unit_id: "UNIT-A",
        is_officer: true,
        is_certified_pilot: true,
        is_on_duty: true,
        last_known_lat: -17.8292,
        last_known_lon: 31.0522,
      },
    ];
  },

  getLotteryEvents: async (): Promise<LotteryEvent[]> => {
    await sleep(300);
    return [
      {
        id: 1,
        name: "January 2024 Safe Driver Draw",
        draw_date: "2024-01-31",
        pool_amount: "5000.00",
        minimum_points: 50,
        status: "OPEN",
        winners_count: 0,
      },
      {
        id: 2,
        name: "Holiday Bonus Draw",
        draw_date: "2023-12-25",
        pool_amount: "2500.00",
        minimum_points: 40,
        status: "DRAWN",
        winners_count: 5,
      },
    ];
  },

  getNotifications: async (): Promise<Notification[]> => {
    await sleep(200);
    return [
      {
        id: "1",
        title: "New Violation Detected",
        message: "A speeding violation was detected by Eagle One at 10:47 AM",
        notification_type: "violation",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Drone Low Battery",
        message: "Hawk Eye (DRN-002) battery level is at 15%. Return to base.",
        notification_type: "system",
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  },
};
