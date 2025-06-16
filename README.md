# ⚙️ CONSILIUM – REST API for Medical Forum (Backend)

[![🇵🇱](https://flagcdn.com/w20/pl.png) Read in Polish](README.pl.md)

## 📌 Description

This repository contains the backend REST API for **CONSILIUM** – a secure discussion platform for medical professionals. The API was built using **Express.js**, with **PRISMA ORM** and a **PostgreSQL** database.

The project is part of my bachelor's thesis in Computer Science.

## 🧠 Key Features

- RESTful API built with **Express.js**
- **JWT-based authentication** and role-based access control
- CRUD operations for:
  - Users (doctors)
  - Topics
  - Comments and replies
  - Private messages

## 🛠️ Technologies

- **Node.js** + **Express.js** + **PRISMA ORM**
- **PostgreSQL**
- **JWT** for authentication
- **Socket.IO**

## 🚀 How to run the backend locally

> ⚠️ The frontend is available here: [consiliumfrontend](https://github.com/azuchora/consiliumfrontend)  
> 🐳 Docker support coming soon™

1. Clone the repository:

```bash
git clone https://github.com/azuchora/consiliumbackend.git
cd consiliumbackend
```

2. Install dependencies

```bash
npm install
```

3. Create .env file in the root directory:

```bash
DATABASE_URL=your_db_url
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
API_ROUTE=/api/v1
EMAIL_USER=mail@example.com
EMAIL_PASS=your_secret
EMAIL_SERVICE=gmail
FRONTEND_URL=example.com
```

4. Create database and generate prisma client

```bash
npx prisma migrate dev --name init
```

```bash
npx prisma generate
```

5. Start the server:

```bash
npm run dev
```

The API will run at

```bash
http://localhost:3300
```