
# Tee Time Scraper and Website

## Overview
This project demonstrates web scraping, API development, and frontend state management using TypeScript, Node.js, SvelteKit, and Docker-based PostgreSQL.

## Pre-requisites
- Node.js( >= 18.0).
- Docker
- Yarn

## Technical Choices
- **SvelteKit**: For SSR and API routes.
- **PostgreSQL**: For persistent data storage.
- **Docker**: For containerized development and deployment.
- **Puppeteer**: For DOM-based web scraping.

## Running the Code
1. Clone the repository.
2. Run `yarn install` to install dependencies.
3. Install docker if not Already installed.
4. Run `docker-compose up -d` or run `db:start` if you use Linux with sudo to start PostgreSQL.
5. Run `yarn run scrape` to scrape tee times.
6. To connect to the PostgreSQL database directly, use the following command:
```bash
 yarn run db:connect
 ```
7. To access an interface for your PostgreSQL database. visit `http://localhost:8081`;
8. Run `yarn start` to make the app running.


## Future Improvements(if time permits)
- Add user authentication.
- Improve the UI and probably responsiveness.
- Improve error handling and logging.
- Add pagination for tee times.
- Explicit Type setting
- An access to scrape data directly from the UI
## Developing



Once you've created a project and installed dependencies with `yarn install`  start a development server:

```bash
yarn run dev
```


To get backend server running, run the following command:

```bash
yarn run server

```

To get both running, run the following command:

```bash
yarn start

```

## Building

