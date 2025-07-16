from fastapi import APIRouter, HTTPException
from typing import List
from uuid import uuid4, UUID
from datetime import datetime

from app.db.mongo import db
from app.models.service import (
    LabourRuleCreate,
    LabourRuleUpdate,
    LabourRuleInDB
)

router = APIRouter()


# ----------------------------
# Create a labour rule
# ----------------------------
@router.post("/labour-rules", response_model=LabourRuleInDB)
async def create_labour_rule(data: LabourRuleCreate):
    labour_rule = {
        "_id": str(uuid4()),
        "task_type_id": str(data.task_type_id),
        "vehicle_category": data.vehicle_category,
        "charge_type": data.charge_type,
        "value": data.value,
        "created_at": datetime.utcnow()
    }
    await db.labour_rules.insert_one(labour_rule)
    return LabourRuleInDB(**labour_rule)


# ----------------------------
# Get all labour rules
# ----------------------------
@router.get("/labour-rules", response_model=List[LabourRuleInDB])
async def get_labour_rules():
    rules = await db.labour_rules.find().to_list(length=None)
    return [LabourRuleInDB(**rule) for rule in rules]


# ----------------------------
# Get rule by task type + vehicle category
# ----------------------------
@router.get("/labour-rules/lookup", response_model=LabourRuleInDB)
async def get_by_task_and_vehicle(task_type_id: UUID, vehicle_category: str):
    rule = await db.labour_rules.find_one({
        "task_type_id": str(task_type_id),
        "vehicle_category": vehicle_category
    })
    if not rule:
        raise HTTPException(status_code=404, detail="Labour rule not found")

    return LabourRuleInDB(**rule)


# ----------------------------
# Update labour rule
# ----------------------------
@router.patch("/labour-rules/{rule_id}", response_model=LabourRuleInDB)
async def update_labour_rule(rule_id: str, data: LabourRuleUpdate):
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
    updated = await db.labour_rules.find_one_and_update(
        {"_id": rule_id},
        {"$set": update_data},
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Labour rule not found")
    return LabourRuleInDB(**updated)


# ----------------------------
# Delete labour rule
# ----------------------------
@router.delete("/labour-rules/{rule_id}")
async def delete_labour_rule(rule_id: str):
    result = await db.labour_rules.delete_one({"_id": rule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Labour rule not found")
    return {"message": "Labour rule deleted successfully"}
