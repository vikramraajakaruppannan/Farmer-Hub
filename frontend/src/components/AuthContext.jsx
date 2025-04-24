import { createContext, useContext, useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(localStorage.getItem('x-session-id') || '');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      if (sessionId) {
        try {
          const response = await axios.get('http://localhost:8000/user', {
            headers: { 'x-session-id': sessionId },
          });
          setUser(response.data);
        } catch (err) {
          localStorage.removeItem('x-session-id');
          setSessionId('');
          setUser(null);
        }
      }
    };
    checkSession();
  }, [sessionId]);


  const loginWithEmail = async (emailInput) => {
    setLoading(true);
    setError('');
    try {
      console.log('Sending OTP request for email:', emailInput);
      const response = await axios.post('http://localhost:8000/login-otp', { email: emailInput }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000, // Increased from 5000ms to 15000ms
      });
      console.log('OTP request response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      if (response.status !== 200) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format');
      }
      setEmail(emailInput);
      setOtpSent(true);
      navigate('/buyer/otp-verification');
    } catch (err) {
      console.error('OTP request failed:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
        code: err.code,
      });
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp) => {
    setLoading(true);
    setError('');
    try {
      console.log('Verifying OTP for email:', email, 'OTP:', otp);
      const response = await axios.post('http://localhost:8000/verify-otp', { email, otp }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000, // Increased from 5000ms to 15000ms
      });
      console.log('OTP verification response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      if (response.status !== 200) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      const { session_id, first_name, last_name, profile_complete } = response.data;
      setSessionId(session_id);
      localStorage.setItem('x-session-id', session_id);
      setUser({ first_name, last_name, email, profile_complete });
      setOtpSent(false);
      navigate(profile_complete ? '/buyer/dashboard' : '/buyer/complete-profile');
    } catch (err) {
      console.error('OTP verification failed:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
        code: err.code,
      });
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to verify OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async ({ fullName, location, phoneNumber }) => {
    setLoading(true);
    setError('');
    try {
      console.log('Completing profile for email:', email, 'Data:', { fullName, location, phoneNumber });
      const response = await axios.post(
        'http://localhost:8000/complete-profile',
        { full_name: fullName, location, email,phoneNumber },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
          },
          timeout: 15000, // Increased from 5000ms to 15000ms
        }
      );
      console.log('Profile completion response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      if (response.status !== 200) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      
      navigate('/buyer/dashboard');
    } catch (err) {
      console.error('Profile completion failed:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        } : null,
        code: err.code,
      });
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to complete profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out, clearing auth state');
    setUser(null);
    setSessionId('');
    setEmail('');
    setOtpSent(false);
    localStorage.removeItem('x-session-id');
    navigate('/buyer/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, email, sessionId, otpSent, loading, error, loginWithEmail, verifyOTP, completeProfile, logout }}
    >
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
