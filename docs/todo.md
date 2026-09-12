# OpenHealth Pending Features

## Family Group Module

### Timeline Sharing

#### Endpoint

GET /api/v1/family/member/:patientId/timeline

#### Purpose

Allow family members belonging to the same family group to view each other's medical timeline.

#### Status

Pending

---

### AI Summary Sharing

#### Endpoint

GET /api/v1/family/member/:patientId/ai-summary

#### Purpose

Allow family members belonging to the same family group to view each other's AI-generated health summaries.

#### Status

Pending

---

## Digital Will Module

### Beneficiaries

#### Purpose

Allow patients to choose exactly which family members can access their Digital Will after unlocking.

#### Example

- Father
- Mother
- Spouse
- Children

#### Status

Pending

---

### Death Verification Workflow

#### Purpose

Establish a trustworthy mechanism to verify that the patient is deceased before unlocking the Digital Will.

#### Possible Future Solutions

- Government Verification
- Manual Review
- Challenge Period
- Patient Confirmation Workflow

#### Status

Pending

---

### Digital Will Unlock Flow

#### Flow

Death Certificate Uploaded

↓

Verification Completed

↓

Digital Will Unlocked

↓

Authorized Beneficiaries Can Access

#### Status

Pending

---

### Family View Digital Will

#### Endpoint

GET /api/v1/digital-will/view/:patientId

#### Purpose

Allow authorized beneficiaries to access an unlocked Digital Will.

#### Status

Pending

---

### Digital Will Access Logs

#### Purpose

Maintain a complete history of:

- Who viewed the Digital Will
- When it was viewed
- Which patient the Digital Will belonged to

#### Security Benefits

- Transparency
- Accountability
- Auditability

#### Status

Pending

---

### Section Visibility Controls (Optional)

#### Purpose

Allow patients to decide which sections become visible after unlocking.

#### Example

| Section | Visibility |
|----------|------------|
| Insurance | Visible |
| Bank Details | Visible |
| Passwords | Visible |
| Personal Message | Visible |
| Custom Notes | Hidden |

#### Status

Future Enhancement

---

## Upcoming Major Modules

### AI Summary

#### Planned Features

- Generate AI Health Summary
- Store AI Summary
- Regenerate Summary
- Family Access Integration

#### Status

Not Started

---

### Doctor Chat

#### Planned Features

- Patient ↔ Doctor Messaging
- Conversation History
- Timeline Integration

#### Status

Not Started

---

### Lab Module

#### Planned Features

- Lab Registration
- Report Upload
- Report Delivery
- Timeline Integration

#### Status

Not Started

---

## Frontend

### Planned Features

- Patient Dashboard
- Family Dashboard
- Digital Will UI
- AI Summary UI
- Doctor Chat UI
- Lab UI

#### Status

Not Started