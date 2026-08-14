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