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

## Controller Layer

### health.controller.js

Contains the logic for health check requests.

### Route-Controller Flow

Browser
↓
Route
↓
Controller
↓
Response

Benefits:
- Cleaner routes
- Better code organization
- Easier testing and maintenance

## Environment Variables

### .env

Stores sensitive configuration outside source code.

Examples:
- PORT
- MONGODB_URI
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASSWORD

### dotenv

Purpose:
Loads variables from .env into process.env.

Flow:

.env
↓
dotenv.config()
↓
process.env
↓
Application

## Database Layer

### db/index.js

Purpose:
Connects the application to MongoDB Atlas.

### Mongoose

Purpose:
Provides a schema-based interface for MongoDB.

### Connection Flow

Server Start
↓
dotenv loads .env
↓
connectDB()
↓
MongoDB Atlas
↓
Connection Successful
↓
Start Server

### Why Connect Database Before Starting Server?

If the database is unavailable, the application should not accept requests.

## First Model: Patient

Purpose:
Stores patient account and profile information.

### Current Fields

- fullName
- email
- phone
- password
- dateOfBirth
- gender
- bloodGroup
- allergies
- ohid

### Mongoose Model Flow

Request
↓
Controller
↓
Patient Model
↓
MongoDB Collection
↓
Database

## Patient Module Structure

### patient.routes.js

Purpose:
Defines patient-related endpoints.

Current Endpoint:

```http
POST /api/v1/patients/register
```

### patient.controller.js

Purpose:
Contains patient-related business logic.

Examples:
- Register Patient
- Login Patient
- Forgot Password
- Update Profile

### patient.model.js

Purpose:
Defines how patient data is stored in MongoDB.

### Module Flow

POST Request
↓
patient.routes.js
↓
patient.controller.js
↓
patient.model.js
↓
MongoDB
↓
Response

## express.json()

Purpose:
Parses incoming JSON request bodies.

Flow:

Client
↓
JSON Request
↓
express.json()
↓
req.body
↓
Controller

## Patient Module Structure

### patient.routes.js

Purpose:
Defines patient-related endpoints.

Current Endpoint:

POST /api/v1/patients/register

### patient.controller.js

Purpose:
Contains patient-related business logic.

Examples:
- Register Patient
- Login Patient
- Forgot Password

### patient.model.js

Purpose:
Defines how patient data is stored in MongoDB.

### Module Flow

POST Request
↓
patient.routes.js
↓
patient.controller.js
↓
patient.model.js
↓
MongoDB
↓
Response

## Database Layer

### db/index.js

Purpose:
Connects the application to MongoDB Atlas.

### Connection Flow

Server Start
↓
dotenv loads .env
↓
connectDB()
↓
MongoDB Atlas
↓
Connection Successful
↓
Start Server

### Why Connect Database Before Starting Server?

If the database is unavailable, the application should not accept requests.

## Patient Registration Request Flow

POST /api/v1/patients/register

Postman
↓
patient.routes.js
↓
patient.controller.js
↓
req.body
↓
Response

## Patient Registration

### Endpoint

POST /api/v1/patients/register

### Flow

Postman
↓
patient.routes.js
↓
patient.controller.js
↓
Patient.create()
↓
MongoDB Atlas
↓
Response

### Status

Patient data is now successfully stored in MongoDB.
## Password Hashing

Passwords are hashed using bcrypt before being stored in MongoDB.

Flow:

Plain Password
↓
bcrypt.hash()
↓
Hashed Password
↓
MongoDB
## OpenHealth ID (OHID)

A unique OHID is generated for every patient during registration.

Purpose:
Provides a unique identifier that can later be used by doctors, labs and family features.

## Error Handling

Purpose:
Prevents application crashes and returns meaningful responses.

Flow:

Request
↓
try
↓
Business Logic
↓
Success Response

OR

catch
↓
Log Error
↓
500 Internal Server Error

## Login Endpoint

POST /api/v1/patients/login

Purpose:
Authenticates an existing patient.

Current Status:
Route and controller connected successfully.

Flow:

Postman
↓
patient.routes.js
↓
loginPatient()
↓
Response

## Login Authentication

Purpose:
Verifies patient credentials during login.

Flow:

Request
↓
Find Patient by Email
↓
Patient Found?
├── No → Invalid Credentials
└── Yes
    ↓
bcrypt.compare()
    ↓
Password Correct?
    ├── No → Invalid Credentials
    └── Yes → Login Success

## JWT (JSON Web Token)

Purpose:
Maintains user authentication after login.

Flow:

Login
↓
Generate JWT
↓
Send Token
↓
Store Token
↓
Use Token For Future Requests

Benefits:
- Stateless authentication
- Secure user identification
- Protects private routes

## JWT Authentication

Purpose:
Maintains authentication after successful login.

Implementation:

jsonwebtoken package is used to generate a token.

Payload:

- patientId
- ohid

Token Expiry:

7 days

Flow:

Login Request
↓
Find Patient
↓
bcrypt.compare()
↓
Generate JWT
↓
Send Token
↓
Frontend Stores Token

## Login Controller

Purpose:
Authenticates an existing patient.

Process:

1. Receive email and password.
2. Find patient by email.
3. Compare password using bcrypt.compare().
4. Generate JWT on successful authentication.
5. Return token to the client.