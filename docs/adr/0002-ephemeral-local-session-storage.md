# 2. Ephemeral Local Session Storage without Database

Date: 2026-08-01

## Status

Accepted

## Context

The system processes user-uploaded PDF and image files, generates page thumbnails, and compiles export artifacts. We needed to decide whether to introduce a database (SQLite/PostgreSQL) and user authentication system or use an ephemeral session file system.

## Decision

We will use an **Ephemeral Local Session File Storage System** (`/tmp/workspaces/{session_id}/` or `data/sessions/{session_id}/`).

- No user accounts or persistent database will be implemented in MVP.
- All uploaded files, generated thumbnails, and export results are scoped to a unique UUID `session_id`.
- A background garbage collection worker (FastAPI background task / periodic timer) automatically deletes session workspaces older than a configurable TTL (e.g. 1 hour).

## Consequences

### Positive
- Zero database dependency, ultra-lightweight and easy to self-host locally.
- Strict user privacy: files auto-delete and leave no traces.
- Extremely simple file system layout and fast I/O.

### Negative
- No persistent user history or cloud saved projects.
