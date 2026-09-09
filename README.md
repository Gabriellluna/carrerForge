# CareerForge

Projeto acadêmico de uma API para planejamento de desenvolvimento profissional. O usuário informa quais habilidades já possui e qual nível deseja alcançar em cada uma; o sistema calcula quantas horas de estudo são necessárias e estima o tempo total considerando quantas horas por semana a pessoa consegue estudar.

## Tecnologias

- **Backend:** Python + FastAPI
- **Banco de dados:** SQLite
- **Frontend:** HTML, CSS e JavaScript puro (sem framework), consumindo a API via `fetch`

## Arquitetura

O backend é separado em camadas:

- **Controller** (`controllers/`): define as rotas e recebe as requisições HTTP.
- **Service** (`services/`): contém as regras de negócio (cálculo do roadmap, validações, etc).
- **Database** (`database/`): conexão com o SQLite e criação das tabelas.

```
carrerForge/
├── main.py                  # inicializa a API e monta as rotas
├── database/
│   └── database.py          # conexão e criação das tabelas
├── models/                  # modelos de dados (em construção)
├── controllers/
│   ├── pessoa_controller.py
│   ├── habilidades_controller.py
│   ├── pessoa_habilidades.py
│   └── habilidades_desejadas.py
├── services/
│   ├── pessoa_service.py
│   ├── habilidades_service.py
│   ├── pessoa_habilidades.py
│   └── habilidades_desejadas.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── carrerForge.db
```

## Banco de dados

| Tabela | Campos | Descrição |
|---|---|---|
| `usuarios` | id, nome, email | Pessoa que usa o sistema |
| `categorias` | id, categoria | Categoria da habilidade (Linguagem, Banco de Dados, Framework, DevOps, Cloud, Ferramenta) |
| `habilidades` | id, nome, categoria_id, horas_por_nivel | Habilidade disponível no sistema (ex: Python, Docker, AWS) |
| `pessoa_habilidades` | id, usuario_id, habilidade_id, nivel_atual | Habilidades que o usuário **já possui** (nível de 1 a 5) |
| `habilidades_desejadas` | id, usuario_id, habilidade_id, nivel_desejado | Habilidades que o usuário **quer desenvolver** (nível de 1 a 5) |

As categorias e a lista inicial de habilidades (Python, JavaScript, SQL, React, Docker, AWS, Git, etc.) já vêm cadastradas automaticamente na primeira execução.

## Regra de negócio: cálculo do roadmap

Para cada habilidade, o sistema compara o nível atual com o nível desejado:

```
horas_necessarias = (nivel_desejado - nivel_atual) × horas_por_nivel
```

As horas de todas as habilidades são somadas e divididas pelas horas de estudo por semana informadas pelo usuário, gerando uma estimativa em semanas (convertida para meses/anos).

Exemplo: Python (2→5, 100h/nível) = 300h + Docker (1→4, 80h/nível) = 240h → total 540h. Estudando 10h/semana → 54 semanas (~1 ano).

Essa lógica fica na camada **Service**, não no Controller.

## Como rodar

```bash
pip install -r requirements.txt
python main.py
```

A API sobe em `http://127.0.0.1:8000` e o frontend é servido na mesma URL (`/`).

## Endpoints da API

Todos com prefixo `/api`.

| Rota | Método | Descrição |
|---|---|---|
| `/pessoas` | GET, POST | Listar / criar pessoa |
| `/pessoas/{id}` | GET, PUT, DELETE | Buscar / atualizar / remover pessoa |
| `/habilidades` | GET | Listar habilidades disponíveis |
| `/pessoa-habilidades/{usuario_id}` | GET | Listar habilidades atuais de uma pessoa |
| `/pessoa-habilidades` | POST | Adicionar habilidade atual a uma pessoa |
| `/habilidades-desejadas/{usuario_id}` | GET | Listar habilidades desejadas de uma pessoa |
| `/habilidades-desejadas` | POST | Adicionar habilidade desejada a uma pessoa |

## Integrantes do grupo

| Nome | RM |
|---|---|
| Bruno Guilherme Gonçalves de Oliveira | RM573697 |
| Gabriel Luna Maia | RM570982 |
