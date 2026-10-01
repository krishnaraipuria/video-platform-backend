# Video Backend Platform

A backend for a video-sharing platform currently **being⌛** built with **Node.js, Express.js, MongoDB, Mongoose, JWT, and Cloudinary**.

The project is being developed with a modular architecture that will separate API routes, middleware, business workflows, authentication, data models, and external services.

## Architecture

The backend is being designed around a layered and domain-oriented architecture:

```text
HTTP Client
    |
    v
Express Application
    |
    +---- API Response Helpers
    |
    +---- Routes
    |       |
    |       +---- User Routes
    |       +---- Video Routes
    |       +---- Domain Routes
    |
    +---- Middleware
    |       |
    |       +---- JWT Authentication
    |       +---- File Upload
    |
    +---- Workflows / Controllers
    |       |
    |       +---- Account Workflows
    |       +---- Video Workflows
    |       +---- Playlist Workflows
    |       +---- Subscription Workflows
    |       +---- Dashboard Workflows
    |       +---- Engagement Workflows
    |
    +---- Models
    |       |
    |       +---- User
    |       +---- Video
    |       +---- Playlist
    |       +---- Subscription
    |       +---- Engagement?
    |
    +---- External Services
    |       |
    |       +---- Cloudinary
    |
    v
 MongoDB