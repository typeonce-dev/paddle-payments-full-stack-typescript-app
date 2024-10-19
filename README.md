# Paddle Billing Payments Full Stack TypeScript App
This repository contains all the code for the course [Paddle Billing Payments Full Stack TypeScript App](https://www.typeonce.dev/course/paddle-payments-full-stack-typescript-app).

> Full stack TypeScript project template that implements Paddle Billing Payments. The project uses React Router v7 on the client and Effect with Node on the server.

***

## Project overview
Payments is one of those features that you will find in most apps. [Paddle](https://www.paddle.com/) acts as a merchant of record, handling your payments, tax and compliance.

This project template implements **payments with Paddle on both client and server**:
- Client Paddle checkout using [@paddle/paddle-js](https://www.npmjs.com/package/@paddle/paddle-js)
- Server Paddle webhook using [@paddle/paddle-node-sdk](https://www.npmjs.com/package/@paddle/paddle-node-sdk)

The template provides a full stack implementation of a working payments system. It includes:
- Initialize and sync events with [Paddle inline checkout](https://developer.paddle.com/concepts/sell/branded-integrated-inline-checkout) using [XState](https://xstate.js.org/) to manage the checkout process
- Server webhook signature validation and event processing using [Effect](https://effect.website/) with [NodeJs](https://nodejs.org/en)

## Project structure
The repository of the project is a monorepo initialized using [Turborepo](https://turbo.build/repo/docs). The same project contains both client and server inside the `apps` folder.

### Client
The client is built using React with the latest version of [React Router v7](https://reactrouter.com/dev/guides) as framework.

The client also uses Effect to organize and execute services (`Paddle`).

The client state is managed using XState. Using a state machine the client keeps track of the current step during the checkout process, keeping the state in sync with Paddle.

Styles are implemented using the latest version of Tailwind CSS v4. Components are based on [React Aria](https://react-spectrum.adobe.com/react-aria/).

This is the final `package.json` file of the client:

```json title="package.json" {15}
{
  "name": "@app/client",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",
    "typecheck": "react-router typegen && tsc"
  },
  "dependencies": {
    "@effect/schema": "^0.74.1",
    "@paddle/paddle-js": "^1.2.3",
    "@react-router/node": "7.0.0-pre.0",
    "@react-router/serve": "7.0.0-pre.0",
    "@tailwindcss/vite": "^4.0.0-alpha.25",
    "@xstate/react": "^4.1.3",
    "clsx": "^2.1.1",
    "effect": "^3.8.4",
    "isbot": "^5.1.17",
    "react": "^18.3.1",
    "react-aria-components": "^1.4.0",
    "react-dom": "^18.3.1",
    "react-router": "7.0.0-pre.0",
    "tailwind-merge": "^2.5.3",
    "xstate": "^5.18.2"
  },
  "devDependencies": {
    "@react-router/dev": "7.0.0-pre.0",
    "@types/react": "^18.3.9",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^4.0.0-alpha.25",
    "vite": "^5.4.8",
    "vite-tsconfig-paths": "^5.0.1"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### Server
The server API is built from scratch using [Effect](https://effect.website/). The project is a normal NodeJs app that uses `node:http` as server.

The API is based on `@effect/platform`, specifically using the following modules:
- `HttpApi`
- `HttpApiBuilder`
- `HttpApiEndpoint`
- `HttpApiGroup`
- `HttpMiddleware`
- `HttpServer`

Other dependencies include `dotenv` (to load environment variables) and `tsx` (to execute the server code).

This is the final `package.json` file of the server:

```json title="package.json" {14}
{
  "name": "@app/server",
  "version": "0.0.0",
  "author": "Typeonce",
  "license": "MIT",
  "scripts": {
    "dev": "tsx src/main.ts",
    "typecheck": "tsc"
  },
  "dependencies": {
    "@effect/platform": "^0.66.2",
    "@effect/platform-node": "^0.61.3",
    "@effect/schema": "^0.74.1",
    "@paddle/paddle-node-sdk": "^1.7.0",
    "dotenv": "^16.4.5",
    "effect": "^3.8.4"
  },
  "devDependencies": {
    "@types/node": "^22.7.4",
    "tsx": "^4.19.1"
  }
}
```

***

## Course content
Instead of explaining step by step how to implement the project, **this course focuses on the overall project structure and code architecture**.

For both client and server, the course explains the pro and cons of each technology and the role and benefits of each dependency.

It then goes more into the details of client and server, showing how the code is organized and discussing some implementation details for the most important files.

The course aims to provide an overview of how to approach the implementation of a full stack project in the specific example of payments with Paddle.