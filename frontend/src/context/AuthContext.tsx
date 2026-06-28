import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<any>;
  register: (credentials: any) => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [booting, setBooting] = useState(true);

  // 1. Fetch current active session (GET /auth/me) on bootstrap
  const {
    data: userData,
    isLoading: isFetchingUser,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/auth/me');
        return response.data.data.user as User;
      } catch (err) {
        // If 401, return null (session is unauthenticated)
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });

  useEffect(() => {
    if (!isFetchingUser) {
      setBooting(false);
    }
  }, [isFetchingUser]);

  // 2. Login Mutation (POST /auth/login)
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data.data.user as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['authUser'], user);
    },
  });

  // 3. Register Mutation (POST /auth/register)
  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await apiClient.post('/auth/register', credentials);
      return response.data.data.user as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['authUser'], user);
    },
  });

  // 4. Logout Mutation (POST /auth/logout)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      queryClient.clear(); // Clear other queries
    },
  });

  const login = async (credentials: any) => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = async (credentials: any) => {
    return registerMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  const user = userData || null;
  const isAuthenticated = !!user;

  // The overall loading state represents boot loading or active mutation processing
  const isLoading = booting || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
