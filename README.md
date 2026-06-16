<p align="center">
  <img src="./frontend/public/logo.svg" alt="Patmoleo Logo" width="420" />
</p>

<h3 align="center">Full-stack Named Entity Recognition powered by fine-tuned DeBERTa-v3 + LoRA</h3>

<p align="center">
  Extract people, places, organizations, time expressions, and more from any text —<br/>
  surfaced through a polished React UI and a high-performance FastAPI inference backend.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_%26_Vite-4F46E5?style=flat&logo=react&logoColor=white" alt="React & Vite" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Model-DeBERTa_V3-FF9D00?style=flat&logo=huggingface&logoColor=white" alt="DeBERTa V3" />
  <img src="https://img.shields.io/badge/Fine--Tuning-LoRA_%2F_PEFT-8B5CF6?style=flat" alt="LoRA / PEFT" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=flat" alt="MIT License" />
</p>

<p align="center">
  <b>🌐 Live Demo:</b> <a href="https://patmoleo.vercel.app">patmoleo.vercel.app</a>
  &nbsp;·&nbsp;
  <b>⚙️ API Docs:</b> <a href="https://alexcj10-patmoleo.hf.space/docs">alexcj10-patmoleo.hf.space/docs</a>
</p>

---
<img width="1918" height="861" alt="Screenshot 2026-06-16 133656" src="https://github.com/user-attachments/assets/6a266851-9704-456b-bbc4-1f61a99380ce" />

---

## Table of Contents

- [Features](#features)
- [Supported Entity Types](#supported-entity-types)
- [Model Versions](#model-versions)
- [Model Performance](#model-performance-e2)
- [LoRA Configuration](#lora-configuration)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Background & Roadmap](#background--roadmap)
- [License](#license)

---

## Features

- **Named Entity Recognition** — identifies 8 entity types (person, location, organization, time, geopolitical, artifact, event, natural phenomenon) using BIO tagging across 17 labels
- **Fine-tuned Transformer** — DeBERTa-v3-small adapted with LoRA for efficient, accurate token classification (F1: 0.96 weighted)
- **Glassmorphism UI** — smooth animations, dynamic color-coded entity highlighting, and a fully responsive layout
- **Mobile-First** — bottom-sheet history panel and search optimized for small screens
- **Fast Inference API** — async FastAPI backend with a single `/predict` endpoint returning structured JSON
- **Production-Ready** — frontend on Vercel, backend on Hugging Face Spaces (Docker)

---

## Supported Entity Types

| Tag | Entity Type | Example |
|-----|-------------|---------|
| `per` | Person | *Alex*, *Barack Obama* |
| `geo` | Geographical Location | *London*, *Mt. Everest* |
| `org` | Organization | *Google*, *United Nations* |
| `tim` | Time Expression | *Tuesday*, *2026*, *morning* |
| `gpe` | Geopolitical Entity | *Indian*, *USA* |
| `art` | Artifact | *Harry Potter*, *Golden Gate Bridge* |
| `eve` | Event | *World War II*, *the Olympics* |
| `nat` | Natural Phenomenon | *Hurricane Katrina*, *Flu* |
| `O` | Outside (non-entity) | Any regular word |

Each entity uses **BIO tagging**: `B-` marks the beginning of an entity span, `I-` marks continuation — giving **17 total labels**.

**Inference Example:**

```
Input:  "Alex went to London last Tuesday to visit Google."

Alex     →  B-per  (Person)
London   →  B-geo  (Geographical Location)
Tuesday  →  B-tim  (Time)
Google   →  B-org  (Organization)
```

---

## Model Versions

| Version | Base Model | Dataset | Labels | Best F1 | Status |
|---------|------------|---------|--------|---------|--------|
| **Patmoleo E1** | `deberta-v3-base` | Synthetic Job Descriptions (CrewAI) | 8 custom | 0.998 | Deprecated |
| **Patmoleo E2** | `deberta-v3-small` | GMB NER (Kaggle, ~48K sentences) | 17 (8 types) | 0.608 macro / **0.96 weighted** | ✅ Active |

---

## Model Performance (E2)

### Training Progress

| Epoch | Train Loss | Val Loss | Macro F1 |
|-------|-----------|----------|----------|
| 1 | 1.666 | 1.107 | 0.448 |
| 2 | 0.803 | 0.561 | 0.531 |
| 3 | 0.589 | 0.460 | 0.551 |
| 4 | 0.580 | 0.398 | 0.525 |
| **5** ✓ | **0.428** | **0.323** | **0.609** |
| 6 | 0.360 | 0.296 | 0.590 |

> Best checkpoint loaded from **Epoch 5** (`load_best_model_at_end=True`)

### Per-Entity Classification Report

| Entity | Precision | Recall | F1 | Support |
|--------|-----------|--------|----|---------|
| B-geo | 0.83 | 0.91 | **0.87** | 3,788 |
| B-gpe | 0.93 | 0.93 | **0.93** | 1,537 |
| B-org | 0.77 | 0.61 | **0.68** | 2,013 |
| B-per | 0.80 | 0.83 | **0.82** | 1,701 |
| B-tim | 0.88 | 0.84 | **0.86** | 1,950 |
| B-eve | 0.67 | 0.36 | 0.47 | 28 |
| B-nat | 0.56 | 0.43 | 0.49 | 23 |
| B-art | 0.67 | 0.10 | 0.17 | 42 |
| O | 0.99 | 0.99 | **0.99** | 88,700 |
| **Weighted Avg** | **0.96** | **0.96** | **0.96** | 104,683 |

> Rare classes (`art`, `nat`, `eve`) pull down the macro average due to limited training examples. Frequent entity types perform excellently.

<!--
  📸 IMAGE PLACEMENT #2 — OPTIONAL: Training loss curve chart
  ─────────────────────────────────────────────────────────────
  If you have a training plot exported from Kaggle/W&B, add it here:
  ![Training Curve](./docs/training-curve.png)
-->

---

## LoRA Configuration

| Parameter | E1 | E2 |
|-----------|----|----|
| Base Model | `deberta-v3-base` | `deberta-v3-small` |
| Rank (`r`) | 16 | 16 |
| Alpha (`lora_alpha`) | 32 | 32 |
| Dropout | 0.05 | 0.1 |
| Target Modules | `query_proj`, `value_proj` | `query_proj`, `value_proj` |
| Task Type | `TOKEN_CLS` | `TOKEN_CLS` |

---

## Architecture

```
┌─────────────────────────────────┐      ┌──────────────────────────────────────┐
│        React + Vite             │      │         FastAPI (HF Spaces)          │
│  ─────────────────────────────  │      │  ──────────────────────────────────  │
│  • Entity highlight UI          │ ───► │  POST /predict                       │
│  • History panel + Search       │      │      │                               │
│  • Mobile-responsive layout     │ ◄─── │      ▼                               │
└─────────────────────────────────┘      │  HuggingFace Pipeline                │
         Vercel                          │  (DeBERTa-v3-small + LoRA weights)   │
                                         │      │                               │
                                         │      ▼                               │
                                         │  Structured JSON entities            │
                                         └──────────────────────────────────────┘
```

<!--
  📸 IMAGE PLACEMENT #3 — OPTIONAL: Side-by-side mobile + desktop screenshot
  ──────────────────────────────────────────────────────────────────────────────
  Great for showing off the responsive design. Place after this architecture section.
  ![Responsive Design](./docs/responsive.png)
-->

### Frontend (`/frontend`)
Built with **React, Vite, and raw CSS**. Users input text and instantly see color-coded entity highlights. Features a bottom-sheet history panel with search, smooth animations, and glassmorphism styling.

### Backend (`/backend/patmoleo E2/api`)
Built with **Python and FastAPI**. Exposes a `/predict` endpoint that tokenizes input text, runs it through the fine-tuned DeBERTa pipeline, and returns structured JSON with entity spans, labels, and confidence scores.

---

## Quick Start

### Prerequisites

- Node.js v18+
- Python 3.9+

### 1. Clone the repository

```bash
# ⚠️ Replace with your actual GitHub repo URL
git clone https://github.com/YOUR_USERNAME/patmoleo.git
cd patmoleo
```

### 2. Start the Backend

```bash
cd "backend/patmoleo E2/api"
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API will be available at `http://localhost:8000` — visit `/docs` for the interactive Swagger UI.

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8000
```

Then run:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Deployment

### Backend → Hugging Face Spaces (Docker)

1. Create a new **Docker Space** on [huggingface.co/spaces](https://huggingface.co/spaces)
2. Clone the empty space repository locally
3. Copy the contents of `backend/patmoleo E2` (including `Dockerfile`, `api/`, and LoRA weights) into it
4. `git push` — the Space builds and exposes your API automatically

### Frontend → Vercel

1. Push this repository to GitHub
2. Import it in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add the environment variable:
   ```
   VITE_API_URL = https://your-space-name.hf.space
   ```
5. Deploy — Vercel auto-deploys on every push to `main`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Model | [Microsoft DeBERTa-v3-small](https://huggingface.co/microsoft/deberta-v3-small) |
| Fine-Tuning | Hugging Face Transformers + PEFT (LoRA) |
| Training | Kaggle (T4 GPU) |
| Evaluation | scikit-learn |
| Backend API | FastAPI + Uvicorn |
| Backend Hosting | Hugging Face Spaces (Docker) |
| Frontend | React + Vite + raw CSS |
| Frontend Hosting | Vercel |

---

## Background & Roadmap

**Patmoleo E1** was originally built to parse job descriptions — extracting entities like company, role, location, and salary using AI agents. However, scraping job boards led to aggressive bot bans, and synthetically generated training data (via CrewAI) failed to generalize to real-world text.

**Patmoleo E2** pivoted to standard NER using the high-quality [GMB (Groningen Meaning Bank)](https://www.kaggle.com/datasets/shoumikgoswami/annotated-gmb-corpus) dataset, achieving strong performance on the most common entity types.

**Future plans:**
- Secure a real-world job description dataset and revisit **E3** for domain-specific NER
- Experiment with larger base models (`deberta-v3-large`) and extended training
- Add confidence score visualization to the UI

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ☕ and way too many training epochs.
</p>
