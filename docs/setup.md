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

## Authentication Middleware

Purpose:
Protect private routes.

Flow:

Request
↓
JWT Middleware
↓
Verify Token
↓
Extract Patient Information
↓
Allow Access

Benefits:
- Prevents unauthorized access
- Identifies the logged-in patient
- Enables protected APIs

## JWT Verification Middleware

File:
src/middlewares/auth.middleware.js

Purpose:
Verifies JWT before allowing access to protected routes.

Flow:

Request
↓
Authorization Header
↓
jwt.verify()
↓
Decoded Payload
↓
req.patient
↓
next()

Failure:
401 Unauthorized

## Protected Route: Patient Profile

Endpoint:
GET /api/v1/patients/profile

Purpose:
Returns information about the currently authenticated patient.

Flow:

Request
↓
JWT Middleware
↓
Verify Token
↓
Extract Payload
↓
Controller
↓
Response

Requirement:
Authorization header containing a valid JWT.

## Protected Route: Patient Profile

Endpoint:
GET /api/v1/patients/profile

Purpose:
Returns information about the currently authenticated patient.

Flow:

Request
↓
JWT Middleware
↓
Verify Token
↓
Extract Payload
↓
Controller
↓
Response

Requirement:
Authorization header containing a valid JWT.

## JWT Protected Routes

Purpose:
Protect sensitive endpoints so that only authenticated patients can access them.

Files:
- src/middlewares/auth.middleware.js
- src/controllers/patient.controller.js
- src/routes/patient.routes.js

Flow:

Login
↓
JWT Generated
↓
Client Sends Token
↓
JWT Middleware
↓
Token Verified
↓
Request Allowed
↓
Controller Executes

Outcome:
Successfully implemented the first protected route:
GET /api/v1/patients/profile

## JWT Protected Route

Purpose:
Protect patient-specific endpoints using JWT authentication.

Files:
- auth.middleware.js
- patient.controller.js
- patient.routes.js

Outcome:
Implemented GET /api/v1/patients/profile as the first protected route.
## Full Patient Profile Fetch

Purpose:
Retrieve complete patient information from MongoDB after JWT verification.

Flow:

JWT
↓
Extract patientId
↓
Patient.findById()
↓
Remove Password
↓
Return Profile

Outcome:
Profile endpoint now returns actual patient data instead of only JWT payload.

## Update Patient Profile

Endpoint:
PATCH /api/v1/patients/profile

Purpose:
Allow authenticated patients to update their personal information.

Fields:
- fullName
- phone
- dateOfBirth
- gender
- bloodGroup
- allergies

Flow:

JWT
↓
Verify Token
↓
Find Patient
↓
Update Fields
↓
Return Updated Profile

Outcome:
Patients can update and maintain their health profile information.

## Change Password

Endpoint:
PATCH /api/v1/patients/change-password

Purpose:
Allow authenticated patients to securely change their password.

Files:
- patient.controller.js
- patient.routes.js
- auth.middleware.js

Flow:

JWT
↓
Verify Token
↓
Find Patient
↓
Verify Old Password
↓
bcrypt.compare()
↓
Hash New Password
↓
Save Updated Password
↓
Success Response

Outcome:
Authenticated patients can change their account password securely.

## Forgot Password Architecture

Purpose:
Allow patients to reset forgotten passwords using OTP verification.

Storage Strategy:
OTP data is stored directly in the Patient document.

Fields:
- resetOtp
- resetOtpExpiry

Reason:
Simpler implementation for MVP and avoids creating a separate OTP collection.

Flow:

Patient
↓
Request OTP
↓
OTP Generated
↓
Store OTP + Expiry
↓
Verify OTP
↓
Reset Password

## Forgot Password - OTP Generation

Endpoint:
POST /api/v1/patients/forgot-password

Purpose:
Generate a password reset OTP for a registered patient.

Flow:

Email
↓
Find Patient
↓
Generate 6-Digit OTP
↓
Store OTP
↓
Store OTP Expiry
↓
Success Response

Outcome:
Patients can request a temporary OTP for password recovery.

## Forgot Password - OTP Generation

Endpoint:
POST /api/v1/patients/forgot-password

Purpose:
Generate a password reset OTP for a registered patient.

Fields Added:
- resetOtp
- resetOtpExpiry

Flow:

Email
↓
Find Patient
↓
Generate 6-Digit OTP
↓
Store OTP
↓
Store OTP Expiry (10 Minutes)
↓
Save Patient Document
↓
Success Response

Outcome:
Patients can request a temporary OTP for password recovery.

Implementation Notes:
- OTP is currently a randomly generated 6-digit number.
- OTP is stored directly in the Patient document.
- OTP expires after 10 minutes.
- Only the latest generated OTP remains valid.

## Forgot Password - OTP Verification

Endpoint:
POST /api/v1/patients/verify-otp

Purpose:
Verify the OTP generated during password recovery.

Flow:

Email
↓
Find Patient
↓
Compare OTP
↓
Check OTP Expiry
↓
Verification Success

Outcome:
Patient is authorized to reset the password.

Validation Rules:
- Patient must exist.
- OTP must match the stored OTP.
- OTP must not be expired.
- Only the latest generated OTP is valid.

## Forgot Password - Reset Password

Endpoint:
POST /api/v1/patients/reset-password

Purpose:
Allow patients to create a new password after successful OTP verification.

Flow:

Email
↓
Find Patient
↓
Verify OTP
↓
Check OTP Expiry
↓
Hash New Password
↓
Update Password
↓
Clear OTP Fields
↓
Success Response

Outcome:
Patient regains access to the account using a newly created password.

Security:
- Password is hashed using bcrypt.
- OTP is cleared after successful reset.
- Expired OTPs are rejected. 

## Doctor Model

Purpose:
Stores doctor account and professional information.

Fields:
- fullName
- email
- phone
- password
- registrationNumber
- qualification
- specialization
- workplace

Notes:
- Doctor identity belongs to the doctor, not the hospital.
- Workplace can be changed when switching hospitals or opening a private clinic.
- Registration number is unique for every doctor.

## Doctor Registration

Endpoint:
POST /api/v1/doctors/register

Purpose:
Create a new doctor account.

Fields:
- fullName
- email
- phone
- password
- registrationNumber
- qualification
- specialization
- workplace

Validation:
- Unique email
- Unique phone
- Unique registration number

Security:
- Password is hashed using bcrypt before storage.

Flow:

Request
↓
Check Existing Doctor
↓
Hash Password
↓
Create Doctor
↓
Store In MongoDB
↓
Success Response

## Doctor Health ID (DHID)

Purpose:
A unique identifier assigned to every doctor during registration.

Format:

DH-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Benefits:
- Unique doctor identification
- Audit trail support
- Prescription ownership tracking
- Hospital-independent identity

Example:

DH-8a92bcf1-1234-5678-9abc-123456789def

## Doctor Login

Endpoint:
POST /api/v1/doctors/login

Purpose:
Authenticates a doctor and returns a JWT token.

Flow:

Email + Password
↓
Find Doctor
↓
bcrypt.compare()
↓
Generate JWT
↓
Return Token

JWT Payload:

- doctorId
- dhid

Token Expiry:

7 Days

Outcome:
Authenticated doctors can access protected APIs.

## Doctor Authentication Middleware

File:
src/middlewares/doctorAuth.middleware.js

Purpose:
Protects doctor-only routes by verifying JWT tokens.

Flow:

Request
↓
Authorization Header
↓
Extract Token
↓
jwt.verify()
↓
Find Doctor
↓
req.doctor
↓
next()

Failure Cases:

- Missing Token → 401 Unauthorized
- Invalid Token → 401 Unauthorized
- Doctor Not Found → 404 Not Found

Outcome:
Only authenticated doctors can access protected doctor routes.

## Medical Case Model

Purpose:
Stores a complete medical case for a patient.

Examples:

- ACL Injury
- Diabetes
- Seasonal Allergy
- Vitamin D Deficiency

Contains:

- Diagnosis
- Reports
- Prescriptions
- Doctors
- Verdict
- Final Advice
- Status

Benefits:

- Organizes medical history into cases
- Enables expandable timeline UI
- Supports future AI summaries
- Supports doctor and lab integrations

## Create Medical Case

Endpoint:
POST /api/v1/medical-case/create

Purpose:
Creates a new medical case for an authenticated patient.

Flow:

Patient
↓
JWT Verification
↓
Extract Medical Case Data
↓
MedicalCase.create()
↓
MongoDB
↓
Success Response

Request Body:

{
  "diagnosis": "ACL Injury",
  "verdict": "Grade 2 ACL Sprain",
  "finalAdvice": "Continue Physiotherapy"
}

Outcome:
A new medical case is created and added to the patient's medical timeline.

## Get Medical Case By ID

Endpoint:
GET /api/v1/medical-case/:caseId

Purpose:
Returns a specific medical case belonging to the authenticated patient.

Flow:

Request
↓
Patient JWT Middleware
↓
Verify Token
↓
Extract caseId from URL
↓
MedicalCase.findById()
↓
Ownership Verification
↓
Success Response

Requirement:
Authorization header containing a valid patient JWT.

Security:
Patients can only access medical cases that belong to them.

Failure Cases:

- Invalid Case ID → 404 Not Found
- Case Does Not Exist → 404 Not Found
- Case Belongs To Another Patient → 403 Forbidden

Outcome:
Returns complete information for a single medical case, enabling expandable timeline views in the frontend.

## Security Improvement

Issue:
Any authenticated patient could potentially access another patient's medical case if they knew the case ID.

Fix:
Added ownership verification before returning medical case data.

Implementation:

if (
    medicalCase.patientId.toString() !==
    req.patient.patientID
){
    return res.status(403).json({
        message : "Access denied"
    })
}

Lesson:
Authentication confirms identity. Authorization confirms permissions. Both are required when handling sensitive medical records.

## Timeline Backend V1

Implemented APIs:

- Create Medical Case
- Get My Medical Cases
- Get Medical Case By ID

Security:

- JWT Authentication
- Ownership Verification
- Protected Patient Routes

Outcome:

Patients can create medical cases, view their medical timeline, and access detailed information for individual cases.

## Report Model

Purpose:
Stores medical reports associated with a specific medical case.

Examples:

- MRI Report
- X-Ray Report
- Blood Test Report
- Prescription PDF

Relationships:

Patient
↓
Medical Case
↓
Report

Fields:

- medicalCaseId
- reportName
- reportType
- fileUrl
- fileType
- uploadedByType
- uploadedById

Report Types:

- Blood Test
- MRI
- X-Ray
- CT-Scan
- Ultrasound
- Prescription
- Other

Uploader Types:

- Patient
- Doctor
- Lab

Benefits:

- Keeps reports organized under a medical case
- Supports PDF and image uploads
- Enables future AI analysis
- Enables doctor, patient and lab uploads
- Supports expandable timeline UI

Outcome:

Medical reports can be linked to medical cases while maintaining scalability for future integrations.

## Create Report API

Endpoint:
POST /api/v1/reports/create

Purpose:
Creates a medical report and links it to an existing medical case.

Flow:

Patient JWT
↓
Verify Token
↓
Verify Medical Case Exists
↓
Verify Ownership
↓
Report.create()
↓
MongoDB
↓
Success Response

Request Body:

{
  "medicalCaseId": "...",
  "reportName": "MRI Report",
  "reportType": "MRI",
  "fileUrl": "https://example.com/mri-report.pdf",
  "fileType": "pdf"
}

Security:

- Medical Case must exist
- Medical Case must belong to the authenticated patient

Report Metadata:

- uploadedByType = Patient
- uploadedById = Authenticated Patient ID

Outcome:

Patients can upload reports to their own medical cases while preventing unauthorized access to other patients' records.

## Get Reports By Medical Case

Endpoint:
GET /api/v1/reports/case/:medicalCaseId

Purpose:
Returns all reports belonging to a specific medical case.

Flow:

Patient JWT
↓
Verify Token
↓
Find Medical Case
↓
Verify Ownership
↓
Report.find()
↓
Success Response

Requirement:

- Valid Patient JWT
- Medical Case must exist
- Medical Case must belong to authenticated patient

Response:

[
  {
    "reportName": "MRI Report",
    "reportType": "MRI"
  },
  {
    "reportName": "Blood Test",
    "reportType": "Blood Test"
  }
]

Outcome:

Patients can retrieve all reports associated with a medical case while ensuring report access remains restricted to the owner of the medical case.