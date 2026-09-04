// URL base da API
const API_PESSOAS = '/api/pessoas';
const API_HABILIDADES = '/api/habilidades';

// ===== CARREGAR AO ABRIR A PÁGINA =====
document.addEventListener('DOMContentLoaded', () => {
    carregarPessoas();
});

// ===== FUNÇÕES DA API =====

// Busca todas as pessoas na API e renderiza na tela
async function carregarPessoas() {
    const container = document.getElementById('lista-pessoas');

    try {
        const resposta = await fetch(API_PESSOAS, { method: 'GET' });
        const pessoas = await resposta.json();
        console.log(pessoas)

        if (pessoas.length === 0) {
            container.innerHTML = '<p class="empty-text">Nenhuma pessoa cadastrada ainda. Clique em "Cadastrar Pessoa" para começar.</p>';
            return;
        }

        // Monta o HTML de cada pessoa como um card
        container.innerHTML = pessoas.map(pessoa => `
            <div class="pessoa-card">
                <div class="pessoa-info">
                    <div class="pessoa-nome">${pessoa.nome}</div>
                    <div class="pessoa-email">${pessoa.email}</div>
                    <span class="pessoa-id">ID: ${pessoa.id}</span>
                </div>
                <div class="pessoa-acoes">
                    <button class="btn-icone danger" onclick="excluirPessoa(${pessoa.id})">Excluir</button>
                </div>
            </div>
        `).join('');

    } catch (erro) {
        container.innerHTML = '<p class="empty-text">Erro ao carregar pessoas. Verifique se a API está rodando.</p>';
        console.error('Erro:', erro);
    }
}

// Envia uma nova pessoa para a API
async function salvarPessoa() {
    const nome = document.getElementById('input-nome').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const habilidade = document.getElementById('select-habilidade').value;
    const proficiencia = document.getElementById('select-proficiencia').value;
    const erroEl = document.getElementById('form-erro');

    console.log("habilidade e proficienccia: ", habilidade, proficiencia)

    const resposta = await fetch(API_HABILIDADES, { method: 'GET' });
    const habilidades = await resposta.json();
    console.log(habilidades)

    // Validação simples: campos não podem estar vazios
    // if (!nome || !email) {
    //     erroEl.textContent = 'Preencha todos os campos.';
    //     erroEl.classList.add('ativo');
    //     return;
    // }

    // try {
    //     const resposta = await fetch(API_PESSOAS, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ nome, email })
    //     });

    //     if (!resposta.ok) {
    //         const dados = await resposta.json();
    //         throw new Error(dados.detail || 'Erro ao cadastrar');
    //     }

    //     // Sucesso: fecha o modal e recarrega a lista
    //     fecharModal();
    //     carregarPessoas();

    // } catch (erro) {
    //     erroEl.textContent = 'Erro: ' + erro.message;
    //     erroEl.classList.add('ativo');
    // }
}

// Exclui uma pessoa
async function excluirPessoa(id) {
    if (!confirm('Tem certeza que deseja excluir esta pessoa?')) return;

    try {
        await fetch(`${API_PESSOAS}/${id}`, { method: 'DELETE' });
        carregarPessoas();
    } catch (erro) {
        alert('Erro ao excluir pessoa.');
        console.error('Erro:', erro);
    }
}

// ===== CONTROLE DO MODAL =====

// Abre o modal com o formulário correspondente ao tipo
function abrirModal(tipo) {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modal-titulo');
    const conteudo = document.getElementById('modal-conteudo');

    if (tipo === 'pessoa') {
        titulo.textContent = 'Cadastrar Pessoa';
        conteudo.innerHTML = `
        <div class="form-grupo">
            <label class="form-label" for="input-nome">Nome</label>
            <input 
                type="text" 
                id="input-nome" 
                class="form-input"
                placeholder="Ex: Gabriel Silva" 
                maxlength="100"
            >
        </div>

        <div class="form-grupo">
            <label class="form-label" for="input-email">E-mail</label>
            <input 
                type="email" 
                id="input-email" 
                class="form-input"
                placeholder="Ex: gabriel@email.com" 
                maxlength="150"
            >
        </div>

        <div class="habilidades-container">

            <p class="habilidades-mensagem">
                Insira aqui uma habilidade sua e sua respectiva proficiência
            </p>

            <div class="habilidade-linha">

                <select id="select-habilidade" class="form-select">
                    <option value="">Selecione uma habilidade</option>
                    <option value="1">Python</option>
                    <option value="2">JavaScript</option>
                    <option value="3">SQL</option>
                    <option value="4">React</option>
                    <option value="5">Docker</option>
                    <option value="6">Git</option>
                </select>

                <select id="select-proficiencia" class="form-select">
                    <option value="">Proficiência</option>
                    <option value="1">1 - Iniciante</option>
                    <option value="2">2 - Básico</option>
                    <option value="3">3 - Intermediário</option>
                    <option value="4">4 - Avançado</option>
                    <option value="5">5 - Especialista</option>
                </select>

            </div>

        </div>

        <div id="form-erro" class="form-erro"></div>

        <div class="form-botoes">
            <button 
                class="btn-cancelar" 
                onclick="fecharModal()"
            >
                Cancelar
            </button>

            <button 
                class="btn-salvar" 
                onclick="salvarPessoa()"
            >
                Salvar
            </button>
        </div>
    `;
    }
    // Aqui depois adicionaremos os outros tipos: 'habilidade', 'objetivo'

    overlay.classList.add('ativo');
    modal.classList.add('ativo');
}

// Fecha o modal e limpa o conteúdo
function fecharModal() {
    document.getElementById('overlay').classList.remove('ativo');
    document.getElementById('modal').classList.remove('ativo');
    document.getElementById('modal-conteudo').innerHTML = '';
}

// ===== NAVEGAÇÃO ENTRE SEÇÕES =====

function mostrarSecao(secao) {
    // Por enquanto só temos a seção de pessoas
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}