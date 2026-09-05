from fastapi import APIRouter, HTTPException
from services.pessoa_service import (
    listar_pessoas,
    buscar_pessoa,
    criar_pessoa,
    atualizar_pessoa,
    deletar_pessoa,
)

# APIRouter agrupa as rotas num único objeto.
# Depois, no main.py, incluirmos esse router na aplicação.
router = APIRouter()

@router.get("/pessoas")
def get_pessoas():
    """Retorna a lista de todas as pessoas cadastradas."""
    return listar_pessoas()

@router.get("/pessoas/{pessoa_id}")
def get_pessoa(pessoa_id: int):
    """Retorna os dados de uma pessoa específica."""
    pessoa = buscar_pessoa(pessoa_id)
    if not pessoa:
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")
    return pessoa

@router.post("/pessoas")
def post_pessoa(pessoa: dict):
    nome = pessoa.get("nome")
    email = pessoa.get("email")
    if not nome or not email:
        raise HTTPException(
            status_code=422,
            detail="Os campos 'nome' e 'email' são obrigatórios"
        )

    return criar_pessoa(nome, email)

@router.put("/pessoas/{pessoa_id}")
def put_pessoa(pessoa_id: int, pessoa: dict):
    """Atualiza os dados de uma pessoa existente."""
    nome = pessoa.get("nome")
    email = pessoa.get("email")

    resultado = atualizar_pessoa(pessoa_id, nome, email)
    if not resultado:
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")
    return resultado

@router.delete("/pessoas/{pessoa_id}")
def delete_pessoa(pessoa_id: int):
    """Remove uma pessoa do sistema."""
    if not deletar_pessoa(pessoa_id):
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")
    return {"message": "Pessoa removida com sucesso"}