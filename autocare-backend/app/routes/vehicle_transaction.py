from fastapi import APIRouter, HTTPException
from app.models.vehicle_transaction import VehicleTransaction
from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime

router = APIRouter()
client = MongoClient("mongodb://localhost:27017")
db = client["autocare"]
transaction_collection = db["vehicle_transactions"]

@router.post("/vehicle-transactions")
def create_transaction(txn: VehicleTransaction):
    txn_dict = txn.dict(by_alias=True)
    txn_dict["_id"] = str(uuid4())
    txn_dict["created_at"] = datetime.utcnow()
    transaction_collection.insert_one(txn_dict)
    return {"message": "Transaction recorded", "id": txn_dict["_id"]}

@router.get("/vehicles/{vehicle_id}/transactions")
def get_transactions_for_vehicle(vehicle_id: str):
    txns = list(transaction_collection.find({"vehicle_id": vehicle_id}, {"_id": 0}))
    return txns

@router.get("/vehicle-transactions/{txn_id}")
def get_transaction_by_id(txn_id: str):
    txn = transaction_collection.find_one({"_id": txn_id}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn
