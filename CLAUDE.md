# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repository contains two independent npm packages; there is no root `package.json` or root-level build command.

- `frontend/` — Vue 3 single-page application using Vite, Vue Router, and Axios (ES modules)
- `backend/` — Express 5 REST API using Mongoose and MongoDB Atlas (CommonJS)

Run npm commands from the package directory that owns the corresponding `package.json`. Each package has its own `package-lock.json`; update only the lockfile for the package whose dependencies change.

## Development commands

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev                  # nodemon server.js
npm start                    # node server.js
```

The API defaults to port 4000 and begins listening only after MongoDB connects successfully.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                  # Vite development server
npm run build                # production build
npm run preview              # preview the production build
```

`VITE_API_BASE_URL` selects the backend API; the code falls back to `http://localhost:4000/api`.

### Data and maintenance scripts

Run these from `backend/`; they are standalone scripts, not npm scripts:

```bash
node scripts/hashPassword.js <password>   # generate ADMIN_PASSWORD_HASH
node seed/bands.js                        # upsert seed bands and albums
node scripts/addNewAlbums.js              # upsert additional albums
node scripts/updateEmbedLinks.js          # update known NetEase track embeds
node scripts/setPlayerHeight.js <digits>  # rewrite NetEase embed height params
```

The seed/update scripts use upserts and require the backend environment configuration.

### Tests and linting

There is currently no test runner, test suite, lint command, formatter command, or CI configuration. Consequently, there is no supported single-test command. For frontend changes, at minimum run `npm run build` from `frontend/`; backend verification currently requires starting the service against a configured database and exercising the affected endpoint.

## Coding conventions

Match the existing JavaScript style: two-space indentation, single quotes, no semicolons, trailing commas in multiline objects, and `const` by default. Frontend code uses ES modules and Vue `<script setup>`; backend code uses CommonJS. Keep HTTP access in `frontend/src/api/`, not directly in views. No formatter or linter is configured, so preserve nearby formatting and avoid unrelated rewrites.

## Architecture

### Frontend request and navigation flow

`frontend/src/main.js` mounts `App.vue` and installs the router. `App.vue` owns the global header/navigation shell and renders pages through `<router-view>`.

`frontend/src/router/index.js` defines public routes for home, bands, band details, and albums, plus nested admin CRUD routes. The `/admin` route tree uses `meta.requiresAuth`; a global guard checks `localStorage.admin_token`. `frontend/vercel.json` rewrites routes to `index.html` so history-mode URLs work on Vercel.

Views do not construct HTTP requests directly. Domain modules under `frontend/src/api/` use the shared Axios instance in `api/client.js`. That client:

- reads `VITE_API_BASE_URL`, with a localhost fallback;
- attaches the local admin token as a Bearer token;
- clears invalid tokens after a 401 and redirects to login only from admin paths.

The principal public flow is: `Home.vue` fetches featured bands for `Carousel.vue`; selecting one opens `BandDetail.vue`, which fetches the band and its albums concurrently. `AlbumList.vue` relies on the backend populating each album's `band` reference. `AlbumCard.vue` selects tracks and delegates playback through `playTrack` from `composables/useMusicPlayer.js`, which owns shared module-level player state. `FloatingMusicPlayer.vue` renders either a native `<audio>` player for an `audioUrl` or an official third-party iframe for an `embedUrl`.

Admin add/edit pages reuse the same form component based on whether the route contains an ID. `ImageUploader.vue` and `AudioUploader.vue` upload `FormData` and write the returned Cloudinary URL into the parent form.

### Backend lifecycle and API

`backend/server.js` is the entry point. It loads environment variables, configures DNS for MongoDB Atlas SRV resolution, applies CORS and JSON middleware, mounts the API routers, and connects to MongoDB before listening. The mounted API prefixes are:

- `/api/bands`
- `/api/albums`
- `/api/auth`
- `/api/upload`
- `/api/health`

`models/Band.js` stores band metadata, members, images, genres, and featured status. `models/Album.js` references a band and embeds track records containing third-party embed metadata and/or a Cloudinary audio URL. Band and album GET routes are public; create, update, and delete routes are protected by `middleware/auth.js`. Album queries support filtering by band, and list responses populate the band's ID and name.

Authentication is deliberately a single-admin, environment-backed design: `routes/auth.js` compares `ADMIN_USERNAME` and a bcrypt `ADMIN_PASSWORD_HASH`, then signs a seven-day JWT using `JWT_SECRET`. There is no admin database model. The frontend persists the token as `admin_token` in local storage.

Uploads use in-memory Multer buffers and then stream to Cloudinary; files are not persisted on the backend filesystem. Image uploads are limited to 5 MB and audio uploads to 20 MB, with MIME-type validation.

## Configuration and deployment

Backend configuration is documented in `backend/.env.example`, including MongoDB, admin credentials, JWT, Cloudinary, port, and CORS settings. Frontend configuration is documented in `frontend/.env.example`. Deployment targets documented by the project are Vercel for the frontend, Render for the backend, and MongoDB Atlas for data.

If `CORS_ORIGIN` is absent, the backend permits all origins for local convenience. Production should provide the allowed frontend origin(s), comma-separated.

## Media-specific constraints

Commercial music should use official third-party player embeds. Cloudinary audio upload is intended only for audio the site owner owns or is authorized to distribute. Seed cover images are placeholders and should only be replaced with legally usable images.

NetEase embeds are standardized on URL parameter `height=66`; the official player does not gain a volume control from a larger URL height. Note that `FloatingMusicPlayer.vue` separately sets the rendered iframe CSS height (currently larger than 66 px), so URL-height and layout-height changes are distinct concerns.

Deleting a band does not cascade to its albums; associated albums must be handled separately.
