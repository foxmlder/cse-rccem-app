# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CSE RCCEM-Montataire management application - A web application for managing the Social and Economic Committee (CSE) of a company with less than 50 employees. The app handles meetings, convocations (invitations), staff feedback, meeting minutes, and electronic signatures.

**Tech Stack**: Next.js 14 (App Router), Prisma ORM, PostgreSQL (Neon), NextAuth.js, Tailwind CSS, React PDF, Resend (emails)

## Development Commands

### Essential Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Database Commands (Prisma)
```bash
# Generate Prisma Client (run after schema changes)
npm run prisma:generate
# or: npx prisma generate

# Push schema to database
npm run prisma:push
# or: npx prisma db push

# Seed database with initial users
npm run prisma:seed
# or: tsx prisma/seed.ts

# Open Prisma Studio (visual database editor)
npm run prisma:studio
# or: npx prisma studio
```

### Testing & Validation
```bash
# TypeScript type checking
npx tsc --noEmit

# Validate Prisma schema
npx prisma validate
```

## Architecture Overview

### Database Schema (Prisma)
The application uses PostgreSQL with the following core models:

- **User**: Members of the CSE with roles (PRESIDENT, ADMIN, MEMBER) and CSE-specific roles (e.g., "Président", "Secrétaire", "Titulaire", "Suppléant")
- **Meeting**: Meetings with type (ORDINARY/EXTRAORDINARY), status tracking, and feedback deadlines
- **MeetingParticipant**: Join table tracking participant status (INVITED, CONFIRMED, PRESENT, ABSENT, EXCUSED)
- **AgendaItem**: Ordered agenda items for meetings with duration estimates
- **Feedback**: Staff submissions categorized by type (working conditions, health/safety, etc.) with status tracking
- **MeetingMinute**: Meeting minutes/reports with status flow (DRAFT → PENDING_SIGNATURE → SIGNED → PUBLISHED)
- **Signature**: Electronic signatures stored as base64 images with metadata (IP, user agent)

All models use `cuid()` for IDs and include appropriate indexes for performance.

### Application Flow
1. **Meeting Creation**: President creates a meeting with date, location, participants, and feedback deadline
2. **Convocation**: President finalizes agenda → System generates PDF → Emails sent to participants → Status updates to CONVOCATION_SENT
3. **Feedback Collection**: Members submit feedback until deadline → Categorized automatically → President can integrate into agenda
4. **Meeting Execution**: Status changes to IN_PROGRESS on meeting day → Participants marked present/absent → Completed after meeting
5. **Minutes**: President/secretary drafts minutes (DRAFT) → Generates PDF → Sends for signatures (PENDING_SIGNATURE) → Members sign electronically → Auto-publishes when all signed (SIGNED → PUBLISHED)

### File Structure
```
src/
├── app/                          # Next.js App Router pages
│   ├── (protected)/             # Protected routes requiring authentication
│   │   ├── dashboard/           # Main dashboard
│   │   ├── reunions/            # Meetings management
│   │   ├── convocations/        # Convocation creation & sending
│   │   ├── remontees/           # Staff feedback management
│   │   ├── comptes-rendus/      # Meeting minutes & signatures
│   │   └── membres/             # Member management
│   ├── api/                     # API routes
│   │   ├── auth/[...nextauth]/  # NextAuth.js endpoints
│   │   ├── meetings/            # Meeting CRUD operations
│   │   ├── feedbacks/           # Feedback operations
│   │   ├── minutes/             # Minutes operations
│   │   └── signatures/          # Signature operations
│   └── auth/                    # Authentication pages
├── components/                   # React components
│   ├── ui/                      # Reusable UI components (Button, Input, Modal, etc.)
│   ├── layout/                  # Header, Navigation, UserMenu
│   └── [feature]/               # Feature-specific components
├── lib/                         # Utilities and configuration
│   ├── db.ts                    # Prisma client instance
│   ├── auth.ts                  # NextAuth configuration
│   ├── pdf/                     # PDF generation templates
│   └── email/                   # Email sending & templates
└── types/                       # TypeScript type definitions

prisma/
├── schema.prisma                # Database schema
└── seed.ts                      # Initial data seeding
```

## Key Implementation Details

### Authentication & Authorization
- NextAuth.js with CredentialsProvider using bcrypt (10 rounds) for password hashing
- JWT sessions with 30-day duration
- Role-based permissions:
  - **PRESIDENT/ADMIN**: Full access (create/edit meetings, send convocations, manage members)
  - **MEMBER**: Submit feedback, sign minutes, view meetings
- Middleware protects all routes under `(protected)/`

### Database Access
- Always use the shared Prisma client from `src/lib/db.ts`
- Use transactions for multi-step operations (e.g., creating meeting with participants and agenda items)
- Select only necessary fields to optimize queries
- Implement pagination for lists

### PDF Generation
- Use `@react-pdf/renderer` for PDF templates
- Templates located in `src/lib/pdf/`
- Two main templates:
  - **Convocation**: Header with logo, meeting details, participants list, numbered agenda with durations, feedback deadline
  - **Minutes**: Header, attendees list, agenda items with discussions/decisions/actions, signatures section

### Email System
- Resend API for sending emails
- Templates in `src/lib/email/templates/`
- Three main email types:
  - **Convocation**: Sent when meeting invitation is sent (includes PDF attachment)
  - **Signature Request**: Sent when minutes are ready for signing
  - **Published Minutes**: Sent when all signatures collected (includes final PDF)

### Forms & Validation
- Use Zod schemas for validation (define in `src/lib/validators/`)
- Validate on both client (react-hook-form with @hookform/resolvers) and server side
- Always handle errors gracefully with user-friendly messages

### Styling & UI
- Tailwind CSS with mobile-first approach
- Color palette: Blue (#3b82f6) primary, Green (#10b981) success, Orange (#f59e0b) warning, Red (#ef4444) danger
- Use lucide-react for icons
- Components use shadow-md for cards and smooth hover transitions
- Reference `MAQUETTE_REFERENCE.jsx` for UI design patterns

### Electronic Signatures
- Use react-signature-canvas for signature pad
- Store signatures as base64-encoded images in database
- Record metadata: timestamp, IP address, user agent
- Auto-publish minutes when all required participants have signed

## Default Test Users

After running `npm run prisma:seed`:
- **President**: f.muselet@rccem.fr / admin123 (role: PRESIDENT)
- **Member**: f.lakhdar@rccem.fr / membre123 (role: MEMBER)
- **Additional test members**: All use password "test123"

## Environment Variables

Required in `.env.local` (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string from Neon
- `NEXTAUTH_SECRET`: Random secret for JWT (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Application URL (http://localhost:3000 for dev)
- `RESEND_API_KEY`: API key from Resend for email sending
- `RESEND_FROM_EMAIL`: Sender email address (e.g., noreply@rccem.fr)

## Important Documentation Files

- **SPECIFICATIONS.md**: Detailed technical specifications including data models, permissions, and workflows
- **TODO.md**: Comprehensive development task list organized by phase
- **QUICKSTART.md**: 5-minute setup guide
- **DEPLOYMENT.md**: Vercel + Neon deployment instructions
- **MAQUETTE_REFERENCE.jsx**: UI/UX reference mockup
- **CONTRIBUTING.md**: Contribution guidelines (if present)

## Date & Time Handling

- All dates stored as DateTime in database
- Display format: dd/MM/yyyy (French format)
- Time format: HH:MM (24-hour)
- Timezone: Europe/Paris
- Use `date-fns` library for date manipulation

## Security Considerations

- Never commit `.env.local` or expose secrets
- Always hash passwords with bcrypt before storing
- Validate all user inputs on server side with Zod
- Use Prisma parameterized queries (SQL injection protection)
- Implement proper CSRF protection (built-in with Next.js)
- Check user permissions before executing sensitive operations
- Rate limit sensitive endpoints

## Performance Best Practices

- Use Next.js automatic code splitting
- Implement React Query for client-side caching
- Lazy load heavy components
- Use `next/image` for image optimization
- Add database indexes on frequently queried fields (already defined in schema)
- Paginate long lists of data

## Testing Workflow

When implementing features:
1. Start with database schema updates if needed
2. Create API routes with validation
3. Build UI components
4. Test manually with seeded data
5. Verify mobile responsiveness
6. Check error handling and loading states

Always test with both PRESIDENT and MEMBER roles to verify permission logic.
