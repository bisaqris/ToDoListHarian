import { priorities } from "../../utils/constants";
import { Star } from "lucide-react";

export const PriorityBadge = ({ priority }) => {
  const p = priorities.find(pr => pr.id === priority) || priorities[0];

  const colors = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[p.color]}`}>
      <Star size={12} />
      {p.name}
    </span>
  );
};
