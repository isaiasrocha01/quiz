const livrosEstudo = {
    "Velho Testamento": ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cântico dos Cânticos", "Isaías", "Jeremias", "Lamentações de Jeremias", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias"],
    "Novo Testamento": ["Mateus", "Marcos", "Lucas", "João", "Atos dos Apóstolos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"]
};

let itensEstudo = [];
let indiceEstudoAtual = 0;

const testamentoSel = document.getElementById("estudo-testamento");
const categoriaSel = document.getElementById("estudo-categoria");
const livroSel = document.getElementById("estudo-livro");
const areaLivroEstudo = document.getElementById("areaLivroEstudo");

categoriaSel.addEventListener("change", () => {
    if (categoriaSel.value === "Livros") {
        areaLivroEstudo.style.display = "block";
        carregarLivrosEstudo();
    } else {
        areaLivroEstudo.style.display = "none";
    }
});
testamentoSel.addEventListener("change", carregarLivrosEstudo);

function carregarLivrosEstudo() {
    livroSel.innerHTML = '<option value="">Selecione...</option>';
    let lista = livrosEstudo[testamentoSel.value];
    if (!lista) return;
    lista.forEach(nome => {
        let opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = nome;
        livroSel.appendChild(opt);
    });
}

function formatarNomeArquivo(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
}

async function carregarEstudo() {
    let url = "../dados/";

    if (categoriaSel.value === "Livros") {
        if (!testamentoSel.value || !livroSel.value) return alert("Selecione o Testamento e o Livro!");
        let pasta = testamentoSel.value === "Velho Testamento" ? "velho_testamento" : "novo_testamento";
        url += `${pasta}/${formatarNomeArquivo(livroSel.value)}.json`;
    } else {
        if (!categoriaSel.value) return alert("Selecione a categoria!");
        url += `${categoriaSel.value.toLowerCase()}.json`;
    }

    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error();
        itensEstudo = await response.json();

        if (itensEstudo.length === 0) {
            return alert("Este arquivo está vazio.");
        }

        document.getElementById("estudo-config").style.display = "none";
        document.getElementById("estudo-painel").style.display = "block";

        indiceEstudoAtual = 0;
        mostrarCard();

    } catch (e) {
        alert("Erro ao abrir o arquivo de dados. Verifique se ele foi gerado e salvo corretamente.");
    }
}

function mostrarCard() {
    // Esconde o verso da resposta ao mudar de card
    document.getElementById("estudo-resposta-bloco").style.display = "none";
    document.getElementById("btn-revelar").style.display = "block";

    let p = itensEstudo[indiceEstudoAtual];
    let letras = ["A", "B", "C", "D"];

    // Configuração do Progresso e Nível
    document.getElementById("estudo-progresso").textContent = `Ficha de Estudo: ${indiceEstudoAtual + 1} de ${itensEstudo.length}`;

    let badgNivel = document.getElementById("estudo-nivel");
    badgNivel.textContent = p.nivel || "Médio";
    badgNivel.style.backgroundColor = p.nivel === "Fácil" ? "#d4edda" : p.nivel === "Difícil" ? "#f8d7da" : "#fff3cd";
    badgNivel.style.color = p.nivel === "Fácil" ? "#155724" : p.nivel === "Difícil" ? "#721c24" : "#856404";

    document.getElementById("estudo-pergunta-texto").textContent = p.pergunta;

    // Renderiza as alternativas apenas para leitura
    let containerAlt = document.getElementById("estudo-alternativas");
    containerAlt.innerHTML = "";
    p.alternativas.forEach((alt, idx) => {
        let parágrafo = document.createElement("p");
        parágrafo.innerHTML = `<strong>${letras[idx]})</strong> ${alt}`;
        if (idx === p.respostaCorretaIndice) {
            parágrafo.id = "alt-correta-alvo"; // Guardado para destacar depois se quiser
        }
        containerAlt.appendChild(parágrafo);
    });

    // Preparar dados ocultos do verso
    document.getElementById("estudo-resposta-letra").textContent = `${letras[p.respostaCorretaIndice]}) ${p.alternativas[p.respostaCorretaIndice]}`;
    document.getElementById("estudo-referencia").textContent = p.referenciaBiblica ? `📖 Referência: ${p.referenciaBiblica}` : "📖 Sem referência informada";
    document.getElementById("estudo-explicacao").textContent = p.explicacao ? `💡 Explicação: ${p.explicacao}` : "💡 Sem explicação detalhada adicionada.";

    // Gerenciar estado dos botões de navegação
    document.getElementById("btn-anterior").disabled = (indiceEstudoAtual === 0);
    document.getElementById("btn-proximo").disabled = (indiceEstudoAtual === itensEstudo.length - 1);
}

function revelarResposta() {
    document.getElementById("btn-revelar").style.display = "none";
    document.getElementById("estudo-resposta-bloco").style.display = "block";
}

function proximoCard() {
    if (indiceEstudoAtual < itensEstudo.length - 1) {
        indiceEstudoAtual++;
        mostrarCard();
    }
}

function anteriorCard() {
    if (indiceEstudoAtual > 0) {
        indiceEstudoAtual--;
        mostrarCard();
    }
}

function voltarConfig() {
    document.getElementById("estudo-painel").style.display = "none";
    document.getElementById("estudo-config").style.display = "block";
}