# Project Collaboration Feature

## Overview
Added the ability for project owners to invite other registered users to collaborate on projects.

## Key Changes

### 1. Database Schema
- Added `ProjectMember` table to track which users have access to which projects
- Many-to-many relationship between `User` and `Project` via `ProjectMember`

### 2. Backend Updates
- **Project Routes**: Owner can add/remove members via email
  - `POST /api/projects/:id/members` - Add member by email
  - `DELETE /api/projects/:id/members/:memberId` - Remove member
- **Access Control**: All routes now check if user is owner OR member
  - Projects, Versions, Test Cases, Dashboard, CSV operations

### 3. Frontend Updates
- **ProjectsPage**: Edit modal shows member management section (owner only)
- **ProjectDetailPage**: Shows members section with add/remove functionality (owner only)
- **i18n**: Added member-related translation keys in `en.json` and `ja.json`

## How It Works

1. **Invite by Email**: Type user's email address, no approval needed
2. **Validation**: 
   - Email must belong to a registered user
   - Cannot add owner as member
   - Cannot add same user twice
3. **Access**: All members see the same projects, versions, and test cases
4. **Permissions**: Only the owner can:
   - Add/remove members
   - Delete the project
5. **Error Messages**: Clear feedback if user is not registered

## Database Migration

Run this to apply the schema changes:

```bash
cd backend
npx prisma migrate dev --name add_project_collaboration
```

Or if you prefer to reset (WARNING: clears all data):

```bash
cd backend
npx prisma migrate reset
npm run seed
```

## Testing

1. Create two user accounts (e.g., user1@test.com, user2@test.com)
2. Login as user1, create a project
3. In project detail or edit modal, add user2@test.com as member
4. Logout and login as user2
5. Verify user2 can see the project and all its data
6. Try creating test cases as user2
7. Verify only user1 (owner) can manage members

## API Examples

**Add Member:**
```bash
POST /api/projects/1/members
{
  "email": "user2@example.com"
}
```

**Remove Member:**
```bash
DELETE /api/projects/1/members/5
```

## Error Responses

- `404`: "User not registered. Please ask them to create an account first."
- `400`: "User is already a member"
- `400`: "You are already the owner of this project"
- `404`: "Project not found or you are not the owner"
