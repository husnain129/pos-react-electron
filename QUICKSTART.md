# 🚀 Quick Start Guide

## Prerequisites
- Bun installed (or Node.js 18+)
- PostgreSQL database (already configured with Neon)

## Installation & Running

### Option 1: One-Command Start (Recommended)
```bash
cd POS-react
./start.sh
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd POS-react
bun run server

# Terminal 2 - Frontend
cd POS-react
bun run dev
```

## Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8001

## Default Login
```
Username: admin
Password: admin
```

## First Time Setup

1. The database is already configured in `.env`
2. Make sure the database schema is applied (check `server/db/schema.sql`)
3. Default admin user will be created automatically

## Quick Test

1. **Login** → Use admin/admin credentials
2. **Dashboard** → View statistics
3. **Products** → Add a test product
4. **POS** → Make a test sale
5. **Transactions** → View the sale record

## Stopping the Application

If using `./start.sh`, press `Ctrl+C` once to stop both servers.

If running manually, press `Ctrl+C` in both terminals.

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 8001 (backend)
lsof -ti:8001 | xargs kill -9

# Kill processes on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error
- Check `.env` file has correct DATABASE_URL
- Verify Neon database is accessible
- Check PostgreSQL connection

### Dependencies Missing
```bash
cd POS-react
bun install
```

### TypeScript Errors
```bash
# Restart VS Code TypeScript server
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## Project Structure

```
POS-react/
├── server/           # Backend API (Express + TypeScript)
├── src/
│   ├── pages/       # React pages
│   ├── components/  # UI components
│   ├── services/    # API calls
│   ├── store/       # State management
│   └── types/       # TypeScript types
├── start.sh         # Quick start script
└── .env            # Configuration
```

## Next Steps

- Read [README_MIGRATION.md](./README_MIGRATION.md) for full documentation
- Check [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for migration details
- Explore the UI and test all features

## Need Help?

Check the detailed documentation files:
- `README_MIGRATION.md` - Complete guide
- `MIGRATION_SUMMARY.md` - Migration details
- `server/db/schema.sql` - Database structure

---

Happy coding! 🎉
