from database.database import get_connection
from fastapi import APIRouter, HTTPException

def listar_habilidades_desejadas(usuario_id: int):

    connection = get_connection()

    habilidades_desejadas = connection.execute("""
        SELECT
            hd.id,
            hd.usuario_id,
            hd.habilidade_id,
            h.nome AS habilidade,
            hd.nivel_desejado
        FROM habilidades_desejadas hd

        INNER JOIN habilidades h
            ON hd.habilidade_id = h.id

        WHERE hd.usuario_id = ?
    """, (usuario_id,)).fetchall()

    connection.close()

    return [dict(habilidade) for habilidade in habilidades_desejadas]


def criar_habilidade_desejada( usuario_id: int, habilidade_id: int, nivel_desejado: int):
    connection = get_connection()
    cursor = connection.execute(
        """
        INSERT INTO habilidades_desejadas (
            usuario_id,
            habilidade_id,
            nivel_desejado
        )
        VALUES (?, ?, ?)
        """,(usuario_id,habilidade_id,nivel_desejado)
    )
    connection.commit()
    habilidades_desejadas_id = cursor.lastrowid
    connection.close()

    return {"id": habilidades_desejadas_id, "usuario_id": usuario_id, "habilidade_id": habilidade_id, "nivel_desejado": nivel_desejado}