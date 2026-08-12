# Project Setup

## npm init -y

Purpose:
Creates package.json, which acts as the project's manifest file.

Key Points:
- Stores project metadata.
- Stores dependencies and devDependencies.
- Stores npm scripts.
- Defines project entry point.

## Installed Packages

### express

Purpose:
Backend framework used to create APIs and handle HTTP requests.

### dotenv

Purpose:
Loads environment variables from .env into process.env.

### cors

Purpose:
Allows frontend and backend running on different origins to communicate.

### nodemon

Purpose:
Automatically restarts the server whenever source files change during development.

## Project Structure

### src/index.js

Application entry point.

Responsibilities:
- Load configuration.
- Connect database.
- Start server.

### src/app.js

Express application configuration.

Responsibilities:
- Create Express app.
- Register middleware.
- Register routes.

## ES Modules

The project uses ES Modules by setting:

"type": "module"

Benefits:
- Modern import/export syntax.
- Better consistency with React and modern JavaScript.
- Industry standard for new projects.

## npm Scripts

### dev

Runs the server using nodemon.

## Express Server Setup

### app.js

Purpose:
Creates and exports the Express application.

```js
import express from "express";

const app = express();

export default app;
```

### index.js

Purpose:
Starts the Express server.

```js
import app from "./app.js";

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Why Separate app.js and index.js?

- app.js → Configure the application.
- index.js → Start the server.

This separation makes testing and scaling easier.

### Server Startup Flow

```text
npm run dev
    ↓
nodemon src/index.js
    ↓
index.js executes
    ↓
imports app.js
    ↓
Express app created
    ↓
app.listen(PORT)
    ↓
Server starts listening
```

## First Route

### Code

```js
app.get("/", (req, res) => {
    res.send("OpenHealth API Running");
});
```

### Purpose

Creates the first API endpoint.

### Request Flow

```text
Browser
    ↓
GET /
    ↓
Express Route Handler
    ↓
res.send()
    ↓
Response Returned
```

### Test

Open:

http://localhost:8000

Expected Response:

```text
OpenHealth API Running
```

## Routes

### Why Routes?

Routes keep endpoints organized.

Instead of putting every endpoint in app.js, we group related endpoints into separate files.

### health.routes.js

Purpose:
Contains health check endpoints.

### Route Registration Flow

Request
↓
app.js
↓
app.use("/", healthRouter)
↓
health.routes.js
↓
Route Handler
↓
Response