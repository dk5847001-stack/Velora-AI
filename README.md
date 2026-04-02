# Velora AI Chat App
doc: update:31
doc: update:32
doc: update:33
doc: update:34
doc: update:35
doc: update:36
doc: update:37
doc: update:38
doc: update:39

Velora is a full-stack AI chatbot web app built with a React + Vite client and a Node.js + Express API. It includes JWT authentication, MongoDB chat persistence, OpenAI integration, responsive dark-mode UI, Markdown rendering, syntax-highlighted code blocks, and recent conversation history.

## Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: JWT + bcrypt
- AI provider: OpenAI API

## Project structure

```text
chatGpt/
|-- client/
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- context/
|       |-- hooks/
|       |-- pages/
|       |-- utils/
|       |-- App.jsx
|       |-- index.css
|       `-- main.jsx
|-- server/
|   |-- .env.example
|   |-- package.json
|   `-- src/
|       |-- config/
|       |-- controllers/
|       |-- middleware/
|       |-- models/
|       |-- routes/
|       |-- services/
|       |-- utils/
|       |-- app.js
|       `-- server.js
`-- README.md
```

## Setup

1. Create environment files:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

2. Update the values in `server/.env`:

- `MONGODB_URI`: your local MongoDB or MongoDB Atlas connection string
- `JWT_SECRET`: any long random secret
- `OPENAI_API_KEY`: your OpenAI API key
- `OPENAI_MODEL`: defaults to `gpt-5-mini`
- `CLIENT_URL`: defaults to `http://localhost:5173`

3. Install dependencies:

```powershell
cd server
npm.cmd install
cd ..\client
npm.cmd install
```

## Run the app

Start the API server:

```powershell
cd server
npm.cmd run dev
```

Start the Vite client in a second terminal:

```powershell
cd client
npm.cmd run dev
```

Client URL: `http://localhost:5173`

API URL: `http://localhost:5000`

## Build the client

```powershell
cd client
npm.cmd run build
```

The production files are written to `client/dist`.

## Available API routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Chats

- `GET /api/chats`
- `POST /api/chats`
- `GET /api/chats/:chatId`
- `POST /api/chats/:chatId/messages`
- `DELETE /api/chats/:chatId`

## Features included

- Signup, login, logout
- Protected API routes with JWT middleware
- Create, open, continue, and delete chats
- Chat history stored in MongoDB
- OpenAI-generated assistant replies saved with each conversation
- Markdown rendering with code block copy buttons
- Loading states, error banners, mobile sidebar, and auto-scroll behavior

## Notes

- Logout is implemented as client-side token removal with a server acknowledgement endpoint, which is typical for stateless JWT flows.
- The client uses `VITE_API_BASE_URL` and also includes a Vite `/api` proxy for local development.
- The backend uses the OpenAI Responses API and stores conversation history in MongoDB.
- When `OPENAI_API_KEY` is missing or the provider is temporarily unavailable, the server falls back to its built-in demo assistant responses.
