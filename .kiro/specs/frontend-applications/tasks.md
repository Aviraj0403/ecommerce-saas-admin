# Implementation Plan: Frontend Applications

## Overview

This implementation plan breaks down the development of two enterprise-level frontend applications into discrete, manageable tasks. Each task builds on previous work and includes testing to ensure correctness. The plan follows an incremental approach where core functionality is implemented first, followed by advanced features.

## Tasks

- [x] 1. Project Setup and Configuration
  - Initialize Next.js project for user-website with TypeScript and App Router
  - Initialize React + Vite project for admin-panel with TypeScript
  - Configure Tailwind CSS in both projects
  - Set up ESLint and Prettier
  - Create environment variable files (.env.local and .env)
  - Install core dependencies (axios, zustand, @tanstack/react-query, socket.io-client, react-hook-form, zod)
  - Configure path aliases in tsconfig.json
  - _Requirements: All requirements (foundation)_

- [x] 2. Core Infrastructure - API Client
  - [x] 2.1 Create API client with Axios
    - Implement APIClient class with request/response interceptors
    - Add authentication token injection
    - Add tenant identifier (X-Project-ID) header injection
    - Implement error handling in interceptors
    - Create typed methods (get, post, put, delete)
    - _Requirements: 22.1_

  - [ ]* 2.2 Write property test for API client
    - **Property 38: Multi-tenant Request Headers**
    - **Validates: Requirements 22.1**

- [x] 3. Core Infrastructure - State Management
  - [x] 3.1 Create Zustand auth store
    - Implement auth state (user, token, isAuthenticated)
    - Add login, logout, updateUser actions
    - Configure persistence to localStorage
    - _Requirements: 5.2, 5.5, 17.1, 17.4, 21.1_

  - [ ]* 3.2 Write property test for auth store
    - **Property 35: Auth State Management**
    - **Validates: Requirements 21.1**

  - [x] 3.3 Create Zustand cart store (user-website only)
    - Implement cart state (items, total)
    - Add addItem, removeItem, updateQuantity, clearCart actions
    - Implement total calculation logic
    - Configure persistence to localStorage
    - _Requirements: 2.1, 2.3, 2.4, 2.7, 21.2_

  - [ ]* 3.4 Write property tests for cart store
    - **Property 3: Cart Count Accuracy**
    - **Property 4: Cart Total Calculation**
    - **Property 5: Cart Item Removal**
    - **Property 36: Cart State Management**
    - **Validates: Requirements 2.1, 2.3, 2.4, 21.2**

  - [x] 3.5 Create Zustand tenant store
    - Implement tenant state (id, branding, subscription)
    - Add actions to load and update tenant data
    - _Requirements: 22.2, 22.4_


- [x] 4. Core Infrastructure - TanStack Query Setup
  - Configure QueryClient with default options (staleTime, cacheTime)
  - Wrap applications with QueryClientProvider
  - Create custom hooks for common queries (useProducts, useOrders, etc.)
  - _Requirements: 20.3, 20.5, 21.3_

- [x] 5. Core Infrastructure - Socket.IO Client
  - [x] 5.1 Create Socket.IO client wrapper
    - Implement SocketClient class with connect/disconnect methods
    - Add authentication with JWT token
    - Implement reconnection logic
    - Add event listener methods (on, off, emit)
    - _Requirements: 18.1, 18.3_

  - [ ]* 5.2 Write property test for Socket.IO authentication
    - **Property 30: Socket.IO Authentication**
    - **Validates: Requirements 18.1**

- [x] 6. Core Infrastructure - Error Handling
  - Create error handler utility for API errors
  - Implement ErrorBoundary component
  - Create toast notification system
  - Add error handling to API client interceptors
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [x] 7. Checkpoint - Core Infrastructure Complete
  - Ensure all core infrastructure is working
  - Verify API client can make requests
  - Verify stores persist data correctly
  - Ask user if questions arise

- [x] 8. User Website - Authentication Pages
  - [x] 8.1 Create login page
    - Build login form with email and password fields
    - Integrate React Hook Form with Zod validation
    - Implement login API call
    - Store JWT token on successful login
    - Redirect to homepage after login
    - _Requirements: 5.2_

  - [ ]* 8.2 Write property test for login
    - **Property 13: Login Token Storage**
    - **Validates: Requirements 5.2**

  - [x] 8.3 Create register page
    - Build registration form with name, email, password fields
    - Add password confirmation field
    - Implement validation with Zod schema
    - Call registration API endpoint
    - Auto-login after successful registration
    - _Requirements: 5.1_

  - [ ]* 8.4 Write property test for registration validation
    - **Property 12: Registration Validation**
    - **Validates: Requirements 5.1**

  - [x] 8.5 Implement Firebase authentication
    - Configure Firebase SDK
    - Add Google sign-in button
    - Handle Firebase auth response
    - Exchange Firebase token for backend JWT
    - _Requirements: 5.3_

  - [x] 8.6 Implement phone OTP authentication
    - Create phone number input form
    - Call send OTP API endpoint
    - Create OTP verification form
    - Call verify OTP endpoint
    - Store JWT token on success
    - _Requirements: 5.4_

- [x] 9. User Website - Protected Routes and Auth Guards
  - [x] 9.1 Create auth guard HOC/middleware
    - Check authentication status from Zustand store
    - Redirect to login if not authenticated
    - Allow access if authenticated
    - _Requirements: 5.7_

  - [ ]* 9.2 Write property test for protected routes
    - **Property 15: Protected Route Access**
    - **Validates: Requirements 5.7**

  - [x] 9.3 Implement logout functionality
    - Create logout button in header
    - Clear auth tokens from store and localStorage
    - Disconnect Socket.IO
    - Redirect to homepage
    - _Requirements: 5.5_

  - [ ]* 9.4 Write property test for logout
    - **Property 14: Logout Token Clearance**
    - **Validates: Requirements 5.5**

- [x] 10. User Website - Product Browsing
  - [x] 10.1 Create product list page
    - Fetch products using TanStack Query
    - Display products in grid layout
    - Implement pagination controls
    - Add loading skeletons
    - Handle empty state
    - _Requirements: 1.2_

  - [x] 10.2 Implement product filters
    - Create filter sidebar (category, price range, rating)
    - Update query parameters on filter change
    - Refetch products with new filters
    - _Requirements: 1.3_

  - [ ]* 10.3 Write property test for product filters
    - **Property 1: Product Filter Consistency**
    - **Validates: Requirements 1.3**

  - [x] 10.3 Implement product search
    - Create search input in header
    - Debounce search input
    - Call search API endpoint
    - Display search results
    - _Requirements: 1.4_

  - [ ]* 10.4 Write property test for product search
    - **Property 2: Product Search Relevance**
    - **Validates: Requirements 1.4**

  - [x] 10.5 Create product detail page
    - Fetch product by ID using TanStack Query
    - Display product images in carousel
    - Show product details (name, price, description, stock)
    - Display product reviews
    - Add "Add to Cart" button
    - _Requirements: 1.5_

  - [x] 10.6 Create homepage
    - Display featured products
    - Show category cards
    - Add hero section
    - _Requirements: 1.1_

- [x] 11. User Website - Shopping Cart
  - [x] 11.1 Implement add to cart functionality
    - Add product to cart store on button click
    - Show success toast notification
    - Update cart count in header
    - _Requirements: 2.1_

  - [ ]* 11.2 Write property test for cart count
    - **Property 3: Cart Count Accuracy**
    - **Validates: Requirements 2.1**

  - [x] 11.3 Create cart page
    - Display all cart items with images and details
    - Show quantity controls for each item
    - Display cart total
    - Add remove item button
    - Handle empty cart state
    - _Requirements: 2.2, 2.5_

  - [x] 11.4 Implement cart quantity updates
    - Update quantity in cart store
    - Recalculate cart total
    - Show updated total immediately
    - _Requirements: 2.3_

  - [ ]* 11.5 Write property test for cart total calculation
    - **Property 4: Cart Total Calculation**
    - **Validates: Requirements 2.3**

  - [x] 11.6 Implement cart persistence
    - Sync cart to backend for authenticated users
    - Store cart in localStorage for unauthenticated users
    - Load cart from backend on login
    - Merge local cart with backend cart on login
    - _Requirements: 2.6, 2.7_

  - [ ]* 11.7 Write property tests for cart persistence
    - **Property 6: Authenticated Cart Persistence**
    - **Property 7: Unauthenticated Cart Storage**
    - **Validates: Requirements 2.6, 2.7**

- [x] 12. Checkpoint - User Website Core Features Complete
  - Ensure authentication works correctly
  - Verify product browsing and search
  - Test cart functionality end-to-end
  - Ask user if questions arise


- [x] 13. User Website - Checkout and Payment
  - [x] 13.1 Create checkout page
    - Display order summary with cart items
    - Show delivery address selection/form
    - Add payment method selection (Razorpay, COD)
    - Calculate shipping and total
    - _Requirements: 3.1, 3.3_

  - [x] 13.2 Implement address validation
    - Validate address form with Zod schema
    - Check required fields (name, phone, address, city, state, pincode)
    - Validate phone number format (10 digits)
    - Validate pincode format (6 digits)
    - Display field-specific errors
    - _Requirements: 3.2_

  - [ ]* 13.3 Write property test for address validation
    - **Property 8: Address Validation**
    - **Validates: Requirements 3.2**

  - [x] 13.4 Integrate Razorpay payment gateway
    - Load Razorpay SDK
    - Create payment order via backend API
    - Open Razorpay checkout modal
    - Handle payment success callback
    - Handle payment failure callback
    - _Requirements: 3.6_

  - [x] 13.5 Implement order creation
    - Call create order API endpoint
    - Pass cart items, address, payment method
    - Handle successful order creation
    - Clear cart after order creation
    - Redirect to order confirmation page
    - _Requirements: 3.4, 3.7_

  - [ ]* 13.6 Write property test for order creation
    - **Property 9: Order Creation on Payment**
    - **Validates: Requirements 3.4**

  - [x] 13.7 Handle payment errors
    - Display error message on payment failure
    - Allow user to retry payment
    - Keep cart intact on failure
    - _Requirements: 3.5_

- [x] 14. User Website - Order Tracking
  - [x] 14.1 Create orders list page
    - Fetch user orders using TanStack Query
    - Display orders with status badges
    - Show order date and total
    - Add click handler to view order details
    - _Requirements: 4.1_

  - [x] 14.2 Create order detail page
    - Fetch order by ID
    - Display order items with images
    - Show order status timeline
    - Display shipping address
    - Show tracking information if available
    - Add cancel order button (if applicable)
    - _Requirements: 4.2, 4.4_

  - [x] 14.3 Implement real-time order updates
    - Connect to Socket.IO on order pages
    - Subscribe to order update events
    - Update order status in UI when event received
    - Show toast notification on status change
    - _Requirements: 4.3_

  - [ ]* 14.4 Write property test for real-time updates
    - **Property 10: Real-time Order Updates**
    - **Validates: Requirements 4.3**

  - [x] 14.5 Implement order cancellation
    - Call cancel order API endpoint
    - Update order status to cancelled
    - Show success message
    - Refresh order details
    - _Requirements: 4.5_

  - [ ]* 14.6 Write property test for order cancellation
    - **Property 11: Order Cancellation**
    - **Validates: Requirements 4.5**

- [x] 15. User Website - User Profile
  - [x] 15.1 Create profile page
    - Display user information (name, email, phone)
    - Add edit profile form
    - Implement profile update functionality
    - Show success message on update
    - _Requirements: 6.1, 6.2_

  - [ ]* 15.2 Write property test for profile updates
    - **Property 16: Profile Update Persistence**
    - **Validates: Requirements 6.2**

  - [x] 15.3 Implement address management
    - Display list of saved addresses
    - Add "Add New Address" button
    - Create address form modal
    - Implement add address functionality
    - Implement edit address functionality
    - Implement delete address functionality
    - Mark default address
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ]* 15.4 Write property test for address operations
    - **Property 17: Address CRUD Operations**
    - **Validates: Requirements 6.3, 6.4, 6.5**

- [x] 16. User Website - Responsive Design
  - Implement mobile navigation menu
  - Add responsive breakpoints for all pages
  - Optimize layouts for tablet and mobile
  - Test on different screen sizes
  - Implement image lazy loading and optimization
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17. Checkpoint - User Website Complete
  - Test complete user journey (browse → cart → checkout → order)
  - Verify all features work on mobile and desktop
  - Ensure real-time updates work correctly
  - Ask user if questions arise

- [x] 18. Admin Panel - Authentication
  - [x] 18.1 Create admin login page
    - Build login form with email and password
    - Implement admin authentication
    - Store JWT token
    - Redirect to dashboard on success
    - _Requirements: 17.1_

  - [ ]* 18.2 Write property test for admin authentication
    - **Property 28: Admin Authentication**
    - **Validates: Requirements 17.1**

  - [x] 18.3 Implement admin route protection
    - Create auth guard for admin routes
    - Check authentication status
    - Redirect to login if not authenticated
    - _Requirements: 17.3_

  - [ ]* 18.4 Write property test for admin route protection
    - **Property 15: Protected Route Access**
    - **Validates: Requirements 17.3**

  - [x] 18.5 Implement admin logout
    - Add logout button in header
    - Clear auth tokens
    - Disconnect Socket.IO
    - Redirect to login
    - _Requirements: 17.4_

  - [ ]* 18.6 Write property test for admin logout
    - **Property 29: Admin Logout**
    - **Validates: Requirements 17.4**

- [x] 19. Admin Panel - Layout and Navigation
  - Create main layout component with sidebar and header
  - Implement sidebar navigation with menu items
  - Add user dropdown in header
  - Create breadcrumb navigation
  - Implement responsive sidebar (collapsible on mobile)
  - _Requirements: All admin requirements (foundation)_

- [x] 20. Admin Panel - Dashboard
  - [x] 20.1 Create dashboard page
    - Fetch dashboard metrics from API
    - Display metric cards (revenue, orders, products, customers)
    - Show percentage changes
    - Add loading states
    - _Requirements: 8.1, 8.2_

  - [x] 20.2 Implement revenue charts
    - Fetch revenue data by date range
    - Create line chart with Recharts
    - Add date range selector (daily, weekly, monthly)
    - Display chart with proper formatting
    - _Requirements: 8.3_

  - [x] 20.3 Display recent orders
    - Fetch recent orders from API
    - Show orders in table format
    - Display order number, customer, total, status
    - Add click handler to view order details
    - _Requirements: 8.4_

  - [x] 20.4 Display top-selling products
    - Fetch top products from API
    - Show products with sales count
    - Display product images and names
    - _Requirements: 8.5_

  - [x] 20.5 Implement real-time dashboard updates
    - Connect to Socket.IO
    - Subscribe to metric update events
    - Update dashboard metrics when events received
    - _Requirements: 8.6_

  - [ ]* 20.6 Write property test for real-time metrics
    - **Property 18: Dashboard Real-time Metrics**
    - **Validates: Requirements 8.6**

- [x] 21. Admin Panel - Product Management
  - [x] 21.1 Create products list page
    - Fetch products using TanStack Query
    - Display products in TanStack Table
    - Add search and filter controls
    - Implement pagination
    - Add "Add Product" button
    - _Requirements: 9.1_

  - [x] 21.2 Create product form modal
    - Build product form with all fields
    - Implement validation with Zod schema
    - Add image upload functionality
    - Handle form submission
    - _Requirements: 9.2, 9.3_

  - [ ]* 21.3 Write property test for product validation
    - **Property 19: Product Validation**
    - **Validates: Requirements 9.2**

  - [x] 21.3 Implement create product
    - Call create product API endpoint
    - Upload images to Cloudinary via backend
    - Show success message
    - Refresh products list
    - Handle subscription limit errors
    - _Requirements: 9.2, 9.7_

  - [x] 21.4 Implement update product
    - Pre-fill form with existing product data
    - Call update product API endpoint
    - Show success message
    - Refresh product details
    - _Requirements: 9.4_

  - [ ]* 21.5 Write property test for product updates
    - **Property 19: Product Validation**
    - **Validates: Requirements 9.4**

  - [x] 21.6 Implement delete product
    - Show confirmation dialog
    - Call delete product API endpoint
    - Remove product from list
    - Show success message
    - _Requirements: 9.5_

  - [ ]* 21.7 Write property test for product deletion
    - **Property 20: Product Deletion**
    - **Validates: Requirements 9.5**

  - [x] 21.8 Create product detail view
    - Display all product information
    - Show product images
    - Display stock and pricing
    - Add edit and delete buttons
    - _Requirements: 9.6_


- [x] 22. Admin Panel - Order Management
  - [x] 22.1 Create orders list page
    - Fetch orders using TanStack Query
    - Display orders in TanStack Table
    - Add status and date filters
    - Implement search by order number
    - Add pagination
    - _Requirements: 10.1_

  - [x] 22.2 Create order detail page
    - Fetch order by ID
    - Display order items with images
    - Show customer information
    - Display shipping address
    - Show payment details
    - Add status update dropdown
    - _Requirements: 10.2_

  - [x] 22.3 Implement order status updates
    - Create status update form
    - Call update order status API endpoint
    - Trigger customer notification
    - Show success message
    - Refresh order details
    - _Requirements: 10.3_

  - [ ]* 22.4 Write property test for order status updates
    - **Property 21: Order Status Update Notification**
    - **Validates: Requirements 10.3**

  - [x] 22.5 Implement real-time order notifications
    - Connect to Socket.IO
    - Subscribe to new order events
    - Show toast notification when new order arrives
    - Update orders list automatically
    - _Requirements: 10.4_

  - [ ]* 22.6 Write property test for real-time order notifications
    - **Property 22: Real-time Order Notifications**
    - **Validates: Requirements 10.4**

  - [x] 22.7 Implement order refund
    - Add refund button on order detail page
    - Show refund confirmation dialog
    - Call refund API endpoint
    - Update order status
    - Show success message
    - _Requirements: 10.5_

  - [x] 22.8 Implement order export
    - Add export button on orders list
    - Generate CSV file with order data
    - Trigger file download
    - _Requirements: 10.6_

- [x] 23. Admin Panel - Customer Management
  - [x] 23.1 Create customers list page
    - Fetch customers using TanStack Query
    - Display customers in TanStack Table
    - Add search functionality
    - Implement pagination
    - _Requirements: 11.1_

  - [x] 23.2 Implement customer search
    - Create search input
    - Filter customers by name, email, or phone
    - Update table with search results
    - _Requirements: 11.2_

  - [ ]* 23.3 Write property test for customer search
    - **Property 23: Customer Search Accuracy**
    - **Validates: Requirements 11.2**

  - [x] 23.4 Create customer detail page
    - Display customer information
    - Show order history
    - Display customer analytics (lifetime value, purchase frequency)
    - _Requirements: 11.3, 11.4_

- [x] 24. Admin Panel - Category Management
  - [x] 24.1 Create categories page
    - Fetch categories using TanStack Query
    - Display categories in tree structure
    - Add "Add Category" button
    - Show edit and delete buttons for each category
    - _Requirements: 12.1_

  - [x] 24.2 Implement create category
    - Create category form modal
    - Validate with Zod schema
    - Call create category API endpoint
    - Refresh categories list
    - _Requirements: 12.2_

  - [ ]* 24.3 Write property test for category validation
    - **Property 24: Category Validation**
    - **Validates: Requirements 12.2**

  - [x] 24.4 Implement update category
    - Pre-fill form with existing category data
    - Call update category API endpoint
    - Refresh categories list
    - _Requirements: 12.3_

  - [ ]* 24.5 Write property test for category updates
    - **Property 24: Category Validation**
    - **Validates: Requirements 12.3**

  - [x] 24.6 Implement delete category
    - Check if category has products
    - Show error if products exist
    - Show confirmation dialog if no products
    - Call delete category API endpoint
    - Refresh categories list
    - _Requirements: 12.4_

  - [ ]* 24.7 Write property test for category deletion validation
    - **Property 25: Category Deletion Validation**
    - **Validates: Requirements 12.4**

  - [x] 24.8 Implement category reordering
    - Add drag-and-drop functionality
    - Call reorder API endpoint
    - Update display order
    - _Requirements: 12.5_

- [x] 25. Checkpoint - Admin Panel Core Features Complete
  - Test dashboard analytics and charts
  - Verify product management CRUD operations
  - Test order management and real-time notifications
  - Verify customer and category management
  - Ask user if questions arise

- [x] 26. Admin Panel - Subscription Management
  - [x] 26.1 Create subscription page
    - Fetch current subscription from API
    - Display current plan details
    - Show usage metrics with progress bars
    - Display feature availability
    - _Requirements: 13.1_

  - [x] 26.2 Display pricing plans
    - Fetch pricing plans from API
    - Show all available plans in cards
    - Highlight current plan
    - Display features for each plan
    - Add upgrade/downgrade buttons
    - _Requirements: 13.2_

  - [x] 26.3 Implement plan upgrade
    - Show upgrade confirmation dialog
    - Call upgrade plan API endpoint
    - Update subscription state
    - Show success message
    - _Requirements: 13.3_

  - [x] 26.4 Implement plan downgrade
    - Show downgrade confirmation with warnings
    - Call downgrade plan API endpoint
    - Update subscription state
    - Show success message
    - _Requirements: 13.4_

  - [x] 26.5 Display usage warnings
    - Check usage against limits
    - Show warning when usage > 90%
    - Display upgrade prompt when limit reached
    - _Requirements: 13.5_

  - [x] 26.6 Handle subscription expiration
    - Check subscription status
    - Show renewal prompt if expired
    - Restrict features based on plan
    - _Requirements: 13.6_

- [x] 27. Admin Panel - Settings and Configuration
  - [x] 27.1 Create settings page with tabs
    - Create tabbed interface (Business, Branding, Payment, Delivery)
    - Fetch tenant settings from API
    - Display current settings
    - _Requirements: 14.1_

  - [x] 27.2 Implement business settings
    - Create business information form
    - Validate with Zod schema
    - Call update settings API endpoint
    - Show success message
    - _Requirements: 14.2_

  - [ ]* 27.3 Write property test for settings updates
    - **Property 26: Settings Update Persistence**
    - **Validates: Requirements 14.2**

  - [x] 27.4 Implement branding settings
    - Add logo upload functionality
    - Create color pickers for primary and secondary colors
    - Call update branding API endpoint
    - Apply theme changes immediately
    - _Requirements: 14.3, 14.4_

  - [ ]* 27.5 Write property test for branding updates
    - **Property 26: Settings Update Persistence**
    - **Validates: Requirements 14.4**

  - [x] 27.6 Implement payment settings
    - Create Razorpay credentials form
    - Validate and save credentials
    - Test connection to Razorpay
    - _Requirements: 14.5_

  - [x] 27.7 Implement delivery settings
    - Create Shiprocket/Delhivery credentials form
    - Validate and save credentials
    - Test connection to delivery providers
    - _Requirements: 14.6_

- [ ] 28. Admin Panel - API Key Management
  - [ ] 28.1 Create API keys page
    - Fetch API keys from backend
    - Display keys in table (masked)
    - Show permissions and scopes
    - Display last used date
    - Add "Create API Key" button
    - _Requirements: 15.1_

  - [ ] 28.2 Implement create API key
    - Create API key form modal
    - Select permissions (READ, WRITE, DELETE)
    - Select scopes (optional)
    - Set expiration date (optional)
    - Call create API key endpoint
    - Display generated key once (copy to clipboard)
    - _Requirements: 15.2_

  - [ ] 28.3 Implement update API key permissions
    - Create edit permissions modal
    - Update permissions via API
    - Refresh API keys list
    - _Requirements: 15.3_

  - [ ]* 28.4 Write property test for API key updates
    - **Property 27: API Key Permission Updates**
    - **Validates: Requirements 15.3**

  - [ ] 28.5 Implement revoke API key
    - Show revoke confirmation dialog
    - Call revoke API key endpoint
    - Update key status to revoked
    - _Requirements: 15.4_

  - [ ] 28.6 Display API key usage statistics
    - Fetch usage data from API
    - Show usage charts
    - Display request count and last used
    - _Requirements: 15.5_

- [ ] 29. Admin Panel - Reports and Analytics
  - [ ] 29.1 Create reports page with tabs
    - Create tabbed interface (Sales, Products, Customers)
    - Add date range selector
    - _Requirements: 16.1, 16.2, 16.3_

  - [ ] 29.2 Implement sales reports
    - Fetch sales data by date range
    - Display revenue metrics
    - Create revenue chart with Recharts
    - Show sales breakdown by category
    - _Requirements: 16.1_

  - [ ] 29.3 Implement product reports
    - Fetch product performance data
    - Display top-selling products
    - Show product sales trends
    - Create product performance chart
    - _Requirements: 16.2_

  - [ ] 29.4 Implement customer reports
    - Fetch customer analytics data
    - Display customer acquisition metrics
    - Show customer retention rate
    - Create customer growth chart
    - _Requirements: 16.3_

  - [ ] 29.5 Implement report export
    - Add export buttons for each report
    - Generate CSV/Excel files
    - Trigger file download
    - _Requirements: 16.4_

  - [ ] 29.6 Create interactive charts
    - Use Recharts for all visualizations
    - Add tooltips and legends
    - Implement responsive charts
    - Add zoom and pan functionality
    - _Requirements: 16.5_

- [ ] 30. Checkpoint - Admin Panel Complete
  - Test all admin features end-to-end
  - Verify subscription management works correctly
  - Test settings and API key management
  - Verify reports and analytics display correctly
  - Ask user if questions arise


- [x] 31. Shared Features - Real-time Updates
  - [x] 31.1 Implement Socket.IO connection management
    - Connect Socket.IO on app initialization
    - Authenticate with JWT token
    - Handle connection errors
    - Implement automatic reconnection
    - _Requirements: 18.1, 18.3_

  - [ ]* 31.2 Write property test for Socket.IO authentication
    - **Property 30: Socket.IO Authentication**
    - **Validates: Requirements 18.1**

  - [x] 31.3 Implement event handlers
    - Subscribe to relevant events (order updates, notifications)
    - Update UI when events received
    - Show toast notifications for important events
    - _Requirements: 18.2, 18.5_

  - [ ]* 31.4 Write property test for event handling
    - **Property 31: Socket.IO Event Handling**
    - **Validates: Requirements 18.2, 18.5**

  - [x] 31.5 Implement data sync on reconnection
    - Detect connection restoration
    - Fetch latest data from API
    - Update UI with fresh data
    - _Requirements: 18.4_

- [-] 32. Shared Features - Error Handling
  - [x] 32.1 Implement API error handling
    - Create error handler utility
    - Map status codes to user-friendly messages
    - Display errors via toast notifications
    - _Requirements: 19.1_

  - [ ]* 32.2 Write property test for API error display
    - **Property 32: API Error Display**
    - **Validates: Requirements 19.1**

  - [x] 32.3 Implement validation error display
    - Show field-specific errors in forms
    - Highlight invalid fields
    - Display error messages below fields
    - _Requirements: 19.3_

  - [ ]* 32.4 Write property test for validation errors
    - **Property 33: Validation Error Display**
    - **Validates: Requirements 19.3**

  - [x] 32.5 Handle network errors
    - Detect network failures
    - Show connectivity error message
    - Provide retry option
    - _Requirements: 19.2_

  - [x] 32.6 Handle authentication errors
    - Detect 401 responses
    - Clear auth tokens
    - Redirect to login with message
    - _Requirements: 19.4_

  - [ ] 32.7 Handle server errors
    - Detect 500+ responses
    - Show generic error message
    - Log error details to console
    - _Requirements: 19.5_

- [ ] 33. Shared Features - Performance Optimization
  - [ ] 33.1 Implement code splitting
    - Use dynamic imports for routes
    - Split vendor bundles
    - Lazy load heavy components
    - _Requirements: 20.1_

  - [ ] 33.2 Implement image optimization
    - Use Next.js Image component (user-website)
    - Add lazy loading to images
    - Optimize image sizes for different devices
    - _Requirements: 20.2, 7.5_

  - [ ] 33.3 Configure TanStack Query caching
    - Set appropriate staleTime for different queries
    - Configure cache time
    - Implement cache invalidation strategies
    - _Requirements: 20.3_

  - [ ]* 33.4 Write property test for API response caching
    - **Property 34: API Response Caching**
    - **Validates: Requirements 20.5**

  - [ ] 33.5 Implement prefetching
    - Prefetch likely next pages
    - Prefetch on hover for links
    - Prefetch related data
    - _Requirements: 20.4_

- [x] 34. Shared Features - State Persistence
  - [x] 34.1 Implement localStorage persistence
    - Persist auth state to localStorage
    - Persist cart state to localStorage (user-website)
    - Restore state on app initialization
    - _Requirements: 21.5_

  - [ ]* 34.2 Write property test for state persistence
    - **Property 37: State Persistence**
    - **Validates: Requirements 21.5**

- [x] 35. Shared Features - Multi-tenant Support
  - [x] 35.1 Implement tenant resolution
    - Resolve tenant from subdomain or custom domain
    - Store tenant ID in state
    - Include tenant ID in API requests
    - _Requirements: 22.1, 22.3_

  - [ ]* 35.2 Write property test for tenant headers
    - **Property 38: Multi-tenant Request Headers**
    - **Validates: Requirements 22.1**

  - [x] 35.3 Implement tenant branding
    - Fetch tenant branding from API
    - Apply custom colors to theme
    - Display tenant logo
    - _Requirements: 22.2, 22.4_

  - [ ]* 35.4 Write property test for branding application
    - **Property 39: Tenant Branding Application**
    - **Validates: Requirements 22.2, 22.4**

  - [x] 35.5 Handle subscription limits
    - Check subscription limits before operations
    - Display upgrade prompts when limits reached
    - Show appropriate error messages
    - _Requirements: 22.5_

- [ ] 36. Testing and Quality Assurance
  - [ ]* 36.1 Write unit tests for UI components
    - Test component rendering
    - Test user interactions
    - Test edge cases and error states
    - Achieve 70% code coverage

  - [ ]* 36.2 Write integration tests
    - Test complete user flows
    - Test authentication flow
    - Test checkout flow
    - Test admin product management flow

  - [ ]* 36.3 Run all property tests
    - Execute all 39 property tests
    - Ensure all tests pass with 100 iterations
    - Fix any failing tests

  - [ ]* 36.4 Perform accessibility testing
    - Test keyboard navigation
    - Test screen reader compatibility
    - Verify ARIA labels
    - Check color contrast ratios

  - [ ]* 36.5 Perform cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge
    - Test on mobile browsers
    - Fix browser-specific issues

- [ ] 37. Documentation and Deployment Preparation
  - [ ]* 37.1 Write README files
    - Document setup instructions
    - List environment variables
    - Explain project structure
    - Add development commands

  - [ ]* 37.2 Create deployment guides
    - Document Vercel deployment (user-website)
    - Document static hosting deployment (admin-panel)
    - List production environment variables
    - Add troubleshooting tips

  - [ ]* 37.3 Generate API documentation
    - Document API client usage
    - List available hooks
    - Explain state management
    - Add code examples

- [x] 38. Final Integration and Testing
  - Test both applications with backend API
  - Verify real-time features work correctly
  - Test multi-tenant functionality
  - Perform end-to-end testing of complete user journeys
  - Verify performance metrics meet targets
  - Ensure all tests pass
  - Ask user for final review

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Both applications share common infrastructure (API client, Socket.IO, state management)
- User Website focuses on customer-facing e-commerce features
- Admin Panel focuses on store management and analytics
- Real-time features use Socket.IO for live updates
- Multi-tenant support ensures data isolation and custom branding
