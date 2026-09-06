# Bugs & Fixes

## Bug 1: ERR_MODULE_NOT_FOUND

Error:

```text
ERR_MODULE_NOT_FOUND
```

Cause:

```js
import { healthCheck } from "../controllers/health.controller";
```

Fix:

```js
import { healthCheck } from "../controllers/health.controller.js";
```

---

## Bug 2: Router Mounted Incorrectly

Incorrect:

```js
app.get("/", healthRouter);
```

Fix:

```js
app.use("/", healthRouter);
```

---

## Bug 3: Wrong Router Export

Incorrect:

```js
export default Router;
```

Fix:

```js
export default router;
```
## Bug 6: Wrong Database Import Path

Error:
ERR_MODULE_NOT_FOUND

Cause:
Incorrect relative path while importing connectDB.

Fix:

```js
import connectDB from "./db/index.js";
```

---

## Bug 7: Missing Default Export

Error:
does not provide an export named 'default'

Cause:
connectDB was not exported as default.

Fix:

```js
export default connectDB;
```

## Bug 9: Variable Name Case Mismatch

Error:
ReferenceError: fullname is not defined

Cause:
Used `fullname` instead of the declared `fullName`.

Fix:
Use consistent variable naming.

Lesson:
JavaScript is case-sensitive.

## Bug 11: Schema Field Name Mismatch

Error:
Patient validation failed: fullname is required.

Cause:
The schema used `fullname` while the controller used `fullName`.

Fix:
Use `fullName` consistently across Postman, controller and model.

Lesson:
Mongoose field names are case-sensitive.

## Bug 12: Duplicate Null OHID

Error:
E11000 duplicate key error: ohid: null

Cause:
OHID was marked unique but was not generated during registration.

Fix:
Generate a unique OHID before creating the patient.

Lesson:
A unique field must receive a unique value when creating a document.

## Bug 13: JWT Secret Not Loaded

Error:
secretOrPrivateKey must have a value

Cause:
JWT_SECRET was missing or incorrectly configured in .env, causing process.env.JWT_SECRET to be undefined.

Fix:
Added JWT_SECRET to .env and restarted the server.

Example:

JWT_SECRET=OpenHealthSuperSecretKey123

Lesson:
Whenever a new environment variable is added, restart the server and verify it is being loaded correctly.

## Bug 14: Postman Cookie Storage Error

Error:
PersistentStore: CookieStorageRemoteClient is missing

Observed:
API request completed successfully and returned HTTP 200 OK with a valid JWT token.

Cause:
Postman client-side persistence/cookie storage issue.

Impact:
No impact on backend functionality.

Resolution:
Refresh/restart Postman, re-login, or update the Postman client.

Lesson:
Always verify the HTTP status code, response body, and backend logs before assuming the backend is broken.

## Bug

Error:
Patient validation failed: gender: `Male` is not a valid enum value.

Cause:
The gender field in the schema uses enum values:
["male", "female", "other"]

A value of "Male" was stored/sent, which does not match the enum because Mongoose enums are case-sensitive.

Fix:
Updated the gender value to use lowercase ("male") and added normalization logic before saving.

Lesson:
Always normalize enum fields before storing them in MongoDB.

## Bug

Error:
OTP fields were not being saved to MongoDB.

Cause:
Controller used:
- resetotp
- resetotpExpiry

while the schema defined:
- resetOtp
- resetOtpExpiry

Fix:
Updated the controller field names to exactly match the schema.

Lesson:
Mongoose schema fields are case-sensitive and must match exactly.

## Bug

Error:
Latest generated OTP was always reported as invalid.

Cause:
Controller used incorrect field names:
- resetotp
- resetotpExpiry

The schema used:
- resetOtp
- resetOtpExpiry

As a result, OTP values were never stored in MongoDB.

Fix:
Updated controller field names to exactly match schema definitions.

Lesson:
Mongoose schema fields are case-sensitive.

## Bug

Error:
Doctor login returned "Invalid Credentials" despite correct password.

Cause:
Doctor account was created before bcrypt hashing was implemented, resulting in an unhashed/invalid stored password.

Fix:
Deleted the old doctor record and registered again using the updated registration flow.

Lesson:
Whenever authentication logic changes, test with freshly created accounts.

## Protected Route: Doctor Profile

Endpoint:
GET /api/v1/doctors/profile

Purpose:
Returns information about the currently authenticated doctor.

Flow:

Request
↓
Doctor JWT Middleware
↓
Verify Token
↓
Find Doctor
↓
Controller
↓
Response

Requirement:
Authorization header containing a valid JWT.

Outcome:
Authenticated doctors can retrieve their profile information.

## Bug

Error:
E11000 duplicate key error collection: openHealth.doctors index: ohid_1

Cause:
An obsolete MongoDB unique index (ohid_1) remained after schema changes.

Fix:
Deleted the old ohid_1 index from the doctors collection.

Lesson:
Removing a field from a Mongoose schema does not automatically remove its MongoDB index.

## Bug

Error:
Protected doctor profile route returned "Invalid Token".

Cause:
Authorization header token was extracted correctly, but the Node.js process object was mistakenly passed to jwt.verify() instead of the JWT token.

Incorrect:

jwt.verify(process, process.env.JWT_SECRET)

Correct:

jwt.verify(token, process.env.JWT_SECRET)

Fix:
Replaced process with token in JWT verification.

Lesson:
Always verify that the extracted token variable is passed to jwt.verify().

## Bug

Error:
MedicalCase creation failed with:

ValidationError: patientId is required

Cause:
The JWT payload stored the patient identifier as:

patientID

but the controller attempted to access:

req.patient.patientId

Because JavaScript is case-sensitive, the value became undefined and Mongoose validation failed.

Fix:
Updated the controller to use the correct field from the decoded JWT payload.

Lesson:
When using JWT payload data, ensure field names match exactly. A small casing mismatch can cause undefined values and validation failures.

## Bug

Error:
GET /medical-case/my-cases returned 404 Not Found.

Cause:
The route was registered as:

router.get("my-cases", ...)

instead of:

router.get("/my-cases", ...)

Because the leading slash was missing, Express could not match the URL.

Fix:
Added the missing "/" before the route path.

Lesson:
Express route paths should always begin with "/" to ensure proper URL mapping.

## Bug

Error:
GET /medical-case/my-cases returned 401 Unauthorized.

Cause:
The request was sent without a valid Authorization header containing the patient JWT.

Fix:
Added the Authorization header in Postman using:

Authorization: Bearer <token>

Lesson:
Protected routes require a valid JWT token in the Authorization header. Always test authenticated APIs with a fresh token.

## Bug

Error:
MedicalCase endpoint returned incorrect results when route parameters were expected.

Cause:
The controller attempted to read caseId from req.body instead of req.params.

Incorrect:

const { caseId } = req.body

Correct:

const { caseId } = req.params

Fix:
Retrieved the route parameter using req.params.

Lesson:
Data in URL routes (/:id) is accessed through req.params, not req.body.

## Bug

Error:
POST /api/v1/reports/create executed the Medical Case controller instead of the Report controller.

Cause:
reportRouter was incorrectly imported from:

./routes/medicalCase.routes.js

instead of:

./routes/report.routes.js

As a result, requests sent to:

/api/v1/reports/create

were handled by the Medical Case routes.

Fix:
Updated app.js to import the correct report router.

Incorrect:

import reportRouter from "./routes/medicalCase.routes.js"

Correct:

import reportRouter from "./routes/report.routes.js"

Lesson:
Always verify that route imports match the feature being registered. A wrong router import can silently redirect requests to unrelated controllers.

## Bug

Error:
Report routes failed to register correctly.

Cause:
The router instance was mistakenly referenced as:

req.post(...)

instead of:

router.post(...)

Fix:
Replaced req.post() with router.post().

Lesson:
Route definitions must be attached to the Express Router instance, not the request object.

## Bug

Error:
CastError: Cast to ObjectId failed for value ":<id>"

Cause:
The route parameter was sent with the leading ":" character.

Incorrect:

/api/v1/reports/case/:6a81cae1ab31e2be10ed6adc

Correct:

/api/v1/reports/case/6a81cae1ab31e2be10ed6adc

Fix:
Removed the ":" from the URL value and passed only the ObjectId.

Lesson:
The ":" character is used only when defining Express route parameters. It should never be included in actual API requests.

## Bug

Error:
Application crashed while fetching a report by ID.

Cause:
The controller attempted to access:

report.medicalCaseId

before checking whether the report existed.

Incorrect:

const report = await Report.findById(reportId);

const medicalCase = await MedicalCase.findById(
    report.medicalCaseId
);

if(!report){
    ...
}

Fix:
Moved the null check immediately after fetching the report.

Correct:

const report = await Report.findById(reportId);

if(!report){
    ...
}

const medicalCase = await MedicalCase.findById(
    report.medicalCaseId
);

Lesson:
Always validate database query results before accessing their properties.

## Bug

Error:
ERR_MODULE_NOT_FOUND while importing doctorNote.controller

Cause:
The controller import path was missing the .js extension in an ES Module project.

Incorrect:

import { createDoctorNote } from "../controllers/doctorNote.controller"

Correct:

import { createDoctorNote } from "../controllers/doctorNote.controller.js"

Fix:
Added the .js extension to the import path.

Lesson:
When using Node.js ES Modules, local file imports must include the file extension.

# Bug

## Error

MedicalCase returned null while deleting a report.

## Incorrect

```js
const medicalCase = await MedicalCase.findById(
  report.medicalCaseId
);
```

## Fix

```js
const medicalCase = await MedicalCase.findOne({
  _id: report.medicalCaseId
});
```

## Result

The parent Medical Case was successfully located and report deletion worked correctly.

## Lesson

Always verify referenced documents exist and validate relationships before performing ownership checks.

# Bug

## Error

MedicalCase returned null while deleting a report.

## Incorrect

```js
const medicalCase = await MedicalCase.findById(
  report.medicalCaseId
);
```

## Fix

```js
const medicalCase = await MedicalCase.findOne({
  _id: report.medicalCaseId
});
```

## Result

The parent Medical Case was successfully located and report deletion worked correctly.

## Lesson

Always verify referenced documents exist and validate relationships before performing ownership checks.

# Bug

## Error

```txt
doctor.isPasswordCorrect is not a function
```

## Cause

The Doctor model did not implement an `isPasswordCorrect()` method, but the controller attempted to call it.

## Incorrect

```js
await doctor.isPasswordCorrect(oldPassword);
```

## Correct

```js
const isPasswordCorrect = await bcrypt.compare(
  oldPassword,
  doctor.password
);
```

## Fix

Removed the invalid method call and used direct bcrypt password comparison.

## Lesson

Maintain a consistent password validation strategy across authentication modules.

## Bug

### Error

```text
CastError: Cast to ObjectId failed for value "active-cases"
```

### Cause

The parameterized route:

```js
router.get("/:caseId", verifyPatient, getMedicalCaseByID)
```

was declared before the specific route:

```js
router.get("/active-cases", verifyPatient, getActiveCases)
```

As a result, Express interpreted:

```text
/active-cases
```

as:

```js
caseId = "active-cases"
```

and attempted:

```js
MedicalCase.findById("active-cases")
```

which caused a MongoDB CastError.

### Fix

Move all specific routes above parameterized routes.

Correct:

```js
router.get("/my-cases", verifyPatient, getMyMedicalCases)

router.get("/timeline", verifyPatient, getMyTimeline)

router.get("/active-cases", verifyPatient, getActiveCases)

router.get("/:caseId", verifyPatient, getMedicalCaseByID)
```

### Lesson

In Express, route order matters.

Always place specific routes before dynamic parameter routes such as:

```js
/:id
/:caseId
/:reportId
```

to prevent unintended route matching.

## Bug

### Error

Request remained in loading state indefinitely.

### Cause

The success path did not send any response back to the client.

Incorrect:

```js
if(consent.expiresAt < Date.now()){
    return res.status(400).json({
        message: "OTP Expired"
    });
}
```

Execution reached the end of the function without returning a response.

### Fix

Added success handling.

```js
consent.isUsed = true;

await consent.save();

return res.status(200).json({
    message: "Consent Verified Successfully"
});
```

### Lesson

Every execution path inside an Express controller should return a response.


## Bug

### Error

Doctors retained timeline access indefinitely after a single OTP verification.

### Cause

Consent verification marked the OTP as used but did not implement a mechanism to revoke timeline access after the consultation ended.

```js
consent.isUsed = true;
await consent.save();
```

As a result, any consent record with `isUsed: true` permanently granted access.

### Fix

Introduced session-based access control using an `accessGranted` field.

```js
consent.isUsed = true;
consent.accessGranted = true;

await consent.save();
```

Added an `end-session` API to revoke access:

```js
consent.accessGranted = false;

await consent.save();
```

### Lesson

Temporary authorization should always have an explicit revocation mechanism. Authentication and authorization flows must define both how access is granted and how it is removed.

## Bug

### Error

```text
Must supply api_key
```

### Cause

Cloudinary was initialized before environment variables were loaded.

`cloudinary.js` accessed:

```js
process.env.CLOUDINARY_CLOUD_NAME
process.env.CLOUDINARY_API_KEY
process.env.CLOUDINARY_API_SECRET
```

before `dotenv.config()` had executed.

With ES Modules, imports are evaluated before the rest of the file executes.

Example:

```js
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();
```

Even though `dotenv.config()` appears near the top, `app.js` and its dependency tree are loaded first.

If `cloudinary.js` is imported anywhere inside that chain, Cloudinary receives:

```js
undefined
undefined
undefined
```

for its credentials.

### Fix

Load dotenv inside `cloudinary.js` before reading environment variables.

```js
import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

### Lesson

With ES Modules, imported files execute before the remaining code in the importing file.

When a configuration file depends on environment variables, ensure the variables are loaded before accessing them.

For critical configuration modules such as Cloudinary, explicitly loading dotenv inside the configuration file prevents initialization-order issues.