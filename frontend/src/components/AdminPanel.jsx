import { Activity, Shield, Users } from "lucide-react";
import { useTodos } from "../context/TodoContext";

export const AdminPanel = () => {
  const { users, activities } = useTodos();

  return (
    <div className="grid lg:grid-cols-2 gap-4 mb-6">
      <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">Pengguna Terdaftar</h2>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                <Shield size={12} />
                {user.roles.join(", ")}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Aktivitas Terbaru</h2>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="border border-gray-100 rounded-lg p-3">
              <p className="font-medium text-gray-900">
                {activity.userName || "User"} {activity.action} todo
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
