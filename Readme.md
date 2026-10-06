# Video Backend Platform

A production-style backend for a video-sharing platform built with **Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, and Cloudinary**.

> **Note:** This backend is hosted on Render's free tier, so the first request after inactivity may take about a minute to wake up.

> **Live Backend:** https://video-platform-backend-z1p6.onrender.com  
> **API Base URL:** https://video-platform-backend-z1p6.onrender.com/api/v1  
> **Postman API Collection & Documentation — Coming Soon**

## Features

- **JWT Authentication** — access and refresh token based authentication with protected routes
- **User & Account Management** — registration, login, logout, password management, and profile updates
- **Video Management** — video and thumbnail upload flow, video retrieval, metadata updates, deletion, and publish-status management
- **Cloud Media Storage** — multipart file handling with **Multer** and media storage through **Cloudinary**
- **MongoDB Aggregation** — aggregation pipelines for channel profiles and watch history
- **Database Modeling** — Mongoose schemas and relationships for users, videos, subscriptions, playlists, comments, likes, and tweets
- **Modular REST API** — structured controllers, routes, middleware, models, utilities, and database configuration
- **Scalable Feature Modules** — separate modules for comments, likes, playlists, subscriptions, tweets, dashboard statistics, and health checks

## Tech Stack

**Backend:** Node.js, Express.js  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**File Uploads:** Multer  
**Media Storage:** Cloudinary  
**Tools:** Git, GitHub, Nodemon, Prettier

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
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

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

### Run the server

```bash
npm run dev
```

## Highlights

This project demonstrates practical backend development beyond basic CRUD, including **authentication lifecycle management, protected APIs, media uploads, MongoDB aggregation, database relationships, and modular Express architecture**.

More features and improvements are being added as the project evolves.