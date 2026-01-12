# CallSphere - Multi-Agent Logistics & Delivery Platform

A comprehensive end-to-end logistics and last-mile delivery platform with AI-powered chat and voice agents, plus operations/admin dashboards.

## Features

### Customer Capabilities
- **Track Shipments**: Real-time tracking with status, last scan, and ETA
- **Report Delivery Issues**: Create issues for damaged, missing, wrong address, missed delivery, delay, etc.
- **Request Delivery Changes**: Reschedule delivery, update instructions, change address
- **Chat & Voice AI Assistant**: Unified conversation history across chat and voice modalities

### Admin/Ops Capabilities
- **Routes & Stops Management**: View routes, route details, driver-level views
- **Issues & Escalations**: Issue queue with filtering, escalation ladder execution and acknowledgment
- **Metrics Dashboard**: Overview KPIs (on-time rate, first-attempt success, open issues, SLA-risk count)
- **Metrics Administration** (Admin only): Edit metric definitions, targets, thresholds, dashboard layouts

## Technology Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Database
- **WebSockets** (Socket.IO) - Real-time updates
- **OpenAI** - AI Agents (GPT-4) + Realtime API for voice

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **React Query** - Data fetching
- **Socket.IO Client** - WebSocket client

## Project Structure

```
project-personal/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication & RBAC
│   │   ├── users/             # User management
│   │   ├── shipments/         # Shipment tracking & scans
│   │   ├── routes/            # Route & stop management
│   │   ├── delivery-issues/   # Issue management
│   │   ├── escalations/       # Escalation workflows
│   │   ├── metrics/           # Metrics & KPIs
│   │   ├── dashboard-config/  # Dashboard configurations
│   │   ├── agent-sessions/    # AI session tracking
│   │   ├── websocket/         # WebSocket gateway
│   │   └── ai-orchestrator/   # OpenAI integration
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   │   ├── customer/      # Customer dashboard components
│   │   │   └── admin/         # Admin dashboard components
│   │   └── lib/               # Utilities (API, auth, websocket)
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- OpenAI API key

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/callsphere?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-openai-api-key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

4. **Set up database**:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

5. **Start the backend server**:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables** (optional):
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

4. **Start the development server**:
```bash
npm run dev
```

The frontend will run on `http://localhost:3001`

## Seed Data

The seed script creates:
- 5 roles: Admin, Manager, Dispatcher, Driver, and 10 Customers
- 45 shipments with scan history
- 10 routes with stops
- 8 delivery issues
- Escalation contacts
- 4 metric definitions
- Default dashboard configurations

### Default Login Credentials

After seeding, you can login with:

- **Admin**: `admin@callsphere.com` / `admin123`
- **Manager**: `manager@callsphere.com` / `manager123`
- **Dispatcher**: `dispatcher@callsphere.com` / `dispatcher123`
- **Driver**: `driver@callsphere.com` / `driver123`
- **Customer**: `customer1@example.com` / `customer123` (customer1-10 available)

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Shipments
- `GET /shipments` - List shipments (role-based filtering)
- `GET /shipments/track/:trackingNumber` - Track by tracking number
- `GET /shipments/:id` - Get shipment details
- `POST /shipments` - Create shipment (admin/dispatcher/manager)
- `PATCH /shipments/:id` - Update shipment
- `POST /shipments/:id/scans` - Create scan

### Routes
- `GET /routes` - List routes (role-based filtering)
- `GET /routes/:id` - Get route details
- `POST /routes` - Create route
- `PATCH /routes/:routeId/stops/:stopId` - Update stop status (driver)

### Delivery Issues
- `GET /delivery-issues` - List issues (with filters)
- `GET /delivery-issues/:id` - Get issue details
- `POST /delivery-issues` - Create issue
- `PATCH /delivery-issues/:id` - Update issue

### Escalations
- `POST /escalations/trigger` - Trigger escalation
- `POST /escalations/:shipmentId/advance` - Advance escalation
- `POST /escalations/:shipmentId/acknowledge` - Acknowledge escalation
- `GET /escalations/:shipmentId/history` - Get escalation history

### Metrics
- `GET /metrics/overview` - Get overview metrics
- `GET /metrics/definitions` - List metric definitions
- `POST /metrics/definitions` - Create metric definition (admin)
- `PATCH /metrics/definitions/:id` - Update metric definition (admin)
- `POST /metrics/snapshots/:metricKey/compute` - Compute metric snapshot

### AI Orchestrator
- `POST /ai/chat/:sessionId` - Process chat message
- `POST /ai/voice/:sessionId` - Process voice message (with audio file)

## WebSocket Events

### Channels
- `shipment:<trackingNumber>` - Shipment updates
- `route:<routeCode>` - Route updates
- `issues` - Issue updates
- `escalations` - Escalation events
- `metrics:overview` - Metric updates

### Events
- `shipment.scan.created` - New scan created
- `shipment.status.updated` - Shipment status changed
- `issue.created` - New issue created
- `issue.updated` - Issue updated
- `escalation.triggered` - Escalation triggered
- `escalation.advanced` - Escalation advanced
- `escalation.acknowledged` - Escalation acknowledged
- `metrics.snapshot.created` - New metric snapshot

## Role-Based Access Control (RBAC)

### Roles
1. **Customer**: Track own shipments, create issues, request changes
2. **Driver**: View assigned routes, update stop statuses
3. **Dispatcher**: Manage shipments/issues in region, adjust routes, read metrics
4. **Manager**: All dispatcher capabilities + escalation acknowledgments, edit thresholds
5. **Admin**: Full access, can edit metric definitions, thresholds, dashboard layouts

### RBAC Enforcement
- **REST APIs**: Enforced via NestJS Guards (`@Roles()` decorator)
- **WebSockets**: Enforced via channel subscription authorization
- **Frontend**: UI controls hidden/disabled based on role

## Demo Flows

### 1. Track Shipment → Create Issue (Chat)
1. Login as customer
2. Navigate to customer dashboard
3. Enter tracking number (e.g., `CS000001`) and click Track
4. Use chat widget: "Where is my package CS000001?"
5. Create issue via chat: "I want to report a damaged package"

### 2. Request Delivery Change (Voice)
1. Login as customer
2. Select a shipment
3. Click "Start Voice" in the AI assistant widget
4. Speak: "I want to reschedule my delivery to next week"

### 3. SLA Risk → Escalation → Manager ACK (Dashboard)
1. Login as admin/manager
2. Navigate to Admin Dashboard
3. View Metrics Overview - check SLA Risk Count
4. Go to Issues tab - find high-severity issue
5. Click "Escalate" on an issue
6. Go to Escalations tab
7. Click "Acknowledge" to acknowledge the escalation

## AI Agents Architecture

The system uses OpenAI Agents for multi-agent orchestration:

1. **LogisticsRouterAgent**: Routes user intent to specialist agents
2. **ShipmentTrackingAgent**: Fetches shipment status and ETA
3. **DeliveryIssueAgent**: Creates and classifies delivery issues with severity scoring
4. **DeliveryChangeAgent**: Validates and applies delivery changes
5. **LogisticsEscalationAgent**: Handles escalations for high-priority cases
6. **LogisticsAnalyticsAgent**: Answers operational questions using metrics

All agents use backend tool calls to read/write data (no hallucinations).

## Development

### Backend
```bash
cd backend
npm run start:dev      # Development mode with hot reload
npm run build          # Build for production
npm run start:prod     # Run production build
npm run prisma:studio  # Open Prisma Studio (database GUI)
```

### Frontend
```bash
cd frontend
npm run dev            # Development server
npm run build          # Build for production
npm run preview        # Preview production build
```

## Testing

Test credentials are available in the seed data. For production, ensure:
- Strong JWT secret
- Secure password hashing
- Environment variables properly configured
- Database connection secured
- CORS properly configured

## Notes

- **Voice Feature**: Full OpenAI Realtime API integration requires additional WebSocket setup with OpenAI. The current implementation provides the structure and placeholder.
- **Metrics Calculation**: Metric computation is simplified. In production, implement more sophisticated aggregation logic.
- **WebSocket Auth**: WebSocket authentication uses JWT tokens passed in the handshake.

## License

MIT

## Author

CallSphere Development Team

