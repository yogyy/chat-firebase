import { ChatList } from "./chat-list";
import { UserInfo } from "./user-info";

export const List = () => {
  return (
    <div className="flex w-full flex-col flex-wrap border-[#dddddd35] lg:basis-1/4 lg:border-r">
      <UserInfo />
      <ChatList />
    </div>
  );
};
