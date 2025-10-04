import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore.js";

export const useAuthStore = create((set, get) => ({
	authUser: null,
	isCheckingAuth: true,
	isSigningUp: false,
	isLoggingIn: false,
	isUpdatingProfile: false,

	checkAuth: async () => {
		try {
			const res = await axiosInstance.get("/auth/check");
			set({ authUser: res.data });
		} catch (error) {
			console.log("Error in authCheck: ", error);
			set({ authUser: null });
		} finally {
			set({ isCheckingAuth: false });
		}
	},

	signup: async (data) => {
		set({ isSigningUp: true });
		try {
			const res = await axiosInstance.post("/auth/signup", data);
			set({ authUser: res.data });
			toast.success("Account created successfully!!");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
			toast.error(errorMessage);
			console.error("Signup Error:", error);
		} finally {
			set({ isSigningUp: false });
		}
	},

	login: async (data) => {
		set({ isLoggingIn: true });
		try {
			const res = await axiosInstance.post("/auth/login", data);
			set({ authUser: res.data });
			toast.success("Logged in successfully!!");
		} catch (error) {
			// **FIXED ERROR HANDLING**
			const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
			toast.error(errorMessage);
			console.error("Login Error:", error);
		} finally {
			set({ isLoggingIn: false });
		}
	},

	logout: async () => {
		try {
			await axiosInstance.post("/auth/logout");
			toast.success("Logged out successfully");
		} catch (error) {
			toast.error("Error logging out");
			console.log("Logout error:", error);
		} finally {
			set({ authUser: null });
		}
	},

	updateProfile: async(data) => {
		set({isUpdatingProfile: true});
		try {
			const res = await axiosInstance.put("/auth/profile-update",data);
			const updatedUser = res.data;
			set({authUser:updatedUser});

			useChatStore.getState().updateUserInStore(updatedUser);
			toast.success("Profile updated successfully");
		} catch (error) {
			console.log("Error in update profile: ", error);
			const errorMessage = error.response?.data?.message || "Failed to update profile.";
			toast.error(errorMessage);
		} finally {
			set({isUpdatingProfile: false});
		}
	}
}));