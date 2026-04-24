export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'blocked' | 'pending';
  isVerified?: boolean;
  role: 'farmer' | 'expert' | 'buyer' | 'admin';
  // farmer
  region?: string;
  soilType?: string;
  climate?: string;
  // expert
  expertiseAreas?: string[];
  experienceYears?: number;
  bio?: string;
  // buyer
  company?: string;
}

export interface IUserResponse {
  data: IUser[];
}

export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginResponse {
  user: {
    name: string;
    role: string;
    email: string;
  };
  token: string;
  message: string;
}

// ✅ السبب: الباك بيستقبل region/soilType/climate flat في الـ body مش جوه location object
// + أضفنا حقول الـ expert الجديدة (experienceYears, bio, cvFile)
export interface IRegister {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'farmer' | 'expert' | 'buyer' | 'admin';

  // farmer — flat مش nested
  region?: string;
  soilType?: string;
  climate?: string;

  // expert
  expertiseAreas?: string[];
  experienceYears?: number;
  bio?: string;
  cvFile?: File; // ✅ للرفع على cloudinary

  // buyer
  company?: string;
}

export interface IVerify {
  email: string;
  code: string;
}

export interface IForgetPassword {
  email: string;
}

// ✅ السبب: الباك بيقارن الكود كـ string (verification.code !== code)
// لو بعتناه number هيفشل دايمًا
export interface IResetPassword {
  email: string;
  code: string; // ✅ string مش number
  newPassword: string;
}
