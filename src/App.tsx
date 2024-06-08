import { Toaster } from "sonner";
import ChatApp from "./components/chat-app";

function App() {
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
