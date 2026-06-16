<p align="center">
  <img src="./frontend/public/logo.svg" alt="Patmoleo Logo" width="500" />
</p>

**Patmoleo** is a modern, full-stack Named Entity Recognition (NER) application. It leverages a fine-tuned **DeBERTa Transformer** model with **LoRA** (Low-Rank Adaptation) adapters to intelligently extract and classify named entities — such as people, locations, organizations, and more — from unstructured text. It is wrapped in a beautiful, responsive React frontend.

  <img src="https://img.shields.io/badge/Frontend-React_%26_Vite-4F46E5?style=flat&logo=react&logoColor=white" alt="React & Vite" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Model-DeBERTa_V3-FF9D00?style=flat&logo=huggingface&logoColor=white" alt="DeBERTa V3" />

---

## Model Versions

| Version | Base Model | Dataset | Labels | Best Metric | Status |
|---------|-----------|---------|--------|------------|--------|
| **Patmoleo E1** | `deberta-v3-base` | Synthetic Job Descriptions (CrewAI) | 8 custom labels | F1: 0.998 | Deprecated |
| **Patmoleo E2** | `deberta-v3-small` | **GMB (Groningen Meaning Bank) NER** dataset (Kaggle, ~48K sentences) | 17 labels (8 entity types) | F1: 0.608 (macro) / 0.96 (weighted) | Active |

---

## Supported Entity Types (E2 - GMB Dataset)

| Tag | Entity Type | Example |
|-----|------------|---------|
| `per` | Person | *Alex*, *Barack Obama* |
| `geo` | Geographical Location | *London*, *Mt. Everest* |
| `org` | Organization | *Google*, *United Nations* |
| `tim` | Time | *Tuesday*, *2026*, *morning* |
| `gpe` | Geopolitical Entity | *Indian*, *USA* |
| `art` | Artifact | *Harry Potter*, *Golden Gate Bridge* |
| `eve` | Event | *World War II*, *Olympics* |
| `nat` | Natural Phenomenon | *Flu*, *Hurricane Katrina* |
| `O` | Outside (non-entity) | Any regular word |

> Each entity type uses **BIO tagging**: `B-` (Beginning of entity) and `I-` (Inside/continuation of entity), resulting in **17 total labels**.

---

## Model Performance (E2)

### Training Summary

| Epoch | Training Loss | Validation Loss | F1 Score |
|-------|--------------|-----------------|----------|
| 1 | 1.666 | 1.107 | 0.448 |
| 2 | 0.803 | 0.561 | 0.531 |
| 3 | 0.589 | 0.460 | 0.551 |
| 4 | 0.580 | 0.398 | 0.525 |
| **5** | **0.428** | **0.323** | **0.609** |
| 6 | 0.360 | 0.296 | 0.590 |

> Best model loaded from **Epoch 5** (`load_best_model_at_end=True`)

### Per-Entity Classification Report (E2)

| Entity | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| B-art | 0.67 | 0.10 | 0.17 | 42 |
| B-eve | 0.67 | 0.36 | 0.47 | 28 |
| B-geo | 0.83 | 0.91 | 0.87 | 3,788 |
| B-gpe | 0.93 | 0.93 | 0.93 | 1,537 |
| B-nat | 0.56 | 0.43 | 0.49 | 23 |
| B-org | 0.77 | 0.61 | 0.68 | 2,013 |
| B-per | 0.80 | 0.83 | 0.82 | 1,701 |
| B-tim | 0.88 | 0.84 | 0.86 | 1,950 |
| O | 0.99 | 0.99 | 0.99 | 88,700 |
| | | | | |
| **Accuracy** | | | **0.96** | 104,683 |
| **Weighted Avg** | 0.96 | 0.96 | **0.96** | 104,683 |

> **Note:** Rare entity classes (like `I-nat` with only 5 examples) have very low F1-scores, which pull down the macro average. The model performs excellently on frequent entity types.

---

## LoRA Configuration

| Parameter | E1 | E2 |
|-----------|-----|-----|
| Base Model | `deberta-v3-base` | `deberta-v3-small` |
| Rank (`r`) | 16 | 16 |
| Alpha (`lora_alpha`) | 32 | 32 |
| Dropout | 0.05 | 0.1 |
| Target Modules | `query_proj`, `value_proj` | `query_proj`, `value_proj` |
| Task Type | `TOKEN_CLS` | `TOKEN_CLS` |

---

## Inference Example

```text
Input:  "Alex went to London last Tuesday to visit Google."

Output:
  Alex      → B-per  (Person)
  went      → O
  to        → O
  London    → B-geo  (Geographical Location)
  last      → O
  Tuesday   → B-tim  (Time)
  to        → O
  visit     → O
  Google    → B-org  (Organization)
  .         → O
```

---

## Full-Stack Architecture

The repository is divided into two main components that are deployed seamlessly together:

### 1. Frontend (`/frontend`)
Built with **React, Vite, and raw CSS**. It provides the interactive user interface where users can input text and instantly see highlighted entities categorized by color.
- **Beautiful UI/UX:** A stunning, glassmorphism-inspired React frontend with smooth animations and dynamic entity highlighting.
- **Mobile-First Design:** Fully responsive interface featuring a modern bottom-sheet history panel and robust search functionality.

### 2. Backend (`/backend/patmoleo E2/api`)
Built with **Python and FastAPI**. It exposes a `/predict` endpoint that takes raw text, passes it through the Hugging Face pipeline (using the fine-tuned LoRA weights), and returns structured JSON entities.
- **Lightning-Fast API:** Asynchronous, high-performance inference ready to handle requests from the frontend.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- Python 3.9+

### Start the Backend
```bash
cd "backend/patmoleo E2/api"
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Your frontend will now be running on `http://localhost:5173` and connected to your local backend API!

---

## Deployment

### Deploy Backend to Hugging Face Spaces
1. Create a new **Docker Space** on Hugging Face.
2. Clone the empty space repository.
3. Copy the contents of `backend/patmoleo E2` (including the `Dockerfile`, `api` folder, and `fine-tuning` weights) into the space repository.
4. Run `git push` to deploy. The API will be automatically exposed.

### Deploy Frontend to Vercel
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the **Root Directory** to `frontend`.
4. Add the Environment Variable `VITE_API_URL` and set it to your Hugging Face Space URL.
5. Deploy!

---

## Project History & Pivot

**Patmoleo E1** was initially built to scrape and parse Job Descriptions using AI agents to extract custom entities (Company, Job Role, Location, Salary, Experience, etc.). However, scraping job boards resulted in strict bot bans. We attempted to use CrewAI agents to generate synthetic data, but the models failed to generalize well to real-world unseen data due to a lack of quality, diverse job descriptions.

Because of this data bottleneck, we pivoted **Patmoleo E2** to focus on a different use case: standard Named Entity Recognition (NER) using the high-quality **GMB NER dataset**. Once we can secure a robust, high-quality dataset for Job Descriptions in the future, we will revisit the job parsing use case under a new version.

---

## Tech Stack

- **Model**: [Microsoft DeBERTa-v3](https://huggingface.co/microsoft/deberta-v3-small)
- **Fine-Tuning**: Hugging Face Transformers + PEFT (LoRA)
- **Backend API**: FastAPI (deployed on Hugging Face Spaces via Docker)
- **Frontend App**: React + Vite (deployed on Vercel)
- **Training**: Kaggle (T4 GPU)
- **Evaluation**: scikit-learn (F1-score, classification report)

---

## License

This project is open source and available under the [MIT License](LICENSE).
