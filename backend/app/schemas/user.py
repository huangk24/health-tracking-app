# User schema placeholder
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    sex: str
    age: int
    height: int
    weight: int

class UserRead(BaseModel):
    id: int
    username: str
    sex: str
    age: int
    height: int
    weight: int
