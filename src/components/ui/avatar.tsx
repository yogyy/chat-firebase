import { cn } from "@/lib/utils";

export const Avatar = ({
  className,
  alt,
  src,
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img
      draggable={false}
      src={src ?? "https://avatars.githubusercontent.com/u/62535762?v=4"}
      alt={alt ?? "gweh"}
      className={cn("h-12 w-12 rounded-full object-cover", className)}
    />
  );
};
