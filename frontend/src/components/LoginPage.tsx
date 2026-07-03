import React, { useState } from "react";

type Role = "admin" | "guest";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      /* Save token to localStorage */
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      /* Redirect based on role */
      if (data.user.role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/home";
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4">
      
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight">
            Admin Portal
          </h1>
          <p className="text-base-content/50 text-sm mt-1">
            Subscription Management System
          </p>
        </div>

        {/* Card */}
        <div className="card bg-base-100 shadow-2xl border border-base-200">
          <div className="card-body p-8">

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error mb-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Role Toggle */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-base-content/70 text-xs uppercase tracking-wider">
                    Sign in as
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-base-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      role === "admin"
                        ? "bg-primary text-primary-content shadow-sm"
                        : "text-base-content/60 hover:text-base-content"
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("guest")}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      role === "guest"
                        ? "bg-primary text-primary-content shadow-sm"
                        : "text-base-content/60 hover:text-base-content"
                    }`}
                  >
                    Guest
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium text-base-content/70 text-xs uppercase tracking-wider">
                    Email address
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input input-bordered w-full focus:input-primary bg-base-200/50"
                />
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label pb-1 flex justify-between">
                  <span className="label-text font-medium text-base-content/70 text-xs uppercase tracking-wider">
                    Password
                  </span>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input input-bordered w-full focus:input-primary bg-base-200/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-2"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

            </form>
          </div>
        </div>

        <p className="text-center text-xs text-base-content/30 mt-6">
          Subscription Management System © {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}