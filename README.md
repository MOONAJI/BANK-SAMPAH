# BANK-SAMPAH

Project for Web Development class. Work in progress.

Install dependencies and initiate seed:

```bash
git clone https://github.com/MOONAJI/BANK-SAMPAH.git
cd BANK-SAMPAH/backend
npm install
npm run seed
```

Run program:

```bash
npm run dev
```

Or run via Docker:

```bash
cd BANK-SAMPAH/backend
docker run --rm -it $(docker build -q .)
```

Note: for the moment, the backend uses MongoDB that runs locally. Make sure a local MongoDB service is active before running the program above.

## Backend

REST API for the waste bank (Bank Sampah) of RW 05. Residents deposit sorted waste, staff weigh it, and its value is credited to the resident's savings balance, which can later be withdrawn as cash, e-wallet, or bank transfer.

### Tech stack

- Node.js + Express 5
- MongoDB via Mongoose
- JWT authentication (`jsonwebtoken`) with bcrypt password hashing (`bcryptjs`)
- `dotenv` for configuration, `nodemon` for development

### Project structure

```
backend/src/
├── index.js         # App entry point: middleware, route mounting, server start
├── config/db.js     # MongoDB connection
├── models/          # User, WasteCategory, DepositTransaction, WithdrawalTransaction, LedgerEntry
├── controllers/     # Business logic for each module
├── routes/          # Express routers mounted under /api
├── middleware/      # Auth (protect/authorize), request validation, error handling
├── utils/           # Transaction code generator (DEP-YYYYMMDD-XXXX / WD-YYYYMMDD-XXXX)
└── seeders/seed.js  # Resets the database and inserts sample users and waste categories
```

### Roles

| Role      | Description                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------- |
| `admin`   | Manages users and the waste category price list, plus everything `petugas` can do                |
| `petugas` | Staff who record deposits, approve/reject withdrawals, and view reports                          |
| `nasabah` | Resident/customer who can see their own deposits, balance history, and request withdrawals      |

Public registration (`POST /api/auth/register`) always creates a `nasabah` account. Other roles are created by an admin.

### Main flow

1. **Deposit** – `petugas` records a deposit with one or more waste items and their weight. The price per kg is snapshotted from the waste category at that moment, the subtotal and total are calculated, and the resident's balance is credited automatically.
2. **Withdrawal** – `nasabah` requests a withdrawal (minimum Rp 1,000) via `TUNAI`, `E_WALLET`, or `BANK_TRANSFER`. The request stays `PENDING` until `petugas`/`admin` sets it to `APPROVED` (balance is debited) or `REJECTED`.
3. **Ledger** – every balance change writes a `LedgerEntry` (`CREDIT` for deposits, `DEBIT` for withdrawals) with the balance before and after, acting as the resident's savings book.
4. **Reports** – dashboard statistics, per-waste-type summaries, and CSV exports of deposits and ledger entries.

Deleting a waste category is a soft delete (`isActive = false`) by default so past transactions stay valid; add `?hard=true` to delete it permanently.

### Environment variables

Copy `backend/.env.example` to `backend/.env` and adjust as needed:

| Variable         | Default                                   | Description                  |
| ---------------- | ----------------------------------------- | ---------------------------- |
| `PORT`           | `5000`                                    | Server port                  |
| `NODE_ENV`       | `development`                             | Hides error stack traces when set to `production` |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/bank_sampah`   | MongoDB connection string    |
| `JWT_SECRET`     | –                                         | Secret for signing JWTs      |
| `JWT_EXPIRES_IN` | `7d`                                      | Token lifetime               |

### API endpoints

All protected endpoints require the header `Authorization: Bearer <token>`. `GET /` returns a health check with the list of modules.

| Method | Endpoint                          | Access                 | Description                                                |
| ------ | --------------------------------- | ---------------------- | ---------------------------------------------------------- |
| POST   | `/api/auth/register`              | Public                 | Register a new `nasabah`                                   |
| POST   | `/api/auth/login`                 | Public                 | Log in and receive a JWT                                   |
| GET    | `/api/auth/me`                    | Logged in              | Get own profile                                            |
| PUT    | `/api/auth/me`                    | Logged in              | Update own profile (name, phone, address, e-wallet info)   |
| GET    | `/api/users`                      | admin, petugas         | List users (`?role=`, `?search=`)                          |
| POST   | `/api/users`                      | admin                  | Create a user with any role                                |
| GET    | `/api/users/:id`                  | admin, petugas         | Get user details                                           |
| PUT    | `/api/users/:id`                  | admin                  | Update a user                                              |
| DELETE | `/api/users/:id`                  | admin                  | Delete a user (not yourself)                               |
| GET    | `/api/waste-categories`           | Public                 | List active categories (`?all=true`, `?group=`)            |
| GET    | `/api/waste-categories/:id`       | Public                 | Get category details                                       |
| POST   | `/api/waste-categories`           | admin                  | Add a category                                             |
| PUT    | `/api/waste-categories/:id`       | admin                  | Update a category / price                                  |
| DELETE | `/api/waste-categories/:id`       | admin                  | Deactivate a category (`?hard=true` to delete)             |
| POST   | `/api/deposits`                   | admin, petugas         | Record a deposit and credit the balance                    |
| GET    | `/api/deposits`                   | admin, petugas         | List deposits (`?nasabah_id=`, `?startDate=&endDate=`)     |
| GET    | `/api/deposits/my-deposits`       | nasabah                | Own deposit history                                        |
| GET    | `/api/deposits/:id`               | Logged in (owner only for nasabah) | Deposit details                                |
| POST   | `/api/withdrawals`                | nasabah                | Request a withdrawal                                       |
| GET    | `/api/withdrawals`                | admin, petugas         | List withdrawals (`?status=`, `?nasabah_id=`)              |
| GET    | `/api/withdrawals/my-withdrawals` | nasabah                | Own withdrawal history                                     |
| PATCH  | `/api/withdrawals/:id/status`     | admin, petugas         | Approve or reject a withdrawal                             |
| GET    | `/api/ledger/my-history`          | nasabah                | Own balance history and current balance                    |
| GET    | `/api/ledger/user/:userId`        | admin, petugas         | A resident's balance history                               |
| GET    | `/api/reports/dashboard`          | admin, petugas         | Totals for users, deposits, withdrawals, and balances      |
| GET    | `/api/reports/waste-summary`      | admin, petugas         | Weight and value per waste type                            |
| GET    | `/api/reports/export/deposits`    | admin, petugas         | Download deposits as CSV (`?startDate=&endDate=`)          |
| GET    | `/api/reports/export/ledger`      | admin, petugas         | Download ledger as CSV (`?user_id=`, `?type=`)             |

List endpoints for deposits, withdrawals, and ledger support pagination with `?page=` and `?limit=` (no limit returns all records) and respond with `count`, `total`, `page`, and `totalPages`.

### Seed data

`npm run seed` clears the database, then creates sample users for each role and 7 waste categories (plastic, paper, metal, glass). The login details for the sample accounts are printed in the terminal when the seeder finishes.~
