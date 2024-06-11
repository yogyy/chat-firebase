import ChatApp from "./components/chat-app";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return auth.currentUser !== null && <ChatApp />;
}

export default App;
