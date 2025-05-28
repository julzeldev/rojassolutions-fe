// src/api/authService.ts
import type { User } from '../types/user';

// Mock user data (password is plain for mock purposes)
const mockUser: User = {
  nationalId: '1-1234-0562',
  firstName: 'Carlos',
  lastName: 'Mora',
  email: 'carlos.mora@example.com',
  phone: '+50688881234',
  role: 'employee',
  password: 'password123', // change later to hashed password
  status: 'active',
  birthDate: '1990-05-15',
  address: 'San José, Costa Rica',
  subsidiaryId: '64f8db8f13ab08d7fa621db2',
  position: 'Supervisor',
  hireDate: '2023-01-10',
  documents: [],
  createdAt: '2024-11-01T08:30:00Z',
  updatedAt: '2024-11-01T10:00:00Z',
  createdBy: '64f8db8f13ab08d7fa621db1',
  updatedBy: '64f8db8f13ab08d7fa621db1',
};

export async function mockAuthorize(nationalId: string, password: string): Promise<{ success: boolean; user?: Omit<User, 'password'>; token?: string; error?: string }> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 400));

  if (nationalId === mockUser.nationalId && password === mockUser.password) {
    // Return a fake JWT token and user data (without password)
    const userWithoutPassword = Object.fromEntries(
      Object.entries(mockUser).filter(([key]) => key !== 'password')
    ) as Omit<User, 'password'>;
    return {
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token',
    };
  }
  return {
    success: false,
    error: 'Invalid national ID or password',
  };
}
