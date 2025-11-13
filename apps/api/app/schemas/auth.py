from pydantic import BaseModel, EmailStr, ConfigDict


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(extra="forbid")


class RegisterRequest(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    contact_info: dict | None = None

    model_config = ConfigDict(extra="forbid")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    employer_id: str

    model_config = ConfigDict(extra="forbid")

