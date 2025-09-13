import { Link } from "@tanstack/react-router";
import { Card } from "@cheering/ui";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type MenuCardProps = {
  to: string;
  label: string;
  icon: IconDefinition;
  description?: string;
  className?: string;
};

export const MenuCard = ({
  to,
  label,
  icon,
  description,
  className,
}: MenuCardProps) => {
  return (
    <Link to={to} className="block">
      <Card
        interactive
        className={`aspect-square ${className || ""}`}
        role="button"
        aria-label={label}
        aria-describedby={description ? `${to}-description` : ""}
      >
        <div className="h-full w-full flex flex-col items-center justify-center gap-3 p-4 text-gray-900">
          <FontAwesomeIcon
            icon={icon}
            className="h-8 w-8 opacity-90 group-hover:scale-105 transition-transform"
          />
          <div className="text-center">
            <div className="text-sm font-medium">{label}</div>
            {description && (
              <div
                id={`${to}-description`}
                className="text-xs text-gray-500 mt-1"
              >
                {description}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
