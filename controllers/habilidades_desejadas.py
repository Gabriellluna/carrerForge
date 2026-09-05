from fastapi import APIRouter, HTTPException

from services.habilidades_desejadas import (
    listar_habilidades_desejadas,
    criar_habilidade_desejada
)

router = APIRouter()


@router.get("/habilidades-desejadas/{usuario_id}")
def get_habilidades_desejadas(usuario_id: int):

    habilidadesDesejadas = listar_habilidades_desejadas(usuario_id)

    return habilidadesDesejadas


@router.post("/habilidades-desejadas")
def post_habilidades_desejadas(pessoa_habilidade: dict):
    usuario_id = pessoa_habilidade.get("usuario_id")
    habilidade_id = pessoa_habilidade.get("habilidade_id")
    nivel_desejado = pessoa_habilidade.get("nivel_desejado")

    if not usuario_id or not habilidade_id or not nivel_desejado:

        raise HTTPException(
            status_code=422,
            detail="Os campos 'Usuário', 'Habilidade' e 'Nível Desejado' são obrigatórios"
        )

    return criar_habilidade_desejada(usuario_id, habilidade_id, nivel_desejado)