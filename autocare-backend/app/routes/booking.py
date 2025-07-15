from fastapi import APIRouter, HTTPException
from app.models.booking import (
    BookingInitRequest,
    BookingInitResponse,
    BookingTaskUpdateRequest,
)
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime

router = APIRouter()

# DB Collections
customer_collection = db["customers"]
vehicle_collection = db["vehicles"]
booking_collection = db["bookings"]

# 🔁 Utility
def normalize_email(data: dict):
    if data.get("email") == "":
        data["email"] = None
    return data


# -----------------------------------------------
# 🔧 INIT BOOKING
# -----------------------------------------------
@router.post("/bookings/init", response_model=BookingInitResponse)
async def init_booking(payload: BookingInitRequest):
    try:
        customer_data = normalize_email(payload.customer.dict())

        # 🔍 Check if customer exists (by phone/email)
        query = {"phone_number": customer_data["phone_number"]}
        if customer_data.get("email"):
            query["$or"] = [
                {"phone_number": customer_data["phone_number"]},
                {"email": customer_data["email"]},
            ]

        existing_customer = await customer_collection.find_one(query)
        if existing_customer:
            customer_id = existing_customer["id"]
        else:
            customer_id = str(uuid4())
            customer_data.update({
                "id": customer_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_active": True,
            })
            await customer_collection.insert_one(customer_data)

        # 🚗 Check if vehicle exists (by number + customer_id)
        vehicle_data = payload.vehicle.dict()
        vehicle_query = {
            "vehicle_number": vehicle_data["vehicle_number"],
            "customer_id": customer_id,
        }

        existing_vehicle = await vehicle_collection.find_one(vehicle_query)
        if existing_vehicle:
            vehicle_id = existing_vehicle["id"]
        else:
            vehicle_id = str(uuid4())
            vehicle_data.update({
                "id": vehicle_id,
                "customer_id": customer_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })
            await vehicle_collection.insert_one(vehicle_data)

        # 📋 Create new booking with pending status
        booking_id = str(uuid4())
        booking = {
            "id": booking_id,
            "customer_id": customer_id,
            "vehicle_id": vehicle_id,
            "store_id": payload.store_id,
            "booking_source": payload.booking_source,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await booking_collection.insert_one(booking)

        return BookingInitResponse(
            message="Booking initialized",
            booking_id=booking_id,
            customer_id=customer_id,
            vehicle_id=vehicle_id,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize booking: {str(e)}")


# -----------------------------------------------
# 🔧 ADD TASKS TO BOOKING
# -----------------------------------------------
@router.put("/bookings/{booking_id}/tasks")
async def add_tasks_to_booking(booking_id: str, payload: BookingTaskUpdateRequest):
    try:
        booking = await booking_collection.find_one({"id": booking_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        tasks = []
        total_amount = 0

        for task in payload.tasks:
            task_dict = task.dict()
            
            # Optionally: Fetch service name by ID (if you want to enrich)
            # service = await db["services"].find_one({"id": str(task.service_id)})
            # task_dict["service_name"] = service["name"] if service else "Unknown"

            task_dict["service_name"] = "To Be Fetched"
            task_total = task.price
            task_total += sum(addon.price for addon in task.addons)
            task_total += sum(sub.price for sub in task.subservices)
            total_amount += task_total
            tasks.append(task_dict)

        await booking_collection.update_one(
            {"id": booking_id},
            {
                "$set": {
                    "tasks": tasks,
                    "quotation_amount": total_amount,
                    "status": "quotation_generated",
                    "updated_at": datetime.utcnow(),
                }
            }
        )

        return {"message": "Tasks added", "quotation_amount": total_amount}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating tasks: {str(e)}")
