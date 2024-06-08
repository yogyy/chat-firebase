import { useEffect, useState } from "react";
import { Avatar } from "../ui/avatar";
import { useUser } from "@/hooks/use-redux";
import { db } from "@/lib/firebase";
import { AddUser } from "./add-user";
import { MessageType, UserType } from "@/types";
import { useDispatch } from "react-redux";
import { changeChat } from "@/state/chat/chat-slice";
import { cn } from "@/lib/utils";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { MagnifyingGlass, Plus } from "../icons";

interface Chats extends MessageType {
  user: UserType | undefined;
}

export const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState<Chats[] | undefined>([]);
  const { currentUser } = useUser();

  const dispatch = useDispatch();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser!.id),
      async (res) => {
        const items = res.data()?.chats as MessageType[];

        const promises = items?.map(async (item) => {
          const userDocRef = doc(db, "users", item?.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(chatData as Chats[]);
        // console.log(chatData);
      },
    );

    return () => {
      unSub();
    };
  }, [currentUser]);

  const handleSelectChat = async (chat: Chats) => {
    const userChats = chats?.map((item) => {
      const { user, ...rest } = item;
      return rest;
    }) as Chats[];

    const chatIndex = userChats?.findIndex(
      (item) => item.chatId === chat.chatId,
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser?.id as string);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      dispatch(
        changeChat({
          chatId: chat.chatId,
          currentUser: currentUser!,
          user: chat.user!,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  //  TODO:
  // make filtered for search chat
  // const filteredChat = chats?.filter((c) =>
  //   c.user?.username.toLowerCase().includes(input.toLowerCase()),
  // );

  return (
    <div className="flex-1">
      <div className="items flex gap-5 p-5">
        <div className="flex flex-1 items-center gap-5 rounded-lg bg-[#11192880] p-2.5">
          <MagnifyingGlass aria-label="search" />
          <input
            className="flex-1 border-none bg-transparent outline-none"
            type="text"
            placeholder="Search"
          />
        </div>
        <button
          className="flex cursor-pointer items-center justify-center rounded-lg bg-[#11192880] p-2"
          onClick={() => setAddMode((prev) => !prev)}
          type="button"
        >
          <Plus className="size-7" aria-label="Add" />
        </button>
      </div>
      <div className="scroller overflow-y-scroll">
        {chats?.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => handleSelectChat(chat)}
            className={cn(
              "flex cursor-pointer items-center gap-5 border-b border-[#dddddd35] px-4 py-3",
              chat.isSeen === true ? "bg-transparent" : "bg-[#5183fe]",
            )}
          >
            <Avatar
              src={chat.user?.avatar}
              alt={chat.user?.username.concat("'s avatar")}
            />
            <div className="flex flex-col gap-2.5">
              <span className="font-medium">{chat.user?.username}</span>
              <p className="text-sm font-light">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
      {addMode && <AddUser isOpen={addMode} close={() => setAddMode(false)} />}
    </div>
  );
};
