import { useState } from "react";
import { CheckCircle2, Lock, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AuthPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "admin@todokpl.local",
    password: "admin12345",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="px-6 py-10 lg:px-16 flex flex-col justify-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-blue-700 font-semibold mb-5">
            <CheckCircle2 size={22} />
            ToDo KPL Masyarakat
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-950 leading-tight mb-4">
            Kelola pekerjaan harian, kegiatan warga, dan layanan publik dalam satu tempat.
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Aplikasi ini sekarang mendukung akun pengguna, pembagian akses admin dan user, kategori publik, serta jejak aktivitas untuk transparansi kerja.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            {["Login aman dengan JWT", "RBAC admin dan user", "Riwayat aktivitas todo"].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-lg p-4 text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-16 flex items-center">
        <form onSubmit={submit} className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 w-full max-w-md mx-auto">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === "login" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg font-medium ${mode === "register" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Register
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === "login" ? "Masuk ke akun" : "Buat akun warga"}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Admin default: admin@todokpl.local / admin12345
          </p>

          {mode === "register" && (
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700">Nama</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg"
                placeholder="Nama lengkap"
              />
            </label>
          )}

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg"
              placeholder="email@contoh.com"
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg"
              placeholder="Minimal 8 karakter"
            />
          </label>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? "Memproses..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </section>
    </div>
  );
};
