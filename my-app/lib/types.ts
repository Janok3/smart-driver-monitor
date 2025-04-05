export interface Driver {
    driver_id: string;
    car_plate_number: string;
}

export interface DrivingRecord {
    id: number;
    driver_id: string;
    car_plate_number: string;
    latitude: number;
    longitude: number;
    speed: number;
    direction: number | null;
    site_name: string | null;
    record_time: Date;
    is_rapidly_speedup: number | null;
    is_rapidly_slowdown: number | null;
    is_neutral_slide: number | null;
    is_neutral_slide_finished: number | null;
    neutral_slide_time: number | null;
    is_overspeed: number | null;
    is_overspeed_finished: number | null;
    overspeed_time: number | null;
    is_fatigue_driving: number | null;
    is_throttle_stop: number | null;
    is_oil_leak: number | null;
    record_date: Date | null;
}

export interface DriverStatistics {
    total_neutral_slide_incidents: number;
    total_neutral_slide_duration: number;
    total_overspeed_incidents: number;
    total_overspeed_duration: number;
    total_rapidly_speedup_incidents: number;
    total_rapidly_slowdown_incidents: number;
    total_fatigue_driving_incidents: number;
    total_oil_leak_incidents: number;
    total_throttle_stop_incidents: number;
    max_speed: number;
}