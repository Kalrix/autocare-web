from fastapi import APIRouter, HTTPException, Query
from app.models.garage_hub_tag import GarageHubTagCreate
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime

router = APIRouter()


@router.post("/garage-hub-tags")
async def create_garage_hub_tags(payload: GarageHubTagCreate):
    """
    Tags a garage to multiple hubs.

    Payload:
    {
        "garage_id": "uuid",
        "hub_ids": ["uuid1", "uuid2"]
    }
    """
    if not payload.hub_ids:
        raise HTTPException(status_code=400, detail="No hub IDs provided.")

    now = datetime.utcnow()

    docs = [
        {
            "_id": str(uuid4()),
            "garage_id": str(payload.garage_id),
            "hub_id": str(hub_id),
            "created_at": now
        }
        for hub_id in payload.hub_ids
    ]

    try:
        await db.garage_hub_tags.insert_many(docs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to tag hubs: {str(e)}")

    return {"message": f"{len(docs)} hub(s) tagged to garage successfully."}


@router.put("/garage-hub-tags")
async def update_garage_hub_tags(payload: GarageHubTagCreate):
    """
    Replace all hub tags for a given garage.

    Payload:
    {
        "garage_id": "uuid",
        "hub_ids": ["uuid1", "uuid2"]
    }
    """
    if not payload.hub_ids:
        raise HTTPException(status_code=400, detail="No hub IDs provided.")

    try:
        # Delete existing tags for this garage
        await db.garage_hub_tags.delete_many({"garage_id": str(payload.garage_id)})

        # Insert new tags
        now = datetime.utcnow()
        docs = [
            {
                "_id": str(uuid4()),
                "garage_id": str(payload.garage_id),
                "hub_id": str(hub_id),
                "created_at": now
            }
            for hub_id in payload.hub_ids
        ]
        await db.garage_hub_tags.insert_many(docs)

        return {"message": f"{len(docs)} hub(s) re-tagged to garage successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


@router.get("/garage-hub-tags")
async def get_hub_tags_for_garage(garage_id: str = Query(...)):
    """
    Get all hub tags for a given garage.
    """
    tags = await db.garage_hub_tags.find({"garage_id": garage_id}).to_list(None)
    return tags
