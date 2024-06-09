import { List } from "./list";
import { Chat } from "./chat";
import { Detail } from "./detail";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { fetchUserInfo } from "@/state/user/user-slice";
import { useChat, useUser } from "@/hooks/use-redux";

const ChatApp = () => {
  const { isLoading } = useUser();
  const { chatId, showDetail } = useChat();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      dispatch(fetchUserInfo(user?.uid));
    });

    return () => {
      unSub();
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center bg-[#0b121590] backdrop-blur-sm">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="content flex">
      <List />
      {chatId && <Chat />}
      {showDetail && <Detail />}
    </div>
  );
};

export default ChatApp;
