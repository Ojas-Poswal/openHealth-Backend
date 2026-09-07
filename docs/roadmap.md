# OpenHealth Roadmap

## Vision

OpenHealth is a patient-centric healthcare platform that transforms fragmented medical records into a lifelong healthcare timeline.

The platform enables patients, doctors, laboratories, and families to collaborate around a single source of truth while ensuring that patients remain the owners of their healthcare data.

---

# Development Strategy

Current Priority:

✅ Backend First

The backend will be fully completed before major frontend development begins.

Reason:

- Stable APIs before UI integration
- Easier testing and debugging
- Faster feature iteration
- Clear separation of responsibilities

---

# Core Architecture

Patient
↓
Medical Case
↓
Report
↓
Doctor Note

Future Extensions:

Patient
↓
Medical Case
├── Reports
├── Doctor Notes
├── Prescriptions
├── Chat
└── AI Summary

Patient
├── Family Group
├── Digital Health Will
└── Timeline

---

# Actors

## Patient

### Authentication

- Register
- Login
- Forgot Password
- Verify OTP
- Reset Password
- Change Password

### Profile

- View Profile
- Update Profile

### Medical History

- Create Medical Case
- View Medical Cases
- View Timeline
- View Reports

### AI Features

- AI Health Summary
- Timeline Summary
- Case Summary

### Health Management

- Manage Allergies
- Manage Chronic Conditions
- Manage Emergency Information

### Digital Health Will

- Create Will
- Update Will
- View Will
- Assign Beneficiaries

### Family Features

- Create Family Group
- Invite Members
- Manage Permissions

---

## Doctor

### Authentication

- Register
- Login
- Change Password
- Update Profile

### Patient Search

Search By:

- OHID
- Patient Name

### Access Control

- Request Access
- OTP Verification
- Time-Limited Access

### Timeline Access

- View Timeline
- View Active Cases
- View Reports

### Medical Collaboration

- Add Doctor Notes
- Add Prescriptions
- Add Remarks

### Doctor Profile

Fields:

- Full Name
- Email
- Phone
- Qualification
- Specialization
- Registration Number
- Workplace

Notes:

- Doctor identity belongs to the doctor
- Independent of hospital affiliation
- Workplace can be updated

---

## Laboratory

### Authentication

- Register
- Login
- Change Password
- Update Profile

### Patient Search

Search By:

- OHID
- Patient Name

### Report Management

- View Active Medical Cases
- Upload Reports
- Attach Reports To Cases
- View Uploaded Reports

---

# Security Rules

## Patient Ownership

- Patient owns healthcare data
- Patient controls access
- Access can be revoked

## Doctor Access

- Requires patient consent
- Requires OTP verification
- Temporary access window

## Laboratory Access

- Limited to report operations
- No access to Digital Will
- No access to doctor conversations

## Digital Will Protection

Doctors cannot:

- View Digital Will
- Modify Digital Will

Labs cannot:

- View Digital Will
- Modify Digital Will

## OTP Rules

- OTP expires after a limited time
- OTP can only be used once
- OTP required for sensitive actions

---

# Backend Modules

## Completed

### Patient Module

- Register
- Login
- Get Profile
- Update Profile
- Change Password
- Forgot Password
- Verify OTP
- Reset Password

### Doctor Module

- Register
- Login
- Get Profile
- Update Profile
- Change Password

### Medical Case Module

- Create Medical Case
- Get My Medical Cases
- Get Medical Case By ID

### Report Module

- Create Report
- Get Reports By Medical Case
- Get Report By ID
- Update Report
- Delete Report

### Doctor Note Module

- Create Doctor Note

### System Module

- Health Check

---

# Backend Milestone 1

Core Healthcare Record System

Status:

✅ Completed

Includes:

- Patient Authentication
- Doctor Authentication
- Medical Cases
- Reports
- Doctor Notes

---

# Backend Milestone 2

Timeline System

Status:

🔄 Planned

Features:

- Patient Timeline API
- Timeline Filtering
- Active Cases
- Resolved Cases
- Timeline Search

Endpoints:

GET /timeline

GET /timeline/active

GET /timeline/resolved

---

# Backend Milestone 3

AI Summary Engine

Status:

🔄 Planned

Features:

- Overall Patient Summary
- Medical Case Summary
- Timeline Summary

Endpoints:

GET /summary

GET /summary/:caseId

---

# Backend Milestone 4

Doctor Portal APIs

Status:

🔄 Planned

Features:

- Search Patient
- Request Access
- Verify OTP
- View Timeline
- View Summary
- Add Notes
- Add Prescriptions

---

# Backend Milestone 5

Laboratory Portal APIs

Status:

🔄 Planned

Features:

- Lab Authentication
- Patient Search
- Case Selection
- Report Upload

---

# Backend Milestone 6

Prescription Module

Status:

🔄 Planned

Features:

- Create Prescription
- Update Prescription
- View Prescription History

---

# Backend Milestone 7

Patient-Doctor Chat

Status:

🔄 Planned

Features:

- Case-Based Conversations
- Message History
- Doctor Access Control

Models:

- Conversation
- Message

---

# Backend Milestone 8

Family System

Status:

🔄 Planned

Features:

- Family Groups
- Invite Members
- Permission Control

Visible To Family:

- Timeline
- AI Summary

Restricted:

- Digital Will
- Doctor Chats
- Private Notes

---

# Backend Milestone 9

Digital Health Will

Status:

🔄 Planned

Features:

- Family Medical History
- Genetic Information
- Emergency Instructions
- Long-Term Health Notes

Models:

- DigitalWill
- Beneficiary

---

# Future Vision

OpenHealth becomes:

Not a document storage platform.

Not a hospital management system.

But a lifelong healthcare companion that preserves, explains, and securely transfers medical knowledge across generations.

# Family Groups System

## Purpose

Allows patients to organize trusted family members into groups and securely access shared healthcare information.

Family Groups are not chat groups.

They are healthcare trust networks that provide access to:

- Medical Timelines
- AI Health Summaries
- Digital Will Information

---

## Core Philosophy

A Family Group acts as a container for trusted individuals.

Each member retains their own medical records, timeline, AI summaries, and digital will.

Group members can navigate between profiles within the same group.

---

## Membership Rules

### Multiple Group Support

A patient can belong to multiple family groups.

Examples:

- Poswal Family
- Grandparents Group
- Emergency Care Group

---

## Roles

### Admin

Can:

- Add Members
- Remove Members
- Promote Admins
- Demote Admins
- Delete Group

### Member

Can:

- View Group
- Access Authorized Profiles
- Leave Group

---

## Group Discovery

Groups can be found using:

- OHID
- Phone Number
- Invitation Code

Name-based search is not included in V1.

---

## Join Policies

### Public Group

Users can join immediately.

Flow:

Join Request

↓

Member Added

### Private Group

Admin approval required.

Flow:

Join Request

↓

Admin Approval

↓

Member Added

---

## Profile Navigation

Inside a Family Group, members appear as profile cards.

Example:

👤 Father

👤 Mother

👤 Son

👤 Grandmother

Selecting a profile opens that member's healthcare view.

---

## Available Sections

### Timeline

Displays:

- Medical Cases
- Reports
- Doctor Notes
- Prescriptions

### AI Summary

Displays AI-generated health summaries for the selected member.

### Digital Will

Displays Digital Will status.

Example:

Digital Will

Status: Locked

---

## Digital Will Access

Digital Will content remains locked until death verification.

Flow:

Patient Death

↓

Death Certificate Uploaded

↓

Verification

↓

Digital Will Unlocked

---

## Relationship Support

Each member stores a relationship label.

Examples:

- Father
- Mother
- Son
- Daughter
- Spouse
- Grandfather
- Grandmother
- Guardian

This relationship data is used for:

- UI Display
- AI Summaries
- Beneficiary Management
- Future Notifications

---

## Security

- Multiple Admins Supported
- Members Can Leave Groups
- Admins Can Remove Members
- Patients Can Belong To Multiple Groups
- Digital Wills Remain Locked Until Verification

---

## Future Enhancements

### Emergency Access

Allows healthcare access when a patient cannot provide approval.

Example:

Patient Unconscious

↓

Emergency Access Request

↓

Audit Logged

↓

Temporary Access Granted

### Family Health Dashboard

Aggregated AI summaries for all family members.

### Family Notifications

Critical health alerts shared with designated family members.