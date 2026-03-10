# InventoryPro — MERN Stack Inventory Management System

A full-stack inventory management application built with **MongoDB, Express.js, React, and Node.js**.

## 📁 Project Structure

```
inventorypro/
├── server/               # Node.js + Express backend
│   ├── index.js          # Server entry point
│   ├── seed.js           # Database seeder script
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   ├── models/
│   │   ├── User.js       # User schema
│   │   ├── Product.js    # Product schema
│   │   └── Category.js   # Category schema
│   └── routes/
│       ├── auth.js       # Login, register, profile
│       ├── products.js   # Full CRUD + quantity update
│       ├── categories.js # Full CRUD
│       └── dashboard.js  # Stats + charts data
├── client/               # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js         # Router + protected routes
│       ├── api.js         # Axios instance with auth
│       ├── index.css      # Global styles
│       ├── context/
│       │   └── AuthContext.js  # Auth state + login/logout
│       ├── components/
│       │   └── Sidebar.js      # Navigation sidebar
│       └── pages/
│           ├── AuthPage.js     # Login + Register
│           ├── Dashboard.js    # Stats + charts
│           ├── Products.js     # Product CRUD + quantity mgmt
│           └── Categories.js   # Category CRUD
├── package.json           # Root package (server deps)
└── .env.example           # Environment variables template
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/AbhishekThota/inventorypro.git
cd inventorypro

# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/inventorypro
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/inventorypro
```

### 3. Seed Demo Data (Optional)

```bash
node server/seed.js
```

This creates:
- Demo user: **admin@demo.com** / **password123**
- 5 categories (Electronics, Clothing, Office Supplies, Furniture, Food & Beverage)
- 13 sample products with varied stock levels

### 4. Run the App

**Development (both frontend + backend):**
```bash
npm run dev
```

**Production:**
```bash
cd client && npm run build
npm start
```

The frontend runs on `http://localhost:3000` and the API on `http://localhost:5000`.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | MongoDB + Mongoose | Document storage, flexible schema |
| **Backend** | Node.js + Express.js | REST API server |
| **Frontend** | React 18 + React Router | SPA user interface |
| **Auth** | JWT + bcrypt | Secure token-based authentication |
| **Charts** | Recharts | Dashboard visualizations |
| **HTTP** | Axios | API requests from frontend |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get token |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with search/filter/pagination) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/quantity` | Adjust stock quantity |
| DELETE | `/api/products/:id` | Delete product |

**Query params for GET /api/products:**
- `search` — search by name, SKU, supplier
- `category` — filter by category ID
- `status` — filter by status (active/inactive/discontinued)
- `page`, `limit` — pagination

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Stats + charts data |

---

## ✨ Features

- **Authentication** — JWT-based login/register, protected routes
- **Dashboard** — KPI cards (total products, inventory value, low/out-of-stock counts), pie chart (stock status), bar chart (products by category), low-stock alert table
- **Products** — Full CRUD, search, filter by category/status, pagination, quick quantity adjustment (add/remove/set)
- **Categories** — Full CRUD with custom color picker
- **Stock Alerts** — Automatic low-stock and out-of-stock detection based on configurable thresholds

---

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/inventorypro` |
| `JWT_SECRET` | Secret key for JWT signing | ⚠️ Required — change in production |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
