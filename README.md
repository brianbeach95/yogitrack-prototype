# YogiTrack

YogiTrack is a full-stack web application developed for Yoga H'om to manage the studio's daily operations. The application provides tools for managing customers, instructors, classes, packages, sales, attendance, class schedules, and studio reports.

## Features

- Customer and instructor management
- Class and package management
- Package sales
- Customer class balance tracking
- Class attendance and check-in
- Class scheduling
- Studio and customer reporting

## Technology Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose

## Running YogiTrack Locally

### Requirements

- Node.js
- MongoDB

### Setup

1. Clone the repository.
2. Navigate to the project directory.
3. Install the required dependencies:

    npm install

4. Make sure MongoDB is running locally.
5. Start the YogiTrack server:

    node yogiserver.cjs

6. Open the application in a web browser at:

    http://localhost:8080

## Project Structure

- `config/` - Database configuration
- `controllers/` - Application logic and business rules
- `models/` - Mongoose data models
- `routes/` - REST API routes
- `public/` - HTML, CSS, JavaScript, and other frontend resources
- `utils/` - Shared validation and utility functions
- `data/` - Sample application data
- `yogiserver.cjs` - Express server entry point