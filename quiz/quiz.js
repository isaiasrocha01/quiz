// Listas de livros para preenchimento do select
const livrosQuiz = {
    "Velho Testamento": ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cântico dos Cânticos", "Isaías", "Jeremias", "Lamentações de Jeremias", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias"],
    "Novo Testamento": ["Mateus", "Marcos", "Lucas", "João", "Atos dos Apóstolos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"]
};

// Tabela de Pontuação por Nível
const TABELA_PONTOS = {
    "facil": 50,
    "fácil": 50,
    "medio": 80,
    "médio": 80,
    "dificil": 100,
    "difícil": 100
};

// Paleta de cores atribuídas aos jogadores ativos
const CORES_JOGADORES = [
    { border: "#1f3a60", bg: "#e8f0fe", badge: "#1f3a60", text: "#ffffff" },
    { border: "#c59b27", bg: "#fef9e7", badge: "#c59b27", text: "#ffffff" },
    { border: "#28a745", bg: "#e8f8ec", badge: "#28a745", text: "#ffffff" },
    { border: "#8e44ad", bg: "#f4ecf7", badge: "#8e44ad", text: "#ffffff" }
];

// Estado Geral
let bancoPerguntas = [];
let indiceAtual = 0;
let jogadoresCadastrados = []; 
let jogadoresSelecionadosNomes = []; 
let listaJogadoresAtivos = []; 
let jogadorTurnoIndice = 0;
let respostasRodada = {}; 
let alternativasDesabilitadas = new Set(); 
let opcaoSelecionadaTemporaria = null;

// Elementos HTML
const testamentoSel = document.getElementById("quiz-testamento");
const categoriaSel = document.getElementById("quiz-categoria");
const livroSel = document.getElementById("quiz-livro");
const areaLivroQuiz = document.getElementById("areaLivroQuiz");
const quantidadeSel = document.getElementById("quiz-quantidade");
const btnEncerrarTopo = document.getElementById("top-btn-encerrar");

// Inicialização de Jogadores do Cache
document.addEventListener("DOMContentLoaded", () => {
    carregarJogadoresSalvos();
});

function carregarJogadoresSalvos() {
    const salvos = localStorage.getItem("oficina_biblica_jogadores_cadastrados");
    if (salvos) {
        jogadoresCadastrados = JSON.parse(salvos);
    } else {
        jogadoresCadastrados = ["Jogador 1"];
        salvarJogadoresNoStorage();
    }
    renderizarListaJogadoresUI();
}

function salvarJogadoresNoStorage() {
    localStorage.setItem("oficina_biblica_jogadores_cadastrados", JSON.stringify(jogadoresCadastrados));
}

function cadastrarNovoJogador() {
    const input = document.getElementById("nome-jogador");
    const nome = input.value.trim();

    if (!nome) return alert("Digite o nome do jogador!");
    if (jogadoresCadastrados.some(n => n.toLowerCase() === nome.toLowerCase())) {
        return alert("Este jogador já está cadastrado!");
    }

    jogadoresCadastrados.push(nome);
    salvarJogadoresNoStorage();

    // Seleciona automaticamente se tiver espaço
    if (jogadoresSelecionadosNomes.length < 4) {
        jogadoresSelecionadosNomes.push(nome);
    }

    input.value = "";
    renderizarListaJogadoresUI();
}

function alternarSelecaoJogador(nome) {
    const index = jogadoresSelecionadosNomes.indexOf(nome);
    if (index > -1) {
        jogadoresSelecionadosNomes.splice(index, 1);
    } else {
        if (jogadoresSelecionadosNomes.length >= 4) {
            return alert("Máximo de 4 jogadores por partida!");
        }
        jogadoresSelecionadosNomes.push(nome);
    }
    renderizarListaJogadoresUI();
}

function excluirJogadorCadastrado(nome, event) {
    event.stopPropagation(); // Impede o clique de marcar/desmarcar
    if (confirm(`Deseja remover "${nome}" do cadastro permanente?`)) {
        jogadoresCadastrados = jogadoresCadastrados.filter(n => n !== nome);
        jogadoresSelecionadosNomes = jogadoresSelecionadosNomes.filter(n => n !== nome);
        salvarJogadoresNoStorage();
        renderizarListaJogadoresUI();
    }
}

function renderizarListaJogadoresUI() {
    const container = document.getElementById("lista-jogadores-cadastrados");
    container.innerHTML = "";

    if (jogadoresCadastrados.length === 0) {
        container.innerHTML = `<em style="font-size: 0.85rem; color: #777;">Nenhum jogador cadastrado. Cadastre acima!</em>`;
        return;
    }

    jogadoresCadastrados.forEach(nome => {
        const estaSelecionado = jogadoresSelecionadosNomes.includes(nome);
        const card = document.createElement("div");
        card.className = `card-selecao-jogador ${estaSelecionado ? 'selecionado' : ''}`;
        
        // O card inteiro é o botão de escolha
        card.innerHTML = `
            <span>${estaSelecionado ? '✅' : '👤'} ${nome}</span>
            <button type="button" class="btn-deletar-cadastrado" onclick="excluirJogadorCadastrado('${nome}', event)" title="Excluir do histórico">✕</button>
        `;

        card.onclick = () => alternarSelecaoJogador(nome);
        container.appendChild(card);
    });
}

// Listeners Form
categoriaSel.addEventListener("change", () => {
    if (categoriaSel.value === "Livros") {
        areaLivroQuiz.style.display = "block";
        carregarLivrosQuiz();
    } else {
        areaLivroQuiz.style.display = "none";
    }
});
testamentoSel.addEventListener("change", carregarLivrosQuiz);

function carregarLivrosQuiz() {
    livroSel.innerHTML = '<option value="">Selecione...</option>';
    let lista = livrosQuiz[testamentoSel.value];
    if (!lista) return;
    lista.forEach(nome => {
        let opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = nome;
        livroSel.appendChild(opt);
    });
}

function formatarNomeArquivo(str) {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
}

// INÍCIO DO JOGO
async function iniciarJogo() {
    if (jogadoresSelecionadosNomes.length === 0) {
        return alert("Selecione pelo menos 1 jogador para participar da partida!");
    }

    let url = "../dados/";
    if (categoriaSel.value === "Livros") {
        if (!testamentoSel.value || !livroSel.value) return alert("Selecione o Testamento e o Livro!");
        let pasta = testamentoSel.value === "Velho Testamento" ? "velho_testamento" : "novo_testamento";
        let arquivo = formatarNomeArquivo(livroSel.value) + ".json";
        url += `${pasta}/${arquivo}`;
    } else {
        if (!categoriaSel.value) return alert("Selecione a categoria!");
        url += `${categoriaSel.value.toLowerCase()}.json`;
    }

    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error("Arquivo não encontrado.");
        let dadosCarregados = await response.json();
        
        if (Array.isArray(dadosCarregados)) {
            bancoPerguntas = dadosCarregados;
        } else if (dadosCarregados.perguntas && Array.isArray(dadosCarregados.perguntas)) {
            bancoPerguntas = dadosCarregados.perguntas;
        } else {
            bancoPerguntas = [];
        }

        if (bancoPerguntas.length === 0) {
            alert("Não há perguntas cadastradas neste bloco.");
            return;
        }

        bancoPerguntas.sort(() => Math.random() - 0.5);

        const qtdOpcao = quantidadeSel.value;
        if (qtdOpcao !== "todas") {
            const limite = parseInt(qtdOpcao);
            bancoPerguntas = bancoPerguntas.slice(0, limite);
        }

        // Monta a lista de objetos para a partida
        listaJogadoresAtivos = jogadoresSelecionadosNomes.map((nome, index) => ({
            nome: nome,
            pontuacao: 0,
            cor: CORES_JOGADORES[index]
        }));

        indiceAtual = 0;

        document.getElementById("tela-config").style.display = "none";
        document.getElementById("tela-jogo").style.display = "block";
        if (btnEncerrarTopo) btnEncerrarTopo.style.display = "inline-block";

        iniciarRodadaPergunta();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar perguntas. Verifique a existência do arquivo JSON.");
    }
}

function iniciarRodadaPergunta() {
    respostasRodada = {};
    alternativasDesabilitadas.clear();
    jogadorTurnoIndice = 0;
    mostrarPergunta();
}

function mostrarPergunta() {
    document.getElementById("feedback-resposta").style.display = "none";
    document.getElementById("btn-confirmar-resposta").style.display = "none";
    opcaoSelecionadaTemporaria = null;

    let p = bancoPerguntas[indiceAtual];
    let nivel = (p.nivel || "medio").toLowerCase();
    
    document.getElementById("progresso").textContent = `Pergunta ${indiceAtual + 1} de ${bancoPerguntas.length}`;
    document.getElementById("nivel-pergunta").textContent = `Nível: ${nivel.toUpperCase()} (${TABELA_PONTOS[nivel] || 80} Pts)`;
    document.getElementById("pergunta-texto").textContent = `${p.id || (indiceAtual + 1)} - ${p.pergunta}`;
    
    atualizarPlacarUI();
    atualizarTurnoUI();
    renderizarOpcoes();
}

function atualizarTurnoUI() {
    let jogadorAtual = listaJogadoresAtivos[jogadorTurnoIndice];
    let elem = document.getElementById("jogador-atual-txt");
    elem.textContent = `Vez de: ${jogadorAtual.nome} 🎯`;
    elem.style.color = jogadorAtual.cor.border;
}

function atualizarPlacarUI() {
    let placarContainer = document.getElementById("placar-rodada");
    placarContainer.innerHTML = listaJogadoresAtivos.map(j => `
        <span style="border-bottom: 2px solid ${j.cor.border}; padding-bottom: 2px;">
            <strong>${j.nome}:</strong> ${j.pontuacao} pts
        </span>
    `).join(" | ");
}

function renderizarOpcoes() {
    let p = bancoPerguntas[indiceAtual];
    const containerOpcoes = document.getElementById("opcoes-container");
    containerOpcoes.innerHTML = "";
    let letras = ["A", "B", "C", "D"];

    let jogadorAtual = listaJogadoresAtivos[jogadorTurnoIndice];

    p.alternativas.forEach((alt, idx) => {
        let btn = document.createElement("button");
        btn.style.width = "100%";
        btn.style.textAlign = "left";
        btn.style.padding = "14px";
        btn.style.borderRadius = "10px";
        btn.style.cursor = "pointer";
        btn.style.position = "relative";
        btn.style.transition = "all 0.2s ease";

        let jogadoresQueEscolheram = [];
        Object.keys(respostasRodada).forEach(jIdx => {
            if (respostasRodada[jIdx] === idx) {
                jogadoresQueEscolheram.push(listaJogadoresAtivos[jIdx]);
            }
        });

        if (opcaoSelecionadaTemporaria === idx) {
            jogadoresQueEscolheram.push(jogadorAtual);
        }

        if (alternativasDesabilitadas.has(idx)) {
            btn.style.backgroundColor = "#f0f0f0";
            btn.style.color = "#a0a0a0";
            btn.style.border = "1.5px solid #ccc";
            btn.disabled = true;
            btn.innerHTML = `<strong>${letras[idx]})</strong> ${alt} <em style="font-size:0.8rem;">(Incorreta)</em>`;
        } else {
            let badgesHTML = "";
            
            if (jogadoresQueEscolheram.length > 0) {
                let ultimaCor = jogadoresQueEscolheram[jogadoresQueEscolheram.length - 1].cor;
                btn.style.border = `3px solid ${ultimaCor.border}`;
                btn.style.backgroundColor = ultimaCor.bg;
                btn.style.boxShadow = `0 4px 12px ${ultimaCor.border}33`;

                badgesHTML = `<div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 5px;">`;
                jogadoresQueEscolheram.forEach(j => {
                    badgesHTML += `<span style="background:${j.cor.badge}; color:${j.cor.text}; font-size: 0.75rem; padding: 3px 8px; border-radius: 12px; font-weight: bold;">${j.nome}</span>`;
                });
                badgesHTML += `</div>`;
            } else {
                btn.style.backgroundColor = "var(--card-bg)";
                btn.style.color = "var(--text-main)";
                btn.style.border = "1.5px solid var(--border-color)";
                btn.style.boxShadow = "none";
            }

            btn.innerHTML = `<strong>${letras[idx]})</strong> ${alt} ${badgesHTML}`;
            btn.onclick = () => selecionarOpcao(idx);
        }

        containerOpcoes.appendChild(btn);
    });
}

function selecionarOpcao(idx) {
    opcaoSelecionadaTemporaria = idx;
    renderizarOpcoes();
    
    let btnConfirmar = document.getElementById("btn-confirmar-resposta");
    let jogadorAtual = listaJogadoresAtivos[jogadorTurnoIndice];
    
    btnConfirmar.style.display = "block";
    btnConfirmar.style.backgroundColor = jogadorAtual.cor.border;
    btnConfirmar.style.color = "#ffffff";
    btnConfirmar.textContent = `Confirmar Escolha de ${jogadorAtual.nome} ➔`;
}

function confirmarEscolha() {
    if (opcaoSelecionadaTemporaria === null) return;

    respostasRodada[jogadorTurnoIndice] = opcaoSelecionadaTemporaria;
    opcaoSelecionadaTemporaria = null;
    jogadorTurnoIndice++;

    if (jogadorTurnoIndice < listaJogadoresAtivos.length) {
        mostrarPergunta();
    } else {
        avaliarResultadoRodada();
    }
}

function avaliarResultadoRodada() {
    let p = bancoPerguntas[indiceAtual];
    let gabarito = p.respostaCorretaIndice;
    let pontosQuestao = TABELA_PONTOS[(p.nivel || "medio").toLowerCase()] || 80;

    let acertos = [];
    let errosRodada = [];

    Object.keys(respostasRodada).forEach(idxString => {
        let idxJugador = parseInt(idxString);
        let respEscolhida = respostasRodada[idxString];

        if (respEscolhida === gabarito) {
            acertos.push(listaJogadoresAtivos[idxJugador].nome);
            listaJogadoresAtivos[idxJugador].pontuacao += pontosQuestao;
        } else {
            errosRodada.push(respEscolhida);
        }
    });

    let painelFeedback = document.getElementById("feedback-resposta");
    let txtFeedback = document.getElementById("feedback-texto");
    let btnProxima = document.getElementById("btn-proxima");
    let btnTentar = document.getElementById("btn-tentar-novamente");

    document.getElementById("btn-confirmar-resposta").style.display = "none";

    if (acertos.length > 0) {
        txtFeedback.textContent = `🌟 Acertaram: ${acertos.join(", ")} (+${pontosQuestao} Pts)!`;
        painelFeedback.style.backgroundColor = "#e2f0d9";
        painelFeedback.style.borderLeft = "5px solid #28a745";

        document.getElementById("feedback-explicacao").textContent = p.explicacao ? `Explicação: ${p.explicacao}` : "";
        document.getElementById("feedback-referencia").textContent = p.referenciaBiblica ? `Referência: ${p.referenciaBiblica}` : "";

        btnProxima.style.display = "inline-block";
        btnTentar.style.display = "none";
    } else {
        txtFeedback.textContent = "❌ Ninguém acertou a resposta! Tentem novamente.";
        painelFeedback.style.backgroundColor = "#fce8e6";
        painelFeedback.style.borderLeft = "5px solid #dc3545";

        document.getElementById("feedback-explicacao").textContent = "";
        document.getElementById("feedback-referencia").textContent = "";

        errosRodada.forEach(e => alternativasDesabilitadas.add(e));

        btnProxima.style.display = "none";
        btnTentar.style.display = "inline-block";
    }

    painelFeedback.style.display = "block";
    atualizarPlacarUI();
}

function tentarNovamente() {
    respostasRodada = {};
    jogadorTurnoIndice = 0;
    mostrarPergunta();
}

function proximaPergunta() {
    indiceAtual++;
    if (indiceAtual < bancoPerguntas.length) {
        iniciarRodadaPergunta();
    } else {
        finalizarJogo();
    }
}

// ENCERRAMENTO ANTECIPADO E FINALIZAÇÃO
function confirmarEncerrarPartida() {
    if (confirm("Tem certeza que deseja encerrar a partida agora? Os pontos acumulados até aqui serão salvos no Ranking!")) {
        finalizarJogo();
    }
}

function finalizarJogo() {
    document.getElementById("tela-jogo").style.display = "none";
    document.getElementById("tela-resultado").style.display = "block";
    
    if (btnEncerrarTopo) btnEncerrarTopo.style.display = "none";

    salvarPontuacoesNoRanking();

    let ranking = [...listaJogadoresAtivos].sort((a, b) => b.pontuacao - a.pontuacao);

    let htmlRanking = `<div class="resultado-box">
        <h3>Classificação Final 🏆</h3><br>`;
    
    ranking.forEach((j, idx) => {
        htmlRanking += `<p style="font-size: 1.2rem; margin: 10px 0; color: ${j.cor.border};">
            ${idx === 0 ? "👑" : "👤"} <strong>${j.nome}</strong>: ${j.pontuacao} Pontos
        </p>`;
    });

    htmlRanking += `</div>`;
    document.getElementById("placar-final").innerHTML = htmlRanking;
}

function salvarPontuacoesNoRanking() {
    const historico = JSON.parse(localStorage.getItem("oficina_biblica_ranking") || "[]");
    const dataAtual = new Date().toISOString();

    listaJogadoresAtivos.forEach(j => {
        if (j.pontuacao > 0) {
            historico.push({
                nome: j.nome,
                pontos: j.pontuacao,
                data: dataAtual
            });
        }
    });

    localStorage.setItem("oficina_biblica_ranking", JSON.stringify(historico));
}

function reiniciarQuiz() {
    document.getElementById("tela-resultado").style.display = "none";
    document.getElementById("tela-config").style.display = "block";
    if (btnEncerrarTopo) btnEncerrarTopo.style.display = "none";
}

function voltarConfiguracao() {
    document.getElementById("tela-jogo").style.display = "none";
    document.getElementById("tela-config").style.display = "block";
    if (btnEncerrarTopo) btnEncerrarTopo.style.display = "none";
    bancoPerguntas = [];
    respostasRodada = {};
    alternativasDesabilitadas.clear();
}
