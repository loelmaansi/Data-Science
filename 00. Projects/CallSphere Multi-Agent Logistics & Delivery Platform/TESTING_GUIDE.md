# CallSphere Testing Guide

## Quick Start

1. **Access the application**: http://localhost:3001
2. **Login** with any of the credentials below
3. **Test features** based on your role

---

## Role-Based Testing Guide

### 🔵 CUSTOMER Role
**Credentials**: `customer1@example.com` / `customer123`

#### Expected Behavior:
- ✅ Can access Customer Dashboard only
- ✅ Can track own shipments
- ✅ Can view shipment details, scans, and timeline
- ✅ Can create delivery issues
- ✅ Can request delivery changes
- ✅ Can use Chat & Voice AI Assistant
- ❌ Cannot access Admin Dashboard
- ❌ Cannot see other customers' shipments
- ❌ Cannot view routes or metrics

#### Test Scenarios:

**1. Track Shipment (Chat)**
```
Steps:
1. Login as customer
2. In the tracking input, enter a tracking number (e.g., CS000001, CS000002)
3. Click "Track" button
4. Verify shipment details appear (status, ETA, last scan location)

Expected: 
- Shipment details load
- Timeline of scans visible
- Current status displayed
```

**2. Use AI Chat Assistant**
```
Steps:
1. In the Chat/Voice widget on the right side
2. Type: "Where is my package CS000001?"
3. Click Send
4. Wait for AI response

Expected:
- AI responds with shipment status, location, and ETA
- Conversation history is maintained
```

**3. Report Delivery Issue**
```
Steps:
1. Select a shipment from "My Shipments" list
2. In chat widget, type: "I want to report a damaged package"
   OR manually create issue via API
3. Provide details when prompted

Expected:
- Issue created with severity score
- Real-time notification to ops team
- Issue appears in admin dashboard
```

**4. Request Delivery Change**
```
Steps:
1. In chat widget, type: "I want to reschedule my delivery to next week"
2. Or: "I want to change my delivery address"

Expected:
- AI processes request
- Change request created
- Admin/Dispatcher can review and approve
```

**5. View Shipment List**
```
Steps:
1. Scroll down to "My Shipments" section
2. Click on any shipment

Expected:
- Only YOUR shipments are visible
- Shipments show status, ETA, address
- Clicking shipment shows details
```

---

### 🟢 DRIVER Role
**Credentials**: `driver@callsphere.com` / `driver123`

#### Expected Behavior:
- ✅ Can access Admin Dashboard (driver view)
- ✅ Can view assigned routes
- ✅ Can see route stops with sequence numbers
- ✅ Can update stop status (completed/failed)
- ✅ Can view shipments assigned to their routes
- ❌ Cannot create shipments
- ❌ Cannot escalate issues
- ❌ Cannot view metrics

#### Test Scenarios:

**1. View Assigned Routes**
```
Steps:
1. Login as driver
2. Navigate to "Routes" tab in admin dashboard
3. View route list

Expected:
- Only routes assigned to this driver are visible
- Each route shows: route code, date, vehicle, stops
- Stops show sequence numbers and status
```

**2. Update Stop Status**
```
Steps:
1. Go to Routes tab
2. Click on a route to see stops
3. Find a stop with status "pending"
4. Use API endpoint: PATCH /routes/:routeId/stops/:stopId
   Body: { "status": "completed" }

Expected:
- Stop status updates to "completed"
- Actual arrival time recorded
- Real-time update in dashboard
```

**3. View Route Details**
```
Steps:
1. Click on any route
2. View stops in sequence order

Expected:
- Stops ordered by sequence number
- Each stop shows:
  - Shipment tracking number
  - Planned ETA
  - Actual arrival (if completed)
  - Status (pending/completed/failed)
```

---

### 🟡 DISPATCHER Role
**Credentials**: `dispatcher@callsphere.com` / `dispatcher123`

#### Expected Behavior:
- ✅ Can access Admin Dashboard
- ✅ Can view all shipments
- ✅ Can update shipments within assigned region
- ✅ Can view and manage routes
- ✅ Can view and update delivery issues
- ✅ Can view metrics overview
- ✅ Can trigger escalations
- ❌ Cannot acknowledge escalations
- ❌ Cannot edit metric definitions
- ❌ Cannot advance escalation ladder

#### Test Scenarios:

**1. View Metrics Overview**
```
Steps:
1. Login as dispatcher
2. Go to "Overview" tab

Expected:
- See 6 metric cards:
  - Total Shipments
  - Delivered
  - On-Time Delivery Rate
  - First Attempt Success
  - Open Issues
  - SLA Risk Count
```

**2. Manage Issues**
```
Steps:
1. Go to "Issues" tab
2. View issue queue (filtered by region if applicable)
3. Click on an issue to see details
4. Update issue status: PATCH /delivery-issues/:id
   Body: { "status": "in_progress", "resolutionNotes": "Investigating..." }

Expected:
- See issues sorted by severity (highest first)
- Can filter by status, type, severity
- Can update issue status and add resolution notes
```

**3. View All Shipments**
```
Steps:
1. Go to "Shipments" tab
2. View shipment table

Expected:
- See all shipments (not just own)
- Table shows: tracking number, customer, status, ETA, SLA risk
- Can filter and search
```

**4. Trigger Escalation**
```
Steps:
1. Go to "Escalations" tab
2. Find a high-severity issue
3. Click "Escalate" button

Expected:
- Escalation triggered
- Notification sent to first contact in escalation ladder
- Escalation log created
- Real-time update in dashboard
```

**5. Manage Routes**
```
Steps:
1. Go to "Routes" tab
2. View route list
3. Create new route: POST /routes
   Body: {
     "routeCode": "RT9999",
     "date": "2026-01-11",
     "driverId": "...",
     "region": "Region 1",
     "stops": [...]
   }

Expected:
- Can view routes in assigned region
- Can create new routes
- Can view route details and stops
```

---

### 🟠 MANAGER Role
**Credentials**: `manager@callsphere.com` / `manager123`

#### Expected Behavior:
- ✅ All Dispatcher capabilities
- ✅ Can acknowledge escalations
- ✅ Can advance escalation ladder
- ✅ Can view detailed escalation history
- ✅ Can read metrics
- ✅ Can edit certain metric thresholds (if enabled)
- ❌ Cannot edit metric definitions (admin only)
- ❌ Cannot manage dashboard layouts

#### Test Scenarios:

**1. Acknowledge Escalation**
```
Steps:
1. Login as manager
2. Go to "Escalations" tab
3. Find an active escalation
4. Click "Acknowledge" button
   Body: { "method": "dashboard", "notes": "Acknowledged" }

Expected:
- Escalation acknowledged
- Acknowledgment record created
- Escalation log updated with ack details
- Real-time notification sent
```

**2. Advance Escalation**
```
Steps:
1. In Escalations tab
2. Find an escalation that needs advancement
3. Click "Advance" button

Expected:
- Escalation moves to next contact in ladder
- New escalation log entry created
- Notification sent to next contact
```

**3. View Escalation History**
```
Steps:
1. Click on a shipment with escalations
2. View escalation history

Expected:
- See complete escalation timeline
- View all attempts and acknowledgments
- See contact information for each level
```

**4. View Metrics**
```
Steps:
1. Go to "Overview" tab
2. View all metrics

Expected:
- See all KPI cards
- View metric trends
- See SLA risk indicators
```

---

### 🔴 ADMIN Role
**Credentials**: `admin@callsphere.com` / `admin123`

#### Expected Behavior:
- ✅ **FULL ACCESS** to everything
- ✅ All Manager capabilities
- ✅ Can edit metric definitions
- ✅ Can create/edit metric thresholds
- ✅ Can manage dashboard configurations
- ✅ Can view all users and manage roles
- ✅ Can access Metrics Admin tab

#### Test Scenarios:

**1. Edit Metric Definitions**
```
Steps:
1. Login as admin
2. Go to "Metrics Admin" tab (only visible to admin)
3. Click "Edit" on any metric
4. Update:
   - Target value
   - Warning threshold
   - Critical threshold
   - Visibility on dashboard
5. Click "Save"

Expected:
- Metric definition updated
- Changes reflect in overview dashboard
- Threshold changes affect alerts
```

**2. Create New Metric**
```
Steps:
1. Go to Metrics Admin
2. POST /metrics/definitions
   Body: {
     "key": "customer_satisfaction",
     "name": "Customer Satisfaction Score",
     "description": "Average customer satisfaction rating",
     "aggregationType": "avg",
     "dimension": "global",
     "targetValue": 4.5,
     "warningThreshold": 4.0,
     "criticalThreshold": 3.5,
     "isVisibleOnDashboard": true
   }

Expected:
- New metric created
- Appears in metrics list
- Can compute snapshots
```

**3. User Management**
```
Steps:
1. GET /users (view all users)
2. PATCH /users/:id/role
   Body: { "role": "manager" }

Expected:
- See all users in system
- Can change user roles
- Role changes apply immediately
```

**4. Complete Admin Workflow**
```
Steps:
1. View Overview metrics
2. Check SLA Risk shipments
3. Review Issues queue
4. Trigger escalation if needed
5. Acknowledge escalation
6. Update metric definitions
7. Review all routes and shipments

Expected:
- Full visibility into all operations
- Can perform any action
- All features accessible
```

---

## Demo Flows (As Per Requirements)

### Demo 1: Track Shipment → Create Issue (Chat)
```
Role: Customer
Steps:
1. Login as customer1@example.com
2. Track shipment CS000001
3. In chat: "Where is my package CS000001?"
4. AI responds with shipment status
5. In chat: "I want to report that my package is damaged"
6. Follow AI prompts to create issue

Expected:
- Shipment tracked successfully
- AI provides tracking info
- Issue created with appropriate severity
- Issue appears in admin dashboard
- Real-time notification sent
```

### Demo 2: Request Delivery Change (Voice)
```
Role: Customer
Steps:
1. Login as customer
2. Select a shipment
3. Click "Start Voice" in AI assistant
4. Speak: "I want to reschedule my delivery to next Monday"
   (Note: Full voice requires OpenAI Realtime API setup)
5. Or use chat: "I want to reschedule my delivery"

Expected:
- Voice/chat processed
- Delivery change request created
- Request visible to dispatcher/manager
- Status updates sent
```

### Demo 3: SLA Risk → Escalation → Manager ACK (Dashboard)
```
Role: Manager/Admin
Steps:
1. Login as manager@callsphere.com
2. Go to Overview tab
3. Notice high "SLA Risk Count"
4. Go to Issues tab
5. Find high-severity issue (severity >= 0.7)
6. Click "Escalate" button
7. Go to Escalations tab
8. See escalation triggered
9. Click "Acknowledge" button
10. Add notes and acknowledge

Expected:
- SLA risk identified
- Escalation triggered automatically or manually
- Escalation ladder activated
- Manager receives notification
- Escalation acknowledged
- Full audit trail in escalation history
```

---

## API Testing Examples

### Test Login (Postman/curl)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@callsphere.com",
    "password": "admin123"
  }'
```

### Test Track Shipment
```bash
curl -X GET http://localhost:3000/shipments/track/CS000001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Create Issue
```bash
curl -X POST http://localhost:3000/delivery-issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "SHIPMENT_ID",
    "issueType": "damaged",
    "description": "Package arrived damaged"
  }'
```

### Test WebSocket Connection
```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

// Subscribe to shipment updates
socket.emit('subscribe:shipment', { trackingNumber: 'CS000001' });
socket.on('shipment.scan.created', (data) => {
  console.log('New scan:', data);
});
```

---

## Expected Features Checklist

### Customer Dashboard
- [ ] Tracking input works
- [ ] Shipment list shows only own shipments
- [ ] Shipment details display correctly
- [ ] Chat AI assistant responds
- [ ] Voice button works (placeholder for full integration)
- [ ] Issue creation via chat works
- [ ] Delivery change requests work
- [ ] Real-time updates via WebSocket

### Admin/Ops Dashboard
- [ ] Metrics overview displays correctly
- [ ] Shipments table shows all shipments
- [ ] Routes list displays correctly
- [ ] Issues queue filters work
- [ ] Escalation panel shows high-priority issues
- [ ] Escalation trigger works
- [ ] Escalation acknowledge works (manager+)
- [ ] Metrics admin editor works (admin only)
- [ ] RBAC correctly hides/shows features

### WebSocket Real-time
- [ ] Shipment scan updates received
- [ ] Issue creation notifications received
- [ ] Escalation events received
- [ ] Status updates broadcast correctly

---

## Common Issues & Troubleshooting

### "Login Failed"
- Check if backend is running: `curl http://localhost:3000/health`
- Verify credentials are correct
- Check backend logs for errors

### "Cannot access admin dashboard"
- Verify your role: Check user object after login
- Only admin/manager/dispatcher can access admin dashboard
- Customer role redirects to customer dashboard

### "WebSocket not connecting"
- Check if backend WebSocket gateway is running
- Verify JWT token is valid
- Check browser console for WebSocket errors

### "No shipments visible"
- Run seed script: `cd backend && npm run prisma:seed`
- Verify database has data
- Check if you're logged in as correct user (customers only see own shipments)

---

## Testing Checklist

### ✅ Basic Functionality
- [ ] Login works for all roles
- [ ] Logout works
- [ ] Protected routes work correctly
- [ ] RBAC enforced on frontend and backend

### ✅ Customer Features
- [ ] Track shipment by tracking number
- [ ] View shipment details
- [ ] Create delivery issue
- [ ] Request delivery change
- [ ] Chat with AI assistant
- [ ] View own shipments list

### ✅ Driver Features
- [ ] View assigned routes
- [ ] Update stop status
- [ ] View route stops in sequence

### ✅ Dispatcher Features
- [ ] View all shipments
- [ ] View metrics overview
- [ ] Manage issues
- [ ] Trigger escalations
- [ ] View and create routes

### ✅ Manager Features
- [ ] All dispatcher features
- [ ] Acknowledge escalations
- [ ] Advance escalation ladder
- [ ] View escalation history

### ✅ Admin Features
- [ ] All manager features
- [ ] Edit metric definitions
- [ ] Create new metrics
- [ ] Manage users and roles
- [ ] Full system access

---

## Next Steps After Testing

1. **Complete Voice Integration**: Set up OpenAI Realtime API for full voice functionality
2. **Enhanced AI Agents**: Configure all 6 specialized agents in OpenAI
3. **Advanced Metrics**: Implement more sophisticated metric calculations
4. **Testing**: Add unit and integration tests
5. **Performance**: Optimize database queries and add caching
6. **Deployment**: Prepare for production deployment

---

**Happy Testing! 🚀**

