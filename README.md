# Hold Your Own Brand 🔥

> **From the Streets to Success** - Premium streetwear e-commerce platform

A custom-built e-commerce solution for Hold Your Own Brand, featuring California beach vibes meets Harlem street style. Built with React, Node.js, Express, and PostgreSQL.

## 🌟 Vision

HYOW is more than clothing—it's a movement. This platform represents Anthony "Stew Money"'s journey from darkness to entrepreneurship, creating premium streetwear that tells a story of perseverance, transformation, and triumph.

**Brand Aesthetic**: California Beach × Harlem Street  
**Tagline**: *Own Your Narrative. Own Your Future.*

## 🏗️ Tech Stack

### Frontend
- **React 18** with Vite for blazing-fast development
- **TailwindCSS** with custom brand color palette
- **React Router v6** for navigation
- **Zustand** for lightweight state management
- **Axios** for API communication
- **Stripe Elements** for secure payments

### Backend
- **Node.js** with Express 4.21.x (CVE-patched)
- **PostgreSQL 15** for robust data storage
- **JWT** with refresh token rotation for secure auth
- **Helmet.js**, rate limiting, and CORS for security
- **Cloudinary** for image hosting
- **Resend** for transactional emails
- **Stripe** for payment processing

## 📁 Project Structure

```
HoldYourOwnBrand/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route page components
│   │   ├── store/          # Zustand state stores
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── styles/         # Global styles
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database & app config
│   │   ├── controllers/    # Request handlers
│   │   ├── db/             # Migrations & seeds
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   └── .env.example        # Environment template
├── shared/                 # Shared types/constants
└── docs/                   # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TzvetomirTodorov/HoldYourOwnBrand.git
   cd HoldYourOwnBrand
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your values
   ```

4. **Create the database**
   ```bash
   createdb hyow_development
   ```

5. **Run migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts both frontend (http://localhost:5173) and backend (http://localhost:3001).

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/hyow_development

# JWT Authentication
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=orders@holdyourownbrand.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Frontend URL
CLIENT_URL=http://localhost:5173
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start backend only |
| `npm run build` | Build for production |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database |

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Ocean Deep | `#1a365d` | Primary brand |
| Sunset Gold | `#d69e2e` | Accent, CTAs |
| Night Black | `#1a1a1a` | Text, backgrounds |
| Beach Foam | `#f7fafc` | Light backgrounds |
| Blood Red | `#9b2c2c` | Sale badges |
| Palm Green | `#276749` | Success states |

## 🛣️ Implementation Roadmap

### Phase 1 (Weeks 1-2) ✅
- [x] Project setup & architecture
- [x] Database schema & migrations
- [x] Authentication system (JWT)
- [x] Basic routing & layout

### Phase 2 (Weeks 3-4)
- [ ] Product CRUD & catalog
- [ ] Cloudinary image integration
- [ ] Category management
- [ ] Admin product UI

### Phase 3 (Weeks 5-6)
- [ ] Shopping cart system
- [ ] Stripe checkout integration
- [ ] Order creation & management
- [ ] Transactional emails

### Phase 4 (Weeks 7-8)
- [ ] Admin dashboard & analytics
- [ ] Inventory management
- [ ] Discount codes
- [ ] CSV import/export

### Phase 5 (Weeks 9-10)
- [ ] Content pages (About, Contact)
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Security audit
- [ ] Production deployment

## 🔗 Links

- **Production**: https://holdyourownbrand.com (coming soon)
- **Instagram**: [@holdyourownbrand](https://instagram.com/holdyourownbrand)
- **YouTube**: [@HYOWORLDWIDE140](https://youtube.com/@HYOWORLDWIDE140)

## 👥 Team

- **Tzvetomir Todorov** - Technical Lead & Development
- **Anthony "Stew Money"** - Brand Owner & Creative Direction

## 📄 License

This project is proprietary software. All rights reserved.

---

*Own Your Narrative. Own Your Future.* 💪
