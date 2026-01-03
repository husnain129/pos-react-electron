# Creative Hands POS - React Migration

A modern Point of Sale system built with React, TypeScript, Tailwind CSS, and shadcn/ui. Migrated from the legacy Store-POS application while preserving all core business logic.

## Features

- ✅ **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- ✅ **Full TypeScript**: Type-safe codebase
- ✅ **Authentication**: Secure user login with role-based permissions
- ✅ **Product Management**: Complete CRUD operations for inventory
- ✅ **Category Management**: Organize products by categories
- ✅ **Institute Management**: Multi-institute support for TEVTA
- ✅ **Point of Sale**: Intuitive POS interface with cart management
- ✅ **Transaction History**: Complete sales tracking and reporting
- ✅ **State Management**: Zustand for efficient state handling
- ✅ **API Integration**: RESTful API with PostgreSQL database

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router DOM
- Zustand (State Management)
- Axios
- SweetAlert2
- Moment.js

### Backend
- Express.js
- TypeScript
- PostgreSQL (Neon Cloud)
- CORS enabled

## Getting Started

### Prerequisites
- Bun (recommended) or Node.js 18+
- PostgreSQL database (Neon Cloud configured)

### Installation

1. **Install dependencies:**
```bash
cd POS-react
bun install
```

2. **Setup environment variables:**
The `.env` file is already configured with:
```
PORT=8001
DATABASE_URL=your_database_url
NODE_ENV=development
```

3. **Initialize database:**
The database schema is in `server/db/schema.sql`. Run this on your PostgreSQL database if not already set up.

### Running the Application

**Option 1: Run both frontend and backend separately**

Terminal 1 - Start the backend server:
```bash
bun run server
```

Terminal 2 - Start the frontend:
```bash
bun run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001

### Default Login Credentials

```
Username: admin
Password: admin
```

## Project Structure

```
POS-react/
├── server/
│   ├── api/              # API route handlers
│   │   ├── inventory.ts
│   │   ├── categories.ts
│   │   ├── users.ts
│   │   ├── transactions.ts
│   │   ├── institutes.ts
│   │   ├── customers.ts
│   │   └── settings.ts
│   ├── db/
│   │   ├── config.ts     # Database configuration
│   │   └── schema.sql    # Database schema
│   └── index.ts          # Express server entry point
│
├── src/
│   ├── components/       # UI components (shadcn)
│   │   ├── ui/          # shadcn components
│   │   ├── Layout.tsx   # Main layout
│   │   └── button.tsx
│   ├── pages/           # Page components
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── POSPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── InstitutesPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   └── UsersPage.tsx
│   ├── services/        # API service layer
│   │   └── api.ts
│   ├── store/           # Zustand stores
│   │   ├── authStore.ts
│   │   └── cartStore.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── app.tsx          # Main App component
│   └── main.tsx         # Entry point
│
├── .env                 # Environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Key Features

### 1. Dashboard
- Real-time sales statistics
- Today's transaction summary
- Low stock alerts
- Quick action buttons

### 2. Point of Sale (POS)
- Product search and SKU lookup
- Shopping cart management
- Quick checkout process
- Real-time inventory updates

### 3. Product Management
- Add, edit, and delete products
- Bulk product import
- Category assignment
- Institute assignment
- Cost and selling price tracking
- Low stock alerts

### 4. Categories
- Organize products by categories
- Institute-specific categories
- Easy CRUD operations

### 5. Institutes
- Manage multiple TEVTA institutes
- Zone and district organization
- Filter products by institute

### 6. Transactions
- Complete sales history
- Date range filtering
- Transaction details view
- Sales reports
- Export functionality

## API Endpoints

### Users
- `POST /api/users/login` - User login
- `GET /api/users/all` - Get all users
- `GET /api/users/user/:id` - Get user by ID
- `POST /api/users/post` - Create/Update user
- `DELETE /api/users/user/:id` - Delete user

### Products
- `GET /api/inventory/products` - Get all products
- `GET /api/inventory/product/:id` - Get product by ID
- `POST /api/inventory/product/sku` - Search by SKU
- `POST /api/inventory/product` - Create/Update product
- `DELETE /api/inventory/product/:id` - Delete product

### Categories
- `GET /api/categories/all` - Get all categories
- `POST /api/categories/category` - Create category
- `PUT /api/categories/category` - Update category
- `DELETE /api/categories/category/:id` - Delete category

### Institutes
- `GET /api/institutes/all` - Get all institutes
- `GET /api/institutes/institute/:id` - Get institute by ID
- `POST /api/institutes/institute` - Create/Update institute
- `DELETE /api/institutes/institute/:id` - Delete institute

### Transactions
- `GET /api/transactions/all` - Get all transactions
- `GET /api/transactions/by-date` - Get transactions by date range
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions/new` - Create transaction
- `POST /api/transactions/delete` - Delete transaction

## Differences from Store-POS

### Improvements
1. **Modern UI Framework**: Migrated from Bootstrap to Tailwind CSS + shadcn/ui
2. **Type Safety**: Full TypeScript implementation
3. **Better State Management**: Zustand instead of global variables
4. **Component Architecture**: Modular React components
5. **Responsive Design**: Better mobile support
6. **Cleaner Code**: Separated concerns (API, State, UI)

### Preserved Features
- All business logic maintained
- Same database schema
- Compatible API endpoints
- User permissions system
- Multi-institute support
- Transaction management

## Development

### Adding New Components

Use shadcn CLI to add components:
```bash
bunx --bun shadcn@latest add [component-name]
```

### Database Migrations

Run SQL migrations directly on your PostgreSQL database or use the schema.sql file.

### Building for Production

```bash
bun run build:web
```

## Troubleshooting

### Database Connection Issues
- Check your DATABASE_URL in `.env`
- Ensure PostgreSQL is accessible
- Verify SSL settings for Neon Cloud

### Port Already in Use
- Backend runs on port 8001 by default
- Frontend runs on port 5173
- Change ports in `.env` or `vite.config.ts`

### Missing Dependencies
```bash
bun install
```

## Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Receipt printing
- [ ] Barcode scanning
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export to PDF/Excel
- [ ] Real-time notifications
- [ ] User management UI completion

## License

This project maintains the same license as the original Store-POS application.

## Support

For issues and questions, please refer to the original project documentation or create an issue in the repository.
