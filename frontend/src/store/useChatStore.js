import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
    onlineUsers: [],

    setOnlineUsers: (users) => set({ onlineUsers: users }),

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
            const res = await axiosInstance.get("/messages/chats");
            set({chats: res.data});
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to load chats.";
			toast.error(errorMessage);        
        } finally {
            set({ isUsersLoading: false});
        }
    },

    getMessagesByUserId: async (userId) => {
        set({ isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser } = get();
        const { authUser } = useAuthStore.getState();

        if (!selectedUser) return toast.error("No user selected to send a message to.");

        const tempId = `temp_${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };

        set((state) => ({ messages: [...state.messages, optimisticMessage] }));

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            const newMessage = res.data;

            set((state) => ({
                messages: state.messages.map((msg) => (msg._id === tempId ? newMessage : msg)),
            }));
        } catch (error) {
            set((state) => ({
                messages: state.messages.filter((msg) => msg._id !== tempId),
            }));
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },

    updateUserInStore: (updatedUser) => {
        set((state) => ({
            allContacts: state.allContacts.map(contact => 
                contact._id === updatedUser._id ? updatedUser : contact
            ),
            chats: state.chats.map(chat => 
                chat._id === updatedUser._id ? updatedUser : chat
            ),
            selectedUser: state.selectedUser?._id === updatedUser._id ? updatedUser : state.selectedUser,
        }));
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled, getMyChatPartners } = get();
        const socket = useAuthStore.getState().socket;

        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
            getMyChatPartners();

            if (selectedUser?._id === newMessage.senderId) {
                set((state) => ({ messages: [...state.messages, newMessage] }));

                if (isSoundEnabled) {
                    const notificationSound = new Audio("/sounds/notification.mp3");
                    notificationSound.currentTime = 0;
                    notificationSound.play().catch((e) => console.log("Audio play failed:", e));
                }
            }
        });
    },

    unsubscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    }
}));