const API_PESSOAS ='/api/pessoas';
const API_HABILIDADES ='/api/habilidades';
const API_PESSOA_HABILIDADES = '/api/pessoa-habilidades';
const API_HABILIDADES_DESEJADAS ='/api/habilidades-desejadas';

let habilidadesSelecionadas = [];
let habilidadesDesejadas = [];
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
    try {
        const resposta = await fetch(API_PESSOAS, {method: 'GET'});
        if (!resposta.ok) {
            throw new Error('Erro ao buscar pessoas');
        }

        const pessoas = await resposta.json();
        if (pessoas.length === 0) {
            container.innerHTML = `
                <p class="empty-text">
                    Nenhuma pessoa cadastrada ainda.
                    Clique em "Cadastrar Pessoa"
                    para começar.
                </p>
            `;

            return;
        }


        container.innerHTML =
            pessoas.map(
                pessoa => `

                    <div class="pessoa-card">

                        <div class="pessoa-info">

                            <div class="pessoa-nome">
                                ${pessoa.nome}
                            </div>

                            <div class="pessoa-email">
                                ${pessoa.email}
                            </div>

                            <span class="pessoa-id">
                                ID: ${pessoa.id}
                            </span>

                        </div>


                        <div class="pessoa-acoes">

                            <button
                                class="btn-icone"
                                onclick="abrirEdicaoPessoa(${pessoa.id})"
                            >
                                Editar
                            </button>


                            <button
                                class="btn-icone"
                                onclick="abrirRoadmap(${pessoa.id})"
                            >
                                Roadmap
                            </button>


                            <button
                                class="btn-icone danger"
                                onclick="excluirPessoa(${pessoa.id})"
                            >
                                Excluir
                            </button>

                        </div>

                    </div>

                `
            ).join('');


    } catch (erro) {

        container.innerHTML = `
            <p class="empty-text">
                Erro ao carregar pessoas.
                Verifique se a API está rodando.
            </p>
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
    const erroEl = document.getElementById('form-erro');

    if (!nome || !email) {
        erroEl.textContent ='Preencha nome e e-mail.';
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
            {method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({nome,email})
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
    ) {return;}


    try {
        const resposta = await fetch(
                `${API_PESSOAS}/${id}`,
                {method: 'DELETE'}
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
        abrirModal('editar-pessoa', pessoa);

    } catch (erro) {
        alert('Erro ao carregar dados da pessoa.');
        console.error('Erro:', erro);
    }
}

async function salvarEdicaoPessoa() {

    const nome = document.getElementById('input-nome-editar').value.trim();
    const email = document.getElementById('input-email-editar').value.trim();
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
                body: JSON.stringify({ nome, email })
            }
        );

        if (!resposta.ok) {
            const dados = await resposta.json();
            throw new Error(dados.detail || 'Erro ao atualizar pessoa');
        }

        fecharModal();
        await carregarPessoas();

    } catch (erro) {
        erroEl.textContent = 'Erro: ' + erro.message;
        erroEl.classList.add('ativo');
    }
}

function abrirModal(tipo, pessoa) {

    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modal-titulo');
    const conteudo = document.getElementById('modal-conteudo');

    if (tipo === 'editar-pessoa') {
        pessoaEmEdicaoId = pessoa.id;
        titulo.textContent = 'Editar Pessoa';
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
                    Salvar
                </button>

            </div>

        `;

        overlay.classList.add('ativo');
        modal.classList.add('ativo');
        return;
    }

    if (tipo === 'pessoa') {
        habilidadesSelecionadas = [];
        titulo.textContent ='Cadastrar Pessoa';
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


            <div class="habilidades-container">

                <p class="habilidades-mensagem">
                    Adicione as habilidades que você possui
                </p>


                <div
                    id="lista-habilidades-selecionadas"
                    class="lista-habilidades-selecionadas"
                >

                    <p class="lista-vazia">
                        Nenhuma habilidade adicionada ainda.
                    </p>

                </div>


                <div class="adicionar-habilidade">

                    <select
                        id="select-habilidade"
                        class="form-select"
                    >

                        <option value="">
                            Selecione uma habilidade
                        </option>

                    </select>


                    <select
                        id="select-proficiencia"
                        class="form-select"
                    >

                        <option value="">
                            Proficiência
                        </option>

                        <option value="1">
                            1 - Iniciante
                        </option>

                        <option value="2">
                            2 - Básico
                        </option>

                        <option value="3">
                            3 - Intermediário
                        </option>

                        <option value="4">
                            4 - Avançado
                        </option>

                        <option value="5">
                            5 - Especialista
                        </option>

                    </select>


                    <button
                        type="button"
                        class="btn-adicionar-habilidade"
                        onclick="adicionarHabilidade()"
                    >
                        + Adicionar
                    </button>

                </div>

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
                    Salvar
                </button>

            </div>

        `;
        carregarHabilidades();

    }


    overlay.classList.add(
        'ativo'
    );

    modal.classList.add(
        'ativo'
    );

}

async function carregarHabilidades() {

    const select =
        document.getElementById(
            'select-habilidade'
        );


    if (!select) {
        return;
    }


    try {

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


    } catch (erro) {

        console.error(
            'Erro ao carregar habilidades:',
            erro
        );

    }

}

function adicionarHabilidade() {

    const selectHabilidade = document.getElementById('select-habilidade');
    const selectProficiencia = document.getElementById('select-proficiencia');
    const habilidadeId = Number(selectHabilidade.value);
    const nivelAtual = Number(selectProficiencia.value);
    const erroEl = document.getElementById('form-erro');
    if (!habilidadeId || !nivelAtual) {
        erroEl.textContent = 'Selecione uma habilidade e uma proficiência.';
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
        '';


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

                    <div class="habilidade-item">

                        <div class="habilidade-item-info">

                            <strong>
                                ${habilidade.nome}
                            </strong>

                            <span>
                                ${habilidade.proficienciaTexto}
                            </span>

                        </div>


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
        await carregarHabilidadesDesejadas(
            usuarioId
        );


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

            <div class="perfil-nome">
                ${usuario.nome}
            </div>

            <div class="perfil-email">
                ${usuario.email}
            </div>

            <span class="pessoa-id">
                ID: ${usuario.id}
            </span>

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
            if (resposta.status === 404)
            {
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
        console.log(habilidades)
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

                                <span>
                                    Nível ${nivel}
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


    const habilidadeNome =selectHabilidade.options[selectHabilidade.selectedIndex].text;
    const nivelTexto = selectNivel.options[selectNivel.selectedIndex].text;
    habilidadesDesejadas.push({
        habilidade_id: habilidadeId,
        nivel_desejado: nivelDesejado,
        nome: habilidadeNome,
        nivelTexto: nivelTexto
    });
    renderizarHabilidadesDesejadas();
    selectHabilidade.value ='';
    selectNivel.value = '';
    erroEl.textContent = '';
    erroEl.classList.remove('ativo');

}
function removerHabilidadeDesejada(index) {
    habilidadesDesejadas.splice(index, 1);

    renderizarHabilidadesDesejadas();

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


    container.innerHTML =
        habilidadesDesejadas
            .map(
                (habilidade, index) => `

                    <div class="habilidade-item">

                        <div class="habilidade-item-info">

                            <strong>
                                ${habilidade.nome}
                            </strong>

                            <span>
                                ${habilidade.nivelTexto}
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

                `
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
    try {
        for (const habilidade of habilidadesDesejadas) {
            const resposta =
                await fetch(API_HABILIDADES_DESEJADAS,
                    {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
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
        }


        erroEl.textContent = 'Roadmap salvo com sucesso!';
        erroEl.classList.remove('ativo');

    } catch (erro) {
        console.error('Erro ao salvar Roadmap:',erro);
        erroEl.textContent = 'Erro: ' + erro.message;
        erroEl.classList.add('ativo');
    }
}

async function carregarHabilidadesDesejadas(usuarioId) {

    try {

        const resposta = await fetch(`${API_HABILIDADES_DESEJADAS}/${usuarioId}`);
        if (resposta.status === 404) {
            habilidadesDesejadas = [];
            renderizarHabilidadesDesejadas();
            return;
        }


        if (!resposta.ok) {
            throw new Error('Erro ao carregar habilidades desejadas');
        }
        const habilidades = await resposta.json();
        habilidadesDesejadas =
            habilidades.map(
                habilidade => ({
                    habilidade_id: habilidade.habilidade_id,
                    nivel_desejado: habilidade.nivel_desejado,
                    nome: habilidade.habilidade || habilidade.nome,
                    nivelTexto: obterTextoNivel(habilidade.nivel_desejado)
                })
            );
        renderizarHabilidadesDesejadas();
    } catch (erro) {

        console.error(
            'Erro ao carregar habilidades desejadas:',
            erro
        );

    }

}

function obterTextoNivel(nivel) {

    const niveis = {
        1: '1 - Iniciante',
        2: '2 - Básico',
        3: '3 - Intermediário',
        4: '4 - Avançado',
        5: '5 - Especialista'
    };
    return niveis[nivel] ||
        `Nível ${nivel}`;
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
    const botao =document.getElementById(`nav-${secao}`);

    if (botao) {
        botao.classList.add('active');
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