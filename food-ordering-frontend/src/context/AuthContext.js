import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, confirmSignUp, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
  try {
    const currentUser = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    
    // Get user's groups from the auth session
    const session = await fetchAuthSession();
    const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
    
    setUser({
      username: currentUser.username,
      email: attributes.email,
      name: attributes.name,
      groups: groups,
      role: groups[0] || 'Customers' // First group is primary role
    });
  } catch (error) {
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  // Sign Up
  const signup = async (email, password, name) => {
    try {
      const { userId } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      });
      return { success: true, userId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Confirm Sign Up
  const confirmSignup = async (email, code) => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign In
// Sign In
const login = async (email, password) => {
  try {
    const signInResult = await signIn({ username: email, password });
    
    // Check if password change is required
    if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return { 
        success: false, 
        error: 'Password change required. Please contact admin or use password reset.',
        requiresPasswordChange: true 
      };
    }
    
    await checkUser();
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

  // Sign Out
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signup,
    confirmSignup,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};