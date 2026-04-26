import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' or 'citizen'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setRole('admin');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginAdmin = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const demoLoginAdmin = async () => {
    setCurrentUser({ email: 'admin@jaldrishti.com', uid: 'demo-admin' });
    setRole('admin');
    return Promise.resolve();
  };

  const logout = () => {
    setRole(null);
    return signOut(auth);
  };

  const setCitizenRole = () => {
    setRole('citizen');
  };

  const value = {
    currentUser,
    role,
    setRole,
    loginAdmin,
    demoLoginAdmin,
    logout,
    setCitizenRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
