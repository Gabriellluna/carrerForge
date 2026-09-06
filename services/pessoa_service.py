from database.database import get_connection

def listar_pessoas():
    """Retorna todas as pessoas cadastradas no banco."""
    connection = get_connection()
    pessoas = connection.execute(
        "SELECT id, email, nome, idade, cargo_atual, objetivo_profissional FROM usuarios ORDER BY id"
    ).fetchall()
    connection.close()
    return pessoas

def buscar_pessoa(pessoa_id: int):
    """Busca uma pessoa pelo ID. Retorna None se não encontrar."""
    connection = get_connection()
    pessoa = connection.execute(
        "SELECT * FROM usuarios WHERE id = ?", (pessoa_id,)
    ).fetchone()
    connection.close()
    return dict(pessoa) if pessoa else None

def criar_pessoa(
    nome: str,
    email: str,
    idade: int = None,
    cargo_atual: str = None,
    objetivo_profissional: str = None,
):
    """Insere uma nova pessoa e retorna os dados criados."""
    connection = get_connection()
    cursor = connection.execute(
        """
        INSERT INTO usuarios (nome, email, idade, cargo_atual, objetivo_profissional)
        VALUES (?, ?, ?, ?, ?)
        """,
        (nome, email, idade, cargo_atual, objetivo_profissional)
    )
    connection.commit()
    pessoa_id = cursor.lastrowid
    connection.close()
    return {
        "id": pessoa_id,
        "nome": nome,
        "email": email,
        "idade": idade,
        "cargo_atual": cargo_atual,
        "objetivo_profissional": objetivo_profissional,
    }

def atualizar_pessoa(
    pessoa_id: int,
    nome: str = None,
    email: str = None,
    idade: int = None,
    cargo_atual: str = None,
    objetivo_profissional: str = None,
):
    """
    Atualiza os dados da pessoa. Se um campo for None,
    mantém o valor atual do banco.
    """
    connection = get_connection()
    pessoa_atual = connection.execute(
        "SELECT * FROM usuarios WHERE id = ?", (pessoa_id,)
    ).fetchone()

    if not pessoa_atual:
        connection.close()
        return None

    novo_nome = nome if nome is not None else pessoa_atual["nome"]
    novo_email = email if email is not None else pessoa_atual["email"]
    nova_idade = idade if idade is not None else pessoa_atual["idade"]
    novo_cargo_atual = cargo_atual if cargo_atual is not None else pessoa_atual["cargo_atual"]
    novo_objetivo_profissional = (
        objetivo_profissional if objetivo_profissional is not None
        else pessoa_atual["objetivo_profissional"]
    )

    connection.execute(
        """
        UPDATE usuarios
        SET nome = ?, email = ?, idade = ?, cargo_atual = ?, objetivo_profissional = ?
        WHERE id = ?
        """,
        (novo_nome, novo_email, nova_idade, novo_cargo_atual, novo_objetivo_profissional, pessoa_id)
    )
    connection.commit()
    connection.close()
    return {
        "id": pessoa_id,
        "nome": novo_nome,
        "email": novo_email,
        "idade": nova_idade,
        "cargo_atual": novo_cargo_atual,
        "objetivo_profissional": novo_objetivo_profissional,
    }

def deletar_pessoa(pessoa_id: int):
    """Remove uma pessoa. Retorna True se removeu, False se não existe."""
    connection = get_connection()
    pessoa = connection.execute(
        "SELECT * FROM usuarios WHERE id = ?", (pessoa_id,)
    ).fetchone()

    if not pessoa:
        connection.close()
        return False

    connection.execute("DELETE FROM usuarios WHERE id = ?", (pessoa_id,))
    connection.commit()
    connection.close()
    return True