# 📚 School Management System (MERN Backend)

A role-based school management system built with **Node.js, Express.js, and MongoDB**.  
Supports **Students, Teachers, Parents, and Admins** with authentication, authorization, and modular schemas.

---

## 🚀 Features
- 🔐 **Authentication & Authorization** (JWT + role-based guards)
- 👥 **User Management** (Admin controls, CRUD operations)
- 🧑‍🎓 **Student Module** (guardian info, subjects, marks, timetable)
- 👨‍🏫 **Teacher Module** (specializations, assigned subjects, timetable)
- 🏫 **Class & Subject Management**
- 📝 **Attendance Tracking** (by teachers/admins)
- 🎓 **Grade Assignment & Tracking**
- ⚡ **Scalable Schema Design** (core User + role-specific schemas)

---

## 🛠 Tech Stack
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB + Mongoose  
- **Auth**: JWT, bcrypt  
- **Validation**: Zod / Joi (your choice)  
- **Middleware**: Custom role-based auth guards  

---

## 📂 Project Structure
```plaintext
/api/v1
│
├── /auth → register, login, current user
├── /users → manage all users (admin only)
├── /students → student-specific endpoints
├── /teachers → teacher-specific endpoints
├── /classes → class creation & management
├── /subjects → subject creation & management
├── /attendance → mark & fetch attendance
└── /grades → assign & fetch student grades
```

---

## 🔑 API Routes

### Auth
- **POST** `/auth/register` → Create user via invite code  
- **POST** `/auth/login` → Login user & issue token  
- **GET** `/auth/me` → Get logged-in user profile  

### Users
- **GET** `/users` → List all users (admin only)  
- **GET** `/users/:id` → Get user details  
- **PATCH** `/users/:id` → Update user (admin only)  
- **DELETE** `/users/:id` → Delete user (admin only)  

### Students
- **POST** `/students` → Create student (admin only)  
- **GET** `/students` → List all students  
- **GET** `/students/:id` → Get student details  
- **PATCH** `/students/:id` → Update student (admin only)  
- **DELETE** `/students/:id` → Delete student (admin only)  

### Teachers
- **POST** `/teachers` → Create teacher (admin only)  
- **GET** `/teachers` → List all teachers  
- **GET** `/teachers/:id` → Get teacher details  
- **PATCH** `/teachers/:id` → Update teacher (admin only)  
- **DELETE** `/teachers/:id` → Delete teacher (admin only)  

### Classes
- **POST** `/classes` → Create class (admin only)  
- **GET** `/classes` → List all classes  
- **GET** `/classes/:id` → Get class details  
- **PATCH** `/classes/:id` → Update class (admin only)  
- **DELETE** `/classes/:id` → Delete class (admin only)  

### Subjects
- **POST** `/subjects` → Create subject (admin only)  
- **GET** `/subjects` → List all subjects  
- **GET** `/subjects/:id` → Get subject details  
- **PATCH** `/subjects/:id` → Update subject (admin only)  
- **DELETE** `/subjects/:id` → Delete subject (admin only)  

### Attendance
- **POST** `/attendance` → Mark attendance (teacher/admin only)  
- **GET** `/attendance/class/:id` → Get class attendance  

### Grades
- **POST** `/grades` → Assign grade (teacher/admin only)  
- **GET** `/grades/student/:id` → Get student grades  

---

## 🧩 Schema Design Philosophy
- **User** → core details + roles (auth identity)  
- **Student, Teacher, Parent** → separate role-based schemas  
- **Subject, Class, Marksheet, TimeTable** → supporting collections  

This separation keeps schemas lightweight, extensible, and query-optimized.

---

## 🚦 Setup & Run
```bash
# Clone repo
git clone https://github.com/your-username/school-management-backend.git
cd school-management-backend

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run dev server
pnpm run dev
```

---

## 🗺 Roadmap

- **Add Parent schema & APIs**

- **File upload (marksheets, documents)**

- **Notifications (students/parents)**

- **Dashboard & analytics endpoints**

- **CI/CD + Deployment**

---

## 🤝 Contribution

PRs are welcome. Follow conventional commits and branch naming.