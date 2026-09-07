document.addEventListener('DOMContentLoaded', atualizarBotaoTema);

function alternarTema() {

    const escuro = document.documentElement.dataset.tema === 'escuro';

    if (escuro) {
        delete document.documentElement.dataset.tema;
        localStorage.setItem('tema', 'claro');
    } else {
        document.documentElement.dataset.tema = 'escuro';
        localStorage.setItem('tema', 'escuro');
    }

    atualizarBotaoTema();

}

function atualizarBotaoTema() {

    const botao = document.getElementById('btn-tema');
    const escuro = document.documentElement.dataset.tema === 'escuro';

    botao.textContent = escuro ? 'Tema claro' : 'Tema escuro';

}
