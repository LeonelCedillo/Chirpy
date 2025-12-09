# Chirpy

Chirpy is a social network similar to twitter.
It is a web server built in typescript and handles authentication and user data. 
Chirpy adds new users to a database and users can modify their info, 
post chirps, retrieve chirps, and delete chirps.

## Goal

The goal of this project is to show what a web server is and how it powers real world applications,
demonstrating that TypeScript is a great language for building fast web servers without using a framework.
It uses production-ready tools such as PostgreSQL for its database, argon2 for password hashing, 
and JSON Web Tokens in the authentication logic.

## Installation

1. Install *NVM* and run:<br>
    `nvm use`<br>
    > The project’s `.nvmrc` file specifies Node v21.7.0

2. Install Node dependencies:<br>
    `npm install`<br>

3. Install PostgreSQL<br>
    **macOS** with [brew](https://brew.sh/):<br>
    `brew install postgresql@16`<br>
    **Linux/WSL (Debian)**. ([Docs from Microsoft](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-postgresql)):<br>
    `sudo apt update`<br>
    `sudo apt install postgresql postgresql-contrib`<br>

4. Create the database (example: *chirpy*).

5. Create a .env file with the following variables: <br>
PORT="This server's port"<br>
DB_URL="Database connection string"<br>
PLATFORM="dev" - resets are only allowed in this environment - change it in api/reset.ts<br>
JWT_SECRET="secret for JSON Web Token"<br>
POLKA_KEY="Key from the Polka webhook"<br>

6. To start the server run:
`npm run dev`
This also applies the migrations.

<br>
<br>

# API for Chirpy<br>

## Users endpoints:

### POST /api/users

Creates a new user.
Request body:
```json
    {
        "email": "emailName@example.com",
        "password": "mypassword"
    }
```

Response body:
```json
    {
        "id": "user id", 
        "email": "emailName@example.com",
        "createdAt": "date",
        "updatedAt": "date",
        "isChirpyRed": false
    }
```

<br>

### PUT /api/users

Updates user's email and/or password.

Authentication (Authorization header): 
```Authorization: Bearer <access_token>```

Request body:
```json
    {
        "email": "newEmailName@example.com",
        "password": "mynewpassword"
    }
```

Response body:
```json
    {
        "id": "user id", 
        "email": "emailName@example.com",
        "createdAt": "date",
        "updatedAt": "date",
        "isChirpyRed": false
    }
```
<br>

## Chirps endpoints:<br>

### POST /api/chirps

Posts a chirp.

Authentication (Authorization header): 
```Authorization: Bearer <access_token>```

Request body:
```json
    {
        "body": "This is a chirp about anything."
    }
```

Response body:
```json
    {
        "id": "chirp_id", 
        "createdAt": "date",
        "updatedAt": "date",
        "body": "chirp content",
        "userId": "user_id"
    }
```
<br>

### GET /api/chirps

Returns all chirps.

Query parameters (optional):
```authorId=<userId>```
```sort=asc|desc```

Response body:
```json
[
    {
        "id": "chirp_id", 
        "createdAt": "date",
        "updatedAt": "date",
        "body": "chirp content",
        "userId": "user_id"
    }
]
```
<br>

### GET /api/chirps/:chirpId

Returns a single chirp by its ID.

Path parameter:
`:chirpId`

Example request:
GET /api/chirps/abc123

Response body:
```json
    {
        "id": "chirp_id", 
        "createdAt": "date",
        "updatedAt": "date",
        "body": "chirp content",
        "userId": "user_id"
    }
```
<br>

### DELETE /api/chirps/:chirpId

Deletes a single chirp by its ID.

Authentication (Authorization header): 
```Authorization: Bearer <access_token>```

Path parameter:
`:chirpId`

Example request:
DELETE /api/chirps/abc123

Response:
204 No Content

<br>

## Authentication endpoints:<br>

### POST /api/login

Logs in a user.

Request body:
```json
    {
        "email": "emailName@example.com",
        "password": "mypassword"
    }
```

Response body:
```json
    {
        "id": "user id", 
        "email": "emailName@example.com",
        "createdAt": "date",
        "updatedAt": "date",
        "isChirpyRed": false,
        "token": "accessToken",
        "refreshToken": "refreshToken"
    }
```

<br>

### POST /api/refresh

Returns a new access token.

Authentication (Authorization header): 
```Authorization: Bearer <refresh_token>```

Response body:
```json
    {
        "token": "accessToken"
    }
```

<br>

### POST /api/revoke

Revokes the refresh token (logout)

Authentication (Authorization header): 
```Authorization: Bearer <refresh_token>```

Response:
204 No Content

