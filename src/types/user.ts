// src/types/user.ts
export interface User {
  nationalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  role: 'employee' | 'admin' | 'superadmin';
  password: string;
  status: 'active' | 'inactive' | 'terminated';
  birthDate?: string;
  address?: string;
  subsidiaryId?: string;
  position?: string;
  hireDate?: string;
  documents?: Array<{
    name: string;
    type: 'pdf' | 'image' | 'doc';
    url: string;
    uploadedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}
