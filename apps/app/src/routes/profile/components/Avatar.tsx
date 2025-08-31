import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

export const Avatar = ({
  photoURL,
  size = 64,
}: {
  photoURL: string | null;
  size?: number;
}) => {
  const box = [
    "flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "bg-white",
    "border",
    "border-gray-200",
    "overflow-hidden",
  ];

  const px = { width: `${size}px`, height: `${size}px` };

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt="avatar"
        style={px}
        className={clsx(box, "object-cover")}
      />
    );
  }

  return (
    <div style={px} className={clsx(box, "text-gray-400")}>
      <FontAwesomeIcon icon={faCircleUser} className="size-3/5" />
    </div>
  );
};
