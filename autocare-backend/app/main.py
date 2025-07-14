# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import route modules
from app.routes import (
    admin_user,
    store_admin,
    task_types,
    store_task_capacities,
    garage_hub_tags  # ✅ New route module
)

app = FastAPI(
    title="AutoCare API",
    version="1.0.0",
    description="Backend for AutoCare24 Admin Dashboard",
)

# ⚠️ In production, restrict this to specific domains
origins = [
    "*",  # e.g., "http://localhost:3000", "https://admin.autocare24.in"
]

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(admin_user.router, prefix="/api", tags=["Admin Users"])
app.include_router(store_admin.router, prefix="/api", tags=["Store Admin"])
app.include_router(task_types.router, prefix="/api", tags=["Task Types"])
app.include_router(store_task_capacities.router, prefix="/api", tags=["Store Task Capacities"])
app.include_router(garage_hub_tags.router, prefix="/api", tags=["Garage Hub Tags"])  # ✅ Added route

# Root health check
@app.get("/")
async def root():
    return {"message": "AutoCare Backend is up and running 🚀"}
