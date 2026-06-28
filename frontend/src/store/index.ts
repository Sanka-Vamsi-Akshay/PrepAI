// Store configurations (e.g., Zustand slices or global state modules)
export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// Simple state singleton mockup
class DevStore {
  private state: AppState = {
    theme: 'dark',
    sidebarOpen: true,
  };

  public getState(): AppState {
    return this.state;
  }

  public toggleSidebar() {
    this.state.sidebarOpen = !this.state.sidebarOpen;
  }
}

export const store = new DevStore();
