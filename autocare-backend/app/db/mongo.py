# app/db/mongo.py

from motor.motor_asyncio import AsyncIOMotorClient
import os

# ✅ Load from .env only in local environment
if os.getenv("ENV", "local") == "local":
    from dotenv import load_dotenv
    load_dotenv()

# ✅ Support both MONGO_URI and MONGODB_URI
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")

if not MONGO_URI:
    raise ValueError("❌ MongoDB URI not found. Set either MONGO_URI or MONGODB_URI.")

# ✅ Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client["autocare"]
