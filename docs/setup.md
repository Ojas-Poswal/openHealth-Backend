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