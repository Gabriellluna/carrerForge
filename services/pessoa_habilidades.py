from database.database import get_connection

def listar_pessoa_habilidades(usuario_id: int):
    connection = get_connection()
    pessoa_habilidades = connection.execute("""
    SELECT pessoa_habilidades.nivel_atual as nivel_atual, habilidades.nome as habilidade
    FROM pessoa_habilidades
    INNER JOIN habilidades on pessoa_habilidades.habilidade_id = habilidades.id 
    where usuario_id = ? """, (usuario_id,)).fetchall()
    connection.close()
    return pessoa_habilidades

def criar_pessoa_habilidade(usuario_id: int, habilidade_id: int, nivel_atual: int):
    connection = get_connection()
    cursor = connection.execute(
        "INSERT INTO pessoa_habilidades (usuario_id, habilidade_id, nivel_atual) VALUES (?, ?, ?)",
        (usuario_id, habilidade_id, nivel_atual)
    )
    connection.commit()
    pessoa_habilidade_id = cursor.lastrowid
    connection.close()
    return {"id": pessoa_habilidade_id, "usuario_id": usuario_id, "habilidade_id": habilidade_id, "nivel_atual": nivel_atual}
