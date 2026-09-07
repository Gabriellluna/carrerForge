import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from controllers.pessoa_controller import router as pessoa_router
from controllers.habilidades_controller import router as habilidades_router
from controllers.pessoa_habilidades import router as pessoa_habilidades_router
from controllers.habilidades_desejadas import router as habilidades_desejadas_router
from database.database import init_db

app = FastAPI(title="CareerForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pessoa_router, prefix="/api")
app.include_router(habilidades_router, prefix="/api")
app.include_router(pessoa_habilidades_router, prefix="/api")
app.include_router(habilidades_desejadas_router, prefix="/api")

app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
def read_root():
    """Acessar http://127.0.0.1:8000/ retorna a landing page."""
    return FileResponse("frontend/landing.html")

@app.get("/app")
def read_app():
    """Acessar http://127.0.0.1:8000/app retorna o sistema (CRUD)."""
    return FileResponse("frontend/index.html")

# Inicializa o banco (cria a tabela se não existir)
init_db()

# Roda o servidor: python main.py
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)