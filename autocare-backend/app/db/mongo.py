# app/db/mongo.py
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()  # Load variables from .env

MONGO_URI = os.getenv("MONGODB_URI")

if not MONGO_URI:
    raise ValueError("MONGODB_URI is not set in the .env file")

client = AsyncIOMotorClient(MONGO_URI)
db = client["autocare"]  # You can change the DB name if needed
