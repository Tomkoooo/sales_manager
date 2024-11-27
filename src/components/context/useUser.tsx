// src/contexts/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface User {
    _id: string;
    username: string;
    email: string;
    name: string;
    sex: string;
    profilePicture: {
        type: string;
        data: Buffer
    };
  }
  

interface UserContextType {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preloadedUser, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState<boolean>(false)


  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/authentication/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLoading(false)
          setUser(response.data);
        } catch (error) {
          setLoading(false)
        }
      }else{
        setLoading(false)
      }
    };

    fetchUser();
  }, []); // This effect runs once on mount

  // Memoize user data to prevent unnecessary re-renders
  const user = useMemo(() => preloadedUser, [preloadedUser]);

  return (
    <UserContext.Provider value={{ user, setUser, loading}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};