# ⚖️ ComplianceHub

### Automated Multi-State Employee Compliance Workflow Platform

> **Turn employee lifecycle events into automated compliance workflows  zero manual tracking, zero missed deadlines.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

---

## 🔗 Quick Links


| 🌐 Live App | → | [View App](https://compliancehub-deepv.vercel.app/) |

## 📌 What Is ComplianceHub?

When a startup hires their **first employee in Texas**, they unknowingly trigger **8 government registrations** across 4 state agencies each with different deadlines, penalties, and filing procedures.

**Most companies miss these deadlines. The average penalty? $500–$5,000 per violation.**

ComplianceHub solves this by **automatically detecting employee lifecycle events** and **generating a precise compliance checklist** with calculated due dates, penalty exposure, and instructions  so HR teams never miss a deadline again.
<p align="center">
<img width="1919" height="823" alt="image" src="https://github.com/user-attachments/assets/6432db7c-fd16-409f-b064-1319b65b478a" />
</p>


## ✨ Features & Screenshots


### 📊 1. Analytics Dashboard

Real-time operational metrics  computed client-side with zero server round-trips.

**What's included:**
- **6 KPI stat cards**  active employees, states, overdue tasks, due this week, total penalty exposure, completion rate percentage
- **Bar chart**  compliance tasks distributed across CA, TX, NY states (Recharts)
- **Pie chart** real-time task status breakdown (pending / completed / overdue)
- **Client-side aggregations** — all calculations run in the browser for instant updates

<p align="center">
  <img alt="image" src="https://github.com/user-attachments/assets/42640f60-6a24-43fa-954d-67045869c0fc" width="49%"  />
  <img alt="image" src="https://github.com/user-attachments/assets/cb365968-ec92-41ad-a558-a8aca03e5216"  width="49%"  />
</p>


### 👥 2. Employee Management

Manage your workforce and automatically trigger compliance workflows on every lifecycle event.

**What's included:**
- **Add employee form**  first/last name, work state (dropdown), hire date, employment type
- **First-employee-in-state detection** — checks if company already has employees in that state before generating tasks
- **Real-time search**  filter list by first name, last name, or work state instantly
- **State badges** visual pills showing each employee's current state (CA, TX, NY)
- **Status tracking** Active, On Leave, Terminated
<p align="center">
  <img alt="image" src="https://github.com/user-attachments/assets/72c852d6-6537-4fea-b8fa-5a8b74cee22e  " width="49%" />
  <img alt="image" src="https://github.com/user-attachments/assets/be62bfd4-d283-4730-8daf-574dcee383ba " width="49%" />
</p>


### ✅ 3. Task Management

Full compliance task lifecycle with intelligent status management and bulk operations.

**What's included:**
- **Smart sort**  overdue tasks always first (red), then ascending by due date
- **Color-coded status**  🔴 Overdue · 🟡 Pending · 🟢 Completed
- **Multi-criteria filters** — state + status + priority combined simultaneously
- **Full-text search**  across task title and employee name
- **Bulk operations**  select multiple tasks → mark all complete in one click
- **Priority levels** Critical, High, Medium, Low
- **Task assignment** assign to specific team member, tracked in audit log
<p align="center">
  <img  alt="image" src="https://github.com/user-attachments/assets/34dc5ef2-8fac-4c12-b2dd-37b80e51274f"  width="49%"/>
  <img  alt="image" src="https://github.com/user-attachments/assets/07518356-c6a1-47fe-af70-48b10ecdc53a"   width="49%"/>
</p>




### 📋 4. Task Detail Page

Complete compliance task information with team collaboration and action buttons.

**What's included:**
- **Full task info**  title, description, state, category, priority badge
- **Due date countdown** — "Due in 5 days" (yellow) or **"OVERDUE by 3 days"** (red, bold)
- **Penalty exposure**  "Estimated penalty if missed: $500"
- **Agency card** agency name, website link, phone number
- **Mark complete button**  updates status, records `completed_at` timestamp, writes to audit log
- **Task comments** add notes with author name and timestamp, visible to all team members

<p align="center">
  <img  alt="image" src="https://github.com/user-attachments/assets/14aa7cac-6b42-4353-b3dc-09ec9376678d" width="49%"/>
  <img  alt="image" src="https://github.com/user-attachments/assets/38071111-edfc-4fa5-9587-c3ee21918bc2" width="49%" />
</p>


### 🔄 5. Employee State Transition

When an employee relocates, the system auto-generates compliance tasks for the new state and closes out the old state.

**What's included:**
- **State change form** select new state, set effective date, add reason (optional)
- **Auto exit tasks**  2 closure tasks generated for old state
- **Auto entry tasks** 6–10 new compliance tasks for new state (only if first employee there)
- **State history table**  full timeline of every state move with dates and reasons
- **Activity log entry**  `employee_state_changed` recorded with old/new state metadata
- 
<p align="center">
<img  alt="image" src="https://github.com/user-attachments/assets/973405fa-9f32-4204-af8b-3bf6bcea19ad" width="49%" />
<img  alt="image" src="https://github.com/user-attachments/assets/241c694a-3da6-4900-9bfe-1216534a0167" width="49%"/>
</p>



### 📅 6. Calendar View

Visual monthly grid of all compliance deadlines — nothing gets lost in a list.

**What's included:**
- **Monthly grid** —
 every compliance task plotted on its due date
- **Color-coded dots** red (overdue), yellow (upcoming), green (completed)
- **Up to 3 tasks per cell**  overflow badge shows "+X more" when more tasks exist
- **Click to navigate**  click any task dot → goes directly to task detail page
- **Month navigation** previous/next month arrows, jump to today button

<p align="center">
  <img width="1917" height="826" alt="image" src="https://github.com/user-attachments/assets/cbfadf3a-daa4-4022-aefa-3c2ecc8a5002" />
</p>


### 📤 7. CSV Export & Reporting

One-click export of compliance data for investor due diligence and internal audits.

**What's included:**
- **9-column report**: `Title | State | Employee | Category | Priority | Status | Due Date | Penalty | Completed At`
- **Filter-aware** — export respects all active filters exactly
- **Instant download** — browser blob generation, no server round-trip needed
- **Audit-ready** — includes `completed_at` timestamps for proof of completion

<p align="center">
  <img width="1919" height="648" alt="image" src="https://github.com/user-attachments/assets/0558bef2-32ec-468b-97cf-6396e6e1ff12" />
</p>


### 📝 8. Immutable Audit Trail

Complete record of every action taken — built for compliance traceability.

**What's included:**
- **7 action types tracked**: `employee_added` · `tasks_generated` · `task_completed` · `task_reopened` · `employee_state_changed` · `comment_added` · `task_assigned`
- **JSONB metadata** — contextual data stored per action (state changed from/to, penalty avoided, etc.)
- **200-entry feed** — reverse-chronological display of most recent actions
- **Insert-only** — audit records can never be edited or deleted

<p align="center">
  <img width="1919" height="822" alt="image" src="https://github.com/user-attachments/assets/651bf91f-d22c-40d4-ad7a-63b719b316cc" />
</p>


### 🔐 9. Authentication

Secure email/password authentication with persistent sessions and protected routes.

**What's included:**
- **Email/password signup** instant account creation
- **Login** — JWT session stored in browser localStorage
- **Persistent sessions** stays logged in after browser refresh and across tabs
- **Protected routes**  all pages auto-redirect to `/auth` if no session found
- **Anti-loop redirect**  authenticated users cannot revisit login page


<p align="center">
  <img src="https://github.com/user-attachments/assets/071aab25-d725-4a5e-8e97-5ad5f01ddfd6" width="49%" />
  <img src="https://github.com/user-attachments/assets/a6810304-4b28-4e5c-8a7f-0805f520ebf6" width="49%" />
</p>




## 🧠 Business Logic

### 📍 State Compliance Requirements

| State | Tasks | Key Requirements |
|-------|:-----:|-----------------|
| 🏖️ **California (CA)** | **10** | EDD Registration, Employer ID, New Hire Report (20d, $490 penalty), Wage Theft Notice, Quarterly DE 9 |
| 🤠 **Texas (TX)** | **8** | Foreign Entity Registration (30d, $500/day penalty), TWC Account, New Hire Report, Quarterly Wage Report |
| 🗽 **New York (NY)** | **9** | DOL Registration, UI Account, New Hire Report ($500 penalty), Wage Notice ($50/day), Quarterly NYS-45 |
| 🌎 **Other States** | **6** | Generic onboarding compliance checklist |


## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|:-------:|---------|
| ⚛️ Frontend | **React** | 18.3.1 | UI component framework |
| 🔷 Language | **TypeScript** | 5.0 | Full type safety |
| ⚡ Build | **Vite** | 5.0 | Build tool + HMR dev server |
| 🎨 Styling | **Tailwind CSS** | 3.4 | Utility-first + dark mode |
| 🧩 Components | **shadcn/ui** | Latest | 40+ accessible components |
| 🔄 State | **React Query v5** | 5.0 | Server state + cache invalidation |
| 🗺️ Routing | **React Router v6** | 6.0 | Client-side routing |
| 📊 Charts | **Recharts** | 2.0 | Bar chart + pie chart |
| 📅 Dates | **date-fns** | 3.0 | Arithmetic + formatting |
| 🟢 Database | **Supabase** | Latest | PostgreSQL + realtime |
| 🔑 Auth | **Supabase Auth** | Latest | JWT + session management |
| 🔐 Security | **Row-Level Security** | — | Database-level user isolation |
| ⚡ API | **PostgREST** | — | Auto-generated REST endpoints |

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm  >= 9.0.0
```

### Setup

```bash
# 1. Clone
git clone https://github.com/yourusername/compliancehub.git
cd compliancehub

# 2. Install
npm install

# 3. Environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# 4. Database — run supabase-schema.sql in your Supabase SQL editor

# 5. Run
npm run dev
# → http://localhost:5173
```

### Deploy

```bash
npm run build
vercel deploy --prod
```



