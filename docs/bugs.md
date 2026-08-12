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