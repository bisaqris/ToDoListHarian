import { categories } from "../../utils/constants";
import { useTodos } from "../../context/TodoContext";

export const CategoryBadge = ({ categoryId }) => {
  const { categories: dbCategories } = useTodos();
  const dbCat = dbCategories.find(c => c.code === categoryId);
  const cat = dbCat
    ? { ...dbCat, id: dbCat.code }
    : categories.find(c => c.id === categoryId) || categories[0];

  const colors = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    teal: "bg-teal-100 text-teal-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[cat.color] || colors.blue}`}>
      {cat.icon && <cat.icon size={12} />}
      {cat.name}
    </span>
  );
};
