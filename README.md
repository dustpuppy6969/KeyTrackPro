# KeyTrack Pro

A React application for tracking physical keys using QR codes with Supabase backend and cross-device synchronization.

## Features

- Track physical keys using QR codes
- Randomly verify keys to ensure they're in the keybox
- Admin settings for verification frequency
- Cross-device synchronization
- QR code generation for keys
- Dark theme with black and yellow styling

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: Express.js
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query
- **Routing**: Wouter

## Getting Started

### Prerequisites

- Node.js 16+
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Supabase connection:
   ```
   DATABASE_URL=your_supabase_connection_string
   ```
4. Run the database migrations:
   ```
   node schema-push.js
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Deployment

See the [deployment guide](./deployment-guide.md) for step-by-step instructions on how to deploy this application using Netlify, even if you only have an Android phone.

## Mobile Features

- **QR Code Scanning**: Scan QR codes attached to physical keys
- **Responsive Design**: Works well on mobile devices
- **Offline Support**: Basic functionality works without internet
- **Cross-Device Sync**: Key data syncs across all devices

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shadcn UI for the component library
- Supabase for the database
- Tailwind for styling