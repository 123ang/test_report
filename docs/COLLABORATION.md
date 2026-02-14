# Project Collaboration

Project owners can invite other registered users by email to collaborate on projects, versions, and test cases.

---

## Features

- **Invite by email** – No approval flow; instant access for any registered user.
- **Full access for members** – View/create/edit test cases, upload photos, manage versions.
- **Owner-only** – Only the owner can add/remove members and delete the project.
- **UI** – Member management in the project edit modal and on the project detail page (owner only).

---

## How it works

1. Owner adds a member by typing their email (must be a registered user).
2. Validation: cannot add owner as member, cannot add the same user twice.
3. Members see the project in their list and have full access to its data.
4. Clear errors: e.g. "User not registered. Please ask them to create an account first."

---

## API

- **Add member:** `POST /api/projects/:id/members` body `{ "email": "user@example.com" }`
- **Remove member:** `DELETE /api/projects/:id/members/:memberId`

All project/version/test-case/dashboard/CSV routes allow access if the user is **owner or member**.

---

## Database

- **ProjectMember** model: many-to-many between User and Project.
- Migration: `npx prisma migrate dev --name add_project_collaboration` (or use existing migration in repo).

---

## Testing

1. Create two accounts; log in as user1 and create a project.
2. Add user2’s email as member (project edit or detail page).
3. Log in as user2; confirm they see the project and can create/edit test cases.
4. Confirm only user1 can add/remove members and delete the project.
5. Try adding a non-registered email (expect error).

---

## Error responses

- 404: "User not registered. Please ask them to create an account first."
- 400: "User is already a member" / "You are already the owner of this project"
- 404: "Project not found or you are not the owner"
