# ⚙️ CONSILIUM – REST API Forum Medycznego (Backend)

[![🇵🇱](https://flagcdn.com/w20/gb.png) Read in English](README.md)

## 📌 Description

To repozytorium zawiera backendowe REST API dla aplikacji **CONSILIUM** – bezpiecznej platformy dyskusyjnej dla lekarzy. API zostało stworzone w technologii **Express.js**, z wykorzystaniem ręcznie pisanych zapytań SQL (bez ORM) oraz bazy danych **PostgreSQL**.

Projekt powstał jako część mojej pracy dyplomowej na kierunku Informatyka.

## 🧠 Kluczowe funkcjonalności

- REST API oparte na **Express.js**
- Uwierzytelnianie z użyciem **JWT** oraz kontrola dostępu na podstawie ról
- Ręcznie pisane zapytania SQL (bez ORM) z użyciem **PostgreSQL**
- Operacje CRUD dla:
  - Użytkowników (lekarzy)
  - Wątków
  - Komentarzy i odpowiedzi
  - Prywatnych wiadomości
- Cache **Redis** (soon™)

## 🛠️ Technologie

- **Node.js** + **Express.js**
- **PostgreSQL**
- **JWT** do uwierzytelniania
- **Redis** *(soon™)*

## 🚀 Jak uruchomić backend lokalnie

> ⚠️ Frontend znajduje się tutaj:: [consiliumfrontend](https://github.com/azuchora/consiliumfrontend)  
> 🐳 Docker wkrótce™

1. Sklonuj repozytorium:

```bash
git clone https://github.com/Rzanklod/consiliumbackend.git
cd consiliumbackend
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Utwórz plik .env w katalogu głównym:

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

4. Uruchom serwer:

```bash
npm run dev
```

API będzie dostępne pod adresem:

```bash
http://localhost:3300
```