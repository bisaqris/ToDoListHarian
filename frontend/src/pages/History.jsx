import React from "react";
import { useTodos } from "../context/TodoContext";

export default function History() {
  const { todos } = useTodos();

  const historyItems = todos.filter(
    (todo) => todo.status === "completed" || todo.completed,
  );

  return (
    <section className="w-screen p-6">
      <div className="w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6  md:p-8">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            History Activity
          </h1>
          <p className="text-gray-500 mt-1">
            Daftar task yang telah diselesaikan.
          </p>
        </div>

        <div className="space-y-4">
          {historyItems && historyItems.length > 0 ? (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg flex justify-between items-center bg-gray-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-700 line-through">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="text-sm font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  Selesai
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Belum ada riwayat aktivitas yang tercatat.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
