import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role: UserRole, company: string) => Promise<void>;
  quickLoginAs: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  admin: {
    uid: 'admin-001',
    email: 'admin.terminal@portops.id',
    displayName: 'Kapten H. Supriyanto (Harbour Master)',
    role: 'admin',
    companyName: 'Otoritas Terminal Peti Kemas PortOps'
  },
  ship_owner: {
    uid: 'owner-002',
    email: 'armada@meratusline.co.id',
    displayName: 'Bambang Hartono (Fleet Director)',
    role: 'ship_owner',
    companyName: 'PT Meratus Line Tbk'
  },
  agent: {
    uid: 'agent-003',
    email: 'agency.ops@samuderalogistik.id',
    displayName: 'Rina Wijaya (Head of Port Clearance)',
    role: 'agent',
    companyName: 'PT Samudera Logistik Nusantara'
  },
  customer: {
    uid: 'cust-004',
    email: 'supplychain@indofood.co.id',
    displayName: 'Denny Prasetya (Logistics Manager)',
    role: 'customer',
    companyName: 'PT Indofood Sukses Makmur Tbk'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize as null so the login form is guaranteed to be the first view displayed
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      localStorage.removeItem('portops_active_user');
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('portops_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('portops_active_user');
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Try Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUser(profile);
      } else {
        // Fallback profile
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          role: 'customer',
          companyName: 'PT Mitra Logistik'
        };
        setUser(newProfile);
      }
    } catch (err: any) {
      // If auth fails or user wants to test demo accounts:
      const matchedDemo = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matchedDemo) {
        setUser(matchedDemo);
      } else {
        // Allow creating/logging in with instant user profile for prototyping
        const role: UserRole = email.includes('admin') ? 'admin' : email.includes('owner') ? 'ship_owner' : email.includes('agent') ? 'agent' : 'customer';
        const profile: UserProfile = {
          uid: 'user-' + Date.now(),
          email,
          displayName: email.split('@')[0].toUpperCase(),
          role,
          companyName: 'PT Logistik Mandiri'
        };
        setUser(profile);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, role: UserRole, company: string) => {
    setLoading(true);
    try {
      let uid = 'user-' + Date.now();
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        uid = cred.user.uid;
      } catch (fbErr) {
        console.warn('Firebase Auth fallback used:', fbErr);
      }

      const profile: UserProfile = {
        uid,
        email,
        displayName: name,
        role,
        companyName: company
      };

      try {
        await setDoc(doc(db, 'users', uid), profile);
      } catch (dbErr) {
        console.warn('Firestore write user error:', dbErr);
      }

      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAs = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    if (demo) {
      setUser(demo);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, quickLoginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
