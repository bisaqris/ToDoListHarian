import { categories } from "../../utils/constants";

export const CategoryBadge = ({ categoryId }) => {
  const cat = categories.find(c => c.id === categoryId) || categories[0];

  const colors = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[cat.color]}`}>
      {cat.icon && <cat.icon size={12} />}
      {cat.name}
    </span>
  );
};
