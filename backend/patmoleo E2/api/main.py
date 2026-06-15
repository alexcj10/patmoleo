from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline, AutoTokenizer
from peft import AutoPeftModelForTokenClassification

app = FastAPI()

# Enable CORS so the frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load the model from your checkpoint (using a relative path)
checkpoint = "../fine-tuning/results/checkpoint-8094"

tokenizer = AutoTokenizer.from_pretrained(checkpoint)

model = AutoPeftModelForTokenClassification.from_pretrained(
    checkpoint, 
    num_labels=17
)

# 2. Map the label IDs to correct names
id2label = {
    0: 'B-art', 
    1: 'B-eve', 
    2: 'B-geo', 
    3: 'B-gpe', 
    4: 'B-nat', 
    5: 'B-org', 
    6: 'B-per', 
    7: 'B-tim', 
    8: 'I-art', 
    9: 'I-eve', 
    10: 'I-geo', 
    11: 'I-gpe', 
    12: 'I-nat', 
    13: 'I-org', 
    14: 'I-per', 
    15: 'I-tim', 
    16: 'O'
}

model.config.id2label = id2label

model.config.label2id = {label: id for id, label in id2label.items()}

# 3. Create the Hugging Face Pipeline
nlp = pipeline(
    "ner", 
    model=model, 
    tokenizer=tokenizer, 
    aggregation_strategy="simple"
)

@app.post("/predict")
def predict(data: dict):
    # Run the model on input text
    results = nlp(data["text"])
    
    # Return entities (convert float32 to standard float for JSON compatibility)
    return [
        {
            "word": item["word"],
            "entity_group": item["entity_group"],
            "score": float(item["score"]),
            "start": int(item["start"]),
            "end": int(item["end"])
        }
        for item in results
    ]
