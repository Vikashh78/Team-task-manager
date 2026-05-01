# TeamFlow — Team Task Manager

A full-stack web application for team task management with role-based access control (RBAC).

## Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (NoSQL)
- **Auth**: JWT (JSON Web Tokens)
- **Deployment**: Railway

---

## Project Structure
team-task-manager/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── projects.routes.js
│   │   ├── tasks.routes.js
│   │   └── users.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── projects.controller.js
│   │   ├── tasks.controller.js
│   │   └── users.controller.js
│   ├── railway.toml
│   ├── package.json
│   └── server.js
└── frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   └── Modal.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── Tasks.jsx
│   │   └── Team.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env.example
├── railway.toml
└── package.json

---

## Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/team-task-manager
JWT_SECRET=your_very_secret_key_here
FRONTEND_URL=http://localhost:3000

Start the backend:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
REACT_APP_API_URL=http://localhost:5000/api

Start the frontend:
```bash
npm start
```
App runs at `http://localhost:3000`

---

## Deploying to Railway

### Step 1 — Set up MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user with a username and password
3. Whitelist all IPs: `0.0.0.0/0` under Network Access
4. Copy your connection string — it looks like:
   `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/team-task-manager`

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) and create a new project
2. Click **New Service** → **GitHub Repo** → select your repo
3. Set the **Root Directory** to `backend`
4. Go to **Variables** tab and add:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
   - `FRONTEND_URL` — leave blank for now, fill in after frontend deploys
5. Railway auto-detects Node.js and runs `npm start`
6. Copy your backend **public URL** (e.g. `https://backend-xxx.railway.app`)

### Step 3 — Deploy Frontend on Railway
1. In the same Railway project, click **New Service** → **GitHub Repo** again
2. Set the **Root Directory** to `frontend`
3. Go to **Variables** tab and add:
   - `REACT_APP_API_URL` — your backend URL + `/api`
     e.g. `https://backend-xxx.railway.app/api`
4. Go to **Settings** tab and set:
   - Build Command: `npm run build`
   - Start Command: `npx serve -s build -l $PORT`
5. Copy your frontend **public URL** (e.g. `https://frontend-xxx.railway.app`)

### Step 4 — Update FRONTEND_URL in Backend
1. Go back to your backend service on Railway
2. Update the `FRONTEND_URL` variable to your frontend URL
3. Railway will auto-redeploy

---

## Environment Variables Reference

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Railway sets this automatically) | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `a8f3k2...` |
| `FRONTEND_URL` | Deployed frontend URL for CORS | `https://frontend-xxx.railway.app` |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `https://backend-xxx.railway.app/api` |

---

## RBAC — Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create / Edit / Delete Projects | ✅ | ❌ |
| View Projects | ✅ All | ✅ Assigned only |
| Create / Edit / Delete Tasks | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| Assign tasks to members | ✅ | ❌ |
| View Team page | ✅ | ❌ |
| Change user roles | ✅ | ❌ |

### Testing RBAC before submission
1. Sign up as **Admin** — verify you can create projects, tasks, and manage team
2. Sign up as **Member** — verify you can only see assigned tasks and update their status
3. Try hitting `DELETE /api/projects/:id` with a Member JWT — should return `403 Access denied`

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get token |
| GET | `/api/auth/me` | Auth | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List projects |
| GET | `/api/projects/:id` | Auth | Get single project |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Auth | List tasks |
| GET | `/api/tasks/dashboard` | Auth | Dashboard stats |
| GET | `/api/tasks/:id` | Auth | Get single task |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Admin/Member* | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

*Members can only update `status` on their own assigned tasks.

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/members` | Auth | List members only |
| PUT | `/api/users/:id/role` | Admin | Change user role |

---

## Live Demo

🚀 **Live URL**: *(paste your Railway frontend URL here after deployment)*
Save as README.md in the root team-task-manager/ folder.
