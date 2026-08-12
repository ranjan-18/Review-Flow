# Review-Flow

**ReviewFlow AI** is an automated multi-tenant customer feedback interceptor and review generation engine powered by Express.js, Node.js, MongoDB Atlas, and React + Vite.

---

## 🚀 Key Features

- **MongoDB Atlas Database**: Live MongoDB cloud integration with automated seeding fallback.
- **Multi-Tenant Dashboards**:
  - **Admin Portal** (`:5174/admin/`): Full system overview, multi-location manager, QR code flyer builder, and centralized feedback console.
  - **Shop Owner Portal** (`:5175/owner/`): Scope-locked dashboard for shop managers to monitor metrics, ratings breakdown, and private feedbacks.
  - **Customer Funnel App** (`:5173/`): Mobile-first QR scanning interface with high-rating Google redirects and low-rating private feedback routing.
- **Health Check API**: `/api/health` endpoint returning real-time service and MongoDB connection status.
- **Rate Limiting & Security**: Protection against spam/abuse with `express-rate-limit` and HTTP cookie session JWT authentication.

---

## 🛠️ Environment Configuration (`.env`)

Create a `.env` file in the root directory (see `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.pnjvds9.mongodb.net/review_flow?retryWrites=true&w=majority
JWT_SECRET=super_secret_key_reviewflow_123!
ADMIN_USER=admin
ADMIN_PASS=admin123
NODE_ENV=development
```

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Environment
```bash
npm run dev
```

This starts all four services concurrently:
- **API Server**: `http://localhost:5000/api`
- **Health API**: `http://localhost:5000/api/health`
- **Customer Funnel**: `http://localhost:5173/`
- **Admin Dashboard**: `http://localhost:5174/admin/`
- **Shop Owner Dashboard**: `http://localhost:5175/owner/`

---

## 📡 API Endpoints

- `GET /api/health` - Server & MongoDB health status
- `POST /api/auth/login` - Authenticate admin or shop owner
- `GET /api/businesses` - Fetch business locations (RBAC filtered)
- `POST /api/feedbacks` - Submit private customer feedback
- `GET /api/feedbacks` - Retrieve private feedback logs
- `PUT /api/feedbacks/:id/status` - Update feedback resolution status (`pending`, `contacted`, `resolved`)
