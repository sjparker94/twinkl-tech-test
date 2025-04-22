# Contents

<!-- toc -->

- [Twinkl TypeScript Test](#twinkl-typescript-test)
    - [Getting started / Setup](#getting-started--setup)
        - [Prerequisites](#prerequisites)
        - [Environment variables](#environment-variables)
        - [Installation](#installation)
        - [Database setup](#database-setup)
        - [Usage](#usage)
    - [Project structure](#project-structure)
    - [Endpoints](#endpoints)
    - [Task](#task)
    - [What we are looking for](#what-we-are-looking-for)

<!-- tocstop -->

# Twinkl TypeScript Test

## Getting started / Setup

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/): Ensure that Node.js, is installed on your system. This project is using **Node.js v22**.
- [npm](https://www.npmjs.com/): npm is the package manager for Node.js and comes with the Node.js installation.

### Environment variables

Create a `.env` file in the root directory.

```
cp .env.example .env

```

The schema possible values for the environment variables can be found in [env.ts](./src/env.ts)

The environment variables are validated when running the application and an error will be thrown if incorrectly setup.

### Installation

Install the dependencies:

```
npm i
```

### Database setup

This project uses `SQLite` as a local database with `drizzle` as the ORM.

To setup the database run:

```
npx drizzle-kit push
```

Provided the `DATABASE_URL` environment variable is setup correctly this will create the db file and push the schema.

To view the data in gui browser tool run (port can be specified on the end):

```
npx drizzle-kit studio --port=3001
```

### Usage

In development the following command will start the server and use `tsx` to auto-reload the server based on file changes.

```
npm run dev
```

The server will start at `http://localhost:3000` by default. You can change the port via `PORT` environment variable.

To run tests run:

```
npm run test
```

To build and run without watch mode run:

```
npm run build
npm start
```

Additional scripts:

Lint to show warning/errors:

```
npm run lint

```

Lint with auto fix:

```
npm run lint:fix

```

Format to show warning/errors:

```
npm run format:check

```

Format with auto fix:

```
npm run format:fix

```

## Project structure

Libraries packages used:

- [Hono](https://hono.dev/) - web framework for building the API endpoints

    - [Zod OpenAPI Example](https://hono.dev/examples/zod-openapi)
    - [Testing](https://hono.dev/docs/guides/testing)
    - [Testing Helper](https://hono.dev/docs/helpers/testing)

- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) - documenting the endpoints in the code.
- [Scalar Documentation](https://github.com/scalar/scalar/tree/main/?tab=readme-ov-file#documentation) - interactive ui for API reference.

- SQLite/[drizzle](https://orm.drizzle.team/docs/overview) - local file database and ORM. Easily define the database structure and interact with the database in a type safe way.
- [zod](https://zod.dev/) - validation library used widely in the application.
- [pino](https://github.com/pinojs/pino?tab=readme-ov-file#documentation) - small logging library.
-

Base hono app exported from [app.ts](./src/app.ts). Local development uses [@hono/node-server](https://hono.dev/docs/getting-started/nodejs) defined in [index.ts](./src/index.ts) - update this file or create a new entry point to use your preferred runtime.

See [src/routes/users](./src/routes/users/) for an example Open API group.

- Router created in [users.index.ts](./src/routes/users/users.index.ts)
- Route definitions defined in [users.routes.ts](./src/routes/users/users.routes.ts)
- Hono request handlers defined in [users.handlers.ts](./src/routes/users/users.handlers.ts)
- Unit tests defined in [users.test.ts](./src/routes/users/users.test.ts)

## Endpoints

| Path               | Description              |
| ------------------ | ------------------------ |
| GET /api/doc       | Open API Specification   |
| GET /api/reference | Scalar API Documentation |
| GET /api           | Index endpoint           |
| POST /users        | Create a user            |
| GET /users/{id}    | Get one user by id       |

## Task

Your task is to implement a backend API (no front-end is required).

These are the requirements for the system:

1. User Signup Endpoint
    1. A `POST` endpoint, that accepts JSON, containing the user full name, password, email address, created date, and the user type (one of a student, teacher, parent or private tutor).
    1. Validation. The app should check that the fields submitted are not empty. The app should also check that the password matches the following rules:
        1. Between 8 and 64 characters
        1. Must contain at least one digit (0-9)
        1. Must contain at least one lowercase letter (a-z)
        1. Must contain at least one uppercase letter (A-Z)
    1. When validation fails the app should return an appropriate status code with error/s that can be used by the client
1. Save the signup information to a data store. We recommend an in-memory data store (i.e an array) or a lightweight file database like SQLLite.
1. User Signup Details
    1. A `GET` endpoint that takes a user ID and returns the user details as JSON.
1. Create whatever level of testing and documentation you consider appropriate

## What we are looking for

- Submit something that we can run locally
- Commiting changes with good messages as you go is very helpful
- You can update the README or add a NOTES.md detailing any decisions/tradeoffs you made, or changes you would make with more time
- Clean, secure, modular code written to your own standards of what good looks like. Add concise comments in the code if you want to explain a decision.
- Pragmatism. We are not looking for complex solutions, and there is no hidden trick requirement in our task ;)
- Feel free to install and use additional packages
