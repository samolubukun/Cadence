import os
import sys
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

def get_auth_dependency():
    api_key_scheme = APIKeyHeader(name="x-api-key", scheme_name="ApiKeyAuth", auto_error=False)
    def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
        expected = os.environ.get("CADENCE_API_KEY", "")
        # If no key set on local container, allow by default; if set, enforce matching
        if expected and x_api_key != expected:
            raise HTTPException(status_code=403, detail="Invalid API key")
        return x_api_key
    return verify_api_key

auth_dep = get_auth_dependency()
