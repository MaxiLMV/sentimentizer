from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class TextInput(BaseModel):
    text: str

class PredictionOutput(BaseModel):
    label: str
    score: float

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# loads the pre-trained model and tokenizer
model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# sentiment analysis pipeline
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model=model,
    tokenizer=tokenizer,
    return_all_scores=False,  # this returns only the top prediction
    device=0 if torch.cuda.is_available() else -1  # this uses gpu if available, otherwise cpu
)

# endpoint for testing
@app.get("/")
def read_root():
    return {"message": "sentiment analysis api is running!"}

# main prediction endpoint
@app.post("/predict", response_model=PredictionOutput)
def predict_sentiment(input_data: TextInput):
    try:
        # gets the text from the input data
        text = input_data.text

        # runs the sentiment analysis pipeline on the text
        result = sentiment_pipeline(text)

        # extracts the label and score from the pipeline result
        prediction = result[0]
        label = prediction['label']
        score = prediction['score']

        # return the prediction as a json object
        return PredictionOutput(label=label, score=score)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"prediction failed: {str(e)}")

# uvicorn main:app --reload