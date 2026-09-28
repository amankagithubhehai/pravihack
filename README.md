# PRAVI GovAssets

**PRAVI GovAssets** is a web-based platform for managing government and public-sector physical assets across departments and organizations.

It provides a central place to register assets, track custody and assignments, manage maintenance, report incidents, maintain audit records, view analytics, and use an AI-assisted government asset intelligence module.

## Features

- **Command Dashboard** – Overview of assets, departments, maintenance, incidents, and key statistics.
- **Public Assets Registry** – Add, view, search, update, and manage government physical assets.
- **Custody & Sanction Handover** – Track asset assignments and handovers between officers/employees.
- **AMC & Preventive Inspection** – Manage maintenance records, inspections, AMC information, and warranty-related tracking.
- **Public Grievance & Breakdowns** – Create and manage incident/ticket records for damaged or unavailable assets.
- **GFR & CAG Audit Ledger** – Maintain audit-related information and activity records.
- **Directorates & Municipal Zones** – Manage organizations and departments.
- **PRAVI Gov Intelligence** – Ask questions about assets, maintenance records, and stored government documents. The system can use Groq LLM when a `GROQ_API_KEY` is configured and otherwise provides a built-in fallback reasoning engine.
- **Role-based access** – Different navigation and permissions are available for Super Admin, Organization Admin, Asset Manager, Employee, and Auditor.
- **JWT authentication** – Login sessions are protected using JSON Web Tokens.
- **Real-time updates** – Socket.IO is used for notifications and live events.
- **QR support** – QR-code functionality is included for asset-related workflows.
- **Analytics** – Charts and statistics are displayed using Recharts.

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Material UI
- Lucide React
- Recharts
- Axios
- Socket.IO Client
- HTML5 QR Code

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- Multer
- QRCode

### AI
- Groq API with Llama 3.1 when `GROQ_API_KEY` is available
- Built-in fallback asset reasoning engine
- Context is retrieved from assets, maintenance records, and stored documents before generating AI responses

## Project Structure

```text
pravihack-main/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── services/
│       ├── types/
│       ├── App.tsx
│       └── main.tsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── seed.js
│   │   └── server.js
│   └── package.json
│
├── package.json
└── README.md
```

## Requirements

Make sure these are installed:

- Node.js 18+ recommended
- npm
- MongoDB is optional because the project can automatically start an in-memory MongoDB server for local/demo use

Check your versions:

```bash
node -v
npm -v
```

## Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/tirth1919/pravi-hktn.git
cd pravi-hktn
```

Install all dependencies:

```bash
npm run install:all
```

## Environment Variables

### Backend

Create a `.env` file inside the `server` folder if you want to use your own MongoDB database or the Groq AI service.

Example:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/pravi_govassets
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

`MONGO_URI` is optional for local/demo use. If it is missing, the backend automatically uses `mongodb-memory-server`.

`GROQ_API_KEY` is also optional. Without it, the built-in fallback AI reasoning engine is used.

## Run the Project

### Run frontend and backend together

From the root folder:

```bash
npm run dev
```

The Vite frontend normally runs on:

```text
http://localhost:5173
```

The backend normally runs on:

```text
http://localhost:5001
```

### Run separately

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Build for Production

From the root folder:

```bash
npm run build
```

Or build the frontend separately:

```bash
cd client
npm run build
```

The production frontend build is generated in:

```text
client/dist/
```

## API

The backend API uses the `/api` prefix.

Important route groups include:

```text
/api/auth
/api/assets
/api/assignments
/api/maintenance
/api/tickets
/api/analytics
/api/ai
/api/notifications
```

Health check:

```text
GET /api/health
```

Example response:

```json
{
  "status": "online",
  "platform": "AssetSphere AI",
  "version": "1.0.0"
}
```

## Demo Data

On startup, the backend checks the database and seeds initial demo data when the database is empty.

The seed data contains example:

- Government organizations
- Departments
- Officers and users
- Public transport assets
- Hospital equipment
- Fire and emergency equipment
- Water infrastructure
- Municipal machinery
- Maintenance records
- Tickets
- Audit information
- Notifications
- Government/SOP documents

### Demo Login

The seed file creates demo accounts with the password:

```text
password123
```

Example accounts:

| Role | Email |
|---|---|
| Super Admin | superadmin@assetsphere.ai |
| Organization Admin | admin@abccorp.com |
| Asset Manager | manager@abccorp.com |
| Employee | elena@abccorp.com |
| Auditor | auditor@abccorp.com |

These are demo credentials only and should be changed or removed before production use.

## User Roles

### Super Admin
Has access to the complete platform and can manage organizations and system-level information.

### Organization Admin
Manages assets and operations within an organization.

### Asset Manager
Works mainly with asset inventory, assignments, maintenance, and operational records.

### Employee
Can access permitted asset, assignment, incident, and AI functions.

### Auditor
Focuses on asset information, maintenance information, compliance, audit records, analytics, and AI-assisted inspection.

## AI / Intelligence Module

The AI module retrieves relevant information from the application's database before answering questions.

It can use:

- Asset records
- Asset status and location
- Department information
- Assigned officers
- Maintenance records
- Warranty information
- Stored documents and SOPs

If `GROQ_API_KEY` is configured, the application sends the retrieved context to the Groq API using a Llama model.

If the Groq service is unavailable or no API key is configured, the application falls back to its built-in reasoning logic for supported questions such as warranty, risk, disposal, and SOP-related queries.

## Real-Time Communication

Socket.IO is used to provide real-time application events.

Examples include:

- New asset notifications
- Asset updates
- New tickets
- New assignments
- Notification creation
- Notification clearing

## Deployment

### Frontend – Vercel

The `client` folder is a Vite application and can be deployed on Vercel.

Set the frontend environment variable:

```env
VITE_API_URL=https://your-backend-url
```

The frontend API service automatically adds `/api` to this URL.

For example:

```text
VITE_API_URL=https://your-backend-url
```

The application will use:

```text
https://your-backend-url/api
```

### Backend – Render / Railway / VPS

Deploy the `server` folder to your preferred Node.js hosting service.

Set these environment variables:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
GROQ_API_KEY=your_groq_api_key
```

For production, use a persistent MongoDB database instead of the in-memory database.

## Security Notes

For production deployment:

- Use a strong `JWT_SECRET`.
- Do not commit `.env` files.
- Do not expose API keys in frontend code.
- Use a real persistent MongoDB database.
- Restrict CORS to trusted frontend domains.
- Replace the demo passwords.
- Review role permissions before deploying with real government or organizational data.

## Development Commands

| Command | Purpose |
|---|---|
| `npm run install:all` | Install root, server, and client dependencies |
| `npm run dev` | Start frontend and backend together |
| `npm run build` | Build the project |
| `npm run dev --workspace=client` | Start frontend |
| `npm run dev --workspace=server` | Start backend |
| `npm run start --workspace=server` | Start backend in production mode |
| `npm run seed --workspace=server` | Run the database seed script |

## Project Purpose

PRAVI GovAssets is designed as a centralized digital system for improving the visibility and lifecycle management of public physical assets.

The platform aims to make it easier for authorized users to:

1. Register public assets.
2. Track where assets are located.
3. Track who is responsible for an asset.
4. Monitor maintenance and warranty information.
5. Record incidents and breakdowns.
6. Maintain audit and compliance information.
7. View operational analytics.
8. Use AI-assisted search and reasoning over asset records and documents.

## License

This project is intended for educational, hackathon, and demonstration purposes unless a separate license is provided by the project owner.

---

**PRAVI GovAssets — State & National Physical Assets Platform**
