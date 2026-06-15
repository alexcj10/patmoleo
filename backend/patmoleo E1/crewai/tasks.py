from crewai import Task
from agents import synthetic_data_generator_agent, dataset_quality_reviewer_agent
from pydantic import Field, BaseModel
from typing import List

class Entity(BaseModel):
    start: int
    end: int
    label: str
    text: str

class SentenceData(BaseModel):
    text: str
    entities: List[Entity] 

class AnnotatedDataset(BaseModel):
    dataset: List[SentenceData]

# Generate Synthetic NER Dataset Task
synthetic_data_generation_task = Task(
    description="""
    Generate exactly 100 unique job description samples.

    Each sample must:
    - Match the AnnotatedDataset schema.
    - Include realistic job descriptions.
    - Use only these labels:
      ROLE
      TECHNOLOGY
      ORGANIZATION
      EXPERIENCE
      SENIORITY
      EDUCATION
      LOCATION
      WORK_MODE
    - Include accurate start and end offsets.
    - Include the exact entity text.
    - Contain no overlapping entities.
    - Cover multiple industries including software, finance, healthcare, marketing, sales, HR, cloud computing, cybersecurity, and data science.
    - Include remote, hybrid, and onsite jobs.
    - Include junior, mid-level, senior, lead, and principal roles.

    Return only valid JSON.
""",
    expected_output="Valid JSON",
    agent=synthetic_data_generator_agent,
    output_pydantic=AnnotatedDataset
)

# Review and Correct Dataset Task
review_and_correct_task = Task(
    description="""
    Review the generated AnnotatedDataset.

    Verify:
    - JSON validity.
    - Pydantic schema compliance.
    - Correct start/end offsets.
    - Correct entity text values.
    - Correct labels.
    - No overlapping entities.
    - No duplicate samples.
    - Diverse industries and roles.
    - Realistic job descriptions.

    Correct all detected issues.

    Return only the corrected AnnotatedDataset JSON.
""",
    expected_output="A fully validated AnnotatedDataset JSON object ready for NER model fine-tuning.",
    agent=dataset_quality_reviewer_agent,
    output_pydantic=AnnotatedDataset
)

