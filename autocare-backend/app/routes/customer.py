from fastapi import APIRouter, HTTPException, Body, Request
from app.models.customer import CustomerCreate
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime

router = APIRouter()
customer_collection = db["customers"]

# ✅ Helper to convert UUIDs to strings (MongoDB-safe)
def convert_optional_uuids(data: dict, fields: list[str]) -> dict:
    for field in fields:
        if data.get(field):
            data[field] = str(data[field])
    return data

# ✅ Create new customer
@router.post("/customers")
async def create_customer(request: Request):
    try:
        payload = await request.json()

        if payload.get("email") == "":
            payload["email"] = None

        customer = CustomerCreate(**payload)
        customer_dict = customer.dict()

        # Convert UUID fields to string
        convert_optional_uuids(customer_dict, ["store_id", "onboarded_by", "loyalty_card_id"])

        # Add system metadata
        customer_dict["id"] = str(uuid4())
        customer_dict["created_at"] = datetime.utcnow()
        customer_dict["updated_at"] = datetime.utcnow()
        customer_dict["is_active"] = True

        await customer_collection.insert_one(customer_dict)

        return {"message": "Customer created", "id": customer_dict["id"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ✅ List all customers
@router.get("/customers")
async def list_customers():
    try:
        customers_cursor = customer_collection.find({})
        customers = []
        async for doc in customers_cursor:
            doc["id"] = doc.get("id") or str(doc["_id"])
            doc.pop("_id", None)
            customers.append(doc)
        return customers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch customers: {str(e)}")

# ✅ Get single customer
@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    customer = await customer_collection.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer["id"] = customer.get("id") or str(customer["_id"])
    customer.pop("_id", None)
    return customer

# ✅ Update customer
@router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, updated_data: dict = Body(...)):
    if updated_data.get("email") == "":
        updated_data["email"] = None

    convert_optional_uuids(updated_data, ["store_id", "onboarded_by", "loyalty_card_id"])
    updated_data["updated_at"] = datetime.utcnow()

    result = await customer_collection.update_one(
        {"id": customer_id},
        {"$set": updated_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer updated"}

# ✅ Soft-delete customer
@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str):
    result = await customer_collection.update_one(
        {"id": customer_id},
        {"$set": {
            "is_active": False,
            "updated_at": datetime.utcnow()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deactivated"}
