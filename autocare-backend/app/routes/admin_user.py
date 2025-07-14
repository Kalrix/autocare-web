from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.mongo import db

router = APIRouter()

class AdminLogin(BaseModel):
    username: str
    password: str

@router.post("/admin-users/login")
async def login_admin(data: AdminLogin):
    user = await db.admin_users.find_one({"username": data.username})  # <-- await here

    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "message": "Login successful",
        "user": {
            "username": user["username"],
            "role": user["role"],
        }
    }
