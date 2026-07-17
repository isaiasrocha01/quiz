const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const path = require("path");

// Garante que o banco de dados seja criado/lido dentro da pasta 'servidor'
const caminhoBanco = path.join(__dirname, "oficina.db");
const banco = new sqlite3.Database(caminhoBanco);

// Garante que ele busque o 'database.sql' dentro da pasta 'servidor'
const caminhoSQL = path.join(__dirname, "database.sql");

try {
    const sql = fs.readFileSync(caminhoSQL, "utf8");
    banco.exec(sql);
} catch (erro) {
    console.error("Aviso: Não foi possível ler o arquivo database.sql. Verifique se ele está na pasta 'servidor'.", erro.message);
}


// =========================================================
// NOVA ROTA: Retorna apenas a quantidade total de perguntas
// =========================================================
app.get("/perguntas/total", (req, res) => {
    banco.get("SELECT COUNT(*) AS total FROM perguntas", [], (erro, resultado) => {
        if (erro) {
            res.status(500).json({ erro: "Erro ao obter o total de perguntas" });
        } else {
            res.json({ total: resultado.total });
        }
    });
});


// listar perguntas
app.get("/perguntas", (req, res) => {
    banco.all(
        "SELECT * FROM perguntas ORDER BY id DESC",
        [],
        (erro, dados) => {
            res.json(dados);
        }
    );
});

// salvar pergunta
app.post("/perguntas", (req, res) => {
    let p = req.body;

    banco.run(`
    INSERT INTO perguntas
    (
    pergunta,
    alternativa_a,
    alternativa_b,
    alternativa_c,
    alternativa_d,
    respostaCorretaIndice,
    explicacao,
    testamento,
    livro,
    nivel,
    categoria,
    referenciaBiblica
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `,
        [
            p.pergunta,
            p.alternativa_a,
            p.alternativa_b,
            p.alternativa_c,
            p.alternativa_d,
            p.respostaCorretaIndice,
            p.explicacao,
            p.testamento,
            p.livro,
            p.nivel,
            p.categoria,
            p.referenciaBiblica
        ],
        function () {
            res.json({
                sucesso: true,
                id: this.lastID
            });
        });
});

// excluir
app.delete("/perguntas/:id", (req, res) => {
    banco.run(
        "DELETE FROM perguntas WHERE id=?",
        req.params.id,
        () => {
            res.json({
                sucesso: true
            });
        });
});

app.listen(3000, () => {
    console.log(
        "Servidor Oficina Bíblica rodando na porta 3000"
    );
});