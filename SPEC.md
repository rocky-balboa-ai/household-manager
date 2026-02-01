# Household Manager — Full Specification

**Domain:** household.mycyborg.ai
**Deadline:** 8:00am Dubai (8:00pm PST) — Feb 2, 2026
**Report:** 8:10am Dubai on WhatsApp with screenshots

## Overview
A household management app for the Haddad family. Elsy (wife) manages staff who execute tasks. Real-time updates, multi-language support, mobile-first design.

## Tech Stack (Same as OmniFocus Clone)
- **Frontend:** Next.js 16 (TypeScript, Tailwind CSS)
- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Realtime:** WebSockets (Socket.io or native WS)
- **Deploy:** Vercel (frontend), Railway (backend)
- **Auth:** PIN-based for staff, email PIN for Elsy, password for Fred

## Users & Authentication

| User | Role | Auth Method | Languages |
|------|------|-------------|-----------|
| Fred | Admin | Email + Password | English |
| Elsy | Manager | PIN (emailed to elsy@elsy.com) | English |
| Saleem | Driver | Daily PIN (first use) | Urdu |
| Karen | Nanny | Daily PIN | English ↔ Tagalog |
| Wincate | Nanny | Daily PIN | English ↔ Swahili |
| Ada | Maid | Daily PIN | Amharic |
| Bella | Maid | Daily PIN | Amharic |

### Auth Flow
- **Fred:** Standard email/password login
- **Elsy:** Enter email → PIN sent → enter PIN to login
- **Staff:** Select name → Enter 4-digit PIN (set on first use, reused daily)
- Session expires at midnight, PIN required again next day

## Core Features

### 1. Task Board
- **Create tasks:** Title, description, assignee(s), due date/time, recurring option
- **Assign to:** One or multiple staff members
- **Status:** Pending → In Progress → Completed
- **Photo proof:** Optional photo attachment on completion
- **Recurring:** Daily, weekly, custom schedule
- **Categories:** Cleaning, Cooking, Laundry, Kids, Shopping, Other

### 2. Multi-Language UI
- Interface text translated via AI for each user's language
- Store translations in DB or use runtime translation
- Languages: English, Urdu, Tagalog, Swahili, Amharic
- Karen & Wincate can toggle between English and their native language

### 3. Inventory Management

#### Pantry & Freezer
- Items with name, quantity, category, location (pantry/freezer/fridge)
- Low-stock threshold alerts
- Add/remove with +/- buttons
- Categories: Dairy, Meat, Vegetables, Fruits, Grains, Snacks, Beverages, Other

#### Frozen Meals
- Pre-prepared meals stored in freezer
- Track quantity
- Link to kid meal assignments

#### Shisha Inventory
- Tobacco (brand, flavor, quantity)
- Pipes (name, status)
- Charcoal boxes (quantity)

### 4. Shopping Lists
- **Grocery List:** Auto-generated from low-stock + manual adds
- **Pharmacy List:** Manual items for pharmacy pickup
- Lists assigned to Saleem (Driver)
- Mark items as purchased
- Clear completed lists

### 5. Kids Hub (Anthony 5yo, Rodney 3yo)

#### Health Log
- Poop/pee tracking with timestamp
- Notes field
- Which nanny recorded it

#### Meal Tracking
- Meal type: Breakfast, Lunch, Dinner, Snack
- Food source: Frozen meal (select from inventory) OR Fresh/live-prepared (free text)
- Rating: How well they ate (emoji scale: 😫 😕 😐 🙂 😋)
- Photo of plate (required)
- Portions eaten estimate

#### Activity Log
- Free-form activity entries
- Timestamp + which nanny logged it
- Categories: Play, Learning, Outdoor, Screen time, Nap, Other

#### Scheduled Activities
- Recurring calendar items
- Soccer, Gym, School, Playdates, etc.
- Which kid, day/time, location, notes
- Reminder notifications

### 6. Staff Management

#### Day Off Tracking
- Full day or half day (AM/PM)
- Calendar view of upcoming time off
- Request → Approve flow (Elsy approves)

#### Staff Profiles
- Name, role, phone, language preference
- PIN management
- View task history

### 7. Fred's Schedule
- Weekly calendar: WFH or Office per day
- Quick toggle for upcoming week
- Visible to all staff (helps planning)

### 8. Notifications
- **WhatsApp:** Primary notification channel (use wacli or WhatsApp Business API)
- **Web Push:** Fallback for iPhone (if WhatsApp fails)
- Triggers:
  - New task assigned
  - Task overdue
  - Low inventory alert
  - Shopping list ready
  - Day off approved/denied

### 9. Real-time Updates
- WebSocket connection for all clients
- Live task status updates
- Inventory changes sync instantly
- "Who's online" indicator (optional)

### 10. Reports & Dashboard (Elsy/Fred view)
- Daily summary: Tasks completed, pending, overdue
- Weekly overview
- Inventory status
- Kids' meals & health summary

## Database Schema (Prisma)

```prisma
model User {
  id          String   @id @default(uuid())
  name        String
  email       String?  @unique
  phone       String?
  role        Role     // ADMIN, MANAGER, DRIVER, NANNY, MAID
  pin         String?  // Hashed 4-digit PIN
  pinSetAt    DateTime?
  language    String   @default("en") // en, ur, tl, sw, am
  altLanguage String?  // For toggle (Karen: tl, Wincate: sw)
  createdAt   DateTime @default(now())
  
  tasks       TaskAssignment[]
  activityLogs ActivityLog[]
  dayOffs     DayOff[]
}

enum Role {
  ADMIN
  MANAGER
  DRIVER
  NANNY
  MAID
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  category    String   // cleaning, cooking, laundry, kids, shopping, other
  status      TaskStatus @default(PENDING)
  dueDate     DateTime?
  recurring   String?  // cron expression or null
  photoProof  String?  // URL
  createdBy   String   // User ID
  completedAt DateTime?
  createdAt   DateTime @default(now())
  
  assignments TaskAssignment[]
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model TaskAssignment {
  id        String   @id @default(uuid())
  taskId    String
  userId    String
  task      Task     @relation(fields: [taskId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}

model InventoryItem {
  id          String   @id @default(uuid())
  name        String
  category    String   // pantry, freezer, fridge, shisha
  subCategory String?  // For pantry: dairy, meat, etc. For shisha: tobacco, pipes, charcoal
  quantity    Int      @default(0)
  unit        String?  // pieces, kg, boxes, etc.
  lowThreshold Int?
  location    String?
  brand       String?  // For shisha tobacco
  flavor      String?  // For shisha tobacco
  createdAt   DateTime @default(now())
}

model FrozenMeal {
  id          String   @id @default(uuid())
  name        String
  quantity    Int      @default(0)
  description String?
  createdAt   DateTime @default(now())
}

model ShoppingList {
  id          String   @id @default(uuid())
  type        String   // grocery, pharmacy
  items       ShoppingItem[]
  assignedTo  String?  // Saleem's user ID
  status      String   @default("active") // active, completed
  createdAt   DateTime @default(now())
  completedAt DateTime?
}

model ShoppingItem {
  id          String   @id @default(uuid())
  listId      String
  list        ShoppingList @relation(fields: [listId], references: [id])
  name        String
  quantity    Int      @default(1)
  unit        String?
  purchased   Boolean  @default(false)
}

model Kid {
  id          String   @id @default(uuid())
  name        String
  birthDate   DateTime
  
  healthLogs  HealthLog[]
  mealLogs    MealLog[]
  activityLogs KidActivityLog[]
  schedules   KidSchedule[]
}

model HealthLog {
  id          String   @id @default(uuid())
  kidId       String
  kid         Kid      @relation(fields: [kidId], references: [id])
  type        String   // poop, pee
  notes       String?
  loggedBy    String   // User ID (nanny)
  createdAt   DateTime @default(now())
}

model MealLog {
  id          String   @id @default(uuid())
  kidId       String
  kid         Kid      @relation(fields: [kidId], references: [id])
  mealType    String   // breakfast, lunch, dinner, snack
  foodSource  String   // frozen, fresh
  foodName    String
  frozenMealId String? // If from frozen inventory
  rating      Int      // 1-5
  photo       String   // Required URL
  portions    String?  // "all", "most", "half", "little", "none"
  loggedBy    String   // User ID (nanny)
  createdAt   DateTime @default(now())
}

model KidActivityLog {
  id          String   @id @default(uuid())
  kidId       String
  kid         Kid      @relation(fields: [kidId], references: [id])
  activity    String
  category    String   // play, learning, outdoor, screen, nap, other
  notes       String?
  loggedBy    String   // User ID
  createdAt   DateTime @default(now())
}

model KidSchedule {
  id          String   @id @default(uuid())
  kidId       String
  kid         Kid      @relation(fields: [kidId], references: [id])
  activity    String   // Soccer, Gym, School, etc.
  dayOfWeek   Int      // 0-6
  time        String   // HH:MM
  location    String?
  notes       String?
  active      Boolean  @default(true)
}

model DayOff {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  date        DateTime
  type        String   // full, half_am, half_pm
  status      String   @default("pending") // pending, approved, denied
  approvedBy  String?  // User ID (Elsy)
  createdAt   DateTime @default(now())
}

model FredSchedule {
  id          String   @id @default(uuid())
  date        DateTime @unique
  location    String   // wfh, office
  createdAt   DateTime @default(now())
}

model ActivityLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String
  details     Json?
  createdAt   DateTime @default(now())
}
```

## API Endpoints

### Auth
- POST /api/auth/login (Fred - email/password)
- POST /api/auth/pin-request (Elsy - sends PIN to email)
- POST /api/auth/pin-verify (Elsy & Staff)
- POST /api/auth/pin-set (Staff first-time)

### Users
- GET /api/users
- GET /api/users/:id
- PATCH /api/users/:id
- PATCH /api/users/:id/language

### Tasks
- GET /api/tasks
- GET /api/tasks/:id
- POST /api/tasks
- PATCH /api/tasks/:id
- POST /api/tasks/:id/complete (with photo)
- DELETE /api/tasks/:id

### Inventory
- GET /api/inventory
- GET /api/inventory/:id
- POST /api/inventory
- PATCH /api/inventory/:id
- POST /api/inventory/:id/adjust (+/- quantity)

### Frozen Meals
- CRUD /api/frozen-meals

### Shisha
- GET /api/shisha
- POST /api/shisha
- PATCH /api/shisha/:id

### Shopping Lists
- GET /api/shopping-lists
- POST /api/shopping-lists
- POST /api/shopping-lists/:id/items
- PATCH /api/shopping-lists/:id/items/:itemId
- POST /api/shopping-lists/:id/complete

### Kids
- GET /api/kids
- GET /api/kids/:id
- POST /api/kids/:id/health-log
- POST /api/kids/:id/meal-log
- POST /api/kids/:id/activity-log
- CRUD /api/kids/:id/schedules

### Staff Management
- GET /api/day-offs
- POST /api/day-offs
- PATCH /api/day-offs/:id (approve/deny)

### Fred Schedule
- GET /api/fred-schedule
- POST /api/fred-schedule
- PATCH /api/fred-schedule/:date

### WebSocket Events
- task:created, task:updated, task:completed
- inventory:updated
- notification:new

## UI Screens

### Staff App (Mobile-first)
1. **Home/Dashboard** - Today's tasks, quick actions
2. **My Tasks** - List with tap-to-complete
3. **Task Detail** - Description, mark complete, add photo
4. **Kids** (Nannies) - Health log, meal log, activity log
5. **Shopping List** (Driver) - Grocery & pharmacy lists
6. **Profile** - Language toggle, PIN reset
7. **Day Off** - Request time off

### Manager App (Elsy)
1. **Dashboard** - Overview, alerts, today's summary
2. **Tasks** - Create, assign, view all tasks
3. **Staff** - View staff, approve day offs
4. **Inventory** - All inventory management
5. **Kids** - View logs, manage schedules
6. **Shopping** - Create/manage lists
7. **Reports** - Daily/weekly summaries

### Admin (Fred)
- Everything Elsy has
- User management
- WFH/Office schedule
- System settings

## Design Guidelines
- **Colors:** Warm, homey palette (soft greens, warm whites, wood tones)
- **Typography:** Clean, readable (system fonts)
- **Icons:** Friendly, rounded icons
- **Mobile:** Touch-friendly buttons (min 44px tap targets)
- **Tablet:** Optimized layout for kitchen display
- **Accessibility:** High contrast, clear labels

## Development Workflow
1. Set up monorepo structure
2. Initialize Prisma schema
3. Build API endpoints (TDD with beads)
4. Build frontend screens
5. Add WebSocket layer
6. Add translations
7. Test on mobile
8. Deploy to household.mycyborg.ai
9. Visual verification with agent-browser

## Seed Data
- All 7 users with PINs
- Sample tasks (10+)
- Pantry items (20+)
- Frozen meals (5+)
- Shisha inventory
- Anthony & Rodney with sample logs
- Sample kid schedules

## Success Criteria
By 8:00am Dubai:
- [ ] All users can login
- [ ] Tasks can be created and completed
- [ ] Inventory management works
- [ ] Kids logging works (health, meals, activities)
- [ ] Shopping lists work
- [ ] Real-time updates via WebSocket
- [ ] Multi-language toggles work
- [ ] Day off requests work
- [ ] Fred's schedule works
- [ ] Mobile-responsive design
- [ ] Deployed and accessible at household.mycyborg.ai

---

**GO BUILD THIS! 🏠**
