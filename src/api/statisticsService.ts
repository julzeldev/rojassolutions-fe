interface EmployeeStatistics {
  total: number;
  active: number;
  inactive: number;
  byProvince: Array<{ province: string; count: number }>;
  byAgeRange: Array<{ range: string; count: number }>;
  byGender: Array<{ gender: string; count: number }>;
  byPosition: Array<{ position: string; count: number }>;
  averageAge: number;
  averageTenure: number;
}

const apiBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
const API_URL = apiBase || 'http://localhost:5001';

export const statisticsService = {
  async getEmployeeStatistics(token: string): Promise<EmployeeStatistics> {
    const response = await fetch(`${API_URL}/employees/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`);
    }

    return response.json();
  },
};
