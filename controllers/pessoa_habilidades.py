from fastapi import APIRouter, HTTPException
from services.pessoa_habilidades import (
    listar_pessoa_habilidades, 
    criar_pessoa_habilidade
)

# APIRouter agrupa as rotas num único objeto.
# Depois, no main.py, incluirmos esse router na aplicação.
router = APIRouter()

@router.get("/pessoa-habilidades/{usuario_id}")
def get_pessoa_habilidades(usuario_id: int):
    """Retorna a lista de todas as habilidades de uma pessoa cadastrada."""
    pessoaHabilidades = listar_pessoa_habilidades(usuario_id)
    if not pessoaHabilidades:
        raise HTTPException(status_code=404, detail="Habilidades dessa pessoa não encontradas")
    return pessoaHabilidades

@router.post("/pessoa-habilidades")
def post_pessoa_habilidades(pessoa_habilidade: dict):
    usuario_id = pessoa_habilidade.get("usuario_id")
    habilidade_id = pessoa_habilidade.get("habilidade_id")
    nivel_atual = pessoa_habilidade.get("nivel_atual")

    if not usuario_id or not habilidade_id or not nivel_atual:
        raise HTTPException(
            status_code=422,
            detail="Os campos 'Habilidade', 'Proficiência' e 'Nível Atual' são obrigatórios"
        )

    return criar_pessoa_habilidade(usuario_id, habilidade_id, nivel_atual)