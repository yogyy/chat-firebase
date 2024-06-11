import { useState } from "react";
import { db } from "@/lib/firebase";
import { UserType } from "@/types";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUser } from "@/hooks/use-redux";
import { Avatar } from "../ui/avatar";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  close: () => void;
}

export const AddUser = ({ close, isOpen }: Props) => {
  const { currentUser } = useUser();
  const [user, setUser] = useState<UserType | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");

    if (username === currentUser?.username) {
      return toast.error("Cannot search your own username");
    }

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        toast.error("user not found");
      } else {
        setUser(querySnapshot.docs[0].data() as UserType);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user?.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser?.id,
          updatedAt: Date.now(),
          senderId: user?.id,
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser?.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user?.id,
          updatedAt: Date.now(),
          senderId: currentUser?.id,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
        __demoMode
      >
        <div className="fixed inset-0 z-10 flex w-screen items-center justify-center transition-all duration-300">
          <div className="flex h-full w-full items-center justify-center bg-[#0b121580] p-4 backdrop-blur-sm md:h-[90dvh] md:w-4/5 md:rounded-xl lg:w-[40%]">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="w-full max-w-md rounded-xl">
                <DialogTitle
                  as="h3"
                  className="text-base/7 font-medium text-white"
                >
                  Add New User
                </DialogTitle>
                <div className="w-full rounded-lg p-5">
                  <form className="flex gap-5 p-2.5" onSubmit={handleSearch}>
                    <input
                      type="text"
                      name="username"
                      placeholder="Search username"
                      className="w-max flex-1 rounded-xl border-none bg-[#53535380] px-3 outline-none disabled:cursor-not-allowed"
                    />
                    <button className="rounded-lg bg-[#1a73e8] p-2.5 px-3">
                      Search
                    </button>
                  </form>

                  {user && (
                    <div className="flex items-center justify-between border-t border-[#dddddd35] py-6">
                      <div className="flex items-center gap-5">
                        <Avatar
                          src={user.avatar}
                          alt={user.username.concat(" avatar")}
                        />
                        <span>{user.username}</span>
                      </div>
                      <button
                        onClick={handleAdd}
                        className="rounded-xl bg-[#53535380] p-2.5 px-3 hover:bg-[#535353]"
                      >
                        Add User
                      </button>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
