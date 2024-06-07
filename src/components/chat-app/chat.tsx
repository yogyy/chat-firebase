import { useEffect, useRef, useState } from "react";
import { Avatar } from "../ui/avatar";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useChat, useUser } from "@/hooks/use-redux";
import { cn, toDate } from "@/lib/utils";
import upload from "@/lib/upload";
import { ChatTypes, MessageType } from "@/types";
import { useDispatch } from "react-redux";
import { changeShowDetail } from "@/state/chat/chat-slice";

export const Chat = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChat();
  const { currentUser } = useUser();
  const [chat, setChat] = useState<ChatTypes>();
  const [text, setText] = useState("");
  const [img, setImg] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });

  const endRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "instant" });
  }, [chatId, chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId!), (res) => {
      setChat(res.data() as ChatTypes);
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const sendChat = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId!), {
        messages: arrayUnion({
          senderId: currentUser?.id,
          text,
          createdAt: new Date(),
          img: imgUrl ?? null,
        }),
      });

      const userIDs = [currentUser?.id, user?.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id as string);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const { chats } = userChatsData as { chats: MessageType[] };
          const chatIndex = chats.findIndex((c) => c.chatId === chatId);

          chats[chatIndex].lastMessage = text;
          chats[chatIndex].isSeen = id === currentUser?.id ? true : false;
          chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats,
          });
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      endRef.current?.scrollIntoView({ behavior: "instant" });
    }

    setText("");
    setImg({
      file: null,
      url: "",
    });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (img.url.length !== 0) {
      URL.revokeObjectURL(img.url);
      console.log("revoke", img.url);
    }

    if (e.target.files?.[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  return (
    <div className="relative flex h-full flex-col border-r border-[#dddddd35] md:basis-3/4">
      <div className="flex items-center justify-between border-b border-[#dddddd35] p-5">
        <div
          className="flex items-center gap-5 "
          onClick={() => dispatch(changeShowDetail())}
        >
          <Avatar src={user?.avatar} alt={user?.username.concat("'s avatar")} />
          <div className="flex flex-col gap-[5px]">
            <span className="text-lg font-bold">{user?.username}</span>
            <p className="text-sm font-light text-[#a5a5a5]">apantuh</p>
          </div>
        </div>
        <div className="flex gap-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div className="scroller relative flex flex-1 flex-col gap-5 overflow-y-scroll p-5 [&>.own]:self-end">
        {chat?.messages.map((msg) => (
          <div
            className={cn(
              "flex w-fit max-w-[70%] flex-row gap-5",
              msg.senderId === currentUser?.id ? "message own" : "message",
            )}
            onClick={() => console.log(chat)}
            key={msg.createdAt.seconds}
          >
            {msg.senderId !== currentUser?.id && <Avatar className="h-7 w-7" />}
            <div
              className={cn(
                "flex w-fit flex-1 flex-col gap-2",
                msg.senderId === currentUser?.id ? "items-end" : "item-start",
              )}
            >
              {msg.img && (
                <img
                  src={msg.img}
                  alt={msg.senderId.concat(" img")}
                  className="max-w-80 rounded-lg"
                />
              )}
              <p
                className={cn(
                  "relative flex w-fit gap-3 rounded-lg bg-[#5183fe] px-3 py-3 pr-10",
                )}
              >
                {msg.text}
                <span className="absolute bottom-2 right-2 self-end justify-self-end text-xs opacity-80">
                  {toDate(msg.createdAt.seconds)}
                </span>
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="flex items-center justify-between gap-5 border-t border-[#dddddd35] p-5">
        <div className="flex gap-5 *:cursor-pointer">
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImage}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            accept="image/*"
          />
          <label htmlFor="file">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
              aria-label="image"
            >
              <path
                fillRule="evenodd"
                d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-label="camera"
          >
            <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
            <path
              fillRule="evenodd"
              d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-label="microphone"
          >
            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
            <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Type a message."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className="flex-1 border-none bg-[#11192880] p-5 outline-none disabled:cursor-not-allowed"
        />
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-label="emoji"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <button
          onClick={sendChat}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className="cursor-pointer rounded-md border-none bg-[#5183fe] px-5 py-2.5 disabled:cursor-not-allowed disabled:bg-[#5183feb4]"
        >
          Send
        </button>
      </div>
      {img.url !== "" && (
        <div className="absolute z-10 h-full w-full bg-[#0b121590] p-10 backdrop-blur-[9px]">
          <button
            className="p-3"
            onClick={() => setImg({ file: null, url: "" })}
          >
            close
          </button>
          <div className="relative flex max-h-[70%] w-full justify-center py-5">
            <img src={img.url} alt="" className="object-contain" />
          </div>
          <div className="flex justify-center gap-3">
            <input
              type="text"
              placeholder="add a description"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
              className="w-3/4 rounded-lg border-none bg-[#d5d8dd80] p-3 outline-none disabled:cursor-not-allowed"
            />
            <button
              onClick={sendChat}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
              className="cursor-pointer rounded-md border-none bg-[#5183fe] px-5 py-2.5 disabled:cursor-not-allowed disabled:bg-[#5183feb4]"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
