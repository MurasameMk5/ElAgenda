import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { getCurrentUser, getUserProfile } from '@/src/services/userService';

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState("");

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = useCallback(async () => {
    const currentUser = await getCurrentUser();
    let profile;
    if(currentUser){
      profile = await getUserProfile(currentUser.id);
      if(profile && profile.name)
        setUser(profile);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser: loadUserProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}