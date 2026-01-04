# Creative Hands POS System

A Point of Sale system built with Electron, React, TypeScript, and PostgreSQL.

## Prerequisites

### Windows Setup

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - During installation, remember your password
   - Add PostgreSQL to PATH

3. **Bun** (Package Manager)
   ```bash
   npm install -g bun
   ```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd POS-react
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup Database**
   
   Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE pos;
   \q
   ```

4. **Configure Environment**
   
   Create `.env` file in root:
   ```env
   PORT=8001
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pos?sslmode=disable
   NODE_ENV=development
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

5. **Run Database Migrations**
   ```bash
   psql -U postgres -d pos -f server/db/schema.sql
   ```

## Running the Application

### Development Mode
```bash
# Run web version
bun run dev

# Run desktop app (Electron)
bun run dev:desktop
```

### Build Desktop App
```bash
bun run build:desktop
```

The installer will be in `release/` folder.

## Default Login
- **Username**: `admin`
- **Password**: `admin`

## Key Features
- Product management with barcode support
- Institute and category organization
- POS with barcode scanner integration
- Transaction history and reporting
- CSV export functionality
- Multi-user support with permissions

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, PostgreSQL
- **Desktop**: Electron
- **Build**: Vite

## Troubleshooting

**Database Connection Issues:**
- Ensure PostgreSQL service is running
- Check DATABASE_URL in `.env` file
- Verify PostgreSQL user and password

**Build Errors:**
- Delete `node_modules` and reinstall: `bun install`
- Clear build cache: `rm -rf dist dist-electron release`

5. Build the Web Application

To build the web version for production:
```bash
bun run build:web
```

6. Build the Desktop Application

To build the desktop application for distribution:
```bash
bun run build:desktop
```

7. Start the Web Application

To preview the built web application:
```bash
bun run start:web
```

8. Start the Desktop Application

To run the built desktop application:
```bash
bun run start:desktop
```

9. Lint the Code

To check and fix code style issues:
```bash
bun run lint
```

10. Run Tests with Coverage

To run tests and generate coverage reports:
```bash
bun run coverage
```

## License

This project is licensed under the MIT License.

## Contributions

Feel free to contribute! Please submit a pull request or open an issue for any changes or improvements.
