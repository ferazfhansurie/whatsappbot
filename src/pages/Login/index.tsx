import logoUrl from "@/assets/images/logo.png";
import logoUrl2 from "@/assets/images/logo3.png";
import illustrationUrl from "@/assets/images/illustration.svg";
import { FormInput, FormCheck } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { useState } from "react";
import { co } from "@fullcalendar/core/internal-common";

const firebaseConfig = {
  apiKey: "AIzaSyCc0oSHlqlX7fLeqqonODsOIC3XA8NI7hc",
  authDomain: "onboarding-a5fcb.firebaseapp.com",
  databaseURL: "https://onboarding-a5fcb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "onboarding-a5fcb",
  storageBucket: "onboarding-a5fcb.appspot.com",
  messagingSenderId: "334607574757",
  appId: "1:334607574757:web:2603a69bf85f4a1e87960c",
  measurementId: "G-2C9J1RY67L"
};

const app = initializeApp(firebaseConfig);

function Main() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSignIn = async () => {
    setError("");
    try {
      console.log('Sending login request with:', { email });
      const response = await fetch('https://juta-dev.ngrok.dev/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (response.ok) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userData', JSON.stringify(data.user));
        navigate('/loading');
      } else {
        setError(data.error || "An error occurred during sign-in. Please try again later.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An error occurred during sign-in. Please try again later.");
    }
  };

  const handleKeyDown = (event: { key: string; }) => {
    if (event.key === "Enter") {
      handleSignIn();
    }
  };

  const handleStartFreeTrial = () => {
    navigate('/register');
  };

  const handleForgotPassword = async () => {
    const auth = getAuth(app);
    setError("");
    setResetMessage("");
    
    if (!resetEmail) {
      setResetMessage("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Please check your inbox.");
      setResetEmail("");
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage("");
      }, 3000);
    } catch (error: any) {
      switch (error.code) {
        case "auth/invalid-email":
          setResetMessage("Please enter a valid email address.");
          break;
        case "auth/user-not-found":
          setResetMessage("No account found with this email.");
          break;
        default:
          setResetMessage("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-4">
        <div className="flex flex-col items-center w-full max-w-2xl text-center px-3 py-4">
          
          {/* Main Title and Logo */}
          <div className="mb-4">
            <div className="mb-3 flex justify-center">
              <img
                alt="Juta Software Logo"
                className="w-20 h-auto object-contain"
                src={logoUrl}
                onError={(e) => {
                  console.error('Logo failed to load:', logoUrl);
                  // Fallback to logo2 if logo fails
                  e.currentTarget.src = logoUrl2;
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign in to your XYZ AI Bot account to continue
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-full max-w-sm">
            
            {/* Sign In Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  Email Address
                </label>
                <FormInput
                  type="email"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  Password
                </label>
                <FormInput
                  type="password"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button 
                  onClick={() => setShowResetModal(true)} 
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                variant="primary"
                className="w-full px-3 py-1.5 text-sm font-semibold rounded-md hover:shadow-md transition-all duration-200"
                onClick={handleSignIn}
              >
                Sign In
              </Button>

              {/* Error Message */}
              {error && (
                <div className="p-1.5 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-1 bg-white dark:bg-gray-800 text-gray-500">New to XYZ AI Bot?</span>
              </div>
            </div>

            {/* Register Button */}
            <Button
              variant="outline-secondary"
              className="w-full px-3 py-1.5 text-sm font-semibold rounded-md border-2 transition-all duration-200"
              onClick={handleStartFreeTrial}
            >
              Create New Account
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Secure access to your business dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-full max-w-sm mx-2">
            <div className="text-center mb-3">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Reset Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Enter your email to receive a password reset link
              </p>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">
                  Email Address
                </label>
                <FormInput
                  type="email"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              {resetMessage && (
                <div className={`p-1.5 rounded-md text-xs ${
                  resetMessage.includes("sent") 
                    ? "bg-green-50 border border-green-200 text-green-700" 
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  {resetMessage}
                </div>
              )}

              <div className="flex gap-1.5 pt-1">
                <Button
                  variant="outline-secondary"
                  className="flex-1 px-2 py-1.5 rounded-md border-2 transition-all duration-200 text-sm"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetMessage("");
                    setResetEmail("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 px-2 py-1.5 rounded-md text-sm"
                  onClick={handleForgotPassword}
                >
                  Send Reset Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Main;