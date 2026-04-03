# Task Manager (Next.js + Prisma + PostgreSQL)

A full-stack task management application with authentication, task CRUD, completion flow, validation, and persistent storage.

## Features

- Create tasks with title and description
- View all tasks for the logged-in user
- Mark tasks as completed
- Edit task details
- Delete tasks
- Persistent storage with PostgreSQL + Prisma
- Validation and meaningful API error messages
- Bonus features:
	- Due dates
	- Task categories

## Tech Stack

- Next.js (App Router)
- TypeScript
- NextAuth
- Prisma ORM
- PostgreSQL
- Tailwind CSS

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database
- OAuth credentials for Google and/or GitHub (for NextAuth)

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_ID=""
GITHUB_SECRET=""
```

## Installation

```bash
pnpm install
```

## Database Setup

1. Update Prisma schema in your DB:

```bash
pnpm prisma db push
```

2. Generate Prisma client:

```bash
pnpm prisma generate
```

3. (Optional) Seed sample data:

```bash
pnpm prisma db seed
```

## Run the App

```bash
pnpm dev
```

Open `http://localhost:3000`.

## How to Use

1. Sign in using a configured provider.
2. Create a task using title, description, optional due date, and optional category.
3. View your tasks in the list.
4. Use `Complete` to mark a task as done.
5. Use `Edit` to update task details.
6. Use `Delete` to remove a task.

## Validation and Error Handling

- `title` is required and cannot be empty.
- Completing an already completed task returns a clear validation error.
- Unauthorized requests return `401 Unauthorized`.
- Non-existing tasks return `404 Task not found`.
- All API routes return structured JSON errors with meaningful messages.

## API Endpoints

- `GET /api/tasks` - list tasks for current user
- `POST /api/tasks` - create a task
- `PUT /api/tasks/:taskId` - edit task details
- `DELETE /api/tasks/:taskId` - delete task
- `PATCH /api/tasks/:taskId/complete` - mark task as completed

## Code Structure

- `prisma/schema.prisma`
	- Defines `User` and `Task` models and relationships.
- `src/app/api/tasks/route.ts`
	- Task listing and creation.
- `src/app/api/tasks/[taskId]/route.ts`
	- Task update and delete handlers.
- `src/app/api/tasks/[taskId]/complete/route.ts`
	- Completion logic with duplicate-complete prevention.
- `src/app/components/TaskManager.tsx`
	- Main task management UI and client-side interactions.
- `src/app/components/Appbar.tsx`
	- Auth controls (sign in/out) and greeting.

## Key Decisions

- Tasks are user-scoped via `userId`, so each user only sees their own tasks.
- Completion is handled by a dedicated endpoint to enforce the "already completed" rule clearly.
- Zod is used for request validation to keep API contracts explicit and reliable.
- Optional due date and category are included to support bonus requirements without complicating core flows.

## Test and Quality Checks

Run lint:

```bash
pnpm lint
```

## Submission Notes

For submission, commit your changes and push to your GitHub repository branch, then submit the repository link in the provided Google Form.
 