# Epilepsy Seizure Prediction System - Web Interface

A comprehensive web application for managing and monitoring epilepsy seizure prediction devices, built with Next.js 15, featuring real-time alerts and emergency contact management.

📄 [Read the full project report](edp.md) for detailed information about the Epilepsy Seizure Prediction Cap Device.

## Features

### Home Page
- Detailed project overview and how the system works
- Information about the epilepsy prediction cap device
- Key features and benefits
- Technical specifications and accuracy metrics

### Authentication System
- Role-based authentication with multiple sign-in options:
  - Email/Password authentication
  - Google OAuth integration
  - Powered by Clerk for secure session management
- User roles:
  - Patient/Device Owner
  - Emergency Contact (pending)
  - Medical Professional (pending)
  - Administrator (pending)

### Dashboard
![Dashboard Preview](public/dashboard.png)
- Real-time device connection status
- Unique device ID display
- Recent alerts timeline
- Key Metrics:
  - Total predictions made
  - Total seizures detected
  - Total alerts generated
  - Number of emergency contacts
- Device status monitoring

### Emergency Contacts Management
- Comprehensive contact management:
  - Add new emergency contacts
  - Edit existing contact information
  - Delete contacts
- Contact Information Fields:
  - Full Name
  - Email Address
  - Phone Number
  - Primary Contact Status
- Notification Preferences:
  - Voice Calls
  - SMS Alerts
  - Email Notifications
- Priority-based contact ordering (primary contact)

### Alert System
- Multi-channel alert delivery:
  - SMS notifications via Twilio
  - Voice calls for urgent situations
  - Email alerts using Nodemailer
- Test alert system for verification
- Alert acknowledgment tracking
- Alert history and status monitoring

### Device Management
- Device registration system
- Generate new device IDs
- Regenerate device credentials
- Device status monitoring
- Connection history

## Tech Stack

### Frontend
- Next.js 15
- TailwindCSS for styling
- shadcn/ui components
- TypeScript

### Backend
- Next.js API routes
- Prisma ORM
- PostgreSQL (NeonDB)
- WebSocket for real-time updates

### Authentication & Security
- Clerk Authentication
- JWT token management
- Role-based access control

### Communication
- Twilio for SMS/Voice
- Nodemailer for emails
- WebSocket for real-time updates

## Getting Started

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
PostgreSQL instance (NeonDB)
Clerk account
Twilio account
```

### Environment Variables
Create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://username:password@your-db-host/dbname?sslmode=require

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
WEBHOOK_SECRET=your_webhook_secret

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dipandhali2021/epilepsy-seizure-detection.git
cd epilepsy-seizure-detection
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:
```bash
npm run dev
```

### Database Schema

```mermaid
erDiagram
    User ||--o{ Device : owns
    User ||--o{ EmergencyContact : has
    Device ||--o{ Alert : generates
    Alert ||--o{ Notification : triggers
    EmergencyContact ||--o{ Notification : receives
```

## API Routes

### Device Management
```typescript
POST /api/device/register      // Register new device
POST /api/device/regenerate    // Regenerate device credentials
GET  /api/device/status        // Get device status
```

### Emergency Contacts
```typescript
GET    /api/contacts          // List all contacts
POST   /api/contacts          // Add new contact
PUT    /api/contacts/:id      // Update contact
DELETE /api/contacts/:id      // Delete contact
```

### Alerts
```typescript
POST /api/alerts              // Create new alert
GET  /api/alerts              // List alerts
POST /api/alerts/test         // Test alert system
POST /api/alerts/:id/ack      // Acknowledge alert
```

## Testing the Alert System

The system includes a test interface for verifying alert functionality:

1. Navigate to the Alerts tab
2. Click "Test Alert System"
3. Select notification channels to test
4. Confirm the test alert
5. Check alert delivery across all selected channels

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built as part of the Epilepsy Seizure Prediction Cap Device project
- Uses advanced machine learning models for seizure prediction
- Integrated with hardware components for real-time monitoring
