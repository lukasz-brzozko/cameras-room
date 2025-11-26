# Cameras Room - WebRTC Application

This application allows you to easily use your mobile phone or laptop as a CCTV camera for home monitoring. Thanks to WebRTC technology, you can transform your device into a simple video surveillance system that works in real-time and provides secure connection via HTTPS. An ideal solution for those who want to create their own monitoring system without investing in professional CCTV cameras.

https://github.com/user-attachments/assets/46f80188-a9f7-4de6-a2b6-f45f1154b0e2

The application includes optional password protection to secure access to your monitoring feed.

<img width="443" height="343" alt="password" src="https://github.com/user-attachments/assets/ff86a937-b8e1-4bc9-a05d-3e734b15ca86" />

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

   To enable password protection for the application, add a `PASSWORD` variable to your `.env` file:

   ```bash
   PASSWORD=your_chosen_password
   ```

   If no `PASSWORD` is set, the application will skip the login page.

4. Run the application using Docker:

   ```bash
   # Build and start containers
   docker compose up -d

   # View logs
   docker compose logs -f

   # Stop containers
   docker compose down
   ```
