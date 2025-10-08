# Contributing

### Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Getting Started](#getting-started)
    - [Using GitHub](#using-github)
    - [Setting up local development environment](#setting-up-local-development-environment)
  - [Useful Tips](#useful-tips)
  - [Pull Request Naming \& Commit Message Guidelines](#pull-request-naming--commit-message-guidelines)
  - [Questions](#questions)

## Overview

This project utilizes a pnpm workspace and consists of three packages:

- **api**:
  - The backend server
  - Built with NodeJS and NestJS
  - Uses PostgreSQL and Redis
- **web**:
  - The frontend application
  - Built with React and TypeScript
  - Styled using Emotion
- **shared**:
  - A common module containing reusable code for both api and web

## Getting Started

You can either make changes directly on GitHub or set up the project locally.

### Using GitHub

1. **Fork the Repository**

   - Click the "Fork" button at the top right of the repository page on GitHub.
   - This will create a copy of the repository under your GitHub account.

2. **Make Changes**

   - Navigate to the file you want to edit in your forked repository.
   - Click the pencil icon to start editing the file.
   - Make your changes.
   - At the bottom of the editing screen, write a brief title and description of the changes you made.
   - Click the `Commit changes` button.
   - Repeat this process for any other files you want to change.

3. **Create a Pull Request**
   - Go to your forked repository on GitHub.
   - Click `Fetch upstream` to update your fork with the latest changes from the original repository.
   - Click the `Contribute` button and select `Open pull request`.
   - Fill in the details about your changes and click `Create pull request`.

### Setting up local development environment

1. **Install basic requirements:**

   Ensure that you have the following installed on your system:

   - Node.js
   - pnpm

2. **Fork and Clone the Repository**

   - Fork the repository on GitHub
   - Clone the forked repository to your local machine

3. **Set up database services:**

   You can either install PostgreSQL and Redis locally or use the provided Docker Compose setup for easier development.

   **Option A: Using Docker (Recommended)**

   A Docker Compose definition is available at `/api/docker-compose.yml` that includes PostgreSQL, Redis, Minio (local S3 storage), and Mailpit (local SMTP server).

   ```bash
   docker compose -f api/docker-compose.yml up -d
   ```

   To stop the services:

   ```bash
   docker compose -f api/docker-compose.yml down
   ```

   **Option B: Local installation**

   Install and configure PostgreSQL and Redis on your system.

4. **Set up environment variables:**

   - Copy `/api/.env.example` to `/api/.env`.
   - Fill in the environment variables with your configuration.
   - If you're using the Docker Compose setup, the default values are already configured.

5. **Install dependencies:**

   ```bash
   pnpm install
   ```

6. **Build shared packages:**

   ```bash
   pnpm build
   ```

7. **Start the API server in development mode:**

   ```bash
   pnpm api dev
   ```

8. **Start the web application in development mode:**

   ```bash
   pnpm web dev
   ```

## Useful Tips

- To install a package for a specific app, use the following command:

  ```bash
  pnpm [app-name] i [package-name]
  ```

  Example:

  ```bash
  pnpm api i dayjs
  ```

- To generate a database migration after updating entities, run:

  ```bash
  pnpm api typeorm migration:generate ./db/migration/[migration-name]
  ```

  Note: If you encounter errors while generating a migration, use Node.js v18.

- To generate using nest cli tools, run:

  ```bash
  pnpm nest g res new-resource
  ```

## Pull Request Naming & Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Please use the following types for pull request titles and commit messages:

- `feat`: A new feature.
- `fix`: A bug fix.
- `impr`: Improvements
- `docs`: Documentation changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance
- `test`: Adding or updating tests.
- `chore`: Maintenance tasks

## Questions

Feel free to ask any questions on [Discord](https://discord.com/invite/a5xUW97UB5) or GitHub discussions and we will be happy to assist you.
