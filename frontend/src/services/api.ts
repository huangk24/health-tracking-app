// Detect backend URL based on environment
export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  console.log('Current hostname:', hostname);
  console.log('Current protocol:', protocol);

  // Codespaces URL pattern: {name}-{port}.app.github.dev
  if (hostname.includes('.app.github.dev')) {
    // Extract the base name by removing the port part
    // Format: "name-port.app.github.dev" -> "name-8000.app.github.dev"
    const baseHostname = hostname.replace(/-\d+\.app\.github\.dev/, '');
    const backendHostname = `${baseHostname}-8000.app.github.dev`;
    const backendUrl = `${protocol}//${backendHostname}`;
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
  goal?: string;
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
    if (!response.ok) {
      let detail = response.statusText || "Request failed";
      try {
        const error = await response.json();
        detail = error.detail || JSON.stringify(error);
      } catch (err) {
        // Ignore parsing errors to preserve default detail.
      }
      throw new Error(detail);
    }
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
    if (!response.ok) {
      let detail = response.statusText || "Request failed";
      try {
        const error = await response.json();
        detail = error.detail || JSON.stringify(error);
      } catch (err) {
        // Ignore parsing errors to preserve default detail.
      }
      throw new Error(detail);
    }
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

  updateFoodEntry: async (entryId: number, data: any, token?: string) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/nutrition/entries/${entryId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let detail = response.statusText || "Request failed";
      try {
        const error = await response.json();
        detail = error.detail || JSON.stringify(error);
      } catch (err) {
        // Ignore parsing errors to preserve default detail.
      }
      throw new Error(detail);
    }
    return response.json();
  },

  deleteFoodEntry: async (entryId: number, token?: string) => {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/nutrition/entries/${entryId}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      let detail = response.statusText || "Request failed";
      try {
        const error = await response.json();
        detail = error.detail || JSON.stringify(error);
      } catch (err) {
        // Ignore parsing errors to preserve default detail.
      }
      throw new Error(detail);
    }
    return;
  },

  getFoodItems: async () => {
    return api.get("/nutrition/food-items");
  },

  createFoodItem: async (data: any, token?: string) => {
    return api.post("/nutrition/food-items", data, token);
  },

  searchUsdaFoods: async (query: string) => {
    const url = `/nutrition/usda/search?query=${encodeURIComponent(query)}`;
    return api.get(url);
  },

  createUsdaFoodItem: async (fdcId: number, token?: string) => {
    return api.post("/nutrition/food-items/usda", { fdc_id: fdcId }, token);
  },
};

export const exerciseApi = {
  createExercise: async (data: any, token?: string) => {
    return api.post("/nutrition/exercises", data, token);
  },

  getExercises: async (date: string, token?: string) => {
    const url = `/nutrition/exercises?date_filter=${date}`;
    return api.get(url, token);
  },

  updateExercise: async (exerciseId: number, data: any, token?: string) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/nutrition/exercises/${exerciseId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let detail = response.statusText || "Request failed";
      try {
        const error = await response.json();
        detail = error.detail || JSON.stringify(error);
      } catch (err) {
        // Ignore parsing errors to preserve default detail.
      }
      throw new Error(detail);
    }
    return response.json();
  },

  deleteExercise: async (exerciseId: number, token?: string) => {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/nutrition/exercises/${exerciseId}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      let detail = response.statusText || "Request failed";
      try {
        const error = await response.json();
        detail = error.detail || JSON.stringify(error);
      } catch (err) {
        // Ignore parsing errors to preserve default detail.
      }
      throw new Error(detail);
    }
    return;
  },
};
export const profileApi = {
  getProfile: async (token?: string): Promise<UserResponse> => {
    return api.get("/profile", token);
  },

  updateProfile: async (data: Partial<UserResponse>, token?: string): Promise<UserResponse> => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let detail = response.statusText || "Request failed";
      try {
        const error = await response.json();
        detail = error.detail || JSON.stringify(error);
      } catch (err) {
        // Ignore parsing errors to preserve default detail.
      }
      throw new Error(detail);
    }
    return response.json();
  },
};
