import sys
import io
import os
import json
from dotenv import load_dotenv
from crewai import Crew, Process
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY_3")

from agents import synthetic_data_generator_agent, dataset_quality_reviewer_agent
from tasks import synthetic_data_generation_task, review_and_correct_task

crew = Crew(
    agents=[
        synthetic_data_generator_agent,
        dataset_quality_reviewer_agent,
    ],
    tasks=[
        synthetic_data_generation_task,
        review_and_correct_task,
    ],
    process=Process.sequential,
    verbose=True
)

all_samples = []
os.makedirs("data", exist_ok=True) 

for i in range(10):
    result = crew.kickoff()
    result_dict = result.pydantic.model_dump()
    new_samples = result_dict["dataset"]
    all_samples.extend(new_samples)
    
    final_data = {"dataset": all_samples}
    with open("data/synthetic_data.json", "w", encoding="utf-8") as f:
        json.dump(final_data, f, indent=4)
        
    print(f"✅ Safely saved {len(all_samples)} total samples so far!")

    time.sleep(40)
