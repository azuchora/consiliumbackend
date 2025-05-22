# ⚙️ CONSILIUM – REST API Forum Medycznego (Backend)

[![🇵🇱](https://flagcdn.com/w20/gb.png) Read in English](README.md)

## 📌 Description

To repozytorium zawiera backendowe REST API dla aplikacji **CONSILIUM** – bezpiecznej platformy dyskusyjnej dla lekarzy. API zostało stworzone w technologii **Express.js**, z wykorzystaniem mapowania relacyjno-obiektowego **PRISMA** oraz bazy danych **PostgreSQL**.

Projekt powstał jako część mojej pracy dyplomowej na kierunku Informatyka.

## 🧠 Kluczowe funkcjonalności

- REST API oparte na **Express.js**
- Uwierzytelnianie z użyciem **JWT** oraz kontrola dostępu na podstawie ról
- Operacje CRUD dla:
  - Użytkowników (lekarzy)
  - Wątków
  - Komentarzy i odpowiedzi
  - Prywatnych wiadomości
- Cache **Redis** (soon™)

## 🛠️ Technologie

- **Node.js** + **Express.js** + **PRISMA ORM**
- **PostgreSQL**
- **JWT** do uwierzytelniania
- **Redis** *(soon™)*

## 🚀 Jak uruchomić backend lokalnie

> ⚠️ Frontend znajduje się tutaj:: [consiliumfrontend](https://github.com/azuchora/consiliumfrontend)  
> 🐳 Docker wkrótce™

1. Sklonuj repozytorium:

```bash
git clone https://github.com/azuchora/consiliumbackend.git
cd consiliumbackend
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Utwórz plik .env w katalogu głównym:

```bash
DATABASE_URL=your_db_url
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
API_ROUTE=/api/v1
```
5. Wygeneruj klient prismy

```bash
npx prisma generate
```

4. Uruchom serwer:

```bash
npm run dev
```

API będzie dostępne pod adresem:

```bash
http://localhost:3300
```