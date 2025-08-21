"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // TODO: Implement actual password reset logic here
    console.log("Password reset request for:", email);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      // TODO: Handle success/error
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back to login link */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Powrót do logowania</span>
          </Link>

          {/* Success Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/60 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-2xl">
                <Check size={32} className="text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Email wysłany!
            </h1>
            
            <p className="text-slate-600 mb-6">
              Wysłaliśmy link do resetowania hasła na adres <strong>{email}</strong>. 
              Sprawdź swoją skrzynkę odbiorczą i kliknij w link, aby zresetować hasło.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Powrót do logowania
              </Link>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="block w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Wyślij ponownie
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to login link */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Powrót do logowania</span>
        </Link>

        {/* Forgot Password Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/60 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <span className="text-3xl">🔐</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Zapomniałeś hasła?
            </h1>
            <p className="text-slate-600">
              Podaj swój adres email, a wyślemy Ci link do resetowania hasła
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Adres email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-500"
                  placeholder="twoj@email.com"
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Wysyłanie...</span>
                </div>
              ) : (
                "Wyślij link resetujący"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Pamiętasz hasło?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
