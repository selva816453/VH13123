# Full Stack Notification Management System

This is a production-grade Full Stack Notification Management System built using a React (TypeScript) frontend and a Node.js + Express (TypeScript) backend.

## Features & Implementation

1. **Centralized Logging Middleware**: Implements `Log(stack, level, package, message)` logic. Frontend logs are piped back to the backend `/api/logs` endpoint, and all logs are formatted and saved to a central log file (`backend/logs/app.log`).
2. **Priority Notification Engine**: Leverages a Heap/Priority Queue data structure on the backend to dynamically prioritize and filter incoming notifications (Placement > Result > Event), breaking ties using insertion timestamp.
3. **Database Architecture & Optimizations**: Designed for PostgreSQL with complete partitioning, indexing, and scale-out queue-worker strategies detailed in the design document.
4. **Professional UI**: Fully responsive blue-themed Material UI dashboard, complete with data tables, pagination, filter controls, badge counters, loading skeleton states, error indicators, and a live-scrolling logs console drawer.

---

## Folder Structure

```
root
│-- backend/                # Express + TypeScript service
│-- frontend/               # React + Material UI + Vite + TypeScript application
│-- notification_system_design.md # Core database & system designs
└-- README.md               # Setup and running instructions
```

---

## Setup and Running Instructions

The application is structured to install all dependencies and run both servers concurrently with a single command from the root folder.

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)

### Installation

From the root directory, run:
```bash
npm install
```
*Note: This command will automatically trigger `npm install` inside both `backend` and `frontend` subdirectories.*

### Run the Application

To start both the frontend (localhost:3000) and the backend (localhost:5000) concurrently, run:
```bash
npm run dev
```

The application will be accessible at:
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **API Swagger / Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Environment Variables

### Backend Configuration (`backend/.env`)
* `PORT`: Port on which the API runs (default: `5000`).
* `ACCESS_TOKEN`: The system-wide internal authentication token (default: `system-secret-auth-token-12345`).

### Frontend Configuration (`frontend/.env`)
* `VITE_API_URL`: Root path of the backend API (default: `http://localhost:5000/api`).
* `VITE_ACCESS_TOKEN`: Authorization token matching backend config (default: `system-secret-auth-token-12345`).
