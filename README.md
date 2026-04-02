# SkillBridge Backend 🎓

REST API for SkillBridge — a platform that connects students with expert tutors.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API |
| TypeScript | Type safety |
| PostgreSQL + Prisma | Database & ORM |
| Better Auth | Authentication |
| bcrypt | Password hashing |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/skillbridge-backend
cd skillbridge-backend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/skillbridge?schema=public"

# Server
PORT=5050
API_URL=http://localhost:5050

# Better Auth
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:5050


# Mailtrap
APP_MAILER_USER=your_mailtrap_user
APP_MAILER_PASS=your_mailtrap_pass

# Admin Seed
ADMIN_SEED_SECRET=your_seed_secret

# Frontend URL
APP_URL=http://localhost:3000
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed admin account
pnpm seed:admin
```

### Run the Server

```bash
# Development
pnpm dev
```

Server runs on `http://localhost:5050`

---

## API Endpoints

### Auth (Better Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-up/email` | Register |
| GET | `/api/auth/session` | Get session |
| POST | `/api/auth/sign-out` | Logout |

### Tutors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tutors` | Public | Get all tutors |
| GET | `/api/tutors/:id` | Public | Get tutor by ID |
| GET | `/api/tutors/stats` | Tutor | Get my stats |
| GET | `/api/tutors/profile` | Tutor | Get my profile |
| PUT | `/api/tutors/profile` | Tutor | Update my profile |
| DELETE | `/api/tutors/:id` | Admin | Delete tutor |
| PATCH | `/api/tutors/:id/featured` | Admin | Toggle featured |

### Students

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/students/profile` | Student | Get my profile |
| PUT | `/api/students/profile` | Student | Update my profile |
| GET | `/api/students/stats` | Student | Get my stats |
| GET | `/api/students` | Admin | Get all students |
| GET | `/api/students/:id` | Admin | Get student by ID |
| PATCH | `/api/students/:id` | Admin | Update student |
| DELETE | `/api/students/:id` | Admin | Delete student |

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Student | Create booking |
| GET | `/api/bookings` | Student/Tutor | Get my bookings |
| GET | `/api/bookings/:id` | Student/Tutor | Get booking by ID |
| PATCH | `/api/bookings/:id/cancel` | Student | Cancel booking |
| PATCH | `/api/bookings/:id/complete` | Tutor | Complete booking |
| GET | `/api/bookings/reviewable` | Student | Get reviewable bookings |
| GET | `/api/bookings/booked-slots` | Public | Get booked slots |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews` | Student | Create review |
| GET | `/api/reviews/tutor/:tutorId` | Public | Get tutor reviews |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | Public | Get all categories |
| POST | `/api/categories` | Admin | Create category |
| GET | `/api/categories/:id` | Admin | Get category by ID |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

### Tutor Availability

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tutor/availability` | Tutor | Get my availability |
| POST | `/api/tutor/availability` | Tutor | Create availability |
| GET | `/api/tutor/availability/:id` | Tutor | Get by ID |
| PUT | `/api/tutor/availability/:id` | Tutor | Update availability |
| DELETE | `/api/tutor/availability/:id` | Tutor | Delete availability |

### Tutor Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tutor/categories` | Tutor | Get my categories |
| POST | `/api/tutor/categories` | Tutor | Add category |
| DELETE | `/api/tutor/categories/:id` | Tutor | Remove category |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PATCH | `/api/admin/users/:id` | Ban / unban user |
| GET | `/api/admin/bookings` | Get all bookings |
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/booking-trends` | Booking trends |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/users/update` | Update user info |
| PATCH | `/api/users/change-password` | Change password |

---

## Project Structure

```
src/
├── lib/
│   ├── auth.ts
│   └── prisma.ts
├── middleware/
├── modules/
│   ├── admin/
│   ├── booking/
│   ├── category/
│   ├── review/
│   ├── student/
│   ├── tutorAvailability/
│   ├── tutorCategory/
│   ├── tutorProfile/
│   └── user/
├── scripts/
│   └── seedAdmin.ts
├── app.ts
└── server.ts
```

---

## Links

| | URL |
|--|-----|
| **Frontend Repo** | https://github.com/shuvo2011/skillbridge-frontend |
| **Backend Repo** | https://github.com/shuvo2011/skillbridge-backend |
| **Frontend Live** | https://skillbridge.vercel.app |
| **Backend Live** | https://skillbridge-api.vercel.app |
| **Demo Video** | https://drive.google.com/file/d/xxx/view |

## Admin Credentials

```
Email    : rahim@skillbridge.com
Password : Pa$$w0rd!
```
