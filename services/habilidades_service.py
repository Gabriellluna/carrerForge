from database.database import get_connection

def listar_habilidades():
    """Retorna todas as habilidades cadastradas no banco."""
    connection = get_connection()
    habilidades = connection.execute("SELECT * FROM habilidades ORDER BY id").fetchall()
    connection.close()
    return habilidades