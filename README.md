# YogiTrack

YogiTrack is a full-stack web application developed for Yoga H'om to manage daily studio operations. It provides tools for managing customers, instructors, recurring classes, packages, sales, attendance, schedules, and reporting. The application includes separate Manager and Instructor experiences with role-based access.

**Live application:** https://yogitrack-brianbeach-191916d92b5b.herokuapp.com/  
**GitHub repository:** https://github.com/brianbeach95/yogitrack-prototype

## Features

- **Authentication:** Session-based login and logout for Manager and Instructor accounts.
- **Role-based dashboards:** Relevant studio information and upcoming classes based on the signed-in user's role.
- **Customer and instructor management:** Add, search, update, and delete records.
- **Class and package management:** Manage recurring weekly classes, instructor assignments, scheduling conflicts, and class packages.
- **Sales and class balances:** Record package purchases and update balances for limited-class packages; track Unlimited packages by validity dates.
- **Attendance:** Check customers into classes, validate attendance, prevent duplicate check-ins, and review attendance history.
- **Scheduling:** View weekly class schedules and instructor assignments.
- **Manager reports:** Review studio sales, class attendance, instructor performance, customer attendance, and package purchases.
- **Instructor performance:** View assigned classes and personal attendance/check-in statistics.

## Technology Stack

- **Frontend:** React, React Router, JavaScript, HTML, CSS, Vite
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB, Mongoose; MongoDB Atlas for the deployed application
- **Authentication:** express-session, bcrypt
- **Hosting and version control:** Heroku, Git, GitHub

## Running YogiTrack Locally

### Requirements

- Node.js and npm
- MongoDB running locally, or access to a MongoDB Atlas database

### Setup

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/brianbeach95/yogitrack-prototype.git
   cd yogitrack-prototype
   ```

2. Install the backend and frontend dependencies:

   ```bash
   npm install
   npm install --prefix client
   ```

3. Start a local MongoDB instance, or configure the `MONGO_URI` environment variable with a valid MongoDB connection string. By default, the backend uses `mongodb://localhost:27017/yogidb` when `MONGO_URI` is not set.

4. Start the Express backend in one terminal:

   ```bash
   npm start
   ```

5. Start the Vite development server in a second terminal:

   ```bash
   npm run dev --prefix client
   ```

6. Open **http://localhost:5173** in a browser. Vite forwards `/api` requests to the Express backend, which runs on **http://localhost:8080** by default.

**Note:** Signing in requires an existing Manager or Instructor account in the connected database. This repository does not provide public demo credentials.

## Deployment

The production application is hosted on Heroku. During deployment, the React frontend is built with Vite, and Express serves the compiled frontend and REST API. MongoDB Atlas provides persistent data storage. The database connection is configured using the `MONGO_URI` environment variable rather than committing credentials to source control.

## Project Structure

- `client/` — React frontend, components, styles, and Vite configuration
- `config/` — Database configuration
- `controllers/` — Application logic and business rules
- `models/` — Mongoose data models
- `routes/` — REST API routes
- `utils/` — Shared validation and utility functions
- `data/` — Sample application data
- `public/` — Legacy frontend resources from the initial prototype
- `yogiserver.cjs` — Express server entry point

## Project Scope

YogiTrack is a course project prototype. Potential future enhancements include calendar-based scheduling, notifications, expanded reporting, and a persistent session store for production use.
