import { useSelector } from "react-redux";
import { Avatar } from "@/components/ui/avatar";
import { RootState } from "@/state/store";
import { EllipsisHorizontal, PencilSquare, VideoCam } from "../icons";

export const UserInfo = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-5">
        <Avatar
          src={currentUser?.avatar}
          alt={currentUser?.username.concat(" picture")}
        />
        <h2>{currentUser?.username}</h2>
      </div>
      <div className="flex gap-5 *:cursor-pointer">
        <EllipsisHorizontal />
        <VideoCam />
        <PencilSquare />
      </div>
    </div>
  );
};
