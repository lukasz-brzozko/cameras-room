# Canera's Room - Video Chat Application

A real-time video chat application built with Next.js, WebRTC (PeerJS), Socket.IO and TypeScript.

## Features

- Real-time video chat capabilities
- Camera toggle functionality
- Secure HTTPS connections
- WebRTC peer-to-peer communication
- Socket.IO for real-time state synchronization
- Optional password protection

## Prerequisites

- Node.js 18+
- Docker (optional)
- SSL certificates for local HTTPS

## Getting Started

### Local Development

1. First, generate SSL certificates for HTTPS:
   ```bash
   npm run certificates
   ```
2. Generate a secure `SESSION_SECRET`:

   ```bash
   # Using node to generate a random base64 string
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   or

   ```bash
   # Using openssl to generate a random base64 string
   openssl rand -base64 32
   ```

   Add the generated secret to your `.env` file:

   ```bash
   SESSION_SECRET=your_generated_secret_here
   ```

3. (Optional) Add password protection:

   To enable password protection for the application, add a PASSWORD variable to your `.env` file:

   ```bash
   PASSWORD=your_chosen_password
   ```

   If no PASSWORD is set, the application will skip the login page.

4. Run the application using Docker:

   ```bash
   # Build and start containers
   docker compose up -d

   # View logs
   docker compose logs -f

   # Stop containers
   docker compose down
   ```
