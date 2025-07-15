from fastapi import APIRouter, HTTPException, status
from models.task_type import TaskTypeCreate, TaskTypeInDB, TaskTypeUpdate
from bson import ObjectId
from database import db  # Assuming you have db.task_types collection
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/api/task-types", response_model=list[TaskTypeInDB])
async def get_task_types():
    data = await db.task_types.find().to_list(length=100)
    return data


@router.post("/api/task-types", response_model=TaskTypeInDB, status_code=status.HTTP_201_CREATED)
async def create_task_type(task: TaskTypeCreate):
    new_task = {
        "_id": str(uuid.uuid4()),
        "name": task.name,
        "allowed_in_hub": task.allowed_in_hub,
        "allowed_in_garage": task.allowed_in_garage,
        "slot_type": task.slot_type,
        "count": task.count,
        "created_at": datetime.utcnow()
    }
    await db.task_types.insert_one(new_task)
    return new_task


@router.put("/api/task-types/{task_id}", response_model=TaskTypeInDB)
async def update_task_type(task_id: str, updates: TaskTypeUpdate):
    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = await db.task_types.find_one_and_update(
        {"_id": task_id},
        {"$set": update_data},
        return_document=True
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Task type not found")

    return result


@router.delete("/api/task-types/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_type(task_id: str):
    result = await db.task_types.delete_one({"_id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task type not found")
    return
