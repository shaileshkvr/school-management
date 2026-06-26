# School Management System (Monorepo)

A modular, production-ready School Management System built using a decoupled React frontend and Node/Express backend, with PostgreSQL as the data store.

---

## 🚀 Tech Stack

### Frontend (`/client`)
- **Core**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS (modular design tokens and CSS variables)
- **Routing**: React Router DOM (role-based protected routes)
- **State**: Auth Session Context Provider

### Backend (`/server`)
- **Core**: Node.js, Express 5, TypeScript
- **Database ORM**: Prisma v7.8.0 with `@prisma/adapter-pg` driver adapter
- **Security**: JWT authentication stored in secure, HttpOnly cookies + Role-based access control (RBAC) middleware

---

## 📁 Repository Structure

```
.
├── client/                     # React Frontend App
│   ├── src/
│   │   ├── components/         # Reusable layouts & UI blocks
│   │   ├── context/            # AuthContext session provider
│   │   └── pages/              # Login, Admin, Teacher, Student dashboards
│   └── Dockerfile              # Multi-stage production Nginx container
├── server/                     # Node/Express Backend App
│   ├── src/
│   │   ├── config/             # Database pool connection setup
│   │   ├── controllers/        # Auth endpoints
│   │   ├── middleware/         # Security & RBAC checks
│   │   └── routes/             # Authentication routing
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma DB models
│   │   ├── seed.ts             # Modular seeder orchestrator
│   │   ├── seeders/            # Individual seeding modules
│   │   └── generators/         # Indian name, DOB, and password helpers
│   └── Dockerfile              # Production Node backend container
├── docker-compose.yml          # Multi-container local build setup
└── README.md                   # Project documentation
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v20+)
- pnpm (v11+)
- Docker & Docker Compose

### 1. Database Setup
Spin up the local PostgreSQL database using Docker Compose:
```bash
docker compose up -d school-postgres
```
This runs PostgreSQL on host port `9099` (configured inside `docker-compose.yml`).

### 2. Backend Server Configuration
Navigate to the `/server` directory:
```bash
cd server
pnpm install
```
Configure your environment file (`server/.env`):
```env
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
DATABASE_URL="postgresql://admin:myschoolpostgres@localhost:9099/school_management?schema=public"
```

Sync the database schema and generate the Prisma Client:
```bash
pnpm exec prisma migrate dev --name init
```

### 3. Seed Database
Seeding populates mock data, including realistic class age limits, Indian name distributions (70% unique first names, 40% unique surnames), historical attendance, fee invoices, global notices, and academic performance profiles across 4 exam phases (UT1, Half-yearly, UT2, Term-end):
```bash
pnpm exec prisma db seed
```
**Default Credentials:**
- **Admin**: `secureadmin@school.com` / `admin-security-key-2816`
- **Teacher**: `teacher@school.com` / `teacher123`
- **Student**: `student@school.com` / `student123`

### 4. Run Development Servers
Start the backend Express server:
```bash
pnpm run dev
```

Start the frontend Vite server:
```bash
cd ../client
pnpm install
pnpm run dev
```
The client will be running on `http://localhost:5173`.

---

## 🐳 Multi-Container Build Setup (Docker Compose)

To build and run the entire application (PostgreSQL database, Express backend, and React frontend served via Nginx) inside isolated Docker containers:

1. **Build and start the containers:**
   ```bash
   docker compose up --build -d
   ```
2. **Apply migrations and seed the database inside the container:**
   ```bash
   docker compose exec server pnpm exec prisma migrate dev --name init
   docker compose exec server pnpm exec prisma db seed
   ```
3. **Access the application:**
   - **Frontend**: `http://localhost:9090`
   - **Backend**: `http://localhost:9091`
   - **Database (from host)**: localhost port `9099`

### How the Docker setup works:
- **`school-postgres`**: Persists data locally via a Docker named volume (`postgres_data`).
- **`server`**: Built using a Node alpine base, generating and compiling Prisma schemas on startup. It connects to the database using Docker bridge network DNS: `school-postgres:5432`.
- **`client`**: Built in a multi-stage compilation stage and served using Nginx with client-side SPA routing support.
