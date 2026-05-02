export interface IUser{
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'blocked' | 'pending';
  isVerfied?: boolean;
  role: 'farmer' | 'expert' | 'buyer' | 'admin';
  address: string;
  region?: string;
  soilType?: string;
  climate?: string;
  expertiseAreas?: string[];
  company?: string;
}
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'expert' | 'farmer' | 'buyer' | 'admin';
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}


export interface IUserResponse{
  data: IUser[];
}

