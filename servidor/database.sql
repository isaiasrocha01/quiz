CREATE TABLE IF NOT EXISTS perguntas (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    pergunta TEXT NOT NULL,

    alternativa_a TEXT NOT NULL,

    alternativa_b TEXT NOT NULL,

    alternativa_c TEXT NOT NULL,

    alternativa_d TEXT NOT NULL,

    respostaCorretaIndice INTEGER NOT NULL,

    explicacao TEXT,

    testamento TEXT,

    livro TEXT,

    nivel TEXT,

    categoria TEXT,

    referenciaBiblica TEXT,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE IF NOT EXISTS usuarios (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,

    senha TEXT NOT NULL

);