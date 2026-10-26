# VideoTube - Backend-Focused Video-Sharing Platform

A backend-focused REST API for a video-sharing platform built with **Node.js, Express.js, MongoDB, Mongoose, Redis, JWT, Multer, and Cloudinary**. It provides authentication, email verification, Redis-backed rate limiting, media uploads, video publishing, social interactions, playlists, subscriptions, watch history, creator dashboard data, and MongoDB aggregation queries.

## Live Demo & Resources

- **Live Frontend:** [Open VideoTube](https://videotube-ojjt.onrender.com/)
- **Live Backend:** [Open API Server](https://video-platform-backend-z1p6.onrender.com/)
- **API Base URL:** [`https://video-platform-backend-z1p6.onrender.com/api/v1`](https://video-platform-backend-z1p6.onrender.com/api/v1)
- **API Documentation:** [Explore the Postman API Docs](https://documenter.getpostman.com/view/54475238/2sBYHQ23Go)
- **Postman Collection:** [Import the collection from this repository](./postman/video-backend.postman_collection.json)

> **Deployment note:** The backend is hosted on Render's free tier. After a period of inactivity, the first request may take about a minute while the service wakes up.

## Backend Features

### Authentication & Account Management

- Registration and login with JWT-based access and refresh token handling.
- Protected routes and logout/session handling.
- Password updates and secure password hashing with bcrypt.
- Account details, avatar, and cover image updates.
- Public channel/profile details and user watch history.
- Email verification using Redis-backed, time-limited OTPs and Resend for email delivery.

> **Email verification status:** The verification flow is implemented. End-to-end testing with arbitrary recipient addresses is pending because a verified sending domain has not yet been configured with Resend.

### Rate Limiting & API Protection

Implemented a custom **Redis-backed Sliding Window Log rate limiter** to prevent excessive API requests and protect endpoints from abuse.

- **Global limit:** 100 requests per IP per rolling 60 seconds across `/api/v1`.
- **Users route limit:** 7 requests per IP per rolling 60 seconds across `/api/v1/users`. Both global and users-specific limits apply to these routes.
- **How it works:** Redis Sorted Sets store request timestamps. A Lua script removes expired entries, counts recent requests, and records allowed requests atomically. Requests exceeding the limit receive `429 Too Many Requests`.
- **Why this algorithm?** Unlike a fixed-window counter, it tracks requests over a continuously moving time window, helping prevent sudden bursts around window boundaries.

**Further Reading:** [ByteByteGo — Design a Rate Limiter](https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter)

### Video & Media APIs

- Upload videos and thumbnails using Multer for incoming file handling and Cloudinary for cloud media storage.
- Retrieve individual videos and query the video feed.
- Search videos and configure pagination and sorting with query parameters such as `query`, `page`, `limit`, `sortBy`, and `sortType`.
- Update video metadata, delete videos, and toggle a video's published status.

### Social & Community APIs

- Create, retrieve, update, and delete video comments.
- Toggle likes on videos, comments, and tweets; retrieve liked videos.
- Create, update, and delete tweets, and retrieve tweets by user.
- Subscribe to channels and retrieve channel/subscriber relationships.
- Create and manage playlists, add or remove videos, and retrieve playlists by user.

### Creator Dashboard & Data Aggregation

- Retrieve channel statistics and channel video data through dashboard endpoints.
- Use MongoDB aggregation pipelines for channel-related information and watch-history queries.
- Model relationships between users, videos, comments, likes, playlists, subscriptions, tweets, and watch history.

### Maintainable API Structure

- Modular separation of routes, controllers, middleware, models, utilities, and database configuration.
- Health-check endpoint for basic deployment/service verification.
- A reusable Postman collection and published API documentation for endpoint exploration and testing.

## API Endpoint Reference

All paths below are **relative to the API base URL**:
```text
https://video-platform-backend-z1p6.onrender.com/api/v1
```
For example, `GET /videos/:videoId` becomes `GET https://video-platform-backend-z1p6.onrender.com/api/v1/videos/:videoId`.

### Health Check

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/healthcheck` | Check the API service |

### Users & Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/users/register` | Register an account; supports avatar and cover image uploads |
| `POST` | `/users/login` | Authenticate a user |
| `POST` | `/users/logout` | Log out the current user |
| `POST` | `/users/refresh-token` | Refresh authentication tokens |
| `GET` | `/users/current-user` | Retrieve the current authenticated user |
| `POST` | `/users/change-password` | Change the current user's password |
| `PATCH` | `/users/update-account` | Update account details |
| `GET` | `/users/history` | Retrieve watch history |
| `GET` | `/users/c/:username` | Retrieve public channel/profile information by username |
| `PATCH` | `/users/update-avatar` | Update the profile avatar |
| `PATCH` | `/users/cover-image` | Update the channel cover image |

### Email Verification

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/email-verification/emailsend` | Send a 6-digit verification code to the supplied email address |
| `POST` | `/email-verification/emailverify` | Verify the email using the supplied code |

Both endpoints are relative to the API base URL. The verification code expires after 5 minutes; a successful verification status is stored in Redis for 10 minutes.

**Send verification code** — `POST /email-verification/emailsend`
```json
{
  "email": "user@example.com"
}
```

**Verify email** — `POST /email-verification/emailverify`
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

### Videos

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/videos/` | List videos; supports pagination, search, and sorting query parameters |
| `POST` | `/videos/` | Upload and publish a video with a thumbnail |
| `GET` | `/videos/:videoId` | Retrieve a video by ID |
| `PATCH` | `/videos/:videoId` | Update video metadata |
| `DELETE` | `/videos/:videoId` | Delete a video |
| `PATCH` | `/videos/toggle/publish/:videoId` | Toggle a video's published status |

Example feed request:
```http
GET /videos/?page=1&limit=5&query=javascript&sortBy=createdAt&sortType=desc
```
The upload endpoint accepts `multipart/form-data` with `title`, `description`, `videoFile`, and `thumbnail` fields.

### Comments

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/comments/:videoId` | Retrieve comments for a video |
| `POST` | `/comments/:videoId` | Add a comment to a video |
| `PATCH` | `/comments/c/:commentId` | Update a comment |
| `DELETE` | `/comments/c/:commentId` | Delete a comment |

### Playlists

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/playlist/` | Create a playlist |
| `GET` | `/playlist/:playlistId` | Retrieve a playlist by ID |
| `PATCH` | `/playlist/:playlistId` | Update playlist details |
| `DELETE` | `/playlist/:playlistId` | Delete a playlist |
| `PATCH` | `/playlist/add/:videoId/:playlistId` | Add a video to a playlist |
| `PATCH` | `/playlist/remove/:videoId/:playlistId` | Remove a video from a playlist |
| `GET` | `/playlist/user/:userId` | Retrieve a user's playlists |

### Creator Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/dashboard/stats` | Retrieve channel statistics |
| `GET` | `/dashboard/videos` | Retrieve videos for the channel dashboard |

### Likes

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/likes/toggle/v/:videoId` | Toggle a video like |
| `POST` | `/likes/toggle/c/:commentId` | Toggle a comment like |
| `POST` | `/likes/toggle/t/:tweetId` | Toggle a tweet like |
| `GET` | `/likes/videos` | Retrieve videos liked by the current user |

### Tweets

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/tweets/` | Create a tweet/social post |
| `GET` | `/tweets/user/:userId` | Retrieve tweets for a user |
| `PATCH` | `/tweets/:tweetId` | Update a tweet |
| `DELETE` | `/tweets/:tweetId` | Delete a tweet |

### Subscriptions

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/subscriptions/c/:channelId` | Retrieve subscriptions for a channel |
| `POST` | `/subscriptions/c/:channelId` | Toggle subscription to a channel |
| `GET` | `/subscriptions/u/:subscriberId` | Retrieve channels subscribed to by a user |

> **Authentication note:** Some endpoints require an authenticated session, and some operations require valid resource IDs. Check the [Postman API documentation](https://documenter.getpostman.com/view/54475238/2sBYHQ23Go) for request bodies, upload fields, and endpoint-specific requirements.

## API Documentation & Testing

Use the published documentation or import the collection to try the API requests.

- **[View API Documentation](https://documenter.getpostman.com/view/54475238/2sBYHQ23Go)** — Browse endpoint descriptions, request parameters, and configurations.
- **[Download Postman Collection](./postman/video-backend.postman_collection.json)** — Import the JSON collection into Postman.

### Getting Started with Postman

1. Download the Postman collection from the link above.
2. Import the JSON file into Postman.
3. Set the `server` collection variable to `https://video-platform-backend-z1p6.onrender.com/api/v1`.
4. Register or log in with your own test account before testing protected endpoints.
5. Supply the required IDs, request bodies, and files for individual requests.

Some requests require valid user, video, comment, playlist, or tweet IDs. File-upload requests need the appropriate `multipart/form-data` fields.

## Tech Stack

| Category | Technologies |
|---|---|
| Runtime & API | Node.js, Express.js |
| Database & ODM | MongoDB, Mongoose |
| Authentication & Security | JSON Web Tokens (JWT), bcrypt |
| File Processing & Media | Multer, Cloudinary |
| Email Delivery | Resend |
| Rate Limiting & Shared State | Redis, Sliding Window Log |
| Frontend | React, Vite, Tailwind CSS |
| API Testing & Developer Tools | Postman, Git, GitHub, Nodemon, Prettier |
| Deployment | Render |

## Project Structure
```text
video-platform-backend/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── db/
│   ├── app.js
│   ├── index.js
│   └── constants.js
├── frontend/
│   └── render.yaml
├── postman/
│   └── video-backend.postman_collection.json
├── docker-compose.yml
├── package.json
└── Readme.md
```
## Local Setup

### Prerequisites

- Node.js and npm
- A MongoDB connection string
- A Cloudinary account and API credentials
- A Redis instance and connection URL
- A Resend account and API key for email verification

### 1. Clone the repository
```bash
git clone https://github.com/krishnaraipuria/video-platform-backend.git

cd video-platform-backend
```
### 2. Install dependencies
```bash
npm install
```
### 3. Configure environment variables

Create a `.env` file in the project root and set the values for your local environment:
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
REDIS_URL=your_redis_connection_url
RESEND_API_KEY=your_resend_key
```
Replace the placeholders with your own values. Never commit your `.env` file or expose credentials in the repository.

### 4. Start the backend
```bash
npm run dev
```
The server starts on the port configured in your environment.

## Frontend & UI Design

The frontend is built with **React, Vite, and Tailwind CSS**, using the [YouTube UI Clone Design from Figma Community](https://www.figma.com/design/mUE4mzxkNjauvVl0jKThbZ/YouTube-UI-Clone-Design--Community-?t=52qqHqHG73EpiFzT-0) as the UI design reference.

## Future Improvements

Planned backend improvements include Redis-based caching, automated rate-limiter tests, and further performance and scalability work.
