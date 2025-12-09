import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { initDB, getItemByIndex, addItem, getAllItems, seedDemoData } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { loginUserApi, registerUserApi } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initDB();
        await seedDemoData();

        // Check for stored session
        const storedUserId = localStorage.getItem('elearn_user_id');
        if (storedUserId) {
          const users = await getAllItems<User>('users');
          const foundUser = users.find(u => u.id === storedUserId);
          if (foundUser) {
            setUser(foundUser);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 🔥 PANGGIL API LOGIN
      const result = await loginUserApi({
        email: email.toLowerCase(),
        password,
      });

      // ✅ Jika login sukses, API harus mengembalikan data user
      const loggedInUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        createdAt: result.user.created_at,
      };

      // Simpan ke global state
      setUser(loggedInUser);

      // Simpan id user di localStorage agar tetap login
      localStorage.setItem("elearn_user_id", loggedInUser.id);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${loggedInUser.name}`,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
          title: 'Login failed',
          description: 'Invalid email or password',
          variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      // CALL API REGISTER
      const result = await registerUserApi({
        email: email.toLowerCase(),
        password,
        name,
        role,
      });

      const newUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        createdAt: result.user.created_at,
      };

      setUser(newUser);

      localStorage.setItem("elearn_user_id", newUser.id);

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully",
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during registration',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elearn_user_id');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
