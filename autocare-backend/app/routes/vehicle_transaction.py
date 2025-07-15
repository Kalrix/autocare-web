from fastapi import APIRouter, HTTPException, Query
from app.models.vehicle_transaction import VehicleTransaction
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime
from typing import List, Optional

router = APIRouter()
transaction_collection = db["vehicle_transactions"]

@router.post("/vehicle-transactions")
async def create_transaction(txn: VehicleTransaction):
    txn_dict = txn.dict(by_alias=True)
    txn_dict["id"] = str(uuid4())
    txn_dict["created_at"] = datetime.utcnow()
    await transaction_collection.insert_one(txn_dict)
    return {"message": "Transaction recorded", "id": txn_dict["id"]}

@router.get("/vehicles/{vehicle_id}/transactions")
async def get_transactions_for_vehicle(
    vehicle_id: str,
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None
):
    """
    Fetch transactions for a vehicle with pagination and optional date filter.
    """
    query = {"vehicle_id": vehicle_id}

    if from_date and to_date:
        query["created_at"] = {"$gte": from_date, "$lte": to_date}
    elif from_date:
        query["created_at"] = {"$gte": from_date}
    elif to_date:
        query["created_at"] = {"$lte": to_date}

    cursor = transaction_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)

    txns = []
    async for txn in cursor:
        txn["id"] = txn.get("id") or str(txn["_id"])
        txn.pop("_id", None)
        txns.append(txn)

    return {
        "total": len(txns),
        "transactions": txns,
        "skip": skip,
        "limit": limit
    }

@router.get("/vehicle-transactions/{txn_id}")
async def get_transaction_by_id(txn_id: str):
    txn = await transaction_collection.find_one({"id": txn_id})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    txn["id"] = txn.get("id") or str(txn["_id"])
    txn.pop("_id", None)
    return txn
