# 1. Server-side Thumbnail Rendering with PyMuPDF

Date: 2026-08-01

## Status

Accepted

## Context

The visual canvas interface requires fast page thumbnail previewing for page reordering, rotation, selection, and image insertion. We evaluated client-side rendering (PDF.js) versus server-side rendering (PyMuPDF `fitz`).

## Decision

We choose **Server-side Thumbnail Rendering** using Python FastAPI and PyMuPDF (`fitz`).

- PyMuPDF generates low-resolution WebP/PNG thumbnails for each page.
- Images uploaded by users follow the same thumbnail pipeline for visual consistency.
- Thumbnails are cached on disk / memory to avoid redundant rendering.

## Consequences

### Positive
- Offloads rendering heavy lifting from client devices; smooth user experience even on low-spec client browsers.
- Uniform handling of both PDF pages and image uploads.
- Extremely high throughput due to PyMuPDF's underlying MuPDF C engine.

### Negative
- Increases backend server CPU and network transfer for thumbnail API endpoints.
