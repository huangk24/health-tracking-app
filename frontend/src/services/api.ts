// Detect backend URL based on environment
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';

  const hostname = window.location.hostname;

  console.log('Current hostname:', hostname);

  // Codespaces URL pattern: {name}-{port}.app.github.dev
  if (hostname.includes('.app.github.dev')) {
    // Replace the frontend port (e.g., 5174) with backend port (8000)
    const backendHostname = hostname.replace(/-\d+\.app\.github\.dev/, '-8000.app.github.dev');
    const backendUrl = `https://${backendHostname}`;
    console.log('Detected Codespaces, using:', backendUrl);
    return backendUrl;
  }

  // Local development
  console.log('Using localhost');
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
console.log('Final API Base URL:', API_BASE_URL);

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: number;
  username: string;
  sex?: string;
  age?: number;
  height?: number;
  weight?: number;
}

export const authApi = {
  register: async (data: RegisterData): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }
    return response.json();
  },

  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }
    return response.json();
  },
};

export const api = {
  get: async (url: string, token?: string) => {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${url}`, { headers });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  },

  post: async (url: string, data: any, token?: string) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  },
};

export const nutritionApi = {
  getDailyNutrition: async (date?: string, token?: string) => {
    const url = date ? `/nutrition/daily?date=${date}` : "/nutrition/daily";
    return api.get(url, token);
  },

  createFoodEntry: async (data: any, token?: string) => {
    return api.post("/nutrition/entries", data, token);
  },

  getFoodItems: async () => {
    return api.get("/nutrition/food-items");
  },

  createFoodItem: async (data: any) => {
    return api.post("/nutrition/food-items", data);
  },
};
