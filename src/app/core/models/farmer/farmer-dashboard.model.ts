// ─── User & Farmer Profile ────────────────────────────────────────────────────
export interface FarmerUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export interface FarmerProfile {
  _id: string;
  user: string;
  region?: string;
  soilType?: string;
  climate?: string;
  lat?: number;
  lon?: number;
}

export interface MyInfoResponse {
  user: FarmerUser;
  profile: FarmerProfile | null;
}

// ─── Crop ─────────────────────────────────────────────────────────────────────
export interface Crop {
  _id: string;
  farmer: string;
  cropName: string;
  areaSize?: number;
  soilType?: string[];
  plantingDate: string;
  status: 'planned' | 'planted' | 'harvested';
  lastNotified: {
    fertilization: number;
    irrigation: number;
    harvest: boolean;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCropRequest {
  cropName: string;
  areaSize?: number;
  soilType?: string[];
  plantingDate: string;
}

export interface CropSchedule {
  cropName: string;
  plantingDate: string;
  currentDay: number;
  irrigation: { every: number; nextInDays: number };
  fertilization: { every: number; nextInDays: number };
  harvest: { afterDays: number; remainingDays: number; progress: number };
  nextTask: { type: 'irrigation' | 'fertilization' | 'harvest'; inDays: number };
}

// ─── Weather ──────────────────────────────────────────────────────────────────
export interface WeatherData {
  current: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    condition: { text: string; icon: string };
  };
  location: { name: string; country: string };
}

export interface SeasonalAnalysis {
  season: string;
  recommendation: string;
  risk: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Dashboard UI ─────────────────────────────────────────────────────────────
export interface DashboardStat {
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface QuickAction {
  label: string;
  sub: string;
  icon: string;
  action: 'add-crop' | 'ai-analysis' | 'community';
}

export interface ActivityItem {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  category: string;
  time: string;
  status: string;
  statusColor: string;
  statusBg: string;
}
export interface CropScheduleItem {
  cropId: string;
  cropName: string;
  plantingDate: string;
  currentDay: number;
  irrigation: { every: number; nextInDays: number };
  fertilization: { every: number; nextInDays: number };
  harvest: { afterDays: number; remainingDays: number; progress: number };
  nextTask: { type: string; inDays: number };
}