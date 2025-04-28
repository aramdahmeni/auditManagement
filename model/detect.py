from fastapi import FastAPI
from pydantic import BaseModel
import xgboost as xgb
import pandas as pd
from typing import List
from fastapi.middleware.cors import CORSMiddleware


# input types
class RiskInput(BaseModel):
    nc_type: int
    cap_status: int
    days_until_due: int
    audit_category: int

# middleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT","DELETE","OPTIONS"],
    expose_headers=["*"],
    allow_headers=["*"],
)


model = xgb.XGBRegressor()
model.load_model("risk_model.json") 


@app.post("/predict")
def predict_risk(data: List[RiskInput]):
    df = pd.DataFrame([d.dict() for d in data])
    preds = model.predict(df)
    return {"predictions": [round(float(p), 2) for p in preds]}
