const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return res.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  requestPin(email: string) {
    return this.request<{ success: boolean }>('/auth/pin-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  verifyPin(data: { userId?: string; email?: string; pin: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/pin-verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  setPin(userId: string, pin: string) {
    return this.request<{ success: boolean }>('/auth/pin-set', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    });
  }

  getStaffList() {
    return this.request<any[]>('/auth/staff');
  }

  // Users
  getUsers() {
    return this.request<any[]>('/users');
  }

  getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  updateLanguage(id: string, language: string) {
    return this.request<any>(`/users/${id}/language`, { method: 'PATCH', body: JSON.stringify({ language }) });
  }

  // Tasks
  getTasks() {
    return this.request<any[]>('/tasks');
  }

  getTask(id: string) {
    return this.request<any>(`/tasks/${id}`);
  }

  createTask(data: any) {
    return this.request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) });
  }

  updateTask(id: string, data: any) {
    return this.request<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  completeTask(id: string, photoProof?: string) {
    return this.request<any>(`/tasks/${id}/complete`, { method: 'POST', body: JSON.stringify({ photoProof }) });
  }

  deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, { method: 'DELETE' });
  }

  // Inventory
  getInventory(category?: string) {
    return this.request<any[]>(`/inventory${category ? `?category=${category}` : ''}`);
  }

  getLowStock() {
    return this.request<any[]>('/inventory/low-stock');
  }

  createInventoryItem(data: any) {
    return this.request<any>('/inventory', { method: 'POST', body: JSON.stringify(data) });
  }

  updateInventoryItem(id: string, data: any) {
    return this.request<any>(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  adjustInventory(id: string, amount: number) {
    return this.request<any>(`/inventory/${id}/adjust`, { method: 'POST', body: JSON.stringify({ amount }) });
  }

  deleteInventoryItem(id: string) {
    return this.request<any>(`/inventory/${id}`, { method: 'DELETE' });
  }

  // Frozen Meals
  getFrozenMeals() {
    return this.request<any[]>('/frozen-meals');
  }

  adjustFrozenMeal(id: string, amount: number) {
    return this.request<any>(`/frozen-meals/${id}/adjust`, { method: 'POST', body: JSON.stringify({ amount }) });
  }

  // Shopping
  getShoppingLists(type?: string) {
    return this.request<any[]>(`/shopping-lists${type ? `?type=${type}` : ''}`);
  }

  createShoppingList(data: any) {
    return this.request<any>('/shopping-lists', { method: 'POST', body: JSON.stringify(data) });
  }

  addShoppingItem(listId: string, data: any) {
    return this.request<any>(`/shopping-lists/${listId}/items`, { method: 'POST', body: JSON.stringify(data) });
  }

  updateShoppingItem(listId: string, itemId: string, data: any) {
    return this.request<any>(`/shopping-lists/${listId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  completeShoppingList(id: string) {
    return this.request<any>(`/shopping-lists/${id}/complete`, { method: 'POST' });
  }

  // Kids
  getKids() {
    return this.request<any[]>('/kids');
  }

  getKid(id: string) {
    return this.request<any>(`/kids/${id}`);
  }

  getAllKidSchedules() {
    return this.request<any[]>('/kids/schedules/all');
  }

  addHealthLog(kidId: string, data: any) {
    return this.request<any>(`/kids/${kidId}/health-log`, { method: 'POST', body: JSON.stringify(data) });
  }

  addMealLog(kidId: string, data: any) {
    return this.request<any>(`/kids/${kidId}/meal-log`, { method: 'POST', body: JSON.stringify(data) });
  }

  addActivityLog(kidId: string, data: any) {
    return this.request<any>(`/kids/${kidId}/activity-log`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Day Off
  getDayOffs() {
    return this.request<any[]>('/day-offs');
  }

  requestDayOff(data: any) {
    return this.request<any>('/day-offs', { method: 'POST', body: JSON.stringify(data) });
  }

  updateDayOff(id: string, status: string) {
    return this.request<any>(`/day-offs/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  // Fred Schedule
  getFredSchedule() {
    return this.request<any[]>('/fred-schedule');
  }

  setFredSchedule(date: string, location: string) {
    return this.request<any>('/fred-schedule', { method: 'POST', body: JSON.stringify({ date, location }) });
  }

  // Meal Plans
  getMealPlans(startDate: string, endDate: string) {
    return this.request<any[]>(`/meal-plans?start=${startDate}&end=${endDate}`);
  }

  getMealPlansByDate(date: string) {
    return this.request<any[]>(`/meal-plans/date/${date}`);
  }

  saveMealPlan(data: { date: string; mealType: string; description?: string; recipe?: string; notes?: string }) {
    return this.request<any>('/meal-plans', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteMealPlan(id: string) {
    return this.request<any>(`/meal-plans/${id}`, { method: 'DELETE' });
  }

  // Config
  getConfig(type?: string) {
    return this.request<any[]>(`/config${type ? `?type=${type}` : ''}`);
  }

  // Users Admin
  createUser(data: any) {
    return this.request<any>('/users', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, { method: 'DELETE' });
  }

  resetUserPin(id: string) {
    return this.request<any>(`/users/${id}/reset-pin`, { method: 'POST' });
  }

  resetUserPassword(id: string, password: string) {
    return this.request<any>(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) });
  }
}

export const api = new ApiClient();
