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