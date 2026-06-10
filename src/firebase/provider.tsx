// src/firebase/provider.tsx
'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { User } from '@/lib/types';

interface FirebaseContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  currentUser: null,
  userData: null,
  loading: true,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useAuth = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Escuchar datos del usuario en tiempo real
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as User);
          }
          setLoading(false);
        });

        return () => unsubscribeUser();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <FirebaseContext.Provider value={{ currentUser, userData, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}