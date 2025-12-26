import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const saveUserToken = (token) => {
    localStorage.setItem('token', token);
    const decoded = parseJwt(token);
    if (decoded) {
        setUser({ 
            id: decoded.sub || decoded.nameid,
            role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.Role,
            email: decoded.email || decoded.unique_name
        });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) saveUserToken(token);
    setLoading(false);
  }, []);


  const register = async (email, fullName, password, role, providerCategoryCode, cvUrl, photoUrl) => {
    await axiosClient.post('/auth/register', { 
        email, 
        fullName, 
        password, 
        role, 
        providerCategoryCode,
        cvUrl,    
        photoUrl 
    });
  };

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    
    if (res.data.requires2FA) {
      return { requires2FA: true, message: res.data.message };
    }

    if (res.data.token) {
      saveUserToken(res.data.token);
      
     
      const decoded = parseJwt(res.data.token);
      let roleStr = "client";
      const rawRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      
     
      if (res.data.role) roleStr = res.data.role;
      else if (rawRole == 1 || rawRole === 'provider') roleStr = 'provider';
      else if (rawRole == 2 || rawRole === 'admin') roleStr = 'admin';

      return { success: true, role: roleStr };
    }
  };

  const verify2FA = async (email, code) => {
    const res = await axiosClient.post('/auth/verify-2fa', { email, code });
    if (res.data.token) {
      saveUserToken(res.data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verify2FA, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);