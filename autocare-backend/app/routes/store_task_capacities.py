from fastapi import APIRouter, HTTPException
from app.db.mongo import db
from app.models.store_task_capacity import (
    StoreTaskCapacityCreate,
    StoreTaskCapacityWithDetails
)
from uuid import uuid4
from datetime import datetime

router = APIRouter()


@router.post("/store-task-capacities")
async def create_store_task_capacities(data: list[StoreTaskCapacityCreate]):
    """
    Create task capacities for a store.

    Args:
        data (list[StoreTaskCapacityCreate]): List of task capacities to create.

    Returns:
        dict: Message and count of created records.
    """
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")

    now = datetime.utcnow()
    payload = [
        {
            "_id": str(uuid4()),
            "store_id": str(item.store_id),
            "task_type_id": str(item.task_type_id),
            "capacity": item.capacity,
            "created_at": now,
        }
        for item in data
    ]

    await db.store_task_capacities.insert_many(payload)
    return {
        "message": "Capacities added successfully",
        "count": len(payload)
    }


@router.put("/store-task-capacities")
async def update_store_task_capacities(data: list[StoreTaskCapacityCreate]):
    """
    Replace task capacities for a store.

    Args:
        data (list[StoreTaskCapacityCreate]): List of task capacities to update.

    Returns:
        dict: Message and count of updated records.
    """
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")

    store_id = str(data[0].store_id)

    # Remove existing capacities for the store
    await db.store_task_capacities.delete_many({"store_id": store_id})

    # Insert new capacities
    now = datetime.utcnow()
    payload = [
        {
            "_id": str(uuid4()),
            "store_id": str(item.store_id),
            "task_type_id": str(item.task_type_id),
            "capacity": item.capacity,
            "created_at": now,
        }
        for item in data
    ]

    await db.store_task_capacities.insert_many(payload)
    return {
        "message": "Capacities updated successfully",
        "count": len(payload)
    }


@router.get("/store-task-capacities/{store_id}", response_model=list[StoreTaskCapacityWithDetails])
async def get_task_capacities_for_store(store_id: str):
    """
    Get task capacities for a store, with task name and slot type.

    Args:
        store_id (str): Store ID to fetch capacities for.

    Returns:
        list[StoreTaskCapacityWithDetails]: Task capacities with details.
    """
    capacities = await db.store_task_capacities.find({"store_id": store_id}).to_list(None)

    if not capacities:
        return []

    task_type_ids = list({c["task_type_id"] for c in capacities})
    task_types = await db.task_types.find({"_id": {"$in": task_type_ids}}).to_list(None)
    task_map = {str(task["_id"]): task for task in task_types}

    result = []
    for c in capacities:
        task = task_map.get(str(c["task_type_id"]))
        if task:
            result.append({
                "task_type_id": str(c["task_type_id"]),
                "task_name": task.get("name", ""),
                "slot_type": task.get("slot_type", ""),
                "capacity": c.get("capacity", 0),
            })

    return result
