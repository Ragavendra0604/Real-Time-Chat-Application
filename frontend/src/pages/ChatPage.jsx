import { useAuthStore } from "../store/useAuthStore";

function ChatPage() {
  const { authUser, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className='bg-slate-800 p-6 rounded-lg shadow-lg text-white max-w-md w-full text-center'>
      <h1 className='text-3xl font-bold mb-4'>Welcome to Chat</h1>
      
      {/* Display user's name if available */}
      {authUser && <p className='text-xl mb-6'>Hello, {authUser.fullName}!</p>}
      
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 w-full'
      >
        Logout
      </button>
    </div>
  );
}

export default ChatPage;