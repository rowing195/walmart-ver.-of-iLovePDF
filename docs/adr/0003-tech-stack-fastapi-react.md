# 3. Tech Stack Selection: FastAPI and React

Date: 2026-08-01

## Status

Accepted

## Context

The application requires interactive visual PDF canvas manipulation (page selecting, dragging/sorting, rotating, inserting images, extracting to PDF/ZIP). We needed to choose the backend and frontend framework stack.

## Decision

We adopt a decoupled architecture:
- **Backend**: Python 3.10+ with **FastAPI** and **PyMuPDF (`fitz`)**.
- **Frontend**: **Vite + React (TypeScript)** with modern drag-and-drop libraries (`dnd-kit` / `@hello-pangea/dnd`) and a curated UI design system.

## Consequences

### Positive
- Component-based reactive state management for complex Page Node states (selection, rotation, source doc).
- Smooth drag-and-drop UX for visual page reordering.
- FastAPI provides automatic OpenAPI docs, asynchronous I/O, and seamless PyMuPDF integration.

### Negative
- Requires a standard frontend build pipeline (`npm run dev` / `npm run build`).
