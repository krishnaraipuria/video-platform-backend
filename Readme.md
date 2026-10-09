# Video Backend Platform

A production-style REST API backend for a video-sharing platform built with **Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, and Cloudinary**. The project focuses on modular backend architecture, authentication, media management, social interactions, and data aggregation.

> **Deployment Note:** The backend is hosted on Render's free tier. The first request after a period of inactivity may take about a minute while the service wakes up.

**Live Backend:** [Open API Server](https://video-platform-backend-z1p6.onrender.com)  
**API Base URL:** [View API Base URL](https://video-platform-backend-z1p6.onrender.com/api/v1)

## API Documentation & Testing

Explore the API documentation or import the Postman collection to test the endpoints.

- **[View API Documentation](https://documenter.getpostman.com/view/54475238/2sBYHQ23Go)** — Browse the available endpoints and their request parameters and configuration.
- **[Download Postman Collection](./postman/video-backend.postman_collection.json)** — Import the collection into Postman to explore and test the API requests.

### Getting Started with Postman

1. Download the Postman collection from the link above.
2. Import the JSON file into Postman.
3. Check the `server` collection variable. Its value should be the deployed API base URL: `https://video-platform-backend-z1p6.onrender.com/api/v1`.
4. Register or log in with your own test account before testing protected endpoints.
5. Provide the required IDs, request bodies, and file uploads when testing individual endpoints.

**Note:** Protected endpoints may require authentication. Some requests also require valid user, video, comment, or playlist IDs.

## Overview

This backend powers a modern video-sharing platform with user accounts, content management, social interactions, and analytics. It uses Express.js, MongoDB, and Mongoose for API development, JWT-based authentication for access control, and Cloudinary for media storage.

## Features

### User & Authentication

- JWT-based authentication for registration, login, logout, token refresh, and protected routes.
- User profile management, account updates, and channel-related data.
- Secure password handling using bcrypt.

### Video & Media Management

- Video and thumbnail uploads with file processing.
- Video publishing and visibility controls for draft and published content.
- Content retrieval and deletion through video APIs.
- Cloud media storage using Multer and Cloudinary.

### Social Features

- Likes and reactions for videos and related content.
- Comments with create, update, delete, and fetch operations.
- Playlists to organize saved or favorite videos.
- Subscriptions to follow creators and manage channel relationships.

### Platform Experience

- Watch history tracking for user activity and engagement insights.
- Dashboard statistics for creators and platform analytics.
- Tweet and social post support for short user updates.
- Health check endpoints for monitoring and deployment readiness.

### Technical Foundation

- Modular Express architecture with controllers, routes, middleware, utilities, and database configuration.
- MongoDB schema design for users, videos, comments, likes, playlists, subscriptions, and tweets.
- MongoDB aggregation pipelines for advanced channel and watch-history queries.

## Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| File Uploads | Multer |
| Media Storage | Cloudinary |
| Tools | Git, GitHub, Nodemon, Prettier |

## Project Structure

```text
src/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── db/
├── app.js
├── index.js
└── constants.js

postman/
└── video-backend.postman_collection.json

.env
.gitignore
package.json
Readme.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB connection string
- Cloudinary account and API credentials

### 1. Clone the Repository

```bash
git clone https://github.com/krishnaraipuria/video-platform-backend.git
cd video-platform-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=your_allowed_origin

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=your_access_token_expiry

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the placeholder values with your own configuration. Never commit your `.env` file or expose credentials in the repository.

### 4. Run the Server

```bash
npm run dev
```

The server will start using the configured port.

## Project Highlights

- **Authentication lifecycle management:** Registration, login, logout, refresh tokens, and protected routes.
- **Media handling:** Video, thumbnail, and profile media uploads using Multer and Cloudinary.
- **Data modeling:** MongoDB schemas and relationships across multiple platform entities.
- **Aggregation pipelines:** Advanced queries for channel information and watch history.
- **Modular architecture:** Separation of controllers, routes, middleware, models, and utilities.
- **API testing:** A reusable Postman collection and published API documentation.

## Future Improvements

The backend will continue to evolve with further improvements to API performance, scalability, caching, rate limiting, and system design.

