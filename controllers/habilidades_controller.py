from fastapi import APIRouter, HTTPException
from services.habilidades_service import (listar_habilidades)

# APIRouter agrupa as rotas num único objeto.
# Depois, no main.py, incluirmos esse router na aplicação.
router = APIRouter()

@router.get("/habilidades")
def get_habilidades():
    """Retorna a lista de todas as habilidades cadastradas."""
    return listar_habilidades()