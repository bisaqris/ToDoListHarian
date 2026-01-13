import { db } from "../config/firebase.js";
import { TodoModel } from "../models/todo.model.js";

const collection = db.collection("todos");

export const createTodo = async (data) => {
  const todo = TodoModel(data);
  const doc = await collection.add(todo);
  return { id: doc.id, ...todo };
};

export const getTodos = async () => {
  const snapshot = await collection.orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateTodo = async (id, data) => {
  await collection.doc(id).update(data);
};

export const deleteTodo = async (id) => {
  await collection.doc(id).delete();
};
