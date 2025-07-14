from fastapi import APIRouter, HTTPException, Query, Body
from app.models.store_admin import StoreAdminCreate
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime
from typing import Optional

router = APIRouter()


@router.post("/store-admin")
async def create_store_admin(store: StoreAdminCreate):
    """
    Create a new store (hub or garage).
    """
    if store.type not in ["hub", "garage"]:
        raise HTTPException(status_code=400, detail="Invalid store type")

    existing = await db["store_admin"].find_one({"alias": store.alias})
    if existing:
        raise HTTPException(status_code=400, detail="Alias already exists")

    store_doc = store.dict()
    store_doc["id"] = str(uuid4())
    store_doc["name"] = (
        store.name if store.name.lower().startswith("autocare24 -")
        else f"AutoCare24 - {store.name}"
    )
    store_doc["created_at"] = datetime.utcnow()

    await db["store_admin"].insert_one(store_doc)

    return {
        "message": "Store created successfully",
        "store_id": store_doc["id"],
        "id": store_doc["id"]
    }


@router.get("/stores")
async def get_stores(type: Optional[str] = Query(None)):
    """
    Fetch all stores or filter by type (hub or garage).
    """
    if type is not None and type not in ["hub", "garage"]:
        raise HTTPException(status_code=400, detail="Invalid store type")

    query = {"type": type} if type else {}
    stores_cursor = db["store_admin"].find(query)

    stores = []
    async for store in stores_cursor:
        store["id"] = store.get("id") or str(store["_id"])
        store.pop("_id", None)
        stores.append(store)

    return stores


@router.get("/stores/{store_id}")
async def get_store_by_id(store_id: str):
    """
    Fetch a single store by its ID.
    """
    store = await db["store_admin"].find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    store["id"] = store.get("id") or str(store["_id"])
    store.pop("_id", None)
    return store


@router.put("/stores/{store_id}")
async def update_store_by_id(store_id: str, updated_data: dict = Body(...)):
    """
    Update store details by ID.
    """
    result = await db["store_admin"].update_one(
        {"id": store_id},
        {"$set": updated_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Store not found")

    return {"message": "Store updated successfully"}


@router.post("/store-admin/login")
async def store_admin_login(data: dict = Body(...)):
    """
    Login route for store (hub or garage) via alias and password.

    Expected payload:
    {
        "alias": "AC24XYZ123",
        "password": "pass123"
    }
    """
    alias = data.get("alias", "").strip()
    password = data.get("password", "").strip()

    if not alias or not password:
        raise HTTPException(status_code=400, detail="Alias and password required")

    store = await db["store_admin"].find_one({
        "alias": alias,
        "password": password
    })

    if not store:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "store_id": store["id"],
        "name": store.get("name", ""),
        "type": store.get("type", ""),
        "alias": store.get("alias", "")
    }
