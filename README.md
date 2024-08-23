# Chat-App

This is a real-time chat application built with Node.js, Express, Socket.IO, and MongoDB. It allows users to register, login, join chat rooms, send messages, and view active users.

## Features

- User registration and login
- Real-time messaging using Socket.IO
- Display of active users
- Admin panel for managing users and chat rooms
- Brute-force attack protection
- NoSQL injection mitigation
- Link preview generation for shared URLs
- XSS filtering for user input
- User profile management

## Prerequisites

- Node.js (v12 or higher)
- MongoDB

## Installation

1. Clone the repository

git clone https://github.com/DudeNation/chat-app.git

2. Install the dependencies:

cd chat-app npm install

3. Create a `.env` file in the root directory and provide the following environment variables:

MONGO_URI= SESSION_SECRET=

4. Start the application:

npm start

5. Open your browser and visit `http://localhost:1212` to access the chat application.