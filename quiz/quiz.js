// Listas idênticas às do seu editor para gerar os selects
const livrosQuiz = {
    "Velho Testamento": ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cântico dos Cânticos", "Isaías", "Jeremias", "Lamentações de Jeremias", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias"],
    "Novo Testamento": ["Mateus", "Marcos", "Lucas", "João", "Atos dos Apóstolos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"]
};

// Estado do Jogo
let bancoPerguntas = [];
let indiceAtual = 0;
let pontuacao = 0;
let erros = 0;

// Elementos da Interface
const testamentoSel = document.getElementById("quiz-testamento");
const categoriaSel = document.getElementById("quiz-categoria");
const livroSel = document.getElementById("quiz-livro");
const areaLivroQuiz = document.getElementById("areaLivroQuiz");

// Eventos para monitorar seletores
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

// Helper para tratar strings de nomes de arquivo (Ex: "1 Crônicas" -> "1_cronicas")
function formatarNomeArquivo(str) {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\s+/g, "_");          // Substitui espaços por underline
}

// FUNÇÃO PRINCIPAL: CRIA A URL E BUSCA O JSON CORRETO
async function iniciarJogo() {
    let url = "../dados/";

    if (categoriaSel.value === "Livros") {
        if (!testamentoSel.value || !livroSel.value) return alert("Selecione o Testamento e o Livro!");
        let pasta = testamentoSel.value === "Velho Testamento" ? "velho_testamento" : "novo_testamento";
        let arquivo = formatarNomeArquivo(livroSel.value) + ".json";
        url += `${pasta}/${arquivo}`;
    } else {
        if (!categoriaSel.value) return alert("Selecione a categoria!");
        url += `${categoriaSel.value.toLowerCase()}.json`; // pessoas.json, lugares.json, eventos.json
    }

    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error("Arquivo não encontrado.");
        bancoPerguntas = await response.json();

        // Embaralhar perguntas (Opcional)
        bancoPerguntas.sort(() => Math.random() - 0.5);

        if (bancoPerguntas.length === 0) {
            alert("Não há perguntas cadastradas neste arquivo.");
            return;
        }

        // Mudar de tela
        document.getElementById("tela-config").style.display = "none";
        document.getElementById("tela-jogo").style.display = "block";

        indiceAtual = 0;
        pontuacao = 0;
        erros = 0;
        mostrarPergunta();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar as perguntas deste bloco. Verifique se o arquivo JSON existe no caminho especificado.");
    }
}

function mostrarPergunta() {
    // Esconder painel de feedback da resposta anterior
    document.getElementById("feedback-resposta").style.display = "none";

    let p = bancoPerguntas[indiceAtual];

    // Atualizar cabeçalho de progresso
    document.getElementById("progresso").textContent = `Pergunta ${indiceAtual + 1} de ${bancoPerguntas.length}`;
    document.getElementById("pergunta-texto").textContent = `${p.id || indiceAtual + 1} - ${p.pergunta}`;

    const containerOpcoes = document.getElementById("opcoes-container");
    containerOpcoes.innerHTML = "";

    let letras = ["A", "B", "C", "D"];
    p.alternativas.forEach((alt, idx) => {
        let btn = document.createElement("button");
        btn.style.width = "100%";
        btn.style.textAlign = "left";
        btn.style.backgroundColor = "var(--card-bg)";
        btn.style.color = "var(--text-main)";
        btn.style.border = "1.5px solid var(--border-color)";
        btn.innerHTML = `<strong>${letras[idx]})</strong> ${alt}`;

        btn.onclick = () => verificarResposta(idx, btn);
        containerOpcoes.appendChild(btn);
    });
}

function verificarResposta(indiceSelecionado, botaoClicado) {
    let p = bancoPerguntas[indiceAtual];
    const botoes = document.getElementById("opcoes-container").querySelectorAll("button");

    // Desabilitar todos os botões para impedir cliques múltiplos
    botoes.forEach(b => b.disabled = true);

    let painelFeedback = document.getElementById("feedback-resposta");
    let txtFeedback = document.getElementById("feedback-texto");

    if (indiceSelecionado === p.respostaCorretaIndice) {
        botaoClicado.style.backgroundColor = "#d4edda";
        botaoClicado.style.borderColor = "#28a745";
        txtFeedback.textContent = "Correto! 🌟";
        painelFeedback.style.backgroundColor = "#e2f0d9";
        painelFeedback.style.borderLeft = "5px solid #28a745";
        pontuacao++;
    } else {
        botaoClicado.style.backgroundColor = "#f8d7da";
        botaoClicado.style.borderColor = "#dc3545";
        // Destacar a correta
        botoes[p.respostaCorretaIndice].style.backgroundColor = "#d4edda";
        botoes[p.respostaCorretaIndice].style.borderColor = "#28a745";

        txtFeedback.textContent = "Incorreto! ❌";
        painelFeedback.style.backgroundColor = "#fce8e6";
        painelFeedback.style.borderLeft = "5px solid #dc3545";
    }

    // Exibir Explicação e Referência se houver
    document.getElementById("feedback-explicacao").textContent = p.explicacao ? `Explicação: ${p.explicacao}` : "";
    document.getElementById("feedback-referencia").textContent = p.referenciaBiblica ? `Referência: ${p.referenciaBiblica}` : "";

    painelFeedback.style.display = "block";
}

function proximaPergunta() {
    indiceAtual++;
    if (indiceAtual < bancoPerguntas.length) {
        mostrarPergunta();
    } else {
        // Fim do Jogo
        document.getElementById("tela-jogo").style.display = "none";
        document.getElementById("tela-resultado").style.display = "block";
        let total = bancoPerguntas.length;


        let porcentagem =
            Math.round((pontuacao / total) * 100);



        document.getElementById("placar-final").innerHTML = `

<div class="resultado-box">

<h3>Resultado Final 🎉</h3>

<br>

<p>
✅ Acertos:
<strong>${pontuacao}</strong>
</p>


<p>
❌ Erros:
<strong>${erros}</strong>
</p>


<p>
📚 Total:
<strong>${total}</strong>
</p>


<p>
🏆 Aproveitamento:
<strong>${porcentagem}%</strong>
</p>


</div>

`;
    }
}

function reiniciarQuiz() {
    document.getElementById("tela-resultado").style.display = "none";
    document.getElementById("tela-config").style.display = "block";
}

function voltarConfiguracao() {


    document.getElementById("tela-jogo")
        .style.display = "none";


    document.getElementById("tela-config")
        .style.display = "block";


    bancoPerguntas = [];

    indiceAtual = 0;

    pontuacao = 0;

    erros = 0;


    document.getElementById("feedback-resposta")
        .style.display = "none";


}