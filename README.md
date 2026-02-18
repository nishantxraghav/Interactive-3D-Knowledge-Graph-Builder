# Interactive 3D Knowledge Graph Builder

An end-to-end platform that aggregates a learner’s activity from **GitHub**, **Notion**, and **certification sources** to generate an **interactive 3D knowledge graph** showing skills, projects, and learning progression over time.

## Objective
Create a secure and extensible system that:
- Ingests evidence of learning from GitHub, Notion, and certifications.
- Uses NLP to identify skills, technologies, and concepts.
- Builds relationships between artifacts and concepts.
- Stores the graph in a graph database.
- Renders an interactive 3D experience with search/filter features.
- Refreshes data periodically to keep progression up to date.

---

## Functional Requirements Coverage

| Requirement | Approach |
|---|---|
| Extract data from GitHub & Notion | OAuth-based connectors + scheduled ETL jobs |
| Identify skills and technologies | NLP pipeline with entity extraction + taxonomy mapping |
| Build relationships between projects and concepts | Relationship inference service (mentions, co-occurrence, dependency, chronology) |
| Auto-generate knowledge graph | Graph builder writes nodes/edges into Neo4j |
| Interactive 3D visualization | Frontend using React + Three.js/React Three Fiber |
| Search & filter capabilities | Full-text + faceted query layer over graph DB |
| Periodic updates | Event-driven webhooks + cron-based incremental sync |

---

## Technical Architecture

```text
┌───────────────────────────┐
│        Frontend UI        │
│ React + R3F + Search/UX   │
└──────────────┬────────────┘
               │ Graph API (REST/GraphQL)
┌──────────────▼────────────┐
│      Backend Services      │
│  Auth, Ingestion, NLP,     │
│ Graph Builder, Query API   │
└───────┬───────────┬────────┘
        │           │
        │           ├──────────────────────────────┐
        │                                          │
┌───────▼────────┐  ┌──────────────────┐  ┌────────▼────────┐
│ Source Connect │  │  NLP/ML Pipeline │  │  Scheduler/Jobs │
│ GitHub/Notion  │  │ Skill Extraction │  │ Periodic Updates│
└───────┬────────┘  └─────────┬────────┘  └────────┬────────┘
        │                     │                    │
        └─────────────┬───────┴──────────┬────────┘
                      │                  │
               ┌──────▼──────┐    ┌──────▼──────┐
               │   Neo4j DB  │    │ Object Store│
               │ Nodes/Edges │    │ Raw Artifacts│
               └─────────────┘    └─────────────┘
```

---

## Core Data Model

### Node Types
- `Student` (id, name, profile)
- `Project` (repo/page/cert artifact)
- `Skill` (normalized concept, e.g., "GraphQL")
- `Technology` (framework/tool/language)
- `Concept` (domain knowledge area)
- `Certification` (issuer, score/date)
- `Milestone` (time-based progression event)

### Edge Types
- `CONTRIBUTED_TO` (Student → Project)
- `USES` (Project → Technology)
- `DEMONSTRATES` (Project/Certification → Skill)
- `RELATED_TO` (Skill ↔ Concept)
- `PREREQUISITE_OF` (Concept → Concept)
- `EVIDENCED_BY` (Skill → Artifact)
- `PROGRESSED_TO` (Milestone → Milestone)

### Graph Weighting
Each edge can carry:
- `confidence_score` (NLP confidence + source reliability)
- `recency_score` (time-decay weighting)
- `frequency_score` (repetition across artifacts)

---

## Integration Plan

### 1) GitHub Connector
- OAuth App for user authorization.
- Pull repositories, commits, README/docs, languages, topics, dependency manifests.
- Optional webhook for near-real-time updates.

### 2) Notion Connector
- Notion OAuth integration.
- Ingest selected pages/databases.
- Extract headings, tags, linked databases, and rich text blocks.

### 3) Certifications Connector
- Initial mode: file/manual import (PDF/JSON/CSV).
- Extension mode: API integrations (e.g., Coursera, Credly) where available.

---

## NLP-Based Skill Extraction

### Pipeline Stages
1. **Preprocessing**: clean markdown/rich text/code metadata.
2. **Entity Extraction**: detect skills/tools/topics via transformer or spaCy model.
3. **Normalization**: map aliases (`js`, `javascript`) to canonical skill taxonomy.
4. **Context Scoring**: infer proficiency intent from verbs and contribution patterns.
5. **Relationship Inference**: connect co-mentioned or sequential concepts.

### Suggested Stack
- Python service with FastAPI.
- spaCy + sentence-transformers (or OpenAI embeddings) for semantic matching.
- Versioned taxonomy (YAML/DB table) for controlled vocabulary.

---

## Backend and Storage

### Graph Database
- **Neo4j** for flexible relationship traversal and fast path queries.
- Cypher queries for recommendations and progression analysis.

### Service Layer
- **API Gateway** (REST or GraphQL).
- **Ingestion Service** per source.
- **Graph Builder** to upsert nodes/edges idempotently.
- **Query Service** for graph views, search, and filters.

### Security
- OAuth 2.0 for GitHub and Notion.
- Encrypt tokens/secrets at rest (KMS-backed).
- Role-based access control for student vs admin views.
- Audit logging for ingestion and model output updates.

---

## Interactive 3D Visualization

### Frontend Capabilities
- 3D force-directed graph (nodes = concepts/projects/skills).
- Zoom, pan, drag, and node pinning.
- Highlight learning paths and clusters.
- Time slider to show progression over time.
- Search box + filter chips (source, date range, domain, confidence).

### Suggested Libraries
- React + TypeScript
- Three.js / React Three Fiber
- Zustand/Redux for state
- D3-force for graph layout physics

---

## Search & Filter Design

- **Search**: node name, aliases, project titles, certification issuer.
- **Filters**:
  - Source (`github`, `notion`, `certification`)
  - Date range
  - Skill category
  - Confidence threshold
  - Proficiency level
- **Result behavior**:
  - Focus camera on matched subgraph
  - Dim unrelated nodes
  - Show side panel with evidence snippets

---

## Periodic Update Strategy

- **Near real-time**: webhooks from GitHub where possible.
- **Scheduled sync**: daily/weekly jobs for Notion + certification refresh.
- **Incremental ingestion**: only changed artifacts processed.
- **Recompute strategy**:
  - Lightweight edge refresh on small updates.
  - Full rebuild option for taxonomy/model upgrades.

---

## MVP Delivery Roadmap

### Phase 1: Foundation (Week 1–2)
- Repo scaffolding, auth framework, source adapters.
- Neo4j schema and basic ingestion pipeline.

### Phase 2: NLP + Graph Build (Week 3–4)
- Skill extraction MVP + normalization.
- Relationship generation and confidence scoring.

### Phase 3: 3D Frontend (Week 5–6)
- Render graph, node detail panel, search/filter controls.
- Time-based progression visual controls.

### Phase 4: Reliability + Security (Week 7)
- Token encryption, retries, observability, audit logs.

### Phase 5: Launch + Feedback (Week 8)
- Pilot with sample student portfolios.
- Tune model and UX based on validation metrics.

---

## Suggested Monorepo Structure

```text
.
├── apps/
│   ├── web/                  # React 3D visualization app
│   └── api/                  # Backend API gateway
├── services/
│   ├── ingest-github/
│   ├── ingest-notion/
│   ├── ingest-certifications/
│   ├── nlp-skill-extractor/
│   └── graph-builder/
├── packages/
│   ├── shared-types/
│   ├── taxonomy/
│   └── ui-components/
├── infra/
│   ├── docker/
│   ├── terraform/
│   └── neo4j/
└── docs/
    ├── architecture.md
    ├── data-model.md
    └── api-spec.md
```

---

## Non-Functional Targets

- **Performance**: graph query p95 < 300ms for filtered subgraphs.
- **Scalability**: 10k+ nodes per user profile with progressive rendering.
- **Reliability**: ingestion jobs retry with dead-letter handling.
- **Privacy**: user-consent-driven source sync and revocation support.

---

## Definition of Done

- User can connect GitHub + Notion accounts securely.
- System extracts and normalizes skills from at least 3 source types.
- Knowledge graph auto-generates and persists in Neo4j.
- Interactive 3D view supports search, filter, and time-based exploration.
- Scheduled updates run successfully with observable logs and metrics.

