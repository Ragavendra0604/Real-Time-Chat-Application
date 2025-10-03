import { Link } from "react-router-dom";

function ChatPage() {
  return (
    <div>
      <h1>Chat Page</h1>
      <nav>
        <Link to="/login">Login</Link> |<Link to="/signup">Signup</Link>
      </nav>
    </div>
  );
}

export default ChatPage;