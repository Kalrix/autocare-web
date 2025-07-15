from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Route Modules
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
    services,
    booking,  # ✅ Optional
)

app = FastAPI(
    title="AutoCare API",
    version="1.0.0",
    description="Backend for AutoCare24 Admin Dashboard",
)

# ✅ CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://admin.autocare24.co.in",
        "https://store.autocare24.co.in",
        "https://garage.autocare24.co.in",
        "https://autocare-web-git-main-kalrixs-projects.vercel.app",
        "https://autocare-dq6oycixr-kalrixs-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Admin + Store Management APIs
app.include_router(admin_user.router, prefix="/api", tags=["Admin Users"])
app.include_router(store_admin.router, prefix="/api", tags=["Store Admin"])
app.include_router(task_types.router, prefix="/api", tags=["Task Types"])
app.include_router(store_task_capacities.router, prefix="/api", tags=["Store Task Capacities"])
app.include_router(garage_hub_tags.router, prefix="/api", tags=["Garage Hub Tags"])

# ✅ Customer Ecosystem APIs
app.include_router(customer.router, prefix="/api", tags=["Customers"])
app.include_router(vehicle.router, prefix="/api", tags=["Vehicles"])
app.include_router(loyalty_card.router, prefix="/api", tags=["Loyalty Cards"])
app.include_router(vehicle_transaction.router, prefix="/api", tags=["Vehicle Transactions"])

# ✅ Services & Booking APIs
app.include_router(services.router, prefix="/api", tags=["Services"])
app.include_router(booking.router, prefix="/api", tags=["Bookings"])

# ✅ Health Check
@app.get("/")
async def root():
    return {"message": "AutoCare Backend is up and running 🚀"}
