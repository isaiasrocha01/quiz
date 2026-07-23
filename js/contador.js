document.addEventListener("DOMContentLoaded", async () => {
    const totalElemento = document.getElementById("total-perguntas");

    const arquivosJson = [
        'dados/eventos.json',
        'dados/lugares.json',
        'dados/pessoas.json',
        'dados/novo_testamento/1_corintios.json',
        'dados/novo_testamento/1_joao.json',
        'dados/novo_testamento/1_pedro.json',
        'dados/novo_testamento/1_tessalonicenses.json',
        'dados/novo_testamento/1_timoteo.json',
        'dados/novo_testamento/2_corintios.json',
        'dados/novo_testamento/2_joao.json',
        'dados/novo_testamento/2_pedro.json',
        'dados/novo_testamento/2_tessalonicenses.json',
        'dados/novo_testamento/2_timoteo.json',
        'dados/novo_testamento/3_joao.json',
        'dados/novo_testamento/apocalipse.json',
        'dados/novo_testamento/atos_dos_apostolos.json',
        'dados/novo_testamento/colossenses.json',
        'dados/novo_testamento/efesios.json',
        'dados/novo_testamento/filemon.json',
        'dados/novo_testamento/filipenses.json',
        'dados/novo_testamento/galatas.json',
        'dados/novo_testamento/hebreus.json',
        'dados/novo_testamento/joao.json',
        'dados/novo_testamento/judas.json',
        'dados/novo_testamento/lucas.json',
        'dados/novo_testamento/marcos.json',
        'dados/novo_testamento/mateus.json',
        'dados/novo_testamento/romanos.json',
        'dados/novo_testamento/tiago.json',
        'dados/novo_testamento/tito.json',
        'dados/velho_testamento/1_cronicas.json',
        'dados/velho_testamento/1_reis.json',
        'dados/velho_testamento/1_samuel.json',
        'dados/velho_testamento/2_cronicas.json',
        'dados/velho_testamento/2_reis.json',
        'dados/velho_testamento/2_samuel.json',
        'dados/velho_testamento/ageu.json',
        'dados/velho_testamento/amos.json',
        'dados/velho_testamento/cantico_dos_canticos.json',
        'dados/velho_testamento/daniel.json',
        'dados/velho_testamento/deuteronomio.json',
        'dados/velho_testamento/eclesiastes.json',
        'dados/velho_testamento/esdras.json',
        'dados/velho_testamento/ester.json',
        'dados/velho_testamento/exodo.json',
        'dados/velho_testamento/ezequiel.json',
        'dados/velho_testamento/genesis.json',
        'dados/velho_testamento/habacuque.json',
        'dados/velho_testamento/isaias.json',
        'dados/velho_testamento/jeremias.json',
        'dados/velho_testamento/jo.json',
        'dados/velho_testamento/joel.json',
        'dados/velho_testamento/jonas.json',
        'dados/velho_testamento/josue.json',
        'dados/velho_testamento/juizes.json',
        'dados/velho_testamento/lamentacoes.json',
        'dados/velho_testamento/levitico.json',
        'dados/velho_testamento/malequias.json',
        'dados/velho_testamento/miqueias.json',
        'dados/velho_testamento/naum.json',
        'dados/velho_testamento/neemias.json',
        'dados/velho_testamento/numeros.json',
        'dados/velho_testamento/obadias.json',
        'dados/velho_testamento/oseias.json',
        'dados/velho_testamento/proverbios.json',
        'dados/velho_testamento/rute.json',
        'dados/velho_testamento/salmos.json',
        'dados/velho_testamento/sofonias.json',
        'dados/velho_testamento/zacarias.json'
    ];

    let totalGeral = 0;

    for (const caminhoDoArquivo of arquivosJson) {
        try {
            const resposta = await fetch(caminhoDoArquivo);
            if (!resposta.ok) throw new Error(`Não foi possível carregar ${caminhoDoArquivo}`);
            const perguntasDoArquivo = await resposta.json();

            if (Array.isArray(perguntasDoArquivo)) {
                totalGeral += perguntasDoArquivo.length;
            } else if (perguntasDoArquivo.perguntas && Array.isArray(perguntasDoArquivo.perguntas)) {
                totalGeral += perguntasDoArquivo.perguntas.length;
            }
        } catch (erro) {
            console.warn(`Erro ao carregar ${caminhoDoArquivo}:`, erro);
        }
    }

    if (totalElemento) totalElemento.textContent = totalGeral;

    // Carregar Ranking na Página Inicial
    carregarRanking('diario');
});

// LÓGICA DO RANKING PERSISTENTE
let abaAtualRanking = 'diario';

function trocarAbaRanking(tipo) {
    abaAtualRanking = tipo;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    carregarRanking(tipo);
}

function carregarRanking(tipo) {
    const tbody = document.getElementById("ranking-corpo");
    if (!tbody) return;

    // Recupera histórico salvo no localStorage
    const historico = JSON.parse(localStorage.getItem("oficina_biblica_ranking") || "[]");

    const agora = new Date();
    const hojeStr = agora.toISOString().split('T')[0]; // YYYY-MM-DD
    const mesStr = hojeStr.substring(0, 7);             // YYYY-MM

    // Acumulador de pontuação por jogador
    const placar = {};

    historico.forEach(registro => {
        const dataReg = registro.data.split('T')[0];
        const mesReg = dataReg.substring(0, 7);

        let incluir = false;

        if (tipo === 'diario' && dataReg === hojeStr) incluir = true;
        else if (tipo === 'mensal' && mesReg === mesStr) incluir = true;
        else if (tipo === 'total') incluir = true;

        if (incluir) {
            if (!placar[registro.nome]) placar[registro.nome] = 0;
            placar[registro.nome] += registro.pontos;
        }
    });

    // Converte para array e ordena do maior para o menor
    const rankingOrdenado = Object.keys(placar)
        .map(nome => ({ nome, pontos: placar[nome] }))
        .sort((a, b) => b.pontos - a.pontos);

    tbody.innerHTML = "";

    if (rankingOrdenado.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--muted); padding: 1.5rem;">Nenhuma pontuação registrada neste período.</td></tr>`;
        return;
    }

    rankingOrdenado.forEach((j, idx) => {
        let icone = `${idx + 1}º`;
        if (idx === 0) icone = "🥇";
        else if (idx === 1) icone = "🥈";
        else if (idx === 2) icone = "🥉";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="posicao-top">${icone}</td>
            <td><strong>${j.nome}</strong></td>
            <td><strong>${j.pontos}</strong> pts</td>
        `;
        tbody.appendChild(tr);
    });
}
