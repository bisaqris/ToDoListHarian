import { LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="w-screen px-6 bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full mx-auto min-h-16 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <NavLink to="/">
            <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r bg-clip-text text-transparent from-[#b900bc] to-[#009cff]">
              Daily To-Do List
            </h1>
            <p className="text-xs text-gray-500">Personal Todo list harian</p>
          </NavLink>
        </div>

        <div className="flex flex-row justify-center gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-bold transition-colors duration-300 bg-linear-to-r from-[#b900bc] to-[#009cff] bg-clip-text ${
                isActive
                  ? "text-transparent"
                  : "text-gray-700 font-medium hover:font-semibold hover:text-transparent"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-bold transition-colors duration-300 bg-linear-to-r from-[#b900bc] to-[#009cff] bg-clip-text ${
                isActive
                  ? "text-transparent"
                  : "text-gray-700 font-medium hover:font-semibold hover:text-transparent"
              }`
            }
          >
            History
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            {isAdmin ? (
              <ShieldCheck size={18} className="text-blue-600" />
            ) : (
              <User size={18} />
            )}
            <span>{user?.name}</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {user?.roles?.join(", ")}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition transform duration-300"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};
