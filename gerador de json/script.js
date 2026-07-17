let perguntas = JSON.parse(localStorage.getItem("perguntas")) || [];

let testamentoFixo = localStorage.getItem("testamentoFixo") || null;
let categoriaFixa = localStorage.getItem("categoriaFixa") || null;
let livroFixo = localStorage.getItem("livroFixo") || null;
let perguntaEditando = null;


// ========================
// LIVROS DA BÍBLIA
// ========================
const livros = {

    "Velho Testamento": [
        "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
        "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
        "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
        "Neemias", "Ester", "Jó", "Salmos", "Provérbios",
        "Eclesiastes", "Cântico dos Cânticos", "Isaías", "Jeremias",
        "Lamentações de Jeremias", "Ezequiel", "Daniel",
        "Oséias", "Joel", "Amós", "Obadias", "Jonas",
        "Miquéias", "Naum", "Habacuque", "Sofonias",
        "Ageu", "Zacarias", "Malaquias"
    ],

    "Novo Testamento": [
        "Mateus", "Marcos", "Lucas", "João",
        "Atos dos Apóstolos", "Romanos",
        "1 Coríntios", "2 Coríntios", "Gálatas",
        "Efésios", "Filipenses", "Colossenses",
        "1 Tessalonicenses", "2 Tessalonicenses",
        "1 Timóteo", "2 Timóteo", "Tito",
        "Filemom", "Hebreus", "Tiago",
        "1 Pedro", "2 Pedro", "1 João",
        "2 João", "3 João", "Judas",
        "Apocalipse"
    ]
};


// ========================
// ELEMENTOS
// ========================
const categoria = document.getElementById("categoria");
const livro = document.getElementById("livro");
const areaLivro = document.getElementById("areaLivro");
const testamento = document.getElementById("testamento");
const lista = document.getElementById("lista");
const importar = document.getElementById("importar");


// ========================
// EVENTOS
// ========================

categoria.addEventListener("change", () => {

    if (categoria.value === "Livros") {

        areaLivro.style.display = "block";
        carregarLivros();

    } else {

        areaLivro.style.display = "none";
        livro.innerHTML = `<option value="">Selecione...</option>`;
    }

    preview();
});


testamento.addEventListener("change", carregarLivros);


// ========================
// CARREGAR LIVROS
// ========================

function carregarLivros() {

    livro.innerHTML = `<option value="">Selecione...</option>`;

    let listaLivros = livros[testamento.value];

    if (!listaLivros) return;


    listaLivros.forEach(nome => {

        let option = document.createElement("option");

        option.value = nome;
        option.textContent = nome;

        livro.appendChild(option);

    });


    if (livroFixo) {

        livro.value = livroFixo;

    }

}


// ========================
// OBJETO JSON
// ========================

function objetoAtual() {

    return {

        id: perguntas.length + 1,

        testamento: testamento.value,

        categoria: categoria.value,

        livro:
            categoria.value === "Livros"
                ? livro.value
                : "",

        nivel:
            document.getElementById("nivel").value,

        pergunta:
            document.getElementById("pergunta").value,


        alternativas: [

            document.getElementById("a1").value,
            document.getElementById("a2").value,
            document.getElementById("a3").value,
            document.getElementById("a4").value

        ],


        respostaCorretaIndice:
            Number(document.getElementById("correta").value),


        referenciaBiblica:
            document.getElementById("referencia").value,


        explicacao:
            document.getElementById("explicacao").value


    };

}



// ========================
// ADICIONAR
// ========================

function adicionar() {


    if (categoriaFixa && categoria.value !== categoriaFixa) {

        alert("A categoria está fixa.");
        return;

    }



    if (livroFixo && livro.value !== livroFixo) {

        alert("O livro está fixo.");
        return;

    }



    let obrigatorios = [

        "testamento",
        "categoria",
        "pergunta",
        "a1",
        "a2",
        "a3",
        "a4"

    ];


    if (categoria.value === "Livros") {

        obrigatorios.push("livro");

    }



    for (let id of obrigatorios) {

        let campo = document.getElementById(id);

        if (!campo.value.trim()) {

            campo.classList.add("campo-erro");

            alert("Preencha os campos obrigatórios.");

            return;

        }

    }

    if (perguntaEditando !== null) {

        let novaPergunta = objetoAtual();

        // mantém o mesmo ID
        novaPergunta.id = perguntas[perguntaEditando].id;


        // substitui no mesmo lugar
        perguntas[perguntaEditando] = novaPergunta;


        perguntaEditando = null;


    } else {

        perguntas.push(objetoAtual());

    }


    localStorage.setItem(
        "perguntas",
        JSON.stringify(perguntas)
    );



    if (perguntas.length === 1) {


        testamentoFixo = testamento.value;
        categoriaFixa = categoria.value;


        localStorage.setItem(
            "testamentoFixo",
            testamentoFixo
        );


        localStorage.setItem(
            "categoriaFixa",
            categoriaFixa
        );



        testamento.disabled = true;

        categoria.disabled = true;



        if (categoriaFixa === "Livros") {


            livroFixo = livro.value;


            localStorage.setItem(
                "livroFixo",
                livroFixo
            );


            livro.disabled = true;

            areaLivro.style.display = "block";


        }

    }


    listar();

    limpar();

    preview();


}




// ========================
// LIMPAR CAMPOS
// ========================

function limpar() {


    document.querySelectorAll("input,textarea")
        .forEach(c => {

            if (c.type !== "file")
                c.value = "";

        });


    document.querySelectorAll("select")
        .forEach(c => {


            if (
                c.id === "testamento" ||
                c.id === "categoria" ||
                c.id === "livro"
            )
                return;


            c.selectedIndex = 0;


        });



    if (livroFixo) {

        areaLivro.style.display = "block";

        livro.value = livroFixo;

    }


}


// ========================
// LISTAR
// ========================

function listar() {

    lista.innerHTML = "";


    perguntas.forEach((p, i) => {

        let div = document.createElement("div");

        div.className = "card-pergunta";


        let letras = ["A", "B", "C", "D"];

        div.innerHTML = `

<h3>${p.id} - ${p.pergunta}</h3>

<p><strong>Categoria:</strong> ${p.categoria}</p>

<p><strong>Testamento:</strong> ${p.testamento}</p>

<p><strong>Livro:</strong> ${p.livro || "N/A"}</p>

<br>

<p><strong>Alternativas:</strong></p>

<p>
A) ${p.alternativas[0]}<br>
B) ${p.alternativas[1]}<br>
C) ${p.alternativas[2]}<br>
D) ${p.alternativas[3]}
</p>

<p>
<strong>Resposta:</strong> 
${letras[p.respostaCorretaIndice]}) 
${p.alternativas[p.respostaCorretaIndice]}
</p>




<button class="btnAcao btnEditar" onclick="editar(${i})">
Editar
</button>

<button class="btnAcao btnExcluir" onclick="excluir(${i})">
Excluir
</button>

`;

        lista.appendChild(div);

    });

}

// ========================
// EDITAR PERGUNTA
// ========================

function editar(i) {

    let p = perguntas[i];

    perguntaEditando = i;


    testamento.value = p.testamento;

    categoria.value = p.categoria;


    if (p.categoria === "Livros") {

        areaLivro.style.display = "block";

        carregarLivros();

        livro.value = p.livro;

    }


    document.getElementById("nivel").value = p.nivel;

    document.getElementById("pergunta").value = p.pergunta;


    document.getElementById("a1").value = p.alternativas[0];

    document.getElementById("a2").value = p.alternativas[1];

    document.getElementById("a3").value = p.alternativas[2];

    document.getElementById("a4").value = p.alternativas[3];


    document.getElementById("correta").value =
        p.respostaCorretaIndice;


    document.getElementById("referencia").value =
        p.referenciaBiblica;


    document.getElementById("explicacao").value =
        p.explicacao;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ========================
// EXCLUIR
// ========================

function excluir(i) {

    perguntas.splice(i, 1);


    localStorage.setItem(
        "perguntas",
        JSON.stringify(perguntas)
    );



    listar();

}


// ========================
// EXPORTAR
// ========================

function exportar() {


    if (perguntas.length === 0) {

        alert("Nenhuma pergunta.");

        return;

    }



    let blob = new Blob(
        [
            JSON.stringify(perguntas, null, 4)
        ],
        {
            type: "application/json"
        }
    );



    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "perguntas.json";

    link.click();



    // limpa tudo

    localStorage.clear();


    perguntas = [];

    testamentoFixo = null;
    categoriaFixa = null;
    livroFixo = null;


    testamento.disabled = false;

    categoria.disabled = false;

    livro.disabled = false;


    listar();

    limpar();

    preview();


}



// ========================
// PREVIEW
// ========================

function preview() {

    let p = document.getElementById("preview");

    if (p) {

        let dados = objetoAtual();

        p.textContent = JSON.stringify(dados, null, 4);

    }

}

document.querySelectorAll("input, textarea, select")
    .forEach(campo => {
        campo.addEventListener("input", preview);
        campo.addEventListener("change", preview);
    });

// ========================
// APLICAR CONFIGURAÇÃO IMPORTADA
// ========================

function aplicarConfiguracao() {

    if (testamentoFixo) {

        testamento.value = testamentoFixo;
        testamento.disabled = true;

    }


    if (categoriaFixa) {

        categoria.value = categoriaFixa;
        categoria.disabled = true;

    }


    if (categoriaFixa === "Livros") {

        areaLivro.style.display = "block";

        carregarLivros();

        livro.value = livroFixo;

        livro.disabled = true;

    }

}

// ========================
// RESTAURAR APÓS F5
// ========================

window.onload = function () {


    if (testamentoFixo) {

        testamento.value = testamentoFixo;

        testamento.disabled = true;

    }



    if (categoriaFixa) {

        categoria.value = categoriaFixa;

        categoria.disabled = true;


    }



    if (categoriaFixa === "Livros") {

        areaLivro.style.display = "block";


        carregarLivros();


        livro.disabled = true;


    }



    listar();

    preview();


}

// ========================
// IMPORTAR JSON
// ========================

importar.addEventListener("change", function () {

    let arquivo = this.files[0];

    if (!arquivo) return;


    let leitor = new FileReader();


    leitor.onload = function (e) {

        try {

            let dados = JSON.parse(e.target.result);


            if (!Array.isArray(dados)) {

                alert("Arquivo JSON inválido.");

                return;

            }


            // Ignora os IDs existentes no JSON e recria a sequência
            perguntas = dados.map((p, index) => {

                return {
                    ...p,
                    id: index + 1
                };

            });


            // recuperar configuração pelo primeiro registro
            if (perguntas.length > 0) {

                testamentoFixo = perguntas[0].testamento;
                categoriaFixa = perguntas[0].categoria;
                livroFixo = perguntas[0].livro || null;


                localStorage.setItem(
                    "testamentoFixo",
                    testamentoFixo
                );

                localStorage.setItem(
                    "categoriaFixa",
                    categoriaFixa
                );

                if (livroFixo) {

                    localStorage.setItem(
                        "livroFixo",
                        livroFixo
                    );

                }

            }


            localStorage.setItem(
                "perguntas",
                JSON.stringify(perguntas)
            );


            aplicarConfiguracao();


            listar();

            preview();


            alert("Perguntas importadas com sucesso!");

        }
        catch (erro) {

            alert("Erro ao ler o arquivo JSON.");

            console.error(erro);

        }

    };


    leitor.readAsText(arquivo);

});


// ========================
// REINICIAR CONFIGURAÇÃO
// ========================

function reiniciarConfiguracao() {


    if (!confirm("Deseja realmente reiniciar a configuração?")) {
        return;
    }


    // Remove dados fixos
    localStorage.removeItem("testamentoFixo");
    localStorage.removeItem("categoriaFixa");
    localStorage.removeItem("livroFixo");
    localStorage.removeItem("perguntas");


    // Zera variáveis
    perguntas = [];

    testamentoFixo = null;
    categoriaFixa = null;
    livroFixo = null;


    // Libera campos
    testamento.disabled = false;
    categoria.disabled = false;
    livro.disabled = false;


    // Volta selects para o início
    testamento.value = "";
    categoria.value = "";

    livro.innerHTML = `
        <option value="">Selecione...</option>
    `;


    areaLivro.style.display = "none";


    // Limpa formulário
    document.querySelectorAll("input, textarea")
        .forEach(c => {

            if (c.type !== "file") {
                c.value = "";
            }

        });


    document.querySelectorAll("select")
        .forEach(c => {

            if (
                c.id !== "testamento" &&
                c.id !== "categoria"
            ) {
                c.selectedIndex = 0;
            }

        });


    listar();

    preview();


    alert("Configuração reiniciada. Você pode escolher novas categorias.");

}

// ========================
// GERAR PDF DAS PERGUNTAS
// LAYOUT COMPACTO EM DUAS COLUNAS
// ========================

async function baixarPDF() {

    if (perguntas.length === 0) {

        alert("Nenhuma pergunta cadastrada.");
        return;

    }


    const { jsPDF } = window.jspdf;


    let pdf = new jsPDF(
        "p",
        "mm",
        "a4"
    );


    let paginaAtual = 0;


    let criarPagina = document.createElement("div");


    for (
        let inicio = 0;
        inicio < perguntas.length;
        inicio += 10
    ) {


        let area = document.createElement("div");


        area.style.width = "794px";
        area.style.padding = "25px";
        area.style.background = "#fff";
        area.style.display = "grid";
        area.style.gridTemplateColumns = "1fr 1fr";
        area.style.gap = "12px";
        area.style.fontFamily = "Arial";


        let titulo = document.createElement("h2");

        titulo.innerHTML =
            "📖 Oficina Bíblica - Perguntas Cadastradas";


        titulo.style.gridColumn =
            "1 / -1";

        titulo.style.textAlign =
            "center";

        titulo.style.color =
            "#1f3a60";


        area.appendChild(titulo);



        let grupo =
            perguntas.slice(
                inicio,
                inicio + 10
            );



        grupo.forEach(p => {


            let card =
                document.createElement("div");


            card.style.border =
                "2px solid #1f3a60";


            card.style.borderLeft =
                "5px solid #c59b27";


            card.style.borderRadius =
                "10px";


            card.style.padding =
                "10px";


            card.style.fontSize =
                "11px";


            card.style.lineHeight =
                "1.25";



            card.innerHTML = `

<b style="color:#1f3a60">
${p.id} - ${p.pergunta}
</b>

<br><br>

<b>Categoria:</b> ${p.categoria}

&nbsp;&nbsp;&nbsp;

<b>Testamento:</b> ${p.testamento}

<br>

<b>Livro:</b> ${p.livro || "N/A"}

<br><br>

<b>A)</b> ${p.alternativas[0]}<br>
<b>B)</b> ${p.alternativas[1]}<br>
<b>C)</b> ${p.alternativas[2]}<br>
<b>D)</b> ${p.alternativas[3]}

<br>

<b>Resposta:</b>
${["A", "B", "C", "D"][p.respostaCorretaIndice]}

<br>

<b>Ref:</b>
${p.referenciaBiblica || ""}

`;


            area.appendChild(card);


        });



        document.body.appendChild(area);



        let canvas =
            await html2canvas(
                area,
                {
                    scale: 3,
                    backgroundColor: "#ffffff"
                }
            );



        let imagem =
            canvas.toDataURL(
                "image/png",
                1
            );



        if (paginaAtual > 0) {

            pdf.addPage();

        }



        pdf.addImage(

            imagem,

            "PNG",

            10,

            10,

            190,

            277

        );



        document.body.removeChild(area);


        paginaAtual++;


    }



    // Nome automático do PDF

    let nomeArquivo = "perguntas-biblicas";


    if (
        categoriaFixa === "Livros" &&
        livroFixo
    ) {

        nomeArquivo = livroFixo
            .toLowerCase()
            .replaceAll(" ", "-");

    }


    pdf.save(
        nomeArquivo + ".pdf"
    );


}