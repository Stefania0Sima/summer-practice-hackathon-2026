# Project Specifications
 
## Overview
This is a full-stack starter application designed for local development on Windows, scalable into a production-ready application.
 
## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router.
- **Backend**: Python, FastAPI, SQLAlchemy (ORM), Pydantic (Validation).
- **Database**: PostgreSQL (Containerized via Docker).
- **Tooling**: `npm` (Frontend), `uv` (Backend package manager), `docker compose`.
 
## Architecture Rules
1. **Strict Separation of Concerns**: Frontend and Backend are treated as separate applications.
2. **Backend Structure**:
   - `src/api/`: API routers and endpoints.
   - `src/core/`: Configuration, settings, and security.
   - `src/db/`: Database session management and SQLAlchemy models.
   - `src/utils/`: Shared helper functions.
3. **Frontend Structure**:
   - `src/components/`: Reusable, atomic UI components.
   - `src/layouts/`: Structural components (e.g., Sidebar, Navbar wrappers).
   - `src/pages/`: Top-level route components.
   - `src/config/`: Frontend configuration (API endpoints, feature flags).
   - `src/scripts/`: Custom hooks and utility functions.
 
## Local Development Commands
- **Start Database**: `docker compose up -d` (from root)
- **Start Backend**: `cd backend` -> `uv run uvicorn src.main:app --reload`
- **Start Frontend**: `cd frontend` -> `npm run dev`
 
## Notes for AI / Developers
- Backend dependencies are strictly managed via `pyproject.toml` using `uv`. Do not use `pip install`. Use `uv add <package>`.
- Frontend styling is strictly Tailwind CSS. Do not create separate `.css` files for components unless strictly necessary.
- The `.venv` is auto-activated in VSCode via `.vscode/settings.json`.

