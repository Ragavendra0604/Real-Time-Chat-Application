import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
        } catch (error) {
            console.log("Error in authCheck: ", error);
            set({authUser:null});
        } finally {
            set({ isCheckingAuth: false});
        }
    },

    signup: async(data) => {
        set({isSigningUp:true});
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser:res.data});

            toast.success("Account created successfully!!");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isSigningUp:false});
        }
    },

    // NEW LOGOUT FUNCTION
    logout: async () => {
        try {
            // This tells the backend to clear the session cookie
            await axiosInstance.post("/auth/logout");
            // This clears the user from the frontend state
            set({ authUser: null });
        } catch (error) {
            console.error("Logout failed: ", error);
            // Still clear the user from frontend state even if backend call fails
            set({ authUser: null });
        }
    }
}));