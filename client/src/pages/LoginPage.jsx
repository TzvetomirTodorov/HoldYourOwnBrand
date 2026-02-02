import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// ============================================================================
// LOGIN PAGE - FULL AUTHENTICATION SYSTEM
// Includes: Login, Registration, Password Reset, Email Verification
// Matching the bold, urban HYOW aesthetic with dark theme and gold accents
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Determine initial view based on URL params
  const getInitialView = () => {
    const view = searchParams.get('view');
    const token = searchParams.get('token');
    if (token) return 'verify-email';
    if (view === 'register') return 'register';
    if (view === 'forgot-password') return 'forgot-password';
    if (view === 'reset-password') return 'reset-password';
    return 'login';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false });
  
  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  // Password reset form state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetPasswordForm, setResetPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  // Update view when URL params change
  useEffect(() => {
    setCurrentView(getInitialView());
  }, [searchParams]);

  // Clear messages when switching views
  useEffect(() => {
    setMessage({ type: '', text: '' });
  }, [currentView]);

  // ========================================================================
  // PASSWORD STRENGTH CALCULATOR
  // ========================================================================
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: '' };
    
    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['#ff4444', '#ff8844', '#ffbb44', '#88cc44', '#44bb44', '#22aa22'];
    
    const index = Math.min(score, 5);
    return { score, label: labels[index], color: colors[index] };
  };

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(registerForm.password));
  }, [registerForm.password]);

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================
  
  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });

      // Store token and user data
      const { token, user } = response.data;
      if (loginForm.rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (registerForm.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      setIsLoading(false);
      return;
    }

    if (!registerForm.acceptTerms) {
      setMessage({ type: 'error', text: 'Please accept the Terms of Service.' });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password,
      });

      setMessage({ 
        type: 'success', 
        text: 'Registration successful! Please check your email to verify your account.' 
      });
      
      // Switch to login view after delay
      setTimeout(() => {
        setCurrentView('login');
        setMessage({ type: 'info', text: 'Please verify your email before logging in.' });
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: forgotPasswordEmail,
      });

      setMessage({ 
        type: 'success', 
        text: 'Password reset instructions have been sent to your email.' 
      });
    } catch (error) {
      // Don't reveal if email exists or not for security
      setMessage({ 
        type: 'success', 
        text: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (resetPasswordForm.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      setIsLoading(false);
      return;
    }

    const token = searchParams.get('token');

    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password: resetPasswordForm.password,
      });

      setMessage({ 
        type: 'success', 
        text: 'Password reset successful! You can now log in with your new password.' 
      });
      
      setTimeout(() => {
        setCurrentView('login');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed. The link may have expired.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification handler
  const handleVerifyEmail = async () => {
    setIsLoading(true);
    const token = searchParams.get('token');

    try {
      await axios.post(`${API_URL}/api/auth/verify-email`, { token });
      setMessage({ 
        type: 'success', 
        text: 'Email verified successfully! You can now log in.' 
      });
      
      setTimeout(() => {
        setCurrentView('login');
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Email verification failed. The link may have expired or already been used.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify on component mount if token is present
  useEffect(() => {
    if (currentView === 'verify-email') {
      handleVerifyEmail();
    }
  }, [currentView]);

  // ========================================================================
  // RENDER FUNCTIONS
  // ========================================================================

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Email Address</label>
        <div style={styles.inputWrapper}>
          <EmailIcon />
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            placeholder="Enter your email"
            style={styles.input}
            required
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Password</label>
        <div style={styles.inputWrapper}>
          <LockIcon />
          <input
            type={showPassword ? 'text' : 'password'}
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            placeholder="Enter your password"
            style={styles.input}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div style={styles.optionsRow}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={loginForm.rememberMe}
            onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
            style={styles.checkbox}
          />
          <span style={styles.checkboxText}>Remember me</span>
        </label>
        <button 
          type="button"
          onClick={() => setCurrentView('forgot-password')}
          style={styles.linkButton}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" style={styles.submitButton} disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'SIGN IN'}
      </button>

      <div style={styles.divider}>
        <span style={styles.dividerLine}></span>
        <span style={styles.dividerText}>OR</span>
        <span style={styles.dividerLine}></span>
      </div>

      <div style={styles.socialButtons}>
        <button type="button" style={styles.socialButton}>
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      </div>

      <p style={styles.switchText}>
        Don't have an account?{' '}
        <button type="button" onClick={() => setCurrentView('register')} style={styles.switchButton}>
          Create one
        </button>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} style={styles.form}>
      <div style={styles.nameRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>First Name</label>
          <div style={styles.inputWrapper}>
            <UserIcon />
            <input
              type="text"
              value={registerForm.firstName}
              onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
              placeholder="First name"
              style={styles.input}
              required
            />
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Last Name</label>
          <div style={styles.inputWrapper}>
            <UserIcon />
            <input
              type="text"
              value={registerForm.lastName}
              onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
              placeholder="Last name"
              style={styles.input}
              required
            />
          </div>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Email Address</label>
        <div style={styles.inputWrapper}>
          <EmailIcon />
          <input
            type="email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            placeholder="Enter your email"
            style={styles.input}
            required
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Password</label>
        <div style={styles.inputWrapper}>
          <LockIcon />
          <input
            type={showPassword ? 'text' : 'password'}
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            placeholder="Create a password"
            style={styles.input}
            required
            minLength={8}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {registerForm.password && (
          <div style={styles.passwordStrength}>
            <div style={styles.strengthBar}>
              <div 
                style={{
                  ...styles.strengthFill,
                  width: `${(passwordStrength.score / 6) * 100}%`,
                  backgroundColor: passwordStrength.color,
                }}
              ></div>
            </div>
            <span style={{ ...styles.strengthLabel, color: passwordStrength.color }}>
              {passwordStrength.label}
            </span>
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Confirm Password</label>
        <div style={styles.inputWrapper}>
          <LockIcon />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            style={styles.input}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
          <span style={styles.errorText}>Passwords do not match</span>
        )}
      </div>

      <label style={styles.termsLabel}>
        <input
          type="checkbox"
          checked={registerForm.acceptTerms}
          onChange={(e) => setRegisterForm({ ...registerForm, acceptTerms: e.target.checked })}
          style={styles.checkbox}
        />
        <span style={styles.termsText}>
          I agree to the{' '}
          <Link to="/terms" style={styles.termsLink}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>
        </span>
      </label>

      <button type="submit" style={styles.submitButton} disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'CREATE ACCOUNT'}
      </button>

      <p style={styles.switchText}>
        Already have an account?{' '}
        <button type="button" onClick={() => setCurrentView('login')} style={styles.switchButton}>
          Sign in
        </button>
      </p>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} style={styles.form}>
      <p style={styles.formDescription}>
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>Email Address</label>
        <div style={styles.inputWrapper}>
          <EmailIcon />
          <input
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
            required
          />
        </div>
      </div>

      <button type="submit" style={styles.submitButton} disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'SEND RESET LINK'}
      </button>

      <button 
        type="button" 
        onClick={() => setCurrentView('login')} 
        style={styles.backButton}
      >
        <ArrowLeftIcon />
        Back to Sign In
      </button>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} style={styles.form}>
      <p style={styles.formDescription}>
        Enter your new password below.
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>New Password</label>
        <div style={styles.inputWrapper}>
          <LockIcon />
          <input
            type={showPassword ? 'text' : 'password'}
            value={resetPasswordForm.password}
            onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, password: e.target.value })}
            placeholder="Enter new password"
            style={styles.input}
            required
            minLength={8}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Confirm New Password</label>
        <div style={styles.inputWrapper}>
          <LockIcon />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={resetPasswordForm.confirmPassword}
            onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
            style={styles.input}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <button type="submit" style={styles.submitButton} disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'RESET PASSWORD'}
      </button>
    </form>
  );

  const renderEmailVerification = () => (
    <div style={styles.verificationContainer}>
      {isLoading ? (
        <>
          <div style={styles.verificationIcon}>
            <LoadingSpinner large />
          </div>
          <p style={styles.verificationText}>Verifying your email...</p>
        </>
      ) : message.type === 'success' ? (
        <>
          <div style={styles.verificationIcon}>
            <CheckIcon />
          </div>
          <p style={styles.verificationText}>{message.text}</p>
        </>
      ) : (
        <>
          <div style={styles.verificationIcon}>
            <AlertIcon />
          </div>
          <p style={styles.verificationText}>{message.text}</p>
          <button 
            type="button" 
            onClick={() => setCurrentView('login')} 
            style={styles.submitButton}
          >
            GO TO LOGIN
          </button>
        </>
      )}
    </div>
  );

  const getTitle = () => {
    switch (currentView) {
      case 'register': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'New Password';
      case 'verify-email': return 'Email Verification';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'register': return 'Join the HYOW movement';
      case 'forgot-password': return 'We\'ve got you covered';
      case 'reset-password': return 'Choose a strong password';
      case 'verify-email': return 'Almost there';
      default: return 'Sign in to your account';
    }
  };

  return (
    <div style={styles.container}>
      {/* Background pattern */}
      <div style={styles.backgroundPattern}>
        <BackgroundSVG />
      </div>

      <div style={styles.contentWrapper}>
        {/* Left side - Brand showcase */}
        <div style={styles.brandSide}>
          <div style={styles.brandContent}>
            <Link to="/" style={styles.brandLogo}>
              <BrandIcon />
            </Link>
            <h2 style={styles.brandTagline}>HOLD YOUR OWN</h2>
            <p style={styles.brandDescription}>
              From Harlem streets to California dreams. Wear your story. Own your legacy.
            </p>
            <div style={styles.brandFeatures}>
              <div style={styles.brandFeature}>
                <CheckCircleIcon />
                <span>Premium Quality Streetwear</span>
              </div>
              <div style={styles.brandFeature}>
                <CheckCircleIcon />
                <span>Exclusive Member Drops</span>
              </div>
              <div style={styles.brandFeature}>
                <CheckCircleIcon />
                <span>Free Shipping Over $100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div style={styles.formSide}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h1 style={styles.formTitle}>{getTitle()}</h1>
              <p style={styles.formSubtitle}>{getSubtitle()}</p>
            </div>

            {/* Message display */}
            {message.text && (
              <div style={{
                ...styles.message,
                backgroundColor: message.type === 'error' ? 'rgba(255, 68, 68, 0.1)' : 
                                 message.type === 'success' ? 'rgba(68, 187, 68, 0.1)' : 
                                 'rgba(212, 175, 55, 0.1)',
                borderColor: message.type === 'error' ? '#ff4444' : 
                             message.type === 'success' ? '#44bb44' : '#D4AF37',
                color: message.type === 'error' ? '#ff6666' : 
                       message.type === 'success' ? '#66dd66' : '#D4AF37',
              }}>
                {message.type === 'error' && <AlertIcon small />}
                {message.type === 'success' && <CheckIcon small />}
                {message.type === 'info' && <InfoIcon small />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Render appropriate form */}
            {currentView === 'login' && renderLoginForm()}
            {currentView === 'register' && renderRegisterForm()}
            {currentView === 'forgot-password' && renderForgotPasswordForm()}
            {currentView === 'reset-password' && renderResetPasswordForm()}
            {currentView === 'verify-email' && renderEmailVerification()}
          </div>
        </div>
      </div>

      {/* Global styles */}
      <style>{globalStyles}</style>
    </div>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" style={styles.inputIcon} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" style={styles.inputIcon} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" style={styles.inputIcon} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', marginRight: '8px' }} fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon({ small }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: small ? '18px' : '60px', height: small ? '18px' : '60px', marginRight: small ? '10px' : 0 }} fill="none" stroke="#44bb44" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ small }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: small ? '18px' : '60px', height: small ? '18px' : '60px', marginRight: small ? '10px' : 0 }} fill="none" stroke={small ? 'currentColor' : '#ff4444'} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function InfoIcon({ small }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: small ? '18px' : '60px', height: small ? '18px' : '60px', marginRight: small ? '10px' : 0 }} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: '10px', flexShrink: 0 }} fill="none" stroke="#D4AF37" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function LoadingSpinner({ large }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      style={{ 
        width: large ? '40px' : '20px', 
        height: large ? '40px' : '20px', 
        animation: 'spin 1s linear infinite' 
      }}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="3" />
      <path 
        d="M12 2a10 10 0 0 1 10 10" 
        fill="none" 
        stroke="#D4AF37" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px' }}>
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#brandGradient)" strokeWidth="2" />
      <path 
        d="M25 60 L25 45 L37 52 L50 35 L63 52 L75 45 L75 60 L50 75 Z" 
        fill="none" 
        stroke="url(#brandGradient)" 
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackgroundSVG() {
  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', position: 'absolute' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#151515" />
        </linearGradient>
      </defs>
      <rect fill="url(#bgGrad)" width="100%" height="100%" />
      {/* Subtle grid pattern */}
      <g opacity="0.05">
        {[...Array(20)].map((_, i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="1080" stroke="#D4AF37" strokeWidth="1" />
        ))}
        {[...Array(12)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="1920" y2={i * 100} stroke="#D4AF37" strokeWidth="1" />
        ))}
      </g>
      {/* Diagonal accent */}
      <line x1="0" y1="1080" x2="600" y2="0" stroke="#D4AF37" strokeWidth="1" opacity="0.1" />
      <line x1="1920" y1="0" x2="1320" y2="1080" stroke="#D4AF37" strokeWidth="1" opacity="0.1" />
    </svg>
  );
}

// ============================================================================
// GLOBAL STYLES
// ============================================================================

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Bebas+Neue&family=Barlow:wght@300;400;500;600&display=swap');

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  input:focus {
    outline: none;
    border-color: #D4AF37 !important;
  }
`;

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    fontFamily: "'Barlow', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  contentWrapper: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    minHeight: '100vh',
  },

  // Brand side (left)
  brandSide: {
    flex: '0 0 45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%)',
    '@media (max-width: 900px)': {
      display: 'none',
    },
  },

  brandContent: {
    maxWidth: '400px',
  },

  brandLogo: {
    display: 'block',
    marginBottom: '30px',
    textDecoration: 'none',
  },

  brandTagline: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '3rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#ffffff',
    margin: '0 0 20px 0',
    lineHeight: 1,
  },

  brandDescription: {
    fontSize: '1.1rem',
    fontWeight: 300,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.6,
    marginBottom: '40px',
  },

  brandFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  brandFeature: {
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.95rem',
  },

  // Form side (right)
  formSide: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },

  formContainer: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(15, 15, 15, 0.9)',
    borderRadius: '8px',
    padding: '40px',
    border: '1px solid rgba(212, 175, 55, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },

  formHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },

  formTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '2.2rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },

  formSubtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  },

  message: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '4px',
    border: '1px solid',
    marginBottom: '20px',
    fontSize: '0.9rem',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
  },

  nameRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },

  formGroup: {
    marginBottom: '20px',
  },

  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '8px',
    letterSpacing: '0.05em',
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  inputIcon: {
    position: 'absolute',
    left: '14px',
    width: '18px',
    height: '18px',
    color: 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
  },

  input: {
    width: '100%',
    padding: '14px 14px 14px 46px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.95rem',
    transition: 'border-color 0.3s ease',
  },

  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  passwordStrength: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '8px',
  },

  strengthBar: {
    flex: 1,
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },

  strengthFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },

  strengthLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    minWidth: '80px',
    textAlign: 'right',
  },

  errorText: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#ff6666',
    marginTop: '6px',
  },

  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },

  checkbox: {
    width: '18px',
    height: '18px',
    marginRight: '10px',
    accentColor: '#D4AF37',
  },

  checkboxText: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  linkButton: {
    background: 'none',
    border: 'none',
    color: '#D4AF37',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textDecoration: 'none',
  },

  termsLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '25px',
    cursor: 'pointer',
  },

  termsText: {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.4,
  },

  termsLink: {
    color: '#D4AF37',
    textDecoration: 'none',
  },

  submitButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
    color: '#0a0a0a',
    fontFamily: "'Oswald', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '25px 0',
    gap: '15px',
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
  },

  dividerText: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.1em',
  },

  socialButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  switchText: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },

  switchButton: {
    background: 'none',
    border: 'none',
    color: '#D4AF37',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
  },

  formDescription: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.6,
    marginBottom: '25px',
    textAlign: 'center',
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '14px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'all 0.3s ease',
  },

  verificationContainer: {
    textAlign: 'center',
    padding: '40px 0',
  },

  verificationIcon: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },

  verificationText: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '20px',
  },
};
