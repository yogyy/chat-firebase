import { useEffect, useRef, useState } from "react";
import { Microphone } from "./icons";
import upload from "@/lib/upload";
import { cn } from "@/lib/utils";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/hooks/use-redux";
import { MessageType } from "@/types";

interface VoiceNoteProps {
  chatId: string;
  userId: string;
}

export const VoiceNote = ({ chatId, userId }: VoiceNoteProps) => {
  const { currentUser } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder>();

  useEffect(() => {
    // Cleanup function to release resources when component unmounts
    return () => {
      recorderRef.current?.stop(); // Stop recording if ongoing
    };
  }, []);

  const startRecording = async () => {
    let audioUrl = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);

      recorderRef.current = recorder;
      recorder.ondataavailable = async (event) => {
        const audio = new File(
          [event.data],
          "voice_note_"
            .concat(new Date().toISOString().replace(/[:.]/g, "-"), ".")
            .concat(event.data.type.split(";")[0].split("/")[1]),
          { type: recorder.mimeType },
        );

        audioUrl = await upload(audio, "audio");
        console.log(audio);

        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser?.id,
            text: "",
            createdAt: new Date(),
            img: null,
            voice: audioUrl,
          }),
        });
      };

      const userIDs = [currentUser?.id, userId];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id as string);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const { chats } = userChatsData as { chats: MessageType[] };
          const chatIndex = chats.findIndex((c) => c.chatId === chatId);

          chats[chatIndex].lastMessage = "audio";
          chats[chatIndex].isSeen = id === currentUser?.id ? true : false;
          chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats,
          });
        }
      });

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current || recorderRef?.current!.state === "recording") {
      recorderRef.current.stop();
      recorderRef.current.stream.getTracks().forEach((tr) => tr.stop());
    }

    setIsRecording(false);
  };

  return (
    <Microphone
      onClick={isRecording ? stopRecording : startRecording}
      aria-label="microphone"
      className={cn(isRecording ? "text-rose-500" : "")}
    />
  );
};
