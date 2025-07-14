from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Import route modules
from app.routes import (
    admin_user,
    store_admin,
    task_types,
    store_task_capacities,
    garage_hub_tags,
)

app = FastAPI(
    title="AutoCare API",
    version="1.0.0",
    description="Backend for AutoCare24 Admin Dashboard",
)

# ✅ Define allowed origins (only necessary domains)
origins = [
    "http://localhost:3000",                   # Local dev
    "https://admin.autocare24.co.in",          # Production domain
    "https://autocare-web-git-main-kalrixs-projects.vercel.app",  # Preview deploy
    "https://autocare-dq6oycixr-kalrixs-projects.vercel.app",      # Preview deploy
]

# ✅ CORS middleware (must be added *before* routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers
app.include_router(admin_user.router, prefix="/api", tags=["Admin Users"])
app.include_router(store_admin.router, prefix="/api", tags=["Store Admin"])
app.include_router(task_types.router, prefix="/api", tags=["Task Types"])
app.include_router(store_task_capacities.router, prefix="/api", tags=["Store Task Capacities"])
app.include_router(garage_hub_tags.router, prefix="/api", tags=["Garage Hub Tags"])

# ✅ Health check
@app.get("/")
async def root():
    return {"message": "AutoCare Backend is up and running 🚀"}
