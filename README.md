# To-Do List Backend API

RESTful API backend for the To-Do List application with multi-tenant support.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL database (local or cloud)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todo_db

# Server Configuration
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=*

# Node Environment
NODE_ENV=production
```

### Run Locally

```bash
npm start
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `POST /api/register` - Create user (with optional PIN)
- `POST /api/login` - Verify PIN and login

### Tasks

- `GET /api/tasks/:userId` - Get all tasks for a user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task

### Health

- `GET /` - API information
- `GET /api/health` - Health check

## 🗄️ Database

The backend automatically:

- Creates the database if it doesn't exist
- Creates `users` and `tasks` tables
- Sets up foreign key relationships

## 🔒 Security Features

- Multi-tenant isolation (users only see their tasks)
- User verification on task operations
- CORS protection
- Input validation
- SQL injection protection (parameterized queries)

## ☁️ Deployment

### Railway

1. Connect GitHub repository
2. Add MySQL database service
3. Set environment variables
4. Deploy

### Render

1. Create Web Service
2. Connect repository
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

See main [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

Test the API with curl or Postman:

```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"title":"Test task","completed":false}'
```

## 📝 License

ISC
