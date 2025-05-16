# ⚙️ CONSILIUM – REST API for Medical Forum (Backend)

[![🇵🇱](https://flagcdn.com/w20/pl.png) Read in Polish](README.pl.md)

## 📌 Description

This repository contains the backend REST API for **CONSILIUM** – a secure discussion platform for medical professionals. The API was built using **Express.js**, with raw SQL queries (no ORM) and a **PostgreSQL** database.

The project is part of my bachelor's thesis in Computer Science.

## 🧠 Key Features

- RESTful API built with **Express.js**
- **JWT-based authentication** and role-based access control
- Manual SQL queries (no ORM) with **PostgreSQL**
- CRUD operations for:
  - Users (doctors)
  - Topics
  - Comments and replies
  - Private messages
- **Redis** support for caching (soon™)

## 🛠️ Technologies

- **Node.js** + **Express.js**
- **PostgreSQL**
- **JWT** for authentication
- **Redis** *(soon™)*

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
PGHOST=your_db_host
PGPORT=your_db_port
PGPASSWORD=your_db_password
PGUSER=your_db_user
PGDATABASE=your_db
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
API_ROUTE=/api/v1
```

4. Start the server:

```bash
npm run dev
```

The API will run at

```bash
http://localhost:3300
```