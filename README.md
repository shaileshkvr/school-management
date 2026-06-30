# School Management System (Monorepo)

A modular, production-ready School Management System built using a decoupled React frontend and Node/Express backend, with PostgreSQL as the data store.

---

## 🚀 Tech Stack

### Frontend (`/client`)
- **Core**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS (modular design tokens and HSL customized CSS variables)
- **Routing**: React Router DOM (role-based protected routes and client-side SPA routing)
- **State**: Auth Session Context Provider + URL Query Search Parameters

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
│   │   ├── components/         # Reusable layouts & UI blocks (Sidebar, Header, ProtectedRoute)
│   │   ├── context/            # AuthContext session provider
│   │   ├── styles/             # Global index.css resets, theme sheets (cream.css, charcoal.css)
│   │   └── pages/              # Login, Admin, Teacher, Student dashboards & Admin Subpages
│   └── Dockerfile              # Multi-stage production Nginx container
├── server/                     # Node/Express Backend App
│   ├── src/
│   │   ├── config/             # Database pool connection setup
│   │   ├── controllers/        # Auth, class, student, teacher, fee and notice endpoints
│   │   ├── middleware/         # Security & RBAC checks
│   │   └── routes/             # Authentication and admin panel routing
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

## 🎨 Design & Layout System

The application features a premium, responsive glassmorphic aesthetic linked to customizable dark and light style profiles:
*   **Floating Sidebar Layout:** A detached glassy navigation container floating next to the main viewport. Includes a collapsible toggle supporting a 72px slim vertical menu (icons-only) and a 260px expanded menu.
*   **Dual Themes Vibe:** Responsive CSS custom variables linked to a `data-theme` attribute for hot-swapping:
    *   `Charcoal` (Dark Mode): Frosted slate surfaces overlaid on `/mac-abs-dark.png` wallpaper.
    *   `Cream` (Light Mode): Ivory frosted surfaces overlaid on `/mac-abs-light.png` wallpaper.
*   **Universal URL-Driven Filters:** No page-level filter clutter. All searches and filters (Fee Status, Rating, Attendance alerts, Seniority, Subjects, Genders, Notice scopes) are handled in the `Header` and bound directly to URL search parameters (`q`, `fees`, `rating`, `attendance`, `seniority`, `subject`, `gender`, `classes`, `scope`, `section`) via React Router `useSearchParams()`, making filtered rosters bookmarkable.
*   **Theme-Aware Scrollbars:** Customized `-webkit-scrollbar` widgets styled using the active theme's borders and hover accents.

---

## 📂 Core Administration Views

### 1. Dynamic Analytics Dashboard
*   **Database Integration:** Fetches real metrics from the Express server endpoint `GET /api/admin/stats` dynamically on mount, replacing hardcoded mock metrics.
*   **Analytics Grid:** Displays glassmorphic widgets for Total Students, Faculties (Instructors count), Total Classes, and Outstanding Fees (formatted dynamically into Indian Rupees `INR` currency).
*   **Announcements Feed:** Renders a scrollable feed of the 5 most recent bulletin updates. Clicking an update redirects the administrator directly to the Notices page details split layout view.

### 2. Database-Driven Roster (Students)
*   **Categorized Class Selector:** Large card grids are collapsed into a single column Primary (Grade 1-5), Secondary (Grade 6-10), and Senior Secondary (Grade 11-12 split by Science, Commerce, and Arts) glass dropdown.
*   **Combined Registers:** Sections (e.g., Grade 8-A and 8-B) are grouped dynamically. Lists load in alphabetical order displaying both class teachers.
*   **Metadata Badges:** Displays average rating (Lucide star scales), attendance alerts (low attendance highlighted in red), and fee status flags (`PAID`, `PARTIAL`, `UNPAID`).
*   **Roster details drawer:** Clicking a student opens a slide-out card showing parent contacts, birth dates, and gender.

### 2. Faculty Directory (Teachers)
*   **Multi-Filter Options:** Dynamic filtering by seniority index (Junior `< 2 yrs`, Mid `2-5 yrs`, Senior `> 5 yrs` computed from `user.createdAt`), course specialty, gender, and collapsible checkboxes of classes taught.
*   **Faculty Details Card:** Opens a right-split panel rendering specialty, led class, list of other classes taught, and service tenure dates.
*   **Warning animations:** The close (`X`) trigger scales and rotates into warning red (`#ef4444`) on hover.

### 3. Announcements Board (Notices)
*   **Notice list:** Displays bulletins, scope targets, and formatted publish timestamps.
*   **Responsive Shrinking Split Layout:** Clicking a notice collapses the notice cards list container to `45%` width, letting the reading panel expand to `55%` width for comfortable full-screen reading. Notice selection synchronizes with router paths (`/admin/notices/:id`).
*   **Form Publisher (`/admin/notices/new`):** Forms to input notice title/headline, message body, target checks (Global Broadcast vs. Class Target checkboxes grouped by Primary, Secondary, and Senior Sec accordion grids), and a disabled image file trigger.
*   **Notice Deletion:** A red hover-scaling trash can icon button is integrated next to the close button inside the notice details header, allowing administrators to delete notices dynamically (executes `DELETE /api/admin/notices/:id` with confirmation prompts and updates state in real-time).

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
### 4. Default Credentials:
**Admin**: 
   - `secureadmin@school.com`
   - `admin-security-key-2816`

**Teacher**:
   - `teacher@school.com`
   - `teacher123`

**Student**: 
   - `student@school.com`
   - `student123`

### 5. Run Development Servers
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
The client will be running on `http://localhost:9090`.

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
   ```
   ```bash
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
