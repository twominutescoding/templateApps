# Auth Service Admin Frontend

React admin panel for managing the auth-service: users, roles, sessions, and monitoring.

## Features

- **Dashboard**: View user and session statistics at a glance
- **User Management**: View, edit, and manage user accounts and roles
- **Role Management**: Create and manage roles across different entities
- **Session Management**: Monitor active sessions and revoke them if needed
- **Dark Mode**: Toggle between light and dark themes
- **Date Formatting**: Customize date and timestamp display formats

## Tech Stack

- **React 19.2** with TypeScript
- **Material-UI v7** for UI components
- **Vite** for blazing-fast development
- **Axios** with automatic token refresh
- **React Router** for navigation

## Prerequisites

1. **Auth Service must be running on port 8091**
2. Node.js 18+ and npm
3. Admin user credentials (only ADMIN role can access this panel)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will start on http://localhost:5174 with proxy to auth-service.

### 3. Login

Use admin credentials from auth-service:
- Username: `admin`
- Password: `password`

## Available Scripts

- `npm run dev` - Start development server (port 5174)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## Environment Variables

Create `.env` file (optional):

```env
VITE_API_BASE_URL=http://localhost:8091/auth/api/v1
```

Default: Uses Vite proxy to auth-service on localhost:8091

## Project Structure

```
admin-frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Reusable components
│   │   ├── layout/        # Layout components (Header, Sidebar)
│   │   └── table/         # AdvancedDataTable component
│   ├── contexts/          # React contexts (Auth)
│   ├── context/           # Date formatting context
│   ├── pages/             # Page components
│   │   ├── users/         # User management
│   │   ├── roles/         # Role management
│   │   └── sessions/      # Session management
│   ├── services/          # API client
│   ├── theme/             # Theme context
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

## API Endpoints Used

### User Management
- `GET /admin/users` - List all users
- `PUT /admin/users/{username}` - Update user
- `PUT /admin/users/{username}/status` - Change user status
- `GET /admin/users/{username}/roles` - Get user roles
- `POST /admin/users/{username}/roles` - Assign role to user
- `DELETE /admin/users/{username}/roles/{role}/entity/{entity}` - Remove role

### Role Management
- `GET /admin/roles` - List all roles
- `GET /admin/roles/{role}/entity/{entity}` - Get specific role
- `POST /admin/roles` - Create new role
- `PUT /admin/roles/{role}/entity/{entity}` - Update role
- `DELETE /admin/roles/{role}/entity/{entity}` - Delete role

### Session Management
- `GET /auth/admin/sessions` - List all active sessions
- `POST /auth/admin/sessions/revoke` - Revoke session by ID
- `POST /auth/admin/users/{username}/logout` - Force logout user

### Dashboard
- `GET /auth/admin/stats/dashboard` - Get dashboard statistics

## Security

- All endpoints require ADMIN role
- JWT tokens stored in localStorage
- Automatic token refresh on expiration (15 minutes)
- Session timeout handled gracefully

## Key Components

### AdvancedDataTable

Reusable data table with:
- Inline editing
- Sorting and filtering
- Export to CSV/Excel
- Row selection

### StatusChip

Interactive status badge:
- Click to change status
- Color-coded (Active=green, Inactive=red)
- Used for users and sessions

## Customization

### Theme

Change theme from Settings page:
- Toggle dark/light mode
- Select predefined color palettes
- Create custom palettes

### Date Formats

Configure date display from Settings:
- Date: DD.MM.YYYY, MM/DD/YYYY, YYYY-MM-DD
- Timestamp: Includes time (HH:mm:ss)

## Building for Production

```bash
npm run build
```

Output will be in `dist/` folder. Deploy to:
- Nginx/Apache static hosting
- Vercel, Netlify, etc.
- Or serve from auth-service (copy to `src/main/resources/static/`)

## Troubleshooting

### "Auth service unavailable"
- Ensure auth-service is running on port 8091
- Check `vite.config.ts` proxy settings

### "Access denied" after login
- Only users with ADMIN role can access
- Check user roles in auth-service database

### Token refresh fails
- JWT_SECRET must match between frontend and backend
- Check browser console for errors

## License

Part of the Auth Service template project.

---

**Last Updated**: 2026-01-09
