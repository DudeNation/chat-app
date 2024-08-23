# Chat-App

This is a chat application built with Node.js, Express, Socket.IO, and MongoDB. It allows users to register, login, join chat rooms, and send messages in real-time.

## Features

- User registration and login
- Real-time messaging using Socket.IO
- User avatars
- Link previews
- XSS protection
- Admin panel for managing users and chat rooms
- Brute-force attack protection
- NoSQL injection mitigation

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/chat-app.git
   ```

2. Navigate the project directory:

   ```bash
   cd chat-app
   ```

3. Create a .env file in the root directory and provide the necessary environment variables:

   ```bash
   PORT=1212
   MONGODB_URI=
   SESSION_SECRET=
   ```

4. Build and start the Docker containers:

   ```bash
   docker-compose up --build
   ```

This command will build the Docker images and start the containers for the chat application and MongoDB.

5. Access the application in your web browser at http://localhost:1212.