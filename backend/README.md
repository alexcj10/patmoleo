<p align="center">
  <img src="./assets/logo.svg" alt="Patmoleo Logo" width="500" />
</p>

**Patmoleo** is a Named Entity Recognition (NER) system built using fine-tuned **DeBERTa** transformer models with **LoRA** (Low-Rank Adaptation) adapters. It identifies and classifies named entities — such as people, locations, organizations, and more — from unstructured text.

---

## Model Versions

| Version | Base Model | Dataset | Labels | Best Metric | Status |
|---------|-----------|---------|--------|------------|--------|
| **Patmoleo E1** | `deberta-v3-base` | Synthetic Job Descriptions (CrewAI) | 8 custom labels | F1: 0.998 | Deprecated |
| **Patmoleo E2** | `deberta-v3-small` | GMB NER (Kaggle, ~48K sentences) | 17 labels (8 entity types) | F1: 0.608 (macro) / 0.96 (weighted) | Active |

---

## Supported Entity Types (E2)

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
| I-art | 0.33 | 0.04 | 0.07 | 25 |
| I-eve | 0.14 | 0.33 | 0.20 | 18 |
| I-geo | 0.87 | 0.65 | 0.74 | 765 |
| I-gpe | 0.86 | 0.71 | 0.77 | 17 |
| I-nat | 0.00 | 0.00 | 0.00 | 5 |
| I-org | 0.71 | 0.71 | 0.71 | 1,718 |
| I-per | 0.80 | 0.92 | 0.85 | 1,753 |
| I-tim | 0.80 | 0.68 | 0.73 | 600 |
| O | 0.99 | 0.99 | 0.99 | 88,700 |
| | | | | |
| **Accuracy** | | | **0.96** | 104,683 |
| **Macro Avg** | 0.68 | 0.59 | **0.61** | 104,683 |
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

## Project Structure

```text
patmoleo/
├── patmoleo E1/                    # Version 1 (Deprecated)
│   ├── crewai/                     # CrewAI synthetic data generation
│   │   ├── agents.py
│   │   ├── tasks.py
│   │   ├── main.py
│   │   └── data/                   # Generated synthetic dataset
│   └── fine-tuning/
│       ├── fine-tuning.ipynb       # Training notebook
│       ├── test.ipynb              # Testing notebook
│       └── results/
│           ├── checkpoint-5532/    # LoRA adapter weights
│           └── accuracy/           # Accuracy & prediction plots
│
├── patmoleo E2/                    # Version 2 (Active)
│   ├── data/
│   │   └── ner.csv                 # GMB NER dataset
│   ├── fine-tuning/
│   │   ├── deberta-finetuning.ipynb  # Training notebook
│   │   ├── test.ipynb              # Testing notebook
│   │   └── results/
│   │       └── checkpoint-8094/    # LoRA adapter weights
│   └── api/                        # FastAPI backend (coming soon)
│       └── main.py
│
├── README.md
└── .gitignore
```

---

## Project History & Pivot

**Patmoleo E1** was initially built to scrape and parse Job Descriptions using AI agents to extract custom entities (Company, Job Role, Location, Salary, Experience, etc.). However, scraping job boards (Indeed, Wellfound, LinkedIn) resulted in strict bot bans. We attempted to use CrewAI agents to generate synthetic data, but the models failed to generalize well to real-world unseen data due to a lack of quality, diverse job descriptions.

Because of this data bottleneck, we pivoted **Patmoleo E2** to focus on a different use case: standard Named Entity Recognition (NER) using high-quality Kaggle datasets. Once we can secure a robust, high-quality dataset for Job Descriptions in the future, we will revisit the job parsing use case under a new version.

---

## Tech Stack

- **Model**: [Microsoft DeBERTa-v3](https://huggingface.co/microsoft/deberta-v3-small)
- **Fine-Tuning**: [Hugging Face Transformers](https://huggingface.co/docs/transformers) + [PEFT (LoRA)](https://huggingface.co/docs/peft)
- **Training Platform**: [Kaggle](https://www.kaggle.com/) (T4 GPU)
- **Backend**: FastAPI (deployed on Hugging Face Spaces)
- **Frontend**: Vercel (coming soon)
- **Evaluation**: scikit-learn (F1-score, classification report)

---

## License

This project is open source and available under the [MIT License](LICENSE).
