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
import {
  Camera,
  Information,
  Microphone,
  Photo,
  Telephone,
  VideoCam,
  XMark,
} from "../icons";

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
        imgUrl = await upload(img.file, "images");
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
    <div className="relative hidden md:basis-3/4 lg:flex">
      <div
        className={cn(
          "flex h-full w-full flex-col",
          img.url !== "" ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="flex items-center justify-between border-b border-[#dddddd35] p-5">
          <div
            className="flex items-center gap-5 "
            onClick={() => dispatch(changeShowDetail())}
          >
            <Avatar
              src={user?.avatar}
              alt={user?.username.concat("'s avatar")}
            />
            <div className="flex flex-col gap-[5px]">
              <span className="text-lg font-bold">{user?.username}</span>
              <p className="text-sm font-light text-[#a5a5a5]">apantuh</p>
            </div>
          </div>
          <div className="flex gap-5">
            <Telephone />
            <VideoCam />
            <Information />
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
              {msg.senderId !== currentUser?.id && (
                <Avatar className="h-7 w-7" src={user?.avatar} />
              )}
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
              className="hidden"
              onChange={handleImage}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
              accept="image/*"
            />
            <label htmlFor="file">
              <Photo aria-label="image" />
            </label>
            <Camera aria-label="camera" />
            <Microphone aria-label="microphone" />
          </div>
          <input
            type="text"
            placeholder="Type a message."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            className="w-max flex-1 rounded-xl border-none bg-[#11192880] p-2.5 pl-3 outline-none disabled:cursor-not-allowed"
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
      {img.url !== "" && (
        <div className="absolute z-10 flex h-full w-full justify-center rounded-r-xl p-10">
          <button
            className="absolute left-2 top-2 p-2"
            onClick={() => setImg({ file: null, url: "" })}
          >
            <span className="sr-only">close image</span>
            <XMark />
          </button>
          <div className="flex flex-col justify-center">
            <div className="relative flex max-h-[70%] w-full justify-center py-5">
              <img src={img.url} alt="" className="object-contain" />
            </div>
            <div className="flex justify-center gap-3 ">
              <input
                type="text"
                placeholder="add a description"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isCurrentUserBlocked || isReceiverBlocked}
                className="w-full rounded-xl border-none bg-[#11192880] p-2.5 pl-5 outline-none disabled:cursor-not-allowed"
              />
              <button
                onClick={sendChat}
                disabled={isCurrentUserBlocked || isReceiverBlocked}
                className="rounded-md border-none bg-[#5183fe] px-5 py-2.5 disabled:cursor-not-allowed disabled:bg-[#5183feb4]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
