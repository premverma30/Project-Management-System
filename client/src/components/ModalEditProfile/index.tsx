"use client";

import React, { useState, useEffect } from "react";
import { useUpdateUserMutation } from "@/state/api";
import { Modal } from "@/components/ui/Modal";
import { User } from "@/state/api";
import { X, AlertCircle, CheckCircle } from "lucide-react";

interface ModalEditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  userId: string;
}

export const ModalEditProfile: React.FC<ModalEditProfileProps> = ({
  isOpen,
  onClose,
  user,
  userId,
}) => {
  const [updateUser, { isLoading, isError, error, isSuccess }] = useUpdateUserMutation();
  
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [errors, setErrors] = useState<{ username?: string; email?: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });
    setErrors({});
    setSuccessMessage("");
  }, [user, isOpen]);

  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1500);
    }
  }, [isSuccess, onClose]);

  const validateForm = () => {
    const newErrors: { username?: string; email?: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 2) {
      newErrors.username = "Username must be at least 2 characters";
    } else if (formData.username.length > 50) {
      newErrors.username = "Username must not exceed 50 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateUser({
        userId,
        userData: {
          username: formData.username.trim(),
          email: formData.email.trim(),
        },
      }).unwrap();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Error Message */}
          {isError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {(error as any)?.data?.message || "Failed to update profile. Please try again."}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {successMessage}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
