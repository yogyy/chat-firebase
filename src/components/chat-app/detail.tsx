import { auth, db } from "@/lib/firebase";
import { Avatar } from "../ui/avatar";
import { useChat, useUser } from "@/hooks/use-redux";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { changeBlock } from "@/state/chat/chat-slice";

export const Detail = () => {
  const { user, isReceiverBlocked, isCurrentUserBlocked } = useChat();
  const { currentUser } = useUser();
  const dispatch = useDispatch();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser?.id as string);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      dispatch(changeBlock());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="scroller hidden flex-1 basis-1/4 overflow-y-scroll 2xl:block">
      <div className="flex flex-col items-center gap-5 border-b border-[#dddddd35] px-5 py-7">
        <Avatar
          className="h-24 w-24"
          src={user?.avatar}
          alt={user?.username.concat("'s avatar")}
        />
        <h1>{user?.username}</h1>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info flex flex-col gap-7 p-5">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <ChevronDown className="size-6" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <ChevronDown className="size-6" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <ChevronDown className="size-6" />
          </div>
          {/* <div className="photo-chat"></div> */}
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <ChevronUp className="size-6" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
              ? "User blocked"
              : "Block User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};
