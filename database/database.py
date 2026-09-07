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
            email TEXT NOT NULL UNIQUE,
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

    # Garante e-mail único em bancos criados antes dessa regra existir
    connection.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)
    """)

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
                REFERENCES habilidades(id),

            UNIQUE (usuario_id, habilidade_id)
        )
    """)

    # Garante habilidade única por pessoa em bancos criados antes dessa regra existir
    connection.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_pessoa_habilidades_unica
        ON pessoa_habilidades(usuario_id, habilidade_id)
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

    # Garante habilidade desejada única por pessoa em bancos criados antes dessa regra existir
    connection.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_habilidades_desejadas_unica
        ON habilidades_desejadas(usuario_id, habilidade_id)
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
        ("HTML/CSS", 1, 60),

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
        ("Spring", 3, 120),

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
        ("Figma", 6, 50),
        ("Power BI", 6, 70),
        ("UX Research", 6, 90),
    ]

    connection.executemany("""
        INSERT OR IGNORE INTO habilidades (
            nome,
            categoria_id,
            horas_por_nivel
        )
        VALUES (?, ?, ?)
    """, habilidades)


    # Pessoas fictícias para demonstração (landing page e tela de Pessoas)
    pessoas_demo = [
        ("Ana Ribeiro", "ana.ribeiro@exemplo.com", 27, "Desenvolvedora Backend Jr.", "Backend Pleno"),
        ("Bruno Tavares", "bruno.tavares@exemplo.com", 24, "Desenvolvedor Frontend Jr.", "Frontend Pleno"),
        ("Carla Menezes", "carla.menezes@exemplo.com", 31, "Analista de Dados", "Cientista de Dados"),
        ("Diego Sampaio", "diego.sampaio@exemplo.com", 29, "Desenvolvedor Java Pleno", "Arquiteto de Software"),
        ("Helena Costa", "helena.costa@exemplo.com", 26, "Designer de Produto", "Head de Design"),
    ]

    connection.executemany("""
        INSERT OR IGNORE INTO usuarios (nome, email, idade, cargo_atual, objetivo_profissional)
        VALUES (?, ?, ?, ?, ?)
    """, pessoas_demo)

    ids_usuarios = {
        linha["email"]: linha["id"]
        for linha in connection.execute("SELECT id, email FROM usuarios").fetchall()
    }

    ids_habilidades = {
        linha["nome"]: linha["id"]
        for linha in connection.execute("SELECT id, nome FROM habilidades").fetchall()
    }

    habilidades_atuais_demo = [
        ("ana.ribeiro@exemplo.com", "Python", 3),
        ("ana.ribeiro@exemplo.com", "SQL", 2),
        ("ana.ribeiro@exemplo.com", "Docker", 1),
        ("ana.ribeiro@exemplo.com", "Git", 3),

        ("bruno.tavares@exemplo.com", "JavaScript", 4),
        ("bruno.tavares@exemplo.com", "HTML/CSS", 4),
        ("bruno.tavares@exemplo.com", "React", 2),

        ("carla.menezes@exemplo.com", "SQL", 4),
        ("carla.menezes@exemplo.com", "Power BI", 3),
        ("carla.menezes@exemplo.com", "Python", 2),

        ("diego.sampaio@exemplo.com", "Java", 3),
        ("diego.sampaio@exemplo.com", "Spring", 2),
        ("diego.sampaio@exemplo.com", "Git", 3),

        ("helena.costa@exemplo.com", "Figma", 5),
        ("helena.costa@exemplo.com", "UX Research", 4),
        ("helena.costa@exemplo.com", "HTML/CSS", 2),
    ]

    connection.executemany("""
        INSERT OR IGNORE INTO pessoa_habilidades (usuario_id, habilidade_id, nivel_atual)
        VALUES (?, ?, ?)
    """, [
        (ids_usuarios[email], ids_habilidades[habilidade], nivel)
        for email, habilidade, nivel in habilidades_atuais_demo
    ])

    habilidades_desejadas_demo = [
        ("ana.ribeiro@exemplo.com", "Python", 5),
        ("ana.ribeiro@exemplo.com", "SQL", 4),
        ("ana.ribeiro@exemplo.com", "AWS", 3),

        ("bruno.tavares@exemplo.com", "React", 4),
        ("bruno.tavares@exemplo.com", "TypeScript", 3),

        ("carla.menezes@exemplo.com", "Python", 4),
        ("carla.menezes@exemplo.com", "PostgreSQL", 3),

        ("diego.sampaio@exemplo.com", "Spring", 4),
        ("diego.sampaio@exemplo.com", "Docker", 3),

        ("helena.costa@exemplo.com", "UX Research", 5),
        ("helena.costa@exemplo.com", "HTML/CSS", 4),
    ]

    connection.executemany("""
        INSERT OR IGNORE INTO habilidades_desejadas (usuario_id, habilidade_id, nivel_desejado)
        VALUES (?, ?, ?)
    """, [
        (ids_usuarios[email], ids_habilidades[habilidade], nivel)
        for email, habilidade, nivel in habilidades_desejadas_demo
    ])


    connection.commit()
    connection.close()