#  GK Store - Complete E-commerce Platform

##  Project Structure

`
GkStore/
 backend-hub-b1/          # Node.js + Fastify Backend (Multi-tenant SaaS)
 user-website/            # Next.js User E-commerce Website
 admin-panel/             # React Admin Dashboard
`

---

##  Quick Setup - All Projects

### 1 Backend Setup
`ash
cd backend-hub-b1
npm install
cp .env.example .env
# Edit .env with your credentials
npm run db:generate
npm run db:push
npm run dev
`
**Backend runs on:** http://localhost:6005

---

### 2 User Website Setup (Next.js)
`ash
cd user-website
npm install
npm run dev
`
**User Website runs on:** http://localhost:3000

---

### 3 Admin Panel Setup (React + Vite)
`ash
cd admin-panel
npm install
npm run dev
`
**Admin Panel runs on:** http://localhost:3001

---

##  Environment Variables

### Backend (.env)
`env
DATABASE_URL="mongodb://localhost:27017/gkstore"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
`

### User Website (.env.local)
`env
NEXT_PUBLIC_API_URL=http://localhost:6005
NEXT_PUBLIC_SOCKET_URL=http://localhost:6006
NEXT_PUBLIC_TENANT_ID=your-tenant-id
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
`

### Admin Panel (.env)
`env
VITE_API_URL=http://localhost:6005
VITE_TENANT_ID=your-tenant-id
`

---

##  Tech Stack

### Backend
- **Framework:** Fastify + TypeScript
- **Database:** MongoDB + Prisma ORM
- **Cache:** Redis
- **Auth:** JWT + Firebase + Phone OTP
- **Payments:** Razorpay
- **Delivery:** Shiprocket, Delhivery
- **Real-time:** Socket.IO
- **Monitoring:** OpenTelemetry + SigNoz

### User Website
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Forms:** React Hook Form + Zod
- **UI:** Lucide Icons, Framer Motion

### Admin Panel
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Tables:** TanStack Table
- **Charts:** Recharts

---

##  One-Command Setup (Windows)

Create a file setup-all.bat:

`atch
@echo off
echo ========================================
echo Setting up GK Store Platform
echo ========================================

echo.
echo [1/3] Setting up Backend...
cd backend-hub-b1
call npm install
if not exist .env copy .env.example .env
call npm run db:generate
echo Backend setup complete!

echo.
echo [2/3] Setting up User Website...
cd ..\user-website
call npm install
echo User Website setup complete!

echo.
echo [3/3] Setting up Admin Panel...
cd ..\admin-panel
call npm install
echo Admin Panel setup complete!

echo.
echo ========================================
echo  All projects setup complete!
echo ========================================
echo.
echo To start all services:
echo 1. Backend:      cd backend-hub-b1 ^&^& npm run dev
echo 2. User Website: cd user-website ^&^& npm run dev
echo 3. Admin Panel:  cd admin-panel ^&^& npm run dev
echo.
pause
`

Run: setup-all.bat

---

##  Running All Services

### Option 1: Manual (3 terminals)
`ash
# Terminal 1 - Backend
cd backend-hub-b1 && npm run dev

# Terminal 2 - User Website
cd user-website && npm run dev

# Terminal 3 - Admin Panel
cd admin-panel && npm run dev
`

### Option 2: Using PM2 (Recommended)
`ash
# Install PM2 globally
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Stop all
pm2 stop all
`

---

##  Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:6005 | REST API |
| API Docs | http://localhost:6005/docs | Swagger UI |
| Socket.IO | http://localhost:6006 | Real-time events |
| User Website | http://localhost:3000 | Customer-facing store |
| Admin Panel | http://localhost:3001 | Admin dashboard |

---

##  Default Credentials

### Admin Login
- **Email:** admin@gkstore.com
- **Password:** admin123

### Test User
- **Email:** user@test.com
- **Password:** user123

---

##  API Documentation

Full API documentation available at: http://localhost:6005/docs

Key endpoints:
- POST /v1/api/auth/register - User registration
- POST /v1/api/auth/login - User login
- GET /v1/api/products - List products
- POST /v1/api/cart/items - Add to cart
- POST /v1/api/orders - Create order
- POST /v1/api/payments - Process payment

---

##  Project Features

###  Backend Features
- Multi-tenant SaaS architecture
- Subscription management (Free, Starter, Pro, Enterprise)
- Product & inventory management
- Order processing & tracking
- Payment integration (Razorpay, COD)
- Delivery integration (Shiprocket, Delhivery)
- Real-time notifications
- API key management
- Usage tracking & limits
- Webhook support

###  User Website Features
- Product browsing & search
- Shopping cart
- Checkout process
- Order tracking
- User authentication
- Payment gateway integration
- Responsive design
- Real-time updates

###  Admin Panel Features
- Dashboard with analytics
- Product management (CRUD)
- Order management
- Customer management
- Inventory tracking
- Sales reports
- Settings & configuration

---

##  Development Commands

### Backend
`ash
npm run dev          # Development mode
npm run build        # Build for production
npm run start        # Start production server
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
`

### User Website
`ash
npm run dev          # Development mode
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
`

### Admin Panel
`ash
npm run dev          # Development mode
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
`

---

##  Build for Production

`ash
# Backend
cd backend-hub-b1
npm run build
npm run start

# User Website
cd user-website
npm run build
npm run start

# Admin Panel
cd admin-panel
npm run build
npm run preview
`

---

##  Docker Setup (Optional)

`ash
# Backend
cd backend-hub-b1
docker build -t gkstore-backend .
docker run -p 6005:6005 gkstore-backend

# Or use docker-compose
docker-compose up -d
`

---

##  Documentation

- [Backend API Endpoints](./backend-hub-b1/docs/API_ENDPOINTS.md)
- [SaaS Architecture](./backend-hub-b1/docs/SAAS_ARCHITECTURE.md)
- [Deployment Guide](./backend-hub-b1/docs/DEPLOYMENT_GUIDE.md)

---

##  Support

For issues or questions:
- Backend: Check ackend-hub-b1/README.md
- User Website: Check user-website/README.md
- Admin Panel: Check dmin-panel/README.md

---

##  License

MIT License - See LICENSE file for details
