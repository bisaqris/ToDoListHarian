import { LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();

  return (

    
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto min-h-16 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            To-Do List Harian
          </h1>
          <p className="text-xs text-gray-500">Personal Todo list harian</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            {isAdmin ? <ShieldCheck size={18} className="text-blue-600" /> : <User size={18} />}
            <span>{user?.name}</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {user?.roles?.join(", ")}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};
