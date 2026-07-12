# Repository Guidelines

## Project Structure & Module Organization

This repository contains two independent npm packages; run commands from the package that owns the relevant `package.json`.

- `frontend/`: Vue 3/Vite SPA. Application code is under `frontend/src/`, with API clients in `src/api/`, reusable UI in `src/components/`, route-level pages in `src/views/`, and routing in `src/router/`. Static files belong in `public/`; imported assets belong in `src/assets/`.
- `backend/`: Express 5/Mongoose API. `server.js` is the entry point; endpoints live in `routes/`, schemas in `models/`, middleware in `middleware/`, configuration in `config/`, and maintenance utilities in `scripts/` and `seed/`.

## Build, Test, and Development Commands

```bash
cd backend && npm install
npm run dev       # start the API with nodemon
npm start         # start the API with Node

cd frontend && npm install
npm run dev       # run the Vite development server
npm run build     # create the production bundle in dist/
npm run preview   # serve the built bundle locally
```

Copy `backend/.env.example` to `.env` and `frontend/.env.example` to `.env.local` before local development. The API defaults to port 4000.

## Coding Style & Naming Conventions

Match the existing JavaScript style: two-space indentation, single quotes, no semicolons, trailing commas in multiline objects, and `const` by default. Frontend code uses ES modules and Vue `<script setup>`; backend code uses CommonJS. Name Vue components and models in PascalCase (`AlbumCard.vue`, `Album.js`), utility/API modules in camelCase, and route files by resource (`albums.js`). Keep HTTP access in `frontend/src/api/`, not directly in views.

No formatter or linter is configured, so preserve nearby formatting and avoid unrelated rewrites.

## Testing Guidelines

There is currently no automated test suite or coverage threshold. For frontend changes, run `npm run build`. For backend changes, start the service with a configured MongoDB connection and manually exercise affected `/api/*` endpoints, including authentication and error cases. If adding tests, place them beside the target module or in a package-level `tests/` directory and add the runner command to that package's `package.json`.

## Commit & Pull Request Guidelines

Recent history uses short, imperative subjects in English or Chinese, such as `Fix carousel arrow centering` or `优化前端效果`. Keep commits focused and explain user-visible behavior. Pull requests should include a concise summary, affected frontend/backend areas, configuration or migration notes, verification steps, and screenshots for UI changes. Link related issues when available.

## Security & Configuration

Never commit `.env`, `.env.local`, MongoDB credentials, JWT secrets, Cloudinary keys, or admin password hashes. Use official third-party music embeds or media you are authorized to distribute.
