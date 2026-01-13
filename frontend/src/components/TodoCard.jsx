import { useState } from "react";
import { Edit2, Trash2, CheckCircle2, Circle, Calendar, Clock } from "lucide-react";
import { CategoryBadge } from "./badges/CategoryBadge";
import { PriorityBadge } from "./badges/PriorityBadge";

export const TodoCard = ({ todo, onEdit, onDelete, onToggle }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${
        todo.completed ? 'border-green-500 opacity-75' : 'border-blue-500'
      }`}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(todo.id)}
            className="mt-1 flex-shrink-0"
          >
            {todo.completed ? (
              <CheckCircle2 className="text-green-500" size={24} />
            ) : (
              <Circle className="text-gray-400 hover:text-blue-500" size={24} />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 mb-1 ${todo.completed ? 'line-through' : ''}`}>
              {todo.title}
            </h3>
            
            {todo.description && (
              <p className="text-sm text-gray-600 mb-2">{todo.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-2">
              <CategoryBadge categoryId={todo.category} />
              <PriorityBadge priority={todo.priority} />
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(todo.dueDate).toLocaleDateString('id-ID')}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {todo.dueTime}
              </span>
            </div>

            {todo.tags && todo.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {todo.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(todo)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 animate-slideUp">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Hapus To-Do?</h3>
            <p className="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus "{todo.title}"? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(todo.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};