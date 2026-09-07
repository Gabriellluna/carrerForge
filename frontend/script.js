const API_PESSOAS = '/api/pessoas';
const API_HABILIDADES = '/api/habilidades';
const API_PESSOA_HABILIDADES = '/api/pessoa-habilidades';
const API_HABILIDADES_DESEJADAS = '/api/habilidades-desejadas';

// A API não retorna o nome da categoria, só o categoria_id — mapeado aqui na mesma ordem do seed em database.py
const CATEGORIAS_HABILIDADE = {
    1: 'Linguagem de Programação',
    2: 'Banco de Dados',
    3: 'Framework',
    4: 'DevOps',
    5: 'Cloud',
    6: 'Ferramenta'
};

let habilidadesSelecionadas = [];
let habilidadesDesejadas = [];
let habilidadesDesejadasExistentesIds = [];
let habilidadesExistentesIds = [];
let habilidadesCatalogo = [];
let habilidadesAtuaisMapa = {};
let usuarioAtualId = null;
let pessoaEmEdicaoId = null;

document.addEventListener(
    'DOMContentLoaded',
    () => {

        carregarPessoas();

    }
);

async function carregarPessoas() {
    const container = document.getElementById('lista-pessoas');
    const contador = document.getElementById('pessoas-contador');
    try {
        const resposta = await fetch(API_PESSOAS, { method: 'GET' });
        if (!resposta.ok) {
            throw new Error('Erro ao buscar pessoas');
        }

        const pessoas = await resposta.json();
        if (pessoas.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-text">
                        Nenhuma pessoa cadastrada ainda.
                        Clique em "Cadastrar Pessoa"
                        para começar.
                    </td>
                </tr>
            `;
            contador.textContent = '0 pessoas cadastradas';

            return;
        }


        container.innerHTML =
            pessoas.map(
                pessoa => `

                    <tr
                        data-nome="${pessoa.nome.toLowerCase()}"
                        data-email="${pessoa.email.toLowerCase()}"
                    >
                        <td>${pessoa.nome}</td>
                        <td>${pessoa.email}</td>
                        <td>${pessoa.id}</td>
                        <td>${pessoa.idade ?? '-'}</td>
                        <td>${pessoa.cargo_atual || '-'}</td>
                        <td>${pessoa.objetivo_profissional || '-'}</td>
                        <td>

                            <div class="pessoa-acoes">

                                <button
                                    class="btn-icone"
                                    onclick="abrirEdicaoPessoa(${pessoa.id})"
                                >
                                    Editar
                                </button>


                                <button
                                    class="btn-icone roadmap"
                                    onclick="abrirRoadmap(${pessoa.id})"
                                >
                                    Roadmap
                                </button>


                                <button
                                    class="btn-icone danger"
                                    onclick="excluirPessoa(${pessoa.id})"
                                    title="Excluir"
                                >
                                    ×
                                </button>

                            </div>

                        </td>
                    </tr>

                `
            ).join('');

        contador.textContent =
            pessoas.length === 1
                ? '1 pessoa cadastrada'
                : `${pessoas.length} pessoas cadastradas`;


    } catch (erro) {

        container.innerHTML = `
            <tr>
                <td colspan="7" class="empty-text">
                    Erro ao carregar pessoas.
                    Verifique se a API está rodando.
                </td>
            </tr>
        `;

        console.error(
            'Erro:',
            erro
        );

    }
}

function filtrarPessoas() {

    const termo =
        document.getElementById('input-busca-pessoa')
            .value.trim().toLowerCase();

    const linhas =
        document.querySelectorAll('#lista-pessoas tr[data-nome]');

    linhas.forEach(linha => {
        const corresponde =
            linha.dataset.nome.includes(termo) ||
            linha.dataset.email.includes(termo);

        linha.hidden = !corresponde;
    });

}

async function carregarHabilidadesCatalogo() {
    const container = document.getElementById('lista-habilidades');
    try {
        const resposta = await fetch(API_HABILIDADES, { method: 'GET' });
        if (!resposta.ok) {
            throw new Error('Erro ao buscar habilidades');
        }

        const habilidades = await resposta.json();
        if (habilidades.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-text">
                        Nenhuma habilidade cadastrada ainda.
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML =
            habilidades.map(
                habilidade => `

                    <tr>
                        <td>${habilidade.nome}</td>
                        <td>${CATEGORIAS_HABILIDADE[habilidade.categoria_id] || '-'}</td>
                        <td>${habilidade.horas_por_nivel} h</td>
                        <td>${habilidade.horas_por_nivel} h</td>
                    </tr>

                `
            ).join('');

    } catch (erro) {

        container.innerHTML = `
            <tr>
                <td colspan="4" class="empty-text">
                    Erro ao carregar habilidades.
                    Verifique se a API está rodando.
                </td>
            </tr>
        `;

        console.error(
            'Erro:',
            erro
        );

    }
}

async function salvarPessoa() {

    const nome = document.getElementById('input-nome').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const idade = document.getElementById('input-idade').value;
    const cargoAtual = document.getElementById('input-cargo-atual').value.trim();
    const objetivoProfissional = document.getElementById('input-objetivo-profissional').value.trim();
    const erroEl = document.getElementById('form-erro');

    if (!nome || !email) {
        erroEl.textContent = 'Preencha nome e e-mail.';
        erroEl.classList.add('ativo');
        return;
    }

    if (habilidadesSelecionadas.length === 0) {
        erroEl.textContent = 'Adicione pelo menos uma habilidade.';
        erroEl.classList.add('ativo');
        return;
    }


    try {
        const resposta = await fetch(API_PESSOAS,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    email,
                    idade: idade ? Number(idade) : null,
                    cargo_atual: cargoAtual || null,
                    objetivo_profissional: objetivoProfissional || null
                })
            }
        );
        if (!resposta.ok) {
            const dados = await resposta.json();
            throw new Error(dados.detail || 'Erro ao cadastrar usuário');
        }

        const usuario = await resposta.json();
        const usuarioId = usuario.id;
        usuarioAtualId = usuarioId;
        for (const habilidade of habilidadesSelecionadas) {
            const respostaHabilidade =
                await fetch(API_PESSOA_HABILIDADES,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuario_id: usuarioId, habilidade_id: habilidade.habilidade_id, nivel_atual: habilidade.nivel_atual })
                    }
                );

            if (!respostaHabilidade.ok) {
                const dados =
                    await respostaHabilidade.json();
                throw new Error(dados.detail || 'Erro ao cadastrar habilidade');
            }
        }
        fecharModal();
        await carregarPessoas();
        await abrirRoadmap(usuarioId);
    } catch (erro) {
        erroEl.textContent = 'Erro: ' + erro.message;
        erroEl.classList.add('ativo');
    }
}

async function excluirPessoa(id) {
    if (!confirm('Tem certeza que deseja excluir esta pessoa?')
    ) { return; }


    try {
        const resposta = await fetch(
            `${API_PESSOAS}/${id}`,
            { method: 'DELETE' }
        );

        if (!resposta.ok) {
            throw new Error('Erro ao excluir pessoa');
        }
        if (usuarioAtualId === id) {
            usuarioAtualId = null;
        }


        await carregarPessoas();


    } catch (erro) {

        alert(
            'Erro ao excluir pessoa.'
        );

        console.error(
            'Erro:',
            erro
        );

    }

}

async function abrirEdicaoPessoa(id) {
    try {
        const resposta = await fetch(`${API_PESSOAS}/${id}`);
        if (!resposta.ok) {
            throw new Error('Erro ao buscar pessoa');
        }

        const pessoa = await resposta.json();

        const respostaHabilidades = await fetch(`${API_PESSOA_HABILIDADES}/${id}`);
        const habilidadesExistentes =
            respostaHabilidades.ok ? await respostaHabilidades.json() : [];

        abrirModal('editar-pessoa', pessoa, habilidadesExistentes);

    } catch (erro) {
        alert('Erro ao carregar dados da pessoa.');
        console.error('Erro:', erro);
    }
}

async function salvarEdicaoPessoa() {

    const nome = document.getElementById('input-nome-editar').value.trim();
    const email = document.getElementById('input-email-editar').value.trim();
    const idade = document.getElementById('input-idade-editar').value;
    const cargoAtual = document.getElementById('input-cargo-atual-editar').value.trim();
    const objetivoProfissional = document.getElementById('input-objetivo-profissional-editar').value.trim();
    const erroEl = document.getElementById('form-erro');

    if (!nome || !email) {
        erroEl.textContent = 'Preencha nome e e-mail.';
        erroEl.classList.add('ativo');
        return;
    }

    try {
        const resposta = await fetch(
            `${API_PESSOAS}/${pessoaEmEdicaoId}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    email,
                    idade: idade ? Number(idade) : null,
                    cargo_atual: cargoAtual || null,
                    objetivo_profissional: objetivoProfissional || null
                })
            }
        );

        if (!resposta.ok) {
            const dados = await resposta.json();
            throw new Error(dados.detail || 'Erro ao atualizar pessoa');
        }

        for (const habilidade of habilidadesSelecionadas) {
            const respostaHabilidade =
                await fetch(API_PESSOA_HABILIDADES,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuario_id: pessoaEmEdicaoId, habilidade_id: habilidade.habilidade_id, nivel_atual: habilidade.nivel_atual })
                    }
                );

            if (!respostaHabilidade.ok) {
                const dados = await respostaHabilidade.json();
                throw new Error(dados.detail || 'Erro ao cadastrar habilidade');
            }
        }

        fecharModal();
        await carregarPessoas();

    } catch (erro) {
        erroEl.textContent = 'Erro: ' + erro.message;
        erroEl.classList.add('ativo');
    }
}

function abrirModal(tipo, pessoa, habilidadesExistentes) {

    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modal-titulo');
    const subtitulo = document.getElementById('modal-subtitulo');
    const conteudo = document.getElementById('modal-conteudo');

    if (tipo === 'editar-pessoa') {
        pessoaEmEdicaoId = pessoa.id;
        habilidadesSelecionadas = [];
        habilidadesExistentesIds = habilidadesExistentes.map(habilidade => habilidade.habilidade_id);

        titulo.textContent = 'Editar pessoa';
        subtitulo.textContent = `ID ${pessoa.id} · alterações afetam o roadmap salvo.`;
        conteudo.innerHTML = `

            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-nome-editar"
                >
                    Nome
                </label>

                <input
                    type="text"
                    id="input-nome-editar"
                    class="form-input"
                    value="${pessoa.nome}"
                    maxlength="100"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-email-editar"
                >
                    E-mail
                </label>

                <input
                    type="email"
                    id="input-email-editar"
                    class="form-input"
                    value="${pessoa.email}"
                    maxlength="150"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-idade-editar"
                >
                    Idade
                </label>

                <input
                    type="number"
                    id="input-idade-editar"
                    class="form-input"
                    value="${pessoa.idade ?? ''}"
                    min="1"
                    max="120"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-cargo-atual-editar"
                >
                    Cargo atual
                </label>

                <input
                    type="text"
                    id="input-cargo-atual-editar"
                    class="form-input"
                    value="${pessoa.cargo_atual ?? ''}"
                    placeholder="Ex: Dev Júnior"
                    maxlength="100"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-objetivo-profissional-editar"
                >
                    Objetivo profissional
                </label>

                <input
                    type="text"
                    id="input-objetivo-profissional-editar"
                    class="form-input"
                    value="${pessoa.objetivo_profissional ?? ''}"
                    placeholder="Ex: Backend"
                    maxlength="150"
                >

            </div>


            <div class="habilidades-container">

                <div class="habilidades-cabecalho">
                    <span class="habilidades-titulo">Habilidades atuais</span>
                    <span class="habilidades-dica">nível de 1 a 5</span>
                </div>

                <div id="lista-habilidades-existentes"></div>

                <div
                    id="lista-habilidades-selecionadas"
                    class="lista-habilidades-selecionadas"
                ></div>

                <div class="picker-habilidade">

                    <select id="select-habilidade" class="form-select">
                        <option value="">Selecione uma habilidade</option>
                    </select>

                    <select id="select-proficiencia" class="form-select">
                        <option value="1">Nível 1</option>
                        <option value="2">Nível 2</option>
                        <option value="3">Nível 3</option>
                        <option value="4">Nível 4</option>
                        <option value="5">Nível 5</option>
                    </select>

                </div>

                <button
                    type="button"
                    class="btn-adicionar-dashed"
                    onclick="adicionarHabilidade()"
                >
                    + Adicionar habilidade
                </button>

            </div>


            <div
                id="form-erro"
                class="form-erro"
            ></div>


            <div class="form-botoes">

                <button
                    class="btn-cancelar"
                    onclick="fecharModal()"
                >
                    Cancelar
                </button>


                <button
                    class="btn-salvar"
                    onclick="salvarEdicaoPessoa()"
                >
                    Salvar alterações
                </button>

            </div>

        `;

        carregarHabilidades(habilidadesExistentesIds);
        renderHabilidadesExistentes(habilidadesExistentes);
        renderizarHabilidadesSelecionadas();

        overlay.classList.add('ativo');
        modal.classList.add('ativo');
        return;
    }

    if (tipo === 'pessoa') {
        habilidadesSelecionadas = [];
        habilidadesExistentesIds = [];

        titulo.textContent = 'Nova pessoa';
        subtitulo.textContent = 'Nome, e-mail e as habilidades que a pessoa já domina.';
        conteudo.innerHTML = `

            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-nome"
                >
                    Nome
                </label>

                <input
                    type="text"
                    id="input-nome"
                    class="form-input"
                    placeholder="Ex: Gabriel Silva"
                    maxlength="100"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-email"
                >
                    E-mail
                </label>

                <input
                    type="email"
                    id="input-email"
                    class="form-input"
                    placeholder="Ex: gabriel@email.com"
                    maxlength="150"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-idade"
                >
                    Idade
                </label>

                <input
                    type="number"
                    id="input-idade"
                    class="form-input"
                    placeholder="Ex: 24"
                    min="1"
                    max="120"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-cargo-atual"
                >
                    Cargo atual
                </label>

                <input
                    type="text"
                    id="input-cargo-atual"
                    class="form-input"
                    placeholder="Ex: Dev Júnior"
                    maxlength="100"
                >

            </div>


            <div class="form-grupo">

                <label
                    class="form-label"
                    for="input-objetivo-profissional"
                >
                    Objetivo profissional
                </label>

                <input
                    type="text"
                    id="input-objetivo-profissional"
                    class="form-input"
                    placeholder="Ex: Backend"
                    maxlength="150"
                >

            </div>


            <div class="habilidades-container">

                <div class="habilidades-cabecalho">
                    <span class="habilidades-titulo">Habilidades atuais</span>
                    <span class="habilidades-dica">nível de 1 a 5</span>
                </div>

                <div
                    id="lista-habilidades-selecionadas"
                    class="lista-habilidades-selecionadas"
                ></div>

                <div class="picker-habilidade">

                    <select id="select-habilidade" class="form-select">
                        <option value="">Selecione uma habilidade</option>
                    </select>

                    <select id="select-proficiencia" class="form-select">
                        <option value="1">Nível 1</option>
                        <option value="2">Nível 2</option>
                        <option value="3">Nível 3</option>
                        <option value="4">Nível 4</option>
                        <option value="5">Nível 5</option>
                    </select>

                </div>

                <button
                    type="button"
                    class="btn-adicionar-dashed"
                    onclick="adicionarHabilidade()"
                >
                    + Adicionar habilidade
                </button>

            </div>


            <div
                id="form-erro"
                class="form-erro"
            ></div>


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
                    Cadastrar
                </button>

            </div>

        `;
        carregarHabilidades();
        renderizarHabilidadesSelecionadas();

    }


    overlay.classList.add(
        'ativo'
    );

    modal.classList.add(
        'ativo'
    );

}

async function carregarHabilidades(excluirIds = []) {

    const select = document.getElementById('select-habilidade');

    if (!select) {
        return;
    }

    try {
        const resposta = await fetch(API_HABILIDADES);

        if (!resposta.ok) {
            throw new Error('Erro ao carregar habilidades');
        }

        const habilidades = await resposta.json();

        habilidades
            .filter(habilidade => !excluirIds.includes(habilidade.id))
            .forEach(habilidade => {
                const option = document.createElement('option');
                option.value = habilidade.id;
                option.textContent = habilidade.nome;
                select.appendChild(option);
            });

    } catch (erro) {
        console.error('Erro ao carregar habilidades:', erro);
    }

}

function renderHabilidadesExistentes(lista) {

    const container = document.getElementById('lista-habilidades-existentes');

    if (!container) {
        return;
    }

    if (lista.length === 0) {
        container.innerHTML = `
            <p class="lista-vazia">
                Nenhuma habilidade cadastrada ainda.
            </p>
        `;
        return;
    }

    container.innerHTML =
        lista.map(habilidade => `

            <div class="adicionar-habilidade">

                <input type="text" class="form-input" value="${habilidade.habilidade}" disabled>

                <input type="text" class="form-input" value="Nível ${habilidade.nivel_atual}" disabled>

                <button
                    type="button"
                    class="btn-remover-habilidade"
                    disabled
                    title="Remoção de habilidades ainda não disponível"
                >
                    ×
                </button>

            </div>

        `).join('');

}

function adicionarHabilidade() {

    const selectHabilidade = document.getElementById('select-habilidade');
    const selectProficiencia = document.getElementById('select-proficiencia');
    const habilidadeId = Number(selectHabilidade.value);
    const nivelAtual = Number(selectProficiencia.value);
    const erroEl = document.getElementById('form-erro');
    if (!habilidadeId) {
        erroEl.textContent = 'Selecione uma habilidade.';
        erroEl.classList.add('ativo');
        return;
    }


    const habilidadeJaExiste =
        habilidadesSelecionadas.some(
            habilidade =>
                habilidade.habilidade_id ===
                habilidadeId
        );


    if (habilidadeJaExiste) {

        erroEl.textContent =
            'Essa habilidade já foi adicionada.';

        erroEl.classList.add(
            'ativo'
        );

        return;
    }


    const habilidadeNome =
        selectHabilidade
            .options[
            selectHabilidade.selectedIndex
        ]
            .text;


    const proficienciaTexto =
        selectProficiencia
            .options[
            selectProficiencia.selectedIndex
        ]
            .text;


    habilidadesSelecionadas.push({

        habilidade_id:
            habilidadeId,

        nivel_atual:
            nivelAtual,

        nome:
            habilidadeNome,

        proficienciaTexto:
            proficienciaTexto

    });


    renderizarHabilidadesSelecionadas();


    selectHabilidade.value =
        '';

    selectProficiencia.value =
        '1';


    erroEl.textContent =
        '';

    erroEl.classList.remove(
        'ativo'
    );

}

function removerHabilidade(index) {

    habilidadesSelecionadas.splice(
        index,
        1
    );


    renderizarHabilidadesSelecionadas();

}

function renderizarHabilidadesSelecionadas() {

    const container =
        document.getElementById(
            'lista-habilidades-selecionadas'
        );


    if (!container) {
        return;
    }


    if (
        habilidadesSelecionadas.length === 0
    ) {

        container.innerHTML = `

            <p class="lista-vazia">
                Nenhuma habilidade adicionada ainda.
            </p>

        `;

        return;
    }


    container.innerHTML =
        habilidadesSelecionadas
            .map(
                (habilidade, index) => `

                    <div class="adicionar-habilidade">

                        <input type="text" class="form-input" value="${habilidade.nome}" disabled>

                        <input type="text" class="form-input" value="${habilidade.proficienciaTexto}" disabled>

                        <button
                            type="button"
                            class="btn-remover-habilidade"
                            onclick="removerHabilidade(${index})"
                        >
                            ×
                        </button>

                    </div>

                `
            )
            .join('');

}

async function abrirRoadmap(usuarioId) {
    usuarioAtualId = usuarioId;
    habilidadesDesejadas = [];

    mostrarSecao('roadmap');

    try {
        await carregarPerfilRoadmap(usuarioId);
        await carregarHabilidadesAtuais(usuarioId);
        await carregarHabilidadesRoadmap();
        await carregarHabilidadesDesejadas(usuarioId);
    } catch (erro) {
        console.error(
            'Erro ao abrir Roadmap:',
            erro
        );

    }

}

async function carregarPerfilRoadmap(
    usuarioId
) {

    const container =
        document.getElementById(
            'roadmap-perfil'
        );


    try {

        const resposta =
            await fetch(
                API_PESSOAS
            );


        if (!resposta.ok) {

            throw new Error(
                'Erro ao carregar pessoas'
            );

        }


        const pessoas =
            await resposta.json();


        const usuario =
            pessoas.find(
                pessoa =>
                    pessoa.id ===
                    usuarioId
            );


        if (!usuario) {

            throw new Error(
                'Usuário não encontrado'
            );

        }


        container.innerHTML = `

            <div class="avatar-pessoa">
                ${obterIniciais(usuario.nome)}
            </div>

            <div>

                <div class="perfil-nome">
                    ${usuario.nome}
                </div>

                <div class="perfil-email">
                    ${usuario.email} · ID ${usuario.id}
                </div>

            </div>

        `;


    } catch (erro) {

        container.innerHTML = `

            <p class="lista-vazia">
                Não foi possível carregar o perfil.
            </p>

        `;

        throw erro;

    }

}

async function carregarHabilidadesAtuais(usuarioId) {

    const container = document.getElementById('roadmap-habilidades-atuais');
    try {
        const resposta = await fetch(`${API_PESSOA_HABILIDADES}/${usuarioId}`);
        if (!resposta.ok) {
            if (resposta.status === 404) {
                habilidadesAtuaisMapa = {};
                container.innerHTML = `
                    <p class="lista-vazia">
                        Nenhuma habilidade cadastrada.
                    </p>
                `;
                return;
            }
            throw new Error('Erro ao carregar habilidades atuais');
        }

        const habilidades = await resposta.json();

        habilidadesAtuaisMapa = {};
        habilidades.forEach(habilidade => {
            habilidadesAtuaisMapa[habilidade.habilidade_id] = habilidade.nivel_atual;
        });

        if (habilidades.length === 0) {
            container.innerHTML = `
                <p class="lista-vazia">
                    Nenhuma habilidade cadastrada.
                </p>
            `;

            return;
        }


        container.innerHTML =
            habilidades.map(habilidade => {
                const nome = habilidade.habilidade || habilidade.nome || 'Habilidade';
                const nivel = habilidade.nivel_atual;
                return `

                            <div class="perfil-habilidade">

                                <strong>
                                    ${nome}
                                </strong>

                                <div class="pontos-nivel">
                                    ${pontosNivel(nivel)}
                                </div>

                                <span>
                                    nível ${nivel}
                                </span>

                            </div>

                        `;

            }
            )
                .join('');


    } catch (erro) {
        console.error('Erro ao carregar habilidades atuais:', erro);
        container.innerHTML = `
            <p class="lista-vazia">
                Erro ao carregar habilidades.
            </p>
        `;

    }

}

async function carregarHabilidadesRoadmap() {

    const select =
        document.getElementById(
            'select-habilidade-desejada'
        );


    select.innerHTML = `

        <option value="">
            Selecione uma habilidade
        </option>

    `;


    const resposta =
        await fetch(
            API_HABILIDADES
        );


    if (!resposta.ok) {

        throw new Error(
            'Erro ao carregar habilidades'
        );

    }


    const habilidades =
        await resposta.json();

    habilidadesCatalogo = habilidades;

    habilidades.forEach(
        habilidade => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                habilidade.id;


            option.textContent =
                habilidade.nome;


            select.appendChild(
                option
            );

        }
    );

}

function adicionarHabilidadeDesejada() {

    const selectHabilidade = document.getElementById('select-habilidade-desejada');
    const selectNivel = document.getElementById('select-nivel-desejado');
    const erroEl = document.getElementById('roadmap-erro');
    const habilidadeId = Number(selectHabilidade.value);
    const nivelDesejado = Number(selectNivel.value);
    if (!habilidadeId || !nivelDesejado) {
        erroEl.textContent = 'Selecione uma habilidade e um nível desejado.';
        erroEl.classList.add('ativo');
        return;
    }


    const habilidadeJaExiste =
        habilidadesDesejadas.some(
            habilidade =>
                habilidade.habilidade_id ===
                habilidadeId
        );


    if (habilidadeJaExiste) {

        erroEl.textContent = 'Essa habilidade já foi adicionada.';

        erroEl.classList.add('ativo');

        return;
    }


    const habilidadeNome = selectHabilidade.options[selectHabilidade.selectedIndex].text;
    habilidadesDesejadas.push({
        habilidade_id: habilidadeId,
        nivel_desejado: nivelDesejado,
        nome: habilidadeNome
    });
    renderizarHabilidadesDesejadas();
    recalcularEstimativa();
    selectHabilidade.value = '';
    selectNivel.value = '1';
    erroEl.textContent = '';
    erroEl.classList.remove('ativo');

}
function removerHabilidadeDesejada(index) {
    habilidadesDesejadas.splice(index, 1);

    renderizarHabilidadesDesejadas();
    recalcularEstimativa();

}

function calcularItemDesejado(item) {

    const habilidade = habilidadesCatalogo.find(h => h.id === item.habilidade_id);
    const nivelAtual = habilidadesAtuaisMapa[item.habilidade_id] || 0;
    const horasPorNivel = habilidade ? habilidade.horas_por_nivel : 0;
    const horas = Math.max(item.nivel_desejado - nivelAtual, 0) * horasPorNivel;

    return { nivelAtual, horas };

}

function renderizarHabilidadesDesejadas() {

    const container =
        document.getElementById('lista-habilidades-desejadas');

    if (habilidadesDesejadas.length === 0) {

        container.innerHTML = `

            <p class="lista-vazia">
                Nenhuma habilidade desejada adicionada.
            </p>

        `;

        return;
    }

    const horasPorSemana = Number(document.getElementById('input-horas-semana').value) || 0;

    container.innerHTML =
        habilidadesDesejadas
            .map(
                (habilidade, index) => {

                    const { nivelAtual, horas } = calcularItemDesejado(habilidade);
                    const semanas = horasPorSemana > 0 ? Math.ceil(horas / horasPorSemana) : 0;

                    return `

                        <div class="linha-desejada">

                            <div class="linha-desejada-info">

                                <strong>
                                    ${habilidade.nome}
                                </strong>

                                <span>
                                    nível ${nivelAtual} → ${habilidade.nivel_desejado}
                                </span>

                            </div>

                            <div class="pontos-nivel">
                                ${pontosNivel(habilidade.nivel_desejado)}
                            </div>

                            <div class="linha-desejada-horas">

                                <strong>
                                    ${horas} h
                                </strong>

                                <span>
                                    ${semanas > 0 ? '≈ ' + formatarDuracao(semanas) : '—'}
                                </span>

                            </div>

                            <button
                                type="button"
                                class="btn-remover-habilidade"
                                onclick="removerHabilidadeDesejada(${index})"
                            >
                                ×
                            </button>

                        </div>

                    `;
                }
            )
            .join('');

}

async function salvarHabilidadesDesejadas() {

    const erroEl = document.getElementById('roadmap-erro');

    if (!usuarioAtualId) {
        erroEl.textContent = 'Nenhum usuário selecionado.';
        erroEl.classList.add('ativo');
        return;
    }

    if (habilidadesDesejadas.length === 0) {
        erroEl.textContent = 'Adicione pelo menos uma habilidade desejada.';
        erroEl.classList.add('ativo');
        return;
    }

    const habilidadesNovas = habilidadesDesejadas.filter(habilidade => {
        const jaExiste = habilidadesDesejadasExistentesIds.includes(
            habilidade.habilidade_id
        );
        return !jaExiste;
    });

    try {

        if (habilidadesNovas.length === 0) {
            erroEl.textContent = "Nenhuma habilidade nova para salvar.";
            erroEl.classList.add("ativo");
            return;
        }

        for (const habilidade of habilidadesNovas) {
            const resposta = await fetch(
                API_HABILIDADES_DESEJADAS,
                {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario_id: usuarioAtualId,
                        habilidade_id: habilidade.habilidade_id,
                        nivel_desejado: habilidade.nivel_desejado
                    })
                }
            );

            if (!resposta.ok) {
                const dados = await resposta.json();
                throw new Error(dados.detail || 'Erro ao salvar habilidade desejada');
            }
            habilidadesDesejadasExistentesIds.push(
                habilidade.habilidade_id
            );
        }

        erroEl.textContent = 'Roadmap salvo com sucesso!';
        erroEl.classList.remove('ativo');

    } catch (erro) {

        console.error(
            'Erro ao salvar Roadmap:',
            erro
        );

        erroEl.textContent = 'Erro: ' + erro.message;
        erroEl.classList.add('ativo');
    }
}

async function carregarHabilidadesDesejadas(usuarioId) {

    try {
        const resposta = await fetch(
            `${API_HABILIDADES_DESEJADAS}/${usuarioId}`
        );

        if (resposta.status === 404) {
            habilidadesDesejadas = [];
            habilidadesDesejadasExistentesIds = [];
            renderizarHabilidadesDesejadas();
            recalcularEstimativa();
            return;
        }

        if (!resposta.ok) {
            throw new Error('Erro ao carregar habilidades desejadas');
        }

        const habilidades = await resposta.json();

        habilidadesDesejadasExistentesIds =
            habilidades.map(habilidade => habilidade.habilidade_id);

        habilidadesDesejadas =
            habilidades.map(habilidade => ({
                habilidade_id: habilidade.habilidade_id,
                nivel_desejado: habilidade.nivel_desejado,
                nome: habilidade.habilidade || habilidade.nome
            }));

        renderizarHabilidadesDesejadas();
        recalcularEstimativa();

    } catch (erro) {

        console.error(
            'Erro ao carregar habilidades desejadas:',
            erro
        );

    }

}

function obterIniciais(nome) {

    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0][0];
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';

    return (primeira + ultima).toUpperCase();

}

function pontosNivel(nivel) {

    return Array.from({ length: 5 }, (_, indice) =>
        `<span class="ponto-nivel ${indice < nivel ? 'preenchido' : ''}"></span>`
    ).join('');

}

function formatarDuracao(semanas) {

    const totalMeses = Math.max(Math.round(semanas * 7 / 30), 1);
    const anos = Math.floor(totalMeses / 12);
    const meses = totalMeses % 12;

    if (anos === 0) {
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }

    if (meses === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }

    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;

}

function calcularDataConclusao(semanas) {

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = new Date();
    data.setDate(data.getDate() + semanas * 7);

    return `${meses[data.getMonth()]} ${data.getFullYear()}`;

}

function recalcularEstimativa() {

    const horasPorSemana = Number(document.getElementById('input-horas-semana').value) || 0;

    const itens = habilidadesDesejadas.map(habilidade => {
        const { horas } = calcularItemDesejado(habilidade);
        return { nome: habilidade.nome, horas };
    });

    const totalHoras = itens.reduce((soma, item) => soma + item.horas, 0);
    const semanas = horasPorSemana > 0 ? Math.ceil(totalHoras / horasPorSemana) : 0;

    document.getElementById('estimativa-total-horas').textContent = `${totalHoras} h`;

    document.getElementById('estimativa-total-meses').textContent =
        totalHoras > 0
            ? `≈ ${formatarDuracao(semanas)} de estudo`
            : 'Adicione habilidades desejadas';

    document.getElementById('estimativa-duracao').textContent =
        semanas > 0 ? `${semanas} semanas` : '—';

    document.getElementById('estimativa-conclusao').textContent =
        semanas > 0 ? calcularDataConclusao(semanas) : '—';

    renderizarDistribuicaoEsforco(itens, totalHoras);
    renderizarFasesRoadmap(horasPorSemana);

}

function calcularFasesRoadmap(horasPorSemana) {

    const passos = [];

    habilidadesDesejadas.forEach(item => {
        const habilidade = habilidadesCatalogo.find(h => h.id === item.habilidade_id);
        if (!habilidade) {
            return;
        }

        const nivelAtual = habilidadesAtuaisMapa[item.habilidade_id] || 0;

        for (let nivel = nivelAtual + 1; nivel <= item.nivel_desejado; nivel++) {
            passos.push({
                nome: item.nome,
                nivel,
                horas: habilidade.horas_por_nivel
            });
        }
    });

    passos.sort((a, b) => a.horas - b.horas);

    let horasAcumuladas = 0;

    return passos.map(passo => {
        const semanaInicio = horasPorSemana > 0 ? horasAcumuladas / horasPorSemana : 0;
        horasAcumuladas += passo.horas;
        const semanaFim = horasPorSemana > 0 ? horasAcumuladas / horasPorSemana : 0;

        return { ...passo, semanaInicio, semanaFim };
    });

}

function renderizarFasesRoadmap(horasPorSemana) {

    const container = document.getElementById('roadmap-fases');
    const fases = calcularFasesRoadmap(horasPorSemana);

    if (fases.length === 0) {
        container.classList.remove('tem-fases');
        container.innerHTML = `
            <p class="lista-vazia">
                Adicione habilidades desejadas para gerar o roadmap em fases.
            </p>
        `;
        return;
    }

    container.classList.add('tem-fases');
    container.style.setProperty('--fase-total', fases.length);

    container.innerHTML = fases
        .map(fase => {
            const mesInicio = Math.max(Math.ceil(fase.semanaInicio * 7 / 30), 1);
            const mesFim = Math.max(Math.ceil(fase.semanaFim * 7 / 30), mesInicio);
            const periodo = horasPorSemana > 0
                ? (mesInicio === mesFim ? `Mês ${mesInicio}` : `Mês ${mesInicio}-${mesFim}`)
                : '—';

            return `

                <div class="fase-roadmap">
                    <span class="fase-ponto"></span>
                    <span class="fase-periodo">${periodo}</span>
                    <strong>${fase.nome} ao nível ${fase.nivel}</strong>
                    <span class="fase-horas">${fase.horas} h</span>
                </div>

            `;
        })
        .join('');

}

function renderizarDistribuicaoEsforco(itens, totalHoras) {

    const container = document.getElementById('distribuicao-esforco');

    if (totalHoras === 0) {
        container.innerHTML = `
            <p class="lista-vazia">
                Adicione habilidades desejadas para ver a distribuição.
            </p>
        `;
        return;
    }

    container.innerHTML = itens
        .filter(item => item.horas > 0)
        .sort((a, b) => b.horas - a.horas)
        .map(item => {
            const percentual = Math.round((item.horas / totalHoras) * 100);
            return `
                <div class="distribuicao-linha">

                    <div class="distribuicao-cabecalho">
                        <span>${item.nome}</span>
                        <span>${percentual}%</span>
                    </div>

                    <div class="distribuicao-barra">
                        <div class="distribuicao-preenchido" style="width: ${percentual}%"></div>
                    </div>

                </div>
            `;
        })
        .join('');

}


function fecharModal() {
    document.getElementById('overlay').classList.remove('ativo');
    document.getElementById('modal').classList.remove('ativo');
    document.getElementById('modal-conteudo').innerHTML = '';

}
function mostrarSecao(secao) {
    document.querySelectorAll('.nav-btn').forEach(
        btn =>
            btn.classList.remove(
                'active'
            )
    );


    document
        .querySelectorAll('.secao')
        .forEach(
            secaoElement =>
                secaoElement.classList.remove(
                    'ativa'
                )
        );

    const secaoElement = document.getElementById(`secao-${secao}`);
    if (secaoElement) {
        secaoElement.classList.add(
            'ativa'
        );

    }
    const botao = document.getElementById(`nav-${secao}`);

    if (botao) {
        botao.classList.add('active');
    }

    if (secao === 'habilidades') {
        carregarHabilidadesCatalogo();
    }

    if (secao === 'roadmap' && !usuarioAtualId) {
        document.getElementById('roadmap-perfil').innerHTML = `
            <p class="lista-vazia">
                Selecione uma pessoa na tela
                "Pessoas" para visualizar o Roadmap.
            </p>

        `;

    }

}