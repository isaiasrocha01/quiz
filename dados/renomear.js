const fs = require('fs');
const path = require('path');

// Alvo: pasta atual
const pastaRaiz = '.';

let idGlobal = 1; // Começa o ID em 1

function processarPasta(caminhoDaPasta) {
    if (!fs.existsSync(caminhoDaPasta)) return;

    const itens = fs.readdirSync(caminhoDaPasta);

    itens.forEach((item) => {
        const caminhoCompleto = path.join(caminhoDaPasta, item);
        const estatisticas = fs.statSync(caminhoCompleto);

        // Ignora o próprio script
        if (item === 'renomear.js') return;

        if (estatisticas.isDirectory()) {
            processarPasta(caminhoCompleto);
        } else if (estatisticas.isFile() && path.extname(item).toLowerCase() === '.json') {
            processarArquivoJSON(caminhoCompleto);
        }
    });
}

function processarArquivoJSON(caminhoDoArquivo) {
    try {
        let conteudo = fs.readFileSync(caminhoDoArquivo, 'utf-8');

        // CORREÇÃO AQUI: Remove o caractere BOM (\uFEFF) caso ele exista no início do arquivo
        if (conteudo.charCodeAt(0) === 0xFEFF) {
            conteudo = conteudo.slice(1);
        }

        let dados = JSON.parse(conteudo);
        let alterado = false;

        if (Array.isArray(dados)) {
            dados.forEach(item => {
                if (item && typeof item === 'object') {
                    item.id = idGlobal++;
                    alterado = true;
                }
            });
        } else if (dados && typeof dados === 'object') {
            for (const chave in dados) {
                if (Array.isArray(dados[chave])) {
                    dados[chave].forEach(item => {
                        if (item && typeof item === 'object') {
                            item.id = idGlobal++;
                            alterado = true;
                        }
                    });
                }
            }
        }

        if (alterado) {
            fs.writeFileSync(caminhoDoArquivo, JSON.stringify(dados, null, 2), 'utf-8');
            console.log(`✓ Atualizado: ${caminhoDoArquivo}`);
        }
    } catch (erro) {
        console.error(`✗ Erro em ${caminhoDoArquivo}:`, erro.message);
    }
}

console.log('Iniciando atualização dos IDs (com tratamento de BOM)...');
processarPasta(pastaRaiz);
console.log(`\nPronto! Todos os arquivos foram sequenciados. Próximo ID livre: ${idGlobal}`);