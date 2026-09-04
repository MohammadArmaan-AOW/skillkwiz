"use client";

import type React from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLogin: (userType: "employer" | "employee") => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [userType, setUserType] = useState<"employer" | "employee">(
    "employee",
  );

  const [showPassword, setShowPassword] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 48,
      scale: prefersReducedMotion ? 1 : 0.92,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 22,
        staggerChildren: prefersReducedMotion ? 0 : 0.07,
        delayChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 16,
      scale: prefersReducedMotion ? 1 : 0.97,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin(userType);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="w-full rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.03] p-6 text-primary-foreground shadow-xl shadow-black/20 backdrop-blur-xl sm:p-8"
    >
      {/* Heading */}
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-primary-gradient">Login</span>
        </h1>

        <p className="mt-2 text-sm text-primary-foreground/65 sm:text-base">
          Sign in to access your account
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Type */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3"
        >
          {/* Employee */}
          <button
            type="button"
            onClick={() => setUserType("employee")}
            className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 ${
              userType === "employee"
                ? "border-secondary bg-secondary text-secondary-foreground shadow-sm"
                : "border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground/65 hover:border-primary-foreground/20 hover:bg-primary-foreground/10"
            }`}
          >
            {userType === "employee" && (
              <motion.span
                layoutId="user-type-indicator"
                className="absolute inset-0 -z-0 bg-secondary"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            <span className="relative z-10">Employee</span>
          </button>

          {/* Employer */}
          <button
            type="button"
            onClick={() => setUserType("employer")}
            className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 ${
              userType === "employer"
                ? "border-secondary bg-secondary text-secondary-foreground shadow-sm"
                : "border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground/65 hover:border-primary-foreground/20 hover:bg-primary-foreground/10"
            }`}
          >
            {userType === "employer" && (
              <motion.span
                layoutId="user-type-indicator"
                className="absolute inset-0 -z-0 bg-secondary"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            <span className="relative z-10">Employer</span>
          </button>
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-primary-foreground/85"
          >
            Email
          </label>

          <div className="group relative">
            <Mail
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-foreground/40 transition-colors duration-200 group-focus-within:text-secondary"
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 py-3 pl-10 pr-4 text-sm text-primary-foreground outline-none transition-all duration-200 placeholder:text-primary-foreground/35 focus:border-secondary/60 focus:bg-primary-foreground/10 focus:ring-2 focus:ring-secondary/15"
              required
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-primary-foreground/85"
          >
            Password
          </label>

          <div className="group relative">
            <Lock
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-foreground/40 transition-colors duration-200 group-focus-within:text-secondary"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 py-3 pl-10 pr-11 text-sm text-primary-foreground outline-none transition-all duration-200 placeholder:text-primary-foreground/35 focus:border-secondary/60 focus:bg-primary-foreground/10 focus:ring-2 focus:ring-secondary/15"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40 transition-colors hover:text-secondary focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Forgot Password */}
        <motion.div variants={itemVariants} className="text-right">
          <a
            href="#"
            className="text-sm text-secondary transition-colors hover:text-accent"
          >
            Forgot Password?
          </a>
        </motion.div>

        {/* Login Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="w-full rounded-lg bg-primary-gradient px-4 py-3 font-medium text-primary-foreground shadow-md transition-all duration-300 hover:opacity-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:ring-offset-2 focus:ring-offset-background"
          >
            Login
          </motion.button>
        </motion.div>

        {/* Sign Up */}
        <motion.div variants={itemVariants} className="pt-1 text-center">
          <p className="text-sm text-primary-foreground/60">
            Don't have an account?{" "}
            <a
              href="#"
              className="font-medium text-secondary transition-colors hover:text-accent"
            >
              Sign Up
            </a>
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
}