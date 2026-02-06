from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.nutrition import router as nutrition_router
from app.api.routes.exercise import router as exercise_router
from app.api.routes.profile import router as profile_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(nutrition_router, tags=["nutrition"])
api_router.include_router(exercise_router, prefix="/nutrition", tags=["exercises"])
api_router.include_router(profile_router, tags=["profile"])
