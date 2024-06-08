import { Toaster } from "sonner";
import ChatApp from "./components/chat-app";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./lib/firebase";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser === null) {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser]);

  return (
    <>
      <ChatApp />
      <Toaster
        position="top-right"
        toastOptions={{ className: "bg-[#0b121590] text-white" }}
      />
    </>
  );
}

export default App;
