$basePath = "c:\Users\HSA\Music\questions"
$novoPath = Join-Path $basePath "novo_testamento"
$velhoPath = Join-Path $basePath "velho_testamento"

$novoOrder = @("mateus.json", "marcos.json", "lucas.json", "joao.json", "atos_dos_apostolos.json", "romanos.json", "1_corintios.json", "2_corintios.json", "galatas.json", "efesios.json", "filipenses.json", "colossenses.json", "1_tessalonicenses.json", "2_tessalonicenses.json", "1_timoteo.json", "2_timoteo.json", "tito.json", "filemon.json", "hebreus.json", "tiago.json", "1_pedro.json", "2_pedro.json", "1_joao.json", "2_joao.json", "3_joao.json", "judas.json", "apocalipse.json")

$velhoOrder = @("genesis.json", "exodo.json", "levitico.json", "numeros.json", "deuteronomio.json", "josue.json", "juizes.json", "rute.json", "1_samuel.json", "2_samuel.json", "1_reis.json", "2_reis.json", "1_cronicas.json", "2_cronicas.json", "esdras.json", "neemias.json", "ester.json", "jo.json", "salmos.json", "proverbios.json", "eclesiastes.json", "cantico_dos_canticos.json", "isaias.json", "jeremias.json", "lamentacoes.json", "ezequiel.json", "daniel.json", "oseias.json", "joel.json", "amos.json", "obadias.json", "jonas.json", "miqueias.json", "naum.json", "habacuque.json", "sofonias.json", "ageu.json", "zacarias.json", "malequias.json")

function ConvertQuestion {
    param([PSCustomObject]$q, [int]$id, [string]$test)
    
    $t = $test
    if ($q.testamento) { $t = $q.testamento }
    if ($q.testament -eq "Velho") { $t = "Velho Testamento" }
    if ($q.testament -eq "Novo") { $t = "Novo Testamento" }
    
    $cat = if ($q.categoria) { $q.categoria } else { if ($q.category) { $q.category } else { "Livros" } }
    $liv = if ($q.livro) { $q.livro } else { if ($q.book) { $q.book } else { "Desconhecido" } }
    $niv = if ($q.nivel) { $q.nivel } else { if ($q.difficulty) { $q.difficulty } else { "Medio" } }
    $per = if ($q.pergunta) { $q.pergunta } else { if ($q.question) { $q.question } else { "" } }
    $alt = if ($q.alternativas) { $q.alternativas } else { if ($q.options) { $q.options } else { @() } }
    $res = if ($q.respostaCorretaIndice -ne $null) { $q.respostaCorretaIndice } else { if ($q.correct -ne $null) { $q.correct } else { 0 } }
    $ref = if ($q.referenciaBiblica) { $q.referenciaBiblica } else { if ($q.reference) { $q.reference } else { "" } }
    $exp = if ($q.explicacao) { $q.explicacao } else { if ($q.explanation) { $q.explanation } else { "" } }
    
    return @{
        id = $id
        testamento = $t
        categoria = $cat
        livro = $liv
        nivel = $niv
        pergunta = $per
        alternativas = $alt
        respostaCorretaIndice = $res
        referenciaBiblica = $ref
        explicacao = $exp
    }
}

$id = 1
$total = 0
$files = @()

foreach ($f in $novoOrder) {
    $p = Join-Path $novoPath $f
    if (Test-Path $p) { $files += $p }
}

foreach ($f in $velhoOrder) {
    $p = Join-Path $velhoPath $f
    if (Test-Path $p) { $files += $p }
}

Write-Host "Processando $($files.Count) arquivos..."

foreach ($fp in $files) {
    $fn = Split-Path $fp -Leaf
    $tt = if ($fp -like "*novo_testamento*") { "Novo Testamento" } else { "Velho Testamento" }
    
    try {
        Write-Host "  $fn..." -NoNewline
        
        $json = Get-Content $fp -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($json -isnot [array]) { $json = @($json) }
        
        $proc = @()
        $start = $id
        
        foreach ($q in $json) {
            $proc += ConvertQuestion -q $q -id $id -test $tt
            $id++
            $total++
        }
        
        $proc | ConvertTo-Json -Depth 100 | Set-Content $fp -Encoding UTF8
        Write-Host " OK ($($proc.Count) itens)"
        
    } catch {
        Write-Host " ERRO: $_"
    }
}

Write-Host "Concluido: $total perguntas. Proximo ID: $id"
