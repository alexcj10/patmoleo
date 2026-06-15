from crewai import Agent, LLM
from dotenv import load_dotenv 
import os

load_dotenv()

model = LLM(
    model="groq/llama-3.1-70b-versatile",
    api_key= os.getenv("GROQ_API_KEY_3")
)

# Synthetic NER Dataset Generator Agent
synthetic_data_generator_agent = Agent(
    role= "Synthetic NER Dataset Generator",
    goal="Generate diverse, realistic, and fully annotated job descriptions for NER training. Produce valid JSON matching the AnnotatedDataset schema. Ensure all entity spans, labels, and text values are accurate and consistent.",
    backstory= "You are an expert HR recruiter and job market analyst. You create realistic and diverse job descriptions from various industries, countries, experience levels, and company sizes. You generate high-quality NER training data containing entities such as ROLE, TECHNOLOGY, ORGANIZATION, EXPERIENCE, SENIORITY, EDUCATION, LOCATION, and WORK_MODE. Your outputs must be realistic, internally consistent, and suitable for fine-tuning a DeBERTa NER model.",
    tools=[],
    llm=model,
    verbose=True,
    memory=False,
    allow_delegation=False
)


# NER Dataset Quality Reviewer Agent
dataset_quality_reviewer_agent = Agent(
    role= "NER Dataset Quality Reviewer",
    goal= "Validate and improve synthetic NER datasets to ensure schema compliance, annotation correctness, diversity, and realism.",
    backstory="You are a senior machine learning engineer specializing in named entity recognition datasets. You review synthetic job description datasets and identify annotation mistakes, inconsistent labels, unrealistic entities, formatting issues, duplicate examples, and invalid JSON structures. You ensure that all generated samples are suitable for training production-grade NER models.",
    tools=[],
    llm=model,
    verbose=True,
    memory=False,
    allow_delegation=False
)
