from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Import route modules
from app.routes import (
    admin_user,
    store_admin,
    task_types,
    store_task_capacities,
    garage_hub_tags,
    customer,
    vehicle,
    loyalty_card,
    vehicle_transaction,
)

app = FastAPI(
    title="AutoCare API",
    version="1.0.0",
    description="Backend for AutoCare24 Admin Dashboard",
)

# ✅ Allowed CORS origins
origins = [
    "http://localhost:3000",  # Local dev
    "https://admin.autocare24.co.in",
    "https://store.autocare24.co.in",
    "https://garage.autocare24.co.in",
    "https://autocare-web-git-main-kalrixs-projects.vercel.app",  # Preview
    "https://autocare-dq6oycixr-kalrixs-projects.vercel.app",      # Preview
]

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.autocare24\.co\.in",  # Allows admin., store., garage., etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Include routers (Admin / Store)
app.include_router(admin_user.router, prefix="/api", tags=["Admin Users"])
app.include_router(store_admin.router, prefix="/api", tags=["Store Admin"])
app.include_router(task_types.router, prefix="/api", tags=["Task Types"])
app.include_router(store_task_capacities.router, prefix="/api", tags=["Store Task Capacities"])
app.include_router(garage_hub_tags.router, prefix="/api", tags=["Garage Hub Tags"])

# ✅ Include routers (Customer System)
app.include_router(customer.router, prefix="/api", tags=["Customers"])
app.include_router(vehicle.router, prefix="/api", tags=["Vehicles"])
app.include_router(loyalty_card.router, prefix="/api", tags=["Loyalty Cards"])
app.include_router(vehicle_transaction.router, prefix="/api", tags=["Vehicle Transactions"])

# ✅ Health check
@app.get("/")
async def root():
    return {"message": "AutoCare Backend is up and running 🚀"}
