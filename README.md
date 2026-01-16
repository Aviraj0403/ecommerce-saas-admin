# GK Store - Admin Panel

Enterprise-level React admin dashboard for store management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## 📦 Features

- Dashboard with real-time analytics
- Product management (CRUD with image upload)
- Order management with live notifications
- Customer management
- Category management
- Subscription and usage tracking
- Store settings and branding
- API key management
- Reports with interactive charts

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **UI**: Lucide Icons

## 📁 Project Structure

```
src/
├── pages/           # Page components
├── components/      # React components
│   └── layout/     # Layout components
├── lib/            # Utilities & API client
├── store/          # Zustand stores
├── hooks/          # Custom React hooks
└── types/          # TypeScript types
```

## 🔧 Environment Variables

Create `.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:6005
VITE_SOCKET_URL=http://localhost:6006

# Tenant Configuration
VITE_TENANT_ID=your-tenant-id
VITE_PROJECT_ID=proj_abc123xyz
```

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Default Login

- Email: admin@gkstore.com
- Password: admin123

## 📖 Documentation

See main project documentation in `../SETUP_GUIDE.md`

## 🔗 Backend API

Connects to backend at: http://localhost:6005

API Documentation: http://localhost:6005/docs
