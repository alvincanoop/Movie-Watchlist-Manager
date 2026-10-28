# CineTrack — Movie Watchlist Manager

A full-stack MERN (MongoDB Atlas, Express.js, React.js, Node.js) web application built for movie lovers to plan what to watch, track what they are currently viewing, and rate what they have finished.

---

##  Repository Structure

```text
Movie Watchlist Manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   └── movieController.js    # Business logic & request handlers
│   ├── models/
│   │   └── Movie.js              # Mongoose schema with validations
│   ├── routes/
│   │   └── movieRoutes.js        # Express RESTful route definitions
│   ├── tests/
│   │   └── rules.test.js         # Automated test assertions
│   ├── utils/
│   │   └── codeGenerator.js      # Per-year sequential code generator
│   ├── .env                      # Environment config (MONGODB_URI, PORT)
│   ├── package.json
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieFormModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── StatsDashboard.jsx
│   │   │   └── WatchNextModal.jsx
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service layer
│   │   ├── App.jsx               # Main stateful dashboard component
│   │   ├── index.css             # Responsive styling & themes
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js            # Vite configuration with proxy
└── README.md
```

---

##  Key Features & Business Rules

1. **Auto-Generated Movie Code**:
   - Automatically generated on creation in the format `MV-<release year>-<3-digit sequence>` (e.g., `MV-2024-001`).
   - Increments per release year and is immutable once generated.

2. **Validation Rules**:
   - **Release Year**: Allowed between `1950` and the current year.
   - **Runtime**: Allowed between `30` and `300` minutes.
   - **Genre**: One of `['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller']`.
   - **Platform**: One of `['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other']`.
   - **Priority**: Integer from `1` to `5` (where 5 is highest).

3. **Status Workflow**:
   - Newly added movies default to `To Watch`.
   - Allowed transitions:
     - `To Watch` ➔ `Watching` or `Watched`
     - `Watching` ➔ `Watched` or `To Watch`
     - `Watched` ➔ Final state (immutable; rating can be revised).
   - Only valid next statuses appear in the frontend dropdown. Any invalid transition is rejected by the backend with HTTP `400 Bad Request`.

4. **Rating & Watched Date Rules**:
   - Transitioning to `Watched` strictly requires a mandatory rating from `1` to `10`.
   - The backend records `watchedDate` automatically on transition to `Watched`.
   - Ratings are rejected for non-watched movies and can be revised only for `Watched` movies.

5. **Duplicate Prevention**:
   - Adding a movie with the same Title and Release Year (case-insensitive) is prevented, returning HTTP `409 Conflict`.

6. **"What Should I Watch Next?"**:
   - Queries `To Watch` movies and recommends the one with the highest priority.
   - Tie-breaker: Shortest runtime.
   - Returns HTTP `404 Not Found` if no `To Watch` movie is available.

7. **Deletion Safeguard**:
   - Deleting a movie in `Watching` status is strictly forbidden (backend returns `400 Bad Request`, and the frontend Delete button is disabled).
   - Other statuses require user confirmation before deletion.

8. **Live Statistics Dashboard**:
   - Real-time MongoDB aggregation showing:
     - Total count per status (`To Watch`, `Watching`, `Watched`).
     - Total hours watched (sum of runtimes of `Watched` movies).
     - Average rating of `Watched` movies (rounded to 1 decimal place).
     - Genre with the highest number of `Watched` movies.
   - Automatically refreshes following any add, edit, status transition, or deletion.

---

##  List of APIs Created

All endpoints return a uniform JSON envelope:
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

| HTTP Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/movies` | Add a new movie to the watchlist | `201 Created`<br>`400 Bad Request`<br>`409 Conflict` |
| `GET` | `/api/movies` | Fetch movies with status/genre filter, title search, and pagination (`limit=6`) | `200 OK`<br>`500 Internal Error` |
| `GET` | `/api/movies/watch-next` | Recommends highest priority & shortest runtime `To Watch` movie | `200 OK`<br>`404 Not Found` |
| `GET` | `/api/movies/stats` | Aggregates status counts, total hours, avg rating, and top genre | `200 OK`<br>`500 Internal Error` |
| `GET` | `/api/movies/:id` | Retrieve single movie by MongoDB ID | `200 OK`<br>`404 Not Found` |
| `PUT` | `/api/movies/:id` | Edit Title, Genre, Runtime, Platform, Priority (Code & Year locked) | `200 OK`<br>`400 Bad Request`<br>`404 Not Found`<br>`409 Conflict` |
| `PATCH` | `/api/movies/:id/status` | Transition status with workflow validation and mandatory rating for `Watched` | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` |
| `PATCH` | `/api/movies/:id/rating` | Edit rating (1–10) for already `Watched` movies | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` |
| `DELETE` | `/api/movies/:id` | Delete movie (Blocked for `Watching` status) | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` |
| `GET` | `/api/health` | Health check route | `200 OK` |

---

##  Setup and Installation

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB Atlas** account / cluster or local MongoDB instance

### 2. Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```
2. Verify or update `backend/.env` with your MongoDB connection string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://testuser:testpass123@cluster0.abcde.mongodb.net/movie_watchlist?retryWrites=true&w=majority&appName=Cluster0
   NODE_ENV=development
   ```
3. Run automated rule tests:
   ```bash
   npm test
   ```
4. Start the backend server:
   ```bash
   npm start
   # or for development mode:
   npm run dev
   ```
   The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:3000`.

---

##  Screenshots of the Application

### 1. Watchlist Dashboard & Overview
*Shows the live Statistics cards, Search and Genre/Status filter bar, and Movie Cards grid with colored status badges, priority stars, and action buttons.*

![Watchlist Dashboard](screenshots/dashboard.png)

---

### 2. "What Should I Watch Next?" & Status Transition Flow
*Shows the recommendation modal picking the highest priority & shortest runtime film, along with the workflow transition modal enforcing rating on completed movies.*

![Watch Next & Status Flow](screenshots/watch-next-modal.png)

> **Note for Evaluators:** To view the screenshots locally or after cloning, save application screenshots to the `screenshots/` directory named `dashboard.png` and `watch-next-modal.png`.

