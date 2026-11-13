# Chat Backend Application

## About Project

I have created a chat backend application using Node.js, TypeScript, PostgreSQL, and Firebase Firestore.

In this project, users can create one-to-one chats, send messages, get messages, mark messages as read, and update their last-seen status.

I have used PostgreSQL to store users, chats, and chat members. I have used Firebase Firestore to store messages, read receipts, and last-seen details.

I have used raw SQL queries instead of an ORM.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Firebase Firestore
- Firebase Admin SDK
- pg package
- Postman

## Database Structure

### PostgreSQL

I have created three tables:

**1. users**

Stores user details like ID, name, email, and created date.

**2. chats**

Stores chat details like chat ID, user A, user B, and created date.

**3. chat_members**

Stores which users belong to which chat.

### Firebase Firestore

I have used Firestore to store:

- Chat messages
- Message read receipts
- User last-seen details

## Project Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create PostgreSQL database

```sql
CREATE DATABASE chat_app;
```

Create the `users`, `chats`, and `chat_members` tables in the database.

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=chat_app
```

### 4. Configure Firebase

- Create a Firebase project.
- Enable Cloud Firestore.
- Download the Firebase service account JSON file.
- Keep the file inside the `config` folder.

### 5. Run the project

For development:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Start the project:

```bash
npm start
```

## API Endpoints

Base URL:

```text
http://localhost:5000
```

### 1. Create Chat

**POST** `/chat/create`

I use this API to create a chat between two users.

Request body:

```json
{
  "userAId": "1",
  "userBId": "2"
}
```

It checks whether both users exist. If a chat already exists between them, it returns the existing chat. Otherwise, it creates a new chat.

### 2. Send Message

**POST** `/chat/:chatId/message/send`

I use this API to send a message in a chat.

Example:

`POST /chat/1/message/send`

Request body:

```json
{
  "senderId": "1",
  "text": "Hello, how are you?"
}
```

Before sending the message, I check whether the sender is a member of that chat. If the user is a member, I save the message in Firestore.

### 3. Get Messages

**GET** `/chat/:chatId/messages?userId=1&limit=50`

I use this API to get messages from a particular chat.

Example:

`GET /chat/1/messages?userId=1&limit=50`

It checks the user's membership and returns the latest messages in chronological order.

### 4. Mark Message as Read

**POST** `/chat/:chatId/message/:messageId/read`

I use this API to mark a message as read.

Example:

`POST /chat/1/message/message_id_1/read`

Request body:

```json
{
  "userId": "2"
}
```

It checks the user's membership and saves the read receipt in Firestore with the read timestamp.

### 5. Update Last Seen

**POST** `/chat/:chatId/lastseen`

I use this API to update the last message read by a user in a particular chat.

Example:

`POST /chat/1/lastseen`

Request body:

```json
{
  "userId": "2",
  "messageId": "message_id_1"
}
```

It checks the user and message, then updates the last-seen details in Firestore.

### 6. Get User Chats

**GET** `/user/:userId/chats`

I use this API to get all chats of a particular user.

Example:

`GET /user/1/chats`

It uses PostgreSQL joins to get all chats in which the user is a member.

## API Testing

I have used Postman to test all the API endpoints.

| Method | API | Purpose |
|---|---|---|
| POST | `/chat/create` | Create chat |
| POST | `/chat/:chatId/message/send` | Send message |
| GET | `/chat/:chatId/messages` | Get messages |
| POST | `/chat/:chatId/message/:messageId/read` | Mark as read |
| POST | `/chat/:chatId/lastseen` | Update last seen |
| GET | `/user/:userId/chats` | Get user chats |

## Project Features

- Create one-to-one chat between users.
- Send messages.
- Get chat messages.
- Check chat member before sending messages.
- Mark messages as read.
- Update last-seen status.
- Get all chats of a user.
- Store user and chat details in PostgreSQL.
- Store messages and read information in Firebase Firestore.
