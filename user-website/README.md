# GK Store - User Website

Enterprise-level Next.js 14 e-commerce website for customers.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Features

- Product browsing with search and filters
- Shopping cart with real-time sync
- Checkout with Razorpay payment gateway
- Order tracking with live updates
- User authentication (JWT, Firebase, Phone OTP)
- Profile and address management
- Fully responsive design
- Real-time updates via Socket.IO

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **UI**: Lucide Icons, Framer Motion
- **Payment**: Razorpay SDK

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Utilities & API client
├── store/           # Zustand stores
├── hooks/           # Custom React hooks
└── types/           # TypeScript types
```

## 🔧 Environment Variables

Create `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:6005
NEXT_PUBLIC_SOCKET_URL=http://localhost:6006

# Tenant Configuration
NEXT_PUBLIC_TENANT_ID=your-tenant-id
NEXT_PUBLIC_PROJECT_ID=proj_abc123xyz

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key

# Firebase (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Customization

Edit `tailwind.config.ts` to customize colors and theme.

## 📖 Documentation

See main project documentation in `../SETUP_GUIDE.md`

## 🔗 Backend API

Connects to backend at: http://localhost:6005

API Documentation: http://localhost:6005/docs
