Aplikasi To-Do List harian yang dibangun dengan React dan Express, menggunakan PostgreSQL sebagai database.

## 🚀 Tech Stacks

### Frontend
- **React 19** - JavaScript library untuk membangun UI
- **Vite** - Build tool dan development server yang cepat
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database relasional untuk CRUD todo
- **pg** - PostgreSQL client untuk Node.js
- **JWT + RBAC** - Login, role admin/user, dan proteksi endpoint
- **CORS** - Cross-Origin Resource Sharing

## 📁 Project Structure

```
ToDoListHarian/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx          # Statistics & progress bar
│   │   │   ├── FilterBar.jsx          # Search & filter controls
│   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   ├── TodoCard.jsx           # Individual todo item
│   │   │   ├── TodoForm.jsx           # Add/edit todo modal
│   │   │   └── badges/
│   │   │       ├── CategoryBadge.jsx
│   │   │       └── PriorityBadge.jsx
│   │   ├── context/
│   │   │   └── TodoContext.jsx        # Global state management
│   │   ├── utils/
│   │   │   └── constants.js           # Categories & priorities
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # Entry point
│   │   ├── index.css                  # Global styles & animations
│   │   └── App.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js            # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   └── todo.controller.js     # Request handlers
│   │   ├── models/
│   │   │   └── todo.model.js          # Data schema
│   │   ├── routes/
│   │   │   └── todo.routes.js         # API routes
│   │   ├── services/
│   │   │   └── todo.service.js        # Business logic
│   │   ├── utils/
│   │   │   └── response.js            # Response formatter
│   │   └── index.js                   # Server entry point
│   ├── package.json
│   ├── database/
│   │   └── schema.sql                 # SQL schema for todos table
│   └── .env                           # Environment variables (gitignored)
│
└── .gitignore
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js (v14 atau lebih tinggi)
- npm
- PostgreSQL aktif di Laragon

### Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd ToDoListHarian
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Setup Frontend**
```bash
cd frontend
npm install
```

4. **Konfigurasi PostgreSQL Laragon**
   - Buat database bernama `todokpl_db`
   - Salin `backend/.env.example` menjadi `backend/.env`
   - Sesuaikan `DB_USER` dan `DB_PASSWORD` jika berbeda dari default Laragon/PostgreSQL Anda
   - Ganti `JWT_SECRET` dengan string panjang dan acak

### Detailed Backend Setup

1. **PostgreSQL Initialization**
   - Pastikan PostgreSQL Laragon berjalan
   - Buat database `todokpl_db`
   - Tabel `todos` akan dibuat otomatis saat backend start
   
2. **Backend Configuration**
   ```bash
   cd backend
   npm install
   ```

3. **File Structure untuk Backend**
   - `src/index.js` - Entry point server (port 5000)
   - `src/config/database.js` - PostgreSQL connection pool dan table initialization
   - `src/routes/todo.routes.js` - Define endpoints: GET, POST, PUT, DELETE
   - `src/controllers/todo.controller.js` - Handle request logic
   - `src/services/todo.service.js` - PostgreSQL database operations
   - `src/models/todo.model.js` - Todo data schema dan validation
   - `src/utils/response.js` - Standardized API response format

4. **Dependencies Backend**
   - express (v4.18.2) - Web framework
   - cors (v2.8.5) - Enable cross-origin requests
   - pg (v8.20.0) - PostgreSQL client
   - nodemon (dev) - Auto-reload server saat development

### Detailed Frontend Setup

1. **React + Vite Setup**
   ```bash
   cd frontend
   npm install
   ```

2. **File Structure untuk Frontend**
   - `src/main.jsx` - Entry point dengan ReactDOM.createRoot
   - `src/App.jsx` - Main component dengan filtering logic
   - `src/context/TodoContext.jsx` - Global state management + API calls
   - `src/components/` - Reusable components
     - `Navbar.jsx` - Navigation header (sticky)
     - `Dashboard.jsx` - Statistics & progress bar
     - `FilterBar.jsx` - Search & filter controls
     - `TodoForm.jsx` - Modal form untuk create/edit
     - `TodoCard.jsx` - Individual todo display
     - `badges/CategoryBadge.jsx` - Category badge styling
     - `badges/PriorityBadge.jsx` - Priority badge styling
   - `src/utils/constants.js` - Categories, priorities, API URL
   - `src/index.css` - Global styles & animations (fadeIn, slideUp, progressFill)

3. **Dependencies Frontend**
   - react (v19.2.0) - UI library
   - react-dom (v19.2.0) - React DOM rendering
   - @tailwindcss/vite (v4.1.18) - Tailwind CSS integration
   - tailwindcss (v4.1.18) - CSS utility framework
   - lucide-react (v0.562.0) - Icon library
   - vite (v7.2.4) - Build tool & dev server

4. **Key Features di Frontend**
   - Context API untuk state management (todos, loading, filters)
   - Fetch API untuk komunikasi dengan backend
   - Form validation sebelum submit
   - Error handling dengan user alert
   - Responsive grid layout (mobile-first)
   - Custom CSS animations

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend (port 5000)**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (port 5173)**
```bash
cd frontend
npm run dev
```

Akses aplikasi web di: `http://localhost:5173`

### Production Build

**Backend**
```bash
cd backend
npm start
```

**Frontend**
```bash
cd frontend
npm run build
npm run preview
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/todos`

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
Header protected route: Authorization: Bearer <token>
```

### Get All Todos
```
GET /api/todos
Response: { success: true, data: [...] }
```

### Create Todo
```
POST /api/todos
Body: {
  title: string,
  description: string,
  category: string,
  priority: string,
  dueDate: string (YYYY-MM-DD),
  dueTime: string (HH:mm)
}
Response: { success: true, data: { id, ...} }
```

### Update Todo
```
PUT /api/todos/:id
Body: { ...fields to update }
Response: { success: true, data: { message: "Todo updated" } }
```

### Todo Status Automata
```
GET /api/todos/:id/transitions
Response: { success: true, data: [{ fromStatus, toStatus, event, label }] }

PATCH /api/todos/:id/status
Body: { event: "start" | "pause" | "complete" | "cancel" | "reopen" }
Response: { success: true, data: { id, status, statusName, completed, ... } }
```

### Delete Todo
```
DELETE /api/todos/:id
Response: { success: true, data: { message: "Todo deleted" } }
```

## ✨ Features

- ✅ **Login & Register** - Akun pengguna dengan password hash
- ✅ **JWT Token** - Proteksi API menggunakan Bearer token
- ✅ **RBAC** - Role admin dapat melihat semua todo, user hanya todo miliknya
- ✅ **Multi-table Database** - users, roles, permissions, categories, todos, activity logs
- ✅ **Admin Panel** - Lihat pengguna dan aktivitas terbaru
- ✅ **Automata Status Todo** - Workflow `pending -> in_progress -> completed/cancelled` divalidasi dari tabel transisi
- ✅ **Parameterized Utilities** - Helper reusable untuk row mapping dan parameterized SQL update
- ✅ **Create Todo** - Tambah todo baru dengan form modal
- ✅ **Read Todo** - Lihat semua todos di dashboard
- ✅ **Update Todo** - Edit todo yang sudah ada
- ✅ **Delete Todo** - Hapus todo dengan konfirmasi
- ✅ **Toggle Status** - Mark todo sebagai completed/pending
- ✅ **Search** - Cari todo berdasarkan title atau description
- ✅ **Filter** - Filter berdasarkan category, priority, dan status
- ✅ **Statistics Dashboard** - Tampilkan jumlah total, completed, dan progress
- ✅ **Responsive Design** - Mobile-friendly UI
- ✅ **Smooth Animations** - Fade-in dan slide-up effects

## 📊 Todo Data Structure

```javascript
{
  id: string,                    // PostgreSQL row ID
  title: string,                 // Required
  description: string,           // Optional
  category: string,              // 'work' | 'personal' | 'shopping' | 'health'
  priority: string,              // 'low' | 'medium' | 'high'
  status: string,                // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  statusName: string,            // Label status untuk UI
  dueDate: string,              // YYYY-MM-DD format
  dueTime: string,              // HH:mm format
  completed: boolean,            // Default: false
  createdAt: timestamp,          // Auto-generated
}
```

## 🎨 Categories & Priorities

### Categories
- Work
- Personal
- Shopping
- Health

### Priorities
- Low (Green badge)
- Medium (Yellow badge)
- High (Red badge)

## 📝 Development Notes

- Use `npm run dev` untuk development dengan hot reload
- Use `npm run build` untuk production build
- Use `npm run lint` untuk check code quality

## ✅ Requirement KPL

| Requirement | Status | Implementasi |
|---|---|---|
| Automata | Terpenuhi | Status todo dikelola sebagai finite-state machine melalui tabel `todo_statuses` dan `todo_status_transitions`. API `PATCH /api/todos/:id/status` hanya menerima event yang valid untuk status saat ini. |
| Table-driven construction | Terpenuhi | Role-permission, kategori, status, dan transisi status semua digerakkan oleh tabel database. Field update juga memakai field map. |
| Generics/Parameterization | Terpenuhi | SQL memakai parameter `$1`, `$2`, dan helper reusable `createRowMapper` serta `buildParameterizedUpdate` untuk mapping dan update yang dapat diparameterkan. |
| Runtime Config | Terpenuhi | Koneksi PostgreSQL, JWT secret, masa berlaku token, dan admin default dibaca dari `.env`. |
| API | Terpenuhi | REST API tersedia untuk auth, todo, status automata, users, categories, dan activity. |
| Code Reuse/Libraries | Terpenuhi | Struktur service/controller/routes/utils reusable, serta library Express, pg, React, Vite, Tailwind, Lucide, dan crypto Node.js. |
