import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",

    toggleSound: () => {
        const newSoundState = !get().isSoundEnabled;
        localStorage.setItem("isSoundEnabled", newSoundState);
        set({isSoundEnabled: newSoundState});
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({selectedUser}),
    
    getAllContacts: async() => {
        set({isUsersLoading: true});

        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({allContacts: res.data});
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load contacts.";
			toast.error(errorMessage);
        } finally {
            set({ isUsersLoading: false});
        }
    },
    
    getMyChatPartners: async() => {
        set({isUsersLoading: true});

        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({chats: res.data});
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load chats.";
			toast.error(errorMessage);        
        } finally {
            set({ isUsersLoading: false});
        }
    },
}));