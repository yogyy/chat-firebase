import { RootState } from "@/state/store";
import { useSelector } from "react-redux";

export function useUser() {
  const { currentUser, isLoading } = useSelector(
    (state: RootState) => state.user,
  );

  return { currentUser, isLoading };
}

export function useChat() {
  const { chatId, isCurrentUserBlocked, isReceiverBlocked, user, showDetail } =
    useSelector((state: RootState) => state.chat);

  return { chatId, showDetail, isCurrentUserBlocked, isReceiverBlocked, user };
}
