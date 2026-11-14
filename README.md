# Chat Backend Application

## About Project

I have created a chat backend application using Node.js, TypeScript, PostgreSQL, and Firebase Firestore.

In this project, users can create one-to-one chats and group chats, send messages, get messages, mark messages as read, update their last-seen status, edit messages, and delete messages.

I have used PostgreSQL to store users, chats, and chat members. I have used Firebase Firestore to store messages, read receipts, and last-seen details.

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

I have created three main tables:

**1. users**

Stores user details like ID, name, email, and created date.

**2. chats**

Stores chat details like chat ID, user A, user B, chat type, group name, created by, and created date.

**3. chat_members**

Stores which users belong to which chat. I use this table for both one-to-one and group chats.

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

The `chats` table also includes group chat fields such as `chat_type`, `group_name`, and `created_by`.

For group chat support, `user_a` must allow NULL values because group chats use `chat_members` to store their members.

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

### 1. Create One-to-One Chat

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

### 2. Create Group Chat

**POST** `/chat/group/create`

I use this API to create a group chat with multiple users.

Request body:

```json
{
  "groupName": "Development Team",
  "createdBy": "1",
  "members": ["2", "3"]
}
```

It checks whether all users exist. It creates a group chat and adds the creator and given members to the `chat_members` table.

### 3. Add Members to Group Chat

**POST** `/chat/group/:chatId/members`

I use this API to add new members to an existing group chat.

Example:

`POST /chat/group/4/members`

Request body:

```json
{
  "addedBy": "1",
  "userIds": ["5", "6"]
}
```

It checks whether the group exists and whether the user adding members is the group creator. It also checks whether the users exist and adds only new members to the group.

### 4. Send Message

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

### 5. Get Messages

**GET** `/chat/:chatId/messages?userId=1&limit=50`

I use this API to get messages from a particular chat.

Example:

`GET /chat/1/messages?userId=1&limit=50`

It checks the user's membership and returns the messages in chronological order. I use a limit to control how many messages are returned.

### 6. Mark Message as Read

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

### 7. Update Last Seen

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

### 8. Get User Chats

**GET** `/user/:userId/chats`

I use this API to get all chats of a particular user.

Example:

`GET /user/1/chats`

It uses PostgreSQL joins to get all chats in which the user is a member.

### 9. Edit Message

**PUT** `/chat/:chatId/message/:messageId/edit`

I use this API to edit an existing message.

Example:

`PUT /chat/4/message/message_id_1/edit`

Request body:

```json
{
  "senderId": "1",
  "text": "This is my updated message"
}
```

It checks whether the user is a member of the chat and whether the message belongs to that user. If both conditions are satisfied, it updates the message text in Firestore and saves the edited status and edited timestamp.

### 10. Delete Message

**DELETE** `/chat/:chatId/message/:messageId/delete`

I use this API to delete an existing message.

Example:

`DELETE /chat/4/message/message_id_1/delete`

Request body:

```json
{
  "senderId": "1"
}
```

It checks whether the user is a member of the chat and whether the message belongs to that user. If both conditions are satisfied, it deletes the message and its read receipts from Firestore.

## API Testing

I have used Postman to test the API endpoints.

| Method | API | Purpose |
|---|---|---|
| POST | `/chat/create` | Create one-to-one chat |
| POST | `/chat/group/create` | Create group chat |
| POST | `/chat/group/:chatId/members` | Add group members |
| POST | `/chat/:chatId/message/send` | Send message |
| GET | `/chat/:chatId/messages` | Get messages |
| POST | `/chat/:chatId/message/:messageId/read` | Mark message as read |
| POST | `/chat/:chatId/lastseen` | Update last seen |
| GET | `/user/:userId/chats` | Get user chats |
| PUT | `/chat/:chatId/message/:messageId/edit` | Edit message |
| DELETE | `/chat/:chatId/message/:messageId/delete` | Delete message |
