import sqlite3

def get_connection():
    conn = sqlite3.connect("carrerForge.db")
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")    
    return conn

def init_db():
    connection = get_connection()
    
    connection.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            nome  TEXT NOT NULL,
            email TEXT NOT NULL,
            idade INTEGER,
            cargo_atual TEXT,
            objetivo_profissional TEXT
        )
    """)

    # Garante as colunas novas em bancos criados antes desses campos existirem
    colunas_novas = [
        "idade INTEGER",
        "cargo_atual TEXT",
        "objetivo_profissional TEXT",
    ]
    for coluna in colunas_novas:
        try:
            connection.execute(f"ALTER TABLE usuarios ADD COLUMN {coluna}")
        except sqlite3.OperationalError:
            pass  # coluna já existe

    connection.execute("""
        CREATE TABLE IF NOT EXISTS categorias (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria  TEXT NOT NULL UNIQUE
        )        
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS habilidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            categoria_id INTEGER NOT NULL,
            horas_por_nivel INTEGER NOT NULL,

            FOREIGN KEY (categoria_id)
                REFERENCES categorias(id)
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS pessoa_habilidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INT NOT NULL,
            habilidade_id INT NOT NULL,
            nivel_atual INTEGER NOT NULL,

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE,
            
            FOREIGN KEY (habilidade_id)
                REFERENCES habilidades(id)
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS habilidades_desejadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INT NOT NULL,
            habilidade_id INT NOT NULL,
            nivel_desejado INTEGER NOT NULL,

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE,
            
            FOREIGN KEY (habilidade_id)
                REFERENCES habilidades(id),

            UNIQUE (usuario_id, habilidade_id)
        )
    """)


    # 4. Inserção de categorias
    categorias = [
        ("Linguagem de Programação",),
        ("Banco de Dados",),
        ("Framework",),
        ("DevOps",),
        ("Cloud",),
        ("Ferramenta",),
    ]    

    connection.executemany("""
        INSERT OR IGNORE INTO categorias (categoria)
        VALUES (?)
    """, categorias)


    categorias_db = connection.execute("""
        SELECT id, categoria
        FROM categorias
    """).fetchall()

    # Inserção das habilidades
    habilidades = [
        # Linguagens de Programação
        ("Python", 1, 120),
        ("JavaScript", 1, 120),
        ("Java", 1, 150),
        ("C#", 1, 150),
        ("PHP", 1, 120),
        ("TypeScript", 1, 100),

        # Banco de Dados
        ("SQL", 2, 80),
        ("MySQL", 2, 70),
        ("PostgreSQL", 2, 80),
        ("SQL Server", 2, 80),
        ("MongoDB", 2, 90),

        # Frameworks
        ("React", 3, 100),
        ("Next.js", 3, 100),
        ("Angular", 3, 120),
        ("Vue.js", 3, 100),
        ("FastAPI", 3, 80),

        # DevOps
        ("Docker", 4, 80),
        ("Kubernetes", 4, 150),
        ("CI/CD", 4, 100),
        ("Jenkins", 4, 80),
        ("Terraform", 4, 120),

        # Cloud
        ("AWS", 5, 150),
        ("Microsoft Azure", 5, 150),
        ("Google Cloud", 5, 150),

        # Ferramentas
        ("Git", 6, 30),
        ("GitHub", 6, 30),
        ("GitLab", 6, 30),
        ("Postman", 6, 30),
        ("VS Code", 6, 20),
    ]

    connection.executemany("""
        INSERT OR IGNORE INTO habilidades (
            nome,
            categoria_id,
            horas_por_nivel
        )
        VALUES (?, ?, ?)
    """, habilidades)


    connection.commit()
    connection.close()