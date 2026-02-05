from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.router import api_router
from app.database import engine, Base
from app.models import user, food_entry  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Health Tracking API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
