# Velora AI

> An AI-powered chatbot that understands user requirements and helps execute tasks through personalized, efficient, and automated conversations.

Velora AI is a full-stack chatbot application built with **React**, **Vite**, **Node.js**, **Express**, **MongoDB**, and the **OpenAI API**. Users can create an account, manage conversations, continue previous chats, and receive AI-generated responses through a responsive web interface.

## ✨ Features

- 🔐 User signup, login, logout, and session handling
- 🛡️ JWT-protected API routes with password hashing via bcrypt
- 💬 Create, open, continue, and delete conversations
- 🗃️ Persistent chat history stored in MongoDB
- 🤖 OpenAI-powered assistant responses
- 🧪 Built-in demo assistant fallback when the OpenAI API is unavailable
- 📝 Markdown rendering with GitHub Flavored Markdown support
- 💻 Syntax-highlighted code blocks with copy support
- 📱 Responsive layout with mobile sidebar navigation
- ⚡ Loading states, error banners, auto-scroll, and protected routes
- 🔧 Vite development proxy and configurable API base URL

## 🧰 Tech stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- React Markdown
- Remark GFM
- Rehype Highlight
- Highlight.js
- Lucide React

### Backend

- Node.js
- Express 5
- Mongoose
- MongoDB
- JSON Web Tokens
- bcryptjs
- OpenAI Node SDK
- dotenv
- Morgan

## 📁 Project structure

```text
Velora-AI/
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── utils/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── app.js
│       └── server.js
└── README.md
```

## ✅ Prerequisites

Make sure the following are installed before starting:

- Node.js 18 or newer
- npm
- MongoDB locally or a MongoDB Atlas cluster
- An OpenAI API key, if you want to use live AI responses

## 🚀 Getting started

### 1. Clone the repository

```bash
git clone https://github.com/dk5847001-stack/Velora-AI.git
cd Velora-AI
```

### 2. Configure environment variables

Create environment files from the provided examples.

#### PowerShell

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

#### macOS/Linux

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` with your local configuration:

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/velora-chat
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_OUTPUT_TOKENS=1200
FORCE_DEMO_MODE=false
CLIENT_URL=http://localhost:5173
```

Update `client/.env` if your API is running on a different URL:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

> Keep `.env` files private. Never commit API keys, database credentials, or JWT secrets to the repository.

### 3. Install dependencies

Install the backend dependencies:

```bash
cd server
npm install
```

Install the frontend dependencies:

```bash
cd ../client
npm install
```

## ▶️ Run locally

Start the backend development server in one terminal:

```bash
cd server
npm run dev
```

Start the frontend development server in a second terminal:

```bash
cd client
npm run dev
```

Open the application at:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`

## 📦 Production build

Build the frontend for production:

```bash
cd client
npm run build
```

The generated files are placed in `client/dist`.

To preview the production build locally:

```bash
npm run preview
```

Start the backend in production mode with:

```bash
cd ../server
npm start
```

## 🔌 API routes

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate a user |
| `POST` | `/api/auth/logout` | Acknowledge user logout |
| `GET` | `/api/auth/me` | Return the authenticated user |

### Chats

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/chats` | List the authenticated user's chats |
| `POST` | `/api/chats` | Create a new chat |
| `GET` | `/api/chats/:chatId` | Get a specific chat |
| `POST` | `/api/chats/:chatId/messages` | Send a message to a chat |
| `DELETE` | `/api/chats/:chatId` | Delete a chat |

## ⚙️ Configuration notes

- `OPENAI_API_KEY` enables live OpenAI responses.
- Set `FORCE_DEMO_MODE=true` to use demo responses intentionally.
- If the OpenAI key is missing or the provider is temporarily unavailable, the server uses built-in demo assistant responses.
- `VITE_API_BASE_URL` controls the API URL used by the client.
- The Vite `/api` proxy is available for local development.
- Logout uses client-side token removal with a server acknowledgement endpoint, which is suitable for the stateless JWT flow used by this project.

## 🛡️ Security recommendations

- Use a long, randomly generated `JWT_SECRET`.
- Do not expose `.env` files or API keys publicly.
- Use HTTPS in production.
- Restrict `CLIENT_URL` to trusted frontend origins.
- Use a dedicated production MongoDB database and credentials.
- Rotate exposed secrets immediately if they are accidentally committed.

## 🤝 Contributing

Contributions, ideas, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes and test them locally.
4. Commit your work: `git commit -m "Add your change"`.
5. Push the branch and open a pull request.

## 📄 License

No license has been specified for this repository yet. If you plan to accept external contributions or distribute the project, add an appropriate license file.

## 👤 Author

Built by [dk5847001-stack](https://github.com/dk5847001-stack).
