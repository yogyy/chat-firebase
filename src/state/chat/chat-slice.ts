import { UserType } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  chatId: string | null;
  user: UserType | null;
  isCurrentUserBlocked: boolean;
  isReceiverBlocked: boolean;
}

const initialState: ChatState = {
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    changeChat: (
      state,
      action: PayloadAction<{
        chatId: string;
        user: UserType;
        currentUser: UserType;
      }>,
    ) => {
      const currentUser = action.payload.currentUser;
      const user = action.payload.user;

      if (user.blocked.includes(currentUser.id)) {
        state.chatId = action.payload?.chatId;
        state.user = action.payload.user;
        state.isCurrentUserBlocked = true;
        state.isReceiverBlocked = false;
      } else if (currentUser.blocked.includes(user.id)) {
        state.chatId = action.payload.chatId;
        state.user = user;
        state.isCurrentUserBlocked = false;
        state.isReceiverBlocked = true;
      } else {
        state.chatId = action.payload.chatId;
        state.user = user;
        state.isCurrentUserBlocked = false;
        state.isReceiverBlocked = false;
      }
    },
    changeBlock: (state) => {
      state.isReceiverBlocked = !state.isReceiverBlocked;
    },
    resetChat: (state) => {
      state.chatId = null;
      state.user = null;
      state.isCurrentUserBlocked = false;
      state.isReceiverBlocked = false;
    },
  },
});

export const { changeChat, changeBlock, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
