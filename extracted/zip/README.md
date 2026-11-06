# 🏥 Medical Shop Management System

A full-stack Next.js (App Router) application built with TypeScript and Tailwind CSS for managing pharmacy inventory, point-of-sale (POS) billing, invoicing, and multi-shop operations.

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Directory Structure](#-directory-structure)
3. [Naming Conventions](#-naming-conventions)
4. [Environment Configuration](#-environment-configuration)
5. [API Design & Error Handling](#-api-design--error-handling)
6. [State Management](#-state-management)
7. [Development & Scripts](#-development--scripts)

---

## 🏗 System Architecture

The codebase enforces a strict **4-Layer Separation of Concerns**:

1. **Presentation Layer (`/components`, `/app/(dashboard)`)**
   - Pure UI primitives (`/components/ui`) and domain feature views (`/components/features`).
   - Pages in `/app` act exclusively as route entry points and layout shells.
   - **Rule**: No direct database queries, raw `fetch()` calls, or `process.env` references inside UI components.

2. **Client State & Hook Layer (`/store`, `/hooks`)**
   - Zustand stores manage cross-page client state (Authentication session & active POS Billing Cart).
   - Custom hooks manage server data fetching, search debouncing, loading states, and UI notifications.

3. **API & Middleware Layer (`/app/api`, `middleware.ts`)**
   - Edge `middleware.ts` guards protected pages and API endpoints using JWT cookie verification and rate limiting.
   - Route handlers validate incoming payloads, call the appropriate Service method, and return standardized JSON responses via `withApiHandler`.

4. **Business Logic & Data Access Layer (`/services`, `/lib/db`)**
   - Domain services (`medicine.service.ts`, `invoice.service.ts`, `shop.service.ts`, `user.service.ts`) encapsulate all SQL queries, transactional integrity (e.g., deducting stock upon invoice creation), and domain rules.

---

## 📂 Directory Structure

```text
MEDICAL-SHOP/
├── app/                        # Next.js App Router (Pages & REST APIs)
│   ├── (auth)/                 # Public routes: /signin, /signup
│   ├── (dashboard)/            # Protected routes: /dashboard, /billing, /inventory, /invoices, /profile
│   └── api/                    # Backend endpoints: /auth, /invoices, /medicines, /shops, /users
├── components/                 # Modular React Components
│   ├── ui/                     # Reusable atomic components (Button, Input, Modal, Table)
│   ├── layout/                 # Navbar, Sidebar, PageHeader
│   ├── features/               # Domain modules (billing, inventory, invoices, shop)
│   └── providers/              # Context & Store hydration providers
├── config/                     # Validated environment variables (env.ts) & app constants
├── hooks/                      # Custom React hooks for data fetching & UI behavior
├── lib/                        # Core infrastructure utilities
│   ├── api/                    # API client wrapper, route error handler, AppError class
│   ├── auth/                   # JWT, password hashing (bcrypt), and HTTP-only cookie utilities
│   ├── db/                     # Database connection pool and query helpers
│   └── security/               # Rate limiting utilities
├── services/                   # Server-side business logic & database operations
├── store/                      # Zustand global state stores (useAuthStore, useBillingStore)
├── types/                      # Shared TypeScript interfaces & API contracts
├── scripts/                    # Database migration CLI scripts
└── middleware.ts               # Next.js Edge authentication & route guard
```

---

## 📏 Naming Conventions

To maintain consistency across the repository, adhere strictly to these naming rules:

| Artifact | Convention | Location | Example |
| :--- | :--- | :--- | :--- |
| **Route Directories** | `kebab-case` | `app/` | `app/(dashboard)/invoices/[id]/page.tsx` |
| **React Components** | `PascalCase.tsx` | `components/` | `components/features/invoices/InvoiceReceipt.tsx` |
| **Business Services** | `camelCase.service.ts` | `services/` | `services/medicine.service.ts` |
| **Infra Utilities** | `camelCase.util.ts` | `lib/` | `lib/auth/jwt.util.ts` |
| **Custom Hooks** | `usePascalCase.ts` | `hooks/` | `hooks/useMedicines.ts` |
| **Zustand Stores** | `usePascalCaseStore.ts` | `store/` | `store/useBillingStore.ts` |
| **TypeScript Types** | `camelCase.types.ts` | `types/` | `types/invoice.types.ts` |
| **Constants** | `UPPER_SNAKE_CASE` | `config/constants.ts` | `AUTH_COOKIE_NAME`, `DEFAULT_PAGE_SIZE` |

---

## ⚙️ Environment Configuration

All environment variables are validated at runtime in `config/env.ts`. **Never access `process.env` directly in application files—always import `env` from `@/config/env`.**

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
2. Configure the required keys:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/medical_shop?sslmode=require"
   JWT_SECRET="your-minimum-32-character-secret-key"
   NODE_ENV="development"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

---

## 🛡 API Design & Error Handling

### Unified API Response Contract
Every API endpoint under `/app/api/**` returns a predictable JSON envelope defined in `types/api.types.ts`:

**Success Response (`200 OK` / `201 Created`):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Invoice created successfully"
}
```

**Error Response (`400` / `401` / `404` / `429` / `500`):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Paracetamol 500mg only has 12 units remaining in stock."
  }
}
```

### Throwing & Catching Errors
- **In Services (`/services`)**: Throw `new AppError(message, statusCode, code)` for known operational failures (validation, missing records, stock shortages).
- **In Route Handlers (`/app/api`)**: Wrap handlers with `withApiHandler(async (req, context) => { ... })`. Unhandled exceptions are logged server-side and sanitized before returning a `500` response.
- **In Client Code (`/hooks`, `/components`)**: Use `apiClient` from `@/lib/api/api-client`, which automatically unwraps `data` or throws a user-friendly error message.

---

## 🔄 State Management

1. **Authentication & Shop Context (`store/useAuthStore.ts`)**
   - Holds current user profile, active shop metadata, and session status.
   - Hydrated automatically on app boot via `AuthProvider`.
2. **POS Billing Cart (`store/useBillingStore.ts`)**
   - Manages line items, quantities, unit prices, customer details, and calculated totals during bill creation.
   - Prevents cart state loss when navigating between `/billing` and `/inventory`.
3. **Server Data Hooks (`hooks/useMedicines.ts`, `hooks/useInvoices.ts`)**
   - Encapsulate API fetching, search/filter state, pagination, and cache invalidation.

---

## 🚀 Development & Scripts

```bash
# Install dependencies
npm install

# Run database migrations
npx tsx scripts/migrate.ts

# Start development server
npm run dev

# Type-check codebase
npx tsc --noEmit

# Lint codebase for dead code and formatting
npm run lint

# Build for production
npm run build
```