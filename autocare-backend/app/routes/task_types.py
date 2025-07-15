from fastapi import APIRouter, HTTPException, Body, Query
from app.db.mongo import db
from app.models.task_type import TaskTypeCreate, TaskTypeUpdate, TaskTypeInDB
from typing import List, Optional
from uuid import uuid4, UUID
from datetime import datetime

router = APIRouter()


# ----------------------------
# Create a single task type
# ----------------------------
@router.post("/task-types", response_model=TaskTypeInDB)
async def create_task_type(data: TaskTypeCreate):
    task_type = {
        "_id": str(uuid4()),
        "name": data.name,
        "allowed_in_hub": data.allowed_in_hub,
        "allowed_in_garage": data.allowed_in_garage,
        "slot_type": data.slot_type,
        "count": data.count,
        "created_at": datetime.utcnow()
    }
    await db.task_types.insert_one(task_type)

    return TaskTypeInDB(**task_type)


# ----------------------------
# Get all or filtered task types
# ----------------------------
@router.get("/task-types", response_model=List[TaskTypeInDB])
async def get_all_task_types(storeType: Optional[str] = Query(None)):
    query = {}
    if storeType == "hub":
        query["allowed_in_hub"] = True
    elif storeType == "garage":
        query["allowed_in_garage"] = True
    elif storeType is not None:
        raise HTTPException(status_code=400, detail="Invalid storeType. Must be 'hub' or 'garage'.")

    task_types = await db.task_types.find(query).to_list(length=None)

    return [
        TaskTypeInDB(
            id=str(task["_id"]),
            name=task["name"],
            allowed_in_hub=task["allowed_in_hub"],
            allowed_in_garage=task["allowed_in_garage"],
            slot_type=task["slot_type"],
            count=int(task["count"]),
            created_at=task["created_at"]
        ) for task in task_types
    ]


# ----------------------------
# Update a task type
# ----------------------------
@router.patch("/task-types/{task_type_id}", response_model=TaskTypeInDB)
async def update_task_type(task_type_id: str, data: TaskTypeUpdate):
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}

    result = await db.task_types.find_one_and_update(
        {"_id": task_type_id},
        {"$set": update_data},
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="Task type not found")

    return TaskTypeInDB(
        id=str(result["_id"]),
        name=result["name"],
        allowed_in_hub=result["allowed_in_hub"],
        allowed_in_garage=result["allowed_in_garage"],
        slot_type=result["slot_type"],
        count=int(result["count"]),
        created_at=result["created_at"]
    )


# ----------------------------
# Delete a task type
# ----------------------------
@router.delete("/task-types/{task_type_id}")
async def delete_task_type(task_type_id: str):
    result = await db.task_types.delete_one({"_id": task_type_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task type not found")

    return {"message": "Task type deleted"}


# ----------------------------
# Bulk create task types
# ----------------------------
@router.post("/task-types/bulk", response_model=List[TaskTypeInDB])
async def create_task_types_bulk(task_list: List[TaskTypeCreate] = Body(...)):
    tasks_to_insert = []

    for task in task_list:
        task_id = getattr(task, "id", None)
        uid = str(UUID(str(task_id))) if task_id else str(uuid4())
        task_dict = {
            "_id": uid,
            "name": task.name,
            "allowed_in_hub": task.allowed_in_hub,
            "allowed_in_garage": task.allowed_in_garage,
            "slot_type": task.slot_type,
            "count": task.count,
            "created_at": datetime.utcnow()
        }
        tasks_to_insert.append(task_dict)

    await db.task_types.insert_many(tasks_to_insert)

    return [
        TaskTypeInDB(
            id=task["_id"],
            name=task["name"],
            allowed_in_hub=task["allowed_in_hub"],
            allowed_in_garage=task["allowed_in_garage"],
            slot_type=task["slot_type"],
            count=int(task["count"]),
            created_at=task["created_at"]
        ) for task in tasks_to_insert
    ]
