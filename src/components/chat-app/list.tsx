import { ChatList } from "./chat-list";
import { UserInfo } from "./user-info";

export const List = () => {
  return (
    <div className="flex basis-1/4 flex-col border-r border-[#dddddd35]">
      <UserInfo />
      <ChatList />
    </div>
  );
};
