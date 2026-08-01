# CONTEXT.md - Domain Glossary

## Core Entities

### Document (文件)
A raw file uploaded by the user to the workspace. Can be a **PDF Document** or an **Image Document** (JPEG, PNG, WebP).

### Page Node (頁面單元)
The atomic unit of operation within the visual editor. Represents a single page sourced either directly from a PDF Document or created from an Image Document.
- **Properties**: Source Document ID, Original Page Index, Current Rotation Angle (0°, 90°, 180°, 270°).

### Visual Canvas / Workspace (視覺化工作區)
The interactive canvas where users can visually select, reorder, rotate, insert (including image-to-page conversion), and delete individual Page Nodes across multiple uploaded Documents.

### Export Job (匯出任務)
An asynchronous or synchronous execution request that reads the Visual Canvas state and produces final target output artifacts.
- **Target Artifact**: A single merged PDF Document or a zip archive of extracted image pages.
