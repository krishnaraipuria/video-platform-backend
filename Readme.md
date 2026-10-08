# Video Backend Platform

A production-style backend for a video-sharing platform built with **Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, and Cloudinary**.

> **Note:** This backend is hosted on Render's free tier, so the first request after inactivity may take about a minute to wake up.
>
> **Live Backend:** https://video-platform-backend-z1p6.onrender.com  
> **API Base URL:** https://video-platform-backend-z1p6.onrender.com/api/v1  
> **Postman API Collection & Documentation — Coming Soon**

## Overview

This backend powers a modern video-sharing platform with user accounts, content management, social interactions, and analytics. It is designed for scalable API development using Express.js, MongoDB, and Mongoose, with secure JWT-based authentication and media handling through Cloudinary.

## Features

### User & Authentication

- **JWT-based authentication** for login, registration, logout, refresh tokens, and protected routes
- **User profile management** with account updates and channel-related data
- **Secure password handling** using bcrypt for authentication safety

### Video & Media Management

- **Video and thumbnail uploads** with efficient file processing
- **Video publishing and visibility controls** for draft and published content
- **Content retrieval and deletion** with flexible video APIs
- **Cloud media storage** using Multer and Cloudinary

### Social Features

- **Likes and reactions** for videos and related content
- **Comments** with create, update, delete, and fetch support
- **Playlists** to organize saved or favorite videos
- **Subscriptions** to follow creators and manage channel relationships

### Platform Experience

- **Watch history tracking** for user activity and engagement insights
- **Dashboard statistics** for creators and platform analytics
- **Tweet/social post support** for short user updates
- **Health check endpoints** for monitoring and deployment readiness

### Technical Foundation

- **Modular Express architecture** with controllers, routes, middleware, utilities, and DB configuration
- **MongoDB schema design** for users, videos, comments, likes, playlists, subscriptions, and tweets
- **Aggregation support** for advanced channel and watch-history queries

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
