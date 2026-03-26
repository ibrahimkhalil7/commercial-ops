# Commercial Operations Platform - Frontend

A modern React application for managing commercial operations with role-based interfaces for Managers, Field Agents, and Outlet Managers.

## Overview

This frontend application provides three distinct interfaces based on user roles:

1. **Manager Dashboard** - Overview of team, routes, operations metrics, and live agent positions
2. **Field Agent Interface** - Mobile-first interface for route tracking, check-ins, and location logging
3. **Outlet Manager Portal** - Simple interface for viewing notices and outlet performance

## Tech Stack

- **React 18.2.0** - UI framework
- **Vite 5.0.0** - Build tool with fast hot module replacement
- **React Router 6.20.0** - Client-side routing
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Lucide React 0.292.0** - Icon library
- **Axios** - HTTP client (configured but not yet used; currently using fetch API)

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, logos
│   ├── components/           # Reusable UI components
│   │   ├── Header.jsx       # Sticky header with user profile
│   │   └── Sidebar.jsx      # Role-based navigation sidebar
│   ├── context/             # React Context providers
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── dashboard/           # Dashboard and portal components
│   │   ├── ManagerDashboard.jsx    # Manager overview dashboard
│   │   ├── FieldAgentDashboard.jsx # Field agent mobile interface
│   │   └── OutletPortal.jsx        # Outlet manager portal
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.js       # Hook for accessing auth context
│   ├── layouts/             # Page layout wrappers
│   │   ├── AuthLayout.jsx       # Login page layout
│   │   └── DashboardLayout.jsx  # Main app layout (Header + Sidebar)
│   ├── pages/               # Page components
│   │   └── LoginPage.jsx    # Authentication page
│   ├── services/            # API communication
│   │   └── api.js           # Centralized API service
│   ├── styles/              # Global styles
│   │   └── globals.css      # Tailwind utilities and custom classes
│   ├── utils/               # Utility functions
│   │   ├── ProtectedRoutes.jsx  # Route protection components
│   │   └── helpers.js           # Formatter and utility functions
│   ├── App.jsx              # Main app routing
│   └── main.jsx             # React root entry point
├── .prettierrc              # Code formatting rules
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── postcss.config.js        # CSS processing config
├── tailwind.config.js       # Tailwind customization
└── vite.config.js           # Vite build configuration
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Check code with ESLint (when configured)

## Authentication Flow

1. User navigates to `/login`
2. Enters credentials (email and password)
3. Request sent to backend `/api/auth/token/` endpoint
4. On success:
   - Access token stored in localStorage
   - User redirected to role-appropriate dashboard:
     - `admin`/`manager` → `/` (Manager Dashboard)
     - `field_agent` → `/agent` (Field Agent Dashboard)
     - `outlet_manager` → `/outlet` (Outlet Manager Portal)
5. Token verified on app load; if invalid, user returned to login

## Routing Structure

```
/               → Manager Dashboard (admin, manager)
/login          → Login page (public)
/agent          → Field Agent Dashboard (field_agent)
/outlet         → Outlet Manager Portal (outlet_manager)
/*              → Redirect to /
```

All routes except `/login` require authentication (PrivateRoute wrapper).
Role-based routes (RoleRoute) additionally check user role and display "Access Denied" if unauthorized.

## Component Architecture

### AuthContext

Manages authentication state:
- `user` - Current user object with role
- `token` - JWT access token
- `isAuthenticated` - Boolean auth status
- `login(email, password)` - Login function
- `logout()` - Logout function
- `loading` - Loading state during auth operations
- `error` - Error messages from auth failures

### Protected Routes

```javascript
// PrivateRoute - Checks if user is authenticated
<Route element={<PrivateRoute />}>
  {/* Child routes only accessible if authenticated */}
</Route>

// RoleRoute - Checks if user has required role
<RoleRoute 
  component={DashboardComponent} 
  allowedRoles={['admin', 'manager']} 
/>
```

### API Service

Centralized API methods for backend communication:

```javascript
// Authentication
apiService.login(email, password)

// User management
apiService.getMe()
apiService.getUsers(filters)

// Core operations
apiService.getOutlets(filters)
apiService.getRoutes(filters)
apiService.getVisits(filters)
apiService.getNotices(filters)
apiService.getTickets(filters)

// Reporting
apiService.getDailyReport(date)
```

## Styling

Uses Tailwind CSS with custom utility classes defined in `src/styles/globals.css`:

- `.btn-*` - Button variants (primary, secondary, danger, success)
- `.form-*` - Form element styles (input, textarea, select, label)
- `.card` - Card container with shadow
- `.badge-*` - Status badges (primary, success, warning, danger, gray)
- `.alert-*` - Alert/notification styles
- `.table` - Sortable table styling
- `.spinner` - Loading spinner (in CSS)

### Color Scheme

- **Primary**: Blue (#0066cc, #0052a3, etc.)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Gray**: Gray-500 (text), Gray-200 (borders)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Errors

Ensure the Django backend is running and has CORS enabled:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### API Connection Issues

Check that the backend is running on `http://localhost:8000` and the Vite proxy is configured correctly in `vite.config.js`.

### Token Expiration

Tokens are stored in localStorage. If a request returns 401, the user is redirected to `/login` to re-authenticate.

## Future Enhancements

- [ ] Replace fetch API with Axios client
- [ ] Add Google Maps integration for live agent tracking
- [ ] Implement real-time updates with WebSockets
- [ ] Add offline-first capability with service workers
- [ ] Implement advanced filtering and search
- [ ] Add data export (CSV, PDF) functionality
- [ ] Create advanced analytics dashboard
- [ ] Implement route optimization algorithm
- [ ] Add multi-language support (i18n)

## Contributing

1. Follow the existing code style and directory structure
2. Use meaningful commit messages
3. Test all routes and authentication flows
4. Update documentation for new features

## License

Commercial © 2024 All Rights Reserved
