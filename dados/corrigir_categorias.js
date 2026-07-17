const fs = require('fs');
const path = require('path');

const pastaRaiz = '.';

function corrigirCategoriaArquivo(caminhoDoArquivo, categoria) {
    try {
        let conteudo = fs.readFileSync(caminhoDoArquivo, 'utf-8');

        // Remove BOM se existir
        if (conteudo.charCodeAt(0) === 0xFEFF) {
            conteudo = conteudo.slice(1);
        }

        let dados = JSON.parse(conteudo);
        let alterado = false;

        function aplicarCategoria(obj) {
            if (Array.isArray(obj)) {
                obj.forEach(item => {
                    if (item && typeof item === 'object') {
                        if (item.categoria !== categoria) {
                            item.categoria = categoria;
                            alterado = true;
                        }
                    }
                });
            } else if (obj && typeof obj === 'object') {
                if (obj.categoria !== undefined && obj.categoria !== categoria) {
                    obj.categoria = categoria;
                    alterado = true;
                }

                for (const chave in obj) {
                    if (Array.isArray(obj[chave])) {
                        obj[chave].forEach(item => {
                            if (item && typeof item === 'object') {
                                if (item.categoria !== categoria) {
                                    item.categoria = categoria;
                                    alterado = true;
                                }
                            }
                        });
                    }
                }
            }
        }

        aplicarCategoria(dados);

        if (alterado) {
            fs.writeFileSync(
                caminhoDoArquivo,
                JSON.stringify(dados, null, 2),
                'utf-8'
            );

            console.log(`✓ Corrigido: ${caminhoDoArquivo} → ${categoria}`);
        }

    } catch (erro) {
        console.error(`✗ Erro em ${caminhoDoArquivo}: ${erro.message}`);
    }
}


function percorrerPasta(caminhoDaPasta) {
    const itens = fs.readdirSync(caminhoDaPasta);

    itens.forEach(item => {
        const caminhoCompleto = path.join(caminhoDaPasta, item);

        const stat = fs.statSync(caminhoCompleto);

        if (stat.isDirectory()) {

            const nomePasta = item.toLowerCase();

            // Pastas dos testamentos
            if (nomePasta === 'velho_testamento' || nomePasta === 'novo_testamento') {
                corrigirTodosLivros(caminhoCompleto);
            } else {
                percorrerPasta(caminhoCompleto);
            }

        } else if (stat.isFile() && item.toLowerCase().endsWith('.json')) {

            const nomeArquivo = item.toLowerCase();

            if (nomeArquivo === 'eventos.json') {
                corrigirCategoriaArquivo(caminhoCompleto, 'Eventos');
            }

            if (nomeArquivo === 'lugares.json') {
                corrigirCategoriaArquivo(caminhoCompleto, 'Lugares');
            }

            if (nomeArquivo === 'pessoas.json') {
                corrigirCategoriaArquivo(caminhoCompleto, 'Pessoas');
            }
        }
    });
}


function corrigirTodosLivros(pasta) {

    const arquivos = fs.readdirSync(pasta);

    arquivos.forEach(item => {

        const caminho = path.join(pasta, item);
        const stat = fs.statSync(caminho);

        if (stat.isDirectory()) {
            corrigirTodosLivros(caminho);

        } else if (stat.isFile() && item.toLowerCase().endsWith('.json')) {
            corrigirCategoriaArquivo(caminho, 'Livros');
        }
    });
}


console.log('Iniciando correção das categorias...');
percorrerPasta(pastaRaiz);
console.log('✓ Finalizado!');