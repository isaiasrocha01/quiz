#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from pathlib import Path
from datetime import datetime

# Estrutura obrigatória
REQUIRED_FIELDS = {
    "id",
    "testamento",
    "categoria",
    "livro",
    "nivel",
    "pergunta",
    "alternativas",
    "respostaCorretaIndice",
    "referenciaBiblica",
    "explicacao"
}

def get_ordered_files():
    """Retorna lista de arquivos JSON em ordem correta (Novo, depois Velho)"""
    base_path = Path(__file__).parent
    
    novo_testamento_path = base_path / "novo_testamento"
    velho_testamento_path = base_path / "velho_testamento"
    
    files = []
    
    # Novo Testamento (na ordem canônica)
    novo_order = [
        "mateus.json", "marcos.json", "lucas.json", "joao.json",
        "atos_dos_apostolos.json",
        "romanos.json", "1_corintios.json", "2_corintios.json",
        "galatas.json", "efesios.json", "filipenses.json", "colossenses.json",
        "1_tessalonicenses.json", "2_tessalonicenses.json",
        "1_timoteo.json", "2_timoteo.json", "tito.json", "filemon.json",
        "hebreus.json", "tiago.json", "1_pedro.json", "2_pedro.json",
        "1_joao.json", "2_joao.json", "3_joao.json",
        "judas.json", "apocalipse.json"
    ]
    
    for fname in novo_order:
        fpath = novo_testamento_path / fname
        if fpath.exists():
            files.append(fpath)
    
    # Velho Testamento
    velho_order = [
        "genesis.json", "exodo.json", "levitico.json", "numeros.json", "deuteronomio.json",
        "josue.json", "juizes.json", "rute.json", "1_samuel.json", "2_samuel.json",
        "1_reis.json", "2_reis.json", "1_cronicas.json", "2_cronicas.json",
        "esdras.json", "neemias.json", "ester.json", "jo.json", "salmos.json",
        "proverbios.json", "eclesiastes.json", "cantico_dos_canticos.json",
        "isaias.json", "jeremias.json", "lamentacoes.json", "ezequiel.json",
        "daniel.json", "oseias.json", "joel.json", "amos.json", "obadias.json",
        "jonas.json", "miqueias.json", "naum.json", "habacuque.json", "sofonias.json",
        "ageu.json", "zacarias.json", "malequias.json"
    ]
    
    for fname in velho_order:
        fpath = velho_testamento_path / fname
        if fpath.exists():
            files.append(fpath)
    
    return files

def map_old_to_new(old_data):
    """Converte dados antigos para o novo padrão"""
    new_data = {}
    
    # Mapeamento de campos
    field_mapping = {
        "testamento": "testamento",
        "testament": "testamento",
        "categoria": "categoria",
        "category": "categoria",
        "livro": "livro",
        "book": "livro",
        "nivel": "nivel",
        "difficulty": "nivel",
        "pergunta": "pergunta",
        "question": "pergunta",
        "alternativas": "alternativas",
        "options": "alternativas",
        "respostaCorretaIndice": "respostaCorretaIndice",
        "correct": "respostaCorretaIndice",
        "referenciaBiblica": "referenciaBiblica",
        "reference": "referenciaBiblica",
        "explicacao": "explicacao",
        "explanation": "explicacao",
    }
    
    # Copiar campos mapeados
    for old_field, new_field in field_mapping.items():
        if old_field in old_data:
            new_data[new_field] = old_data[old_field]
    
    # Tratamento especial para testamento (remover "Velho" e converter para "Velho Testamento")
    if "testamento" in new_data:
        if new_data["testamento"] == "Velho":
            new_data["testamento"] = "Velho Testamento"
        elif new_data["testamento"] == "Novo":
            new_data["testamento"] = "Novo Testamento"
    
    return new_data

def standardize_question(question_data, new_id, testamento_default=None):
    """Padroniza um objeto de pergunta com o novo ID"""
    standardized = {}
    
    # Converter campos antigos
    converted = map_old_to_new(question_data)
    
    # Construir objeto com estrutura obrigatória
    standardized["id"] = new_id
    standardized["testamento"] = converted.get("testamento", testamento_default or "Novo Testamento")
    standardized["categoria"] = converted.get("categoria", "Livros")
    standardized["livro"] = converted.get("livro", "Desconhecido")
    standardized["nivel"] = converted.get("nivel", "Médio")
    standardized["pergunta"] = converted.get("pergunta", "")
    standardized["alternativas"] = converted.get("alternativas", [])
    standardized["respostaCorretaIndice"] = converted.get("respostaCorretaIndice", 0)
    standardized["referenciaBiblica"] = converted.get("referenciaBiblica", "")
    standardized["explicacao"] = converted.get("explicacao", "")
    
    return standardized

def process_all_files():
    """Processa todos os arquivos JSON"""
    files = get_ordered_files()
    current_id = 1
    total_processed = 0
    
    print(f"Iniciando processamento de {len(files)} arquivos...")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 80)
    
    for file_path in files:
        try:
            print(f"\nProcessando: {file_path.name}")
            
            # Ler arquivo
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Garantir que é uma lista
            if not isinstance(data, list):
                data = [data]
            
            # Processar perguntas
            processed_questions = []
            start_id = current_id
            
            for question in data:
                # Determinar testamento baseado no arquivo
                testamento = "Novo Testamento" if "novo_testamento" in str(file_path) else "Velho Testamento"
                
                standardized = standardize_question(question, current_id, testamento)
                processed_questions.append(standardized)
                current_id += 1
                total_processed += 1
            
            # Salvar arquivo padronizado
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(processed_questions, f, ensure_ascii=False, indent=2)
            
            print(f"✓ {len(processed_questions)} perguntas processadas (IDs: {start_id}-{current_id-1})")
            
        except Exception as e:
            print(f"✗ Erro ao processar {file_path.name}: {str(e)}")
    
    print("\n" + "=" * 80)
    print(f"Processamento concluído!")
    print(f"Total de perguntas processadas: {total_processed}")
    print(f"Último ID utilizado: {current_id - 1}")
    print(f"Próximo ID disponível: {current_id}")

if __name__ == "__main__":
    process_all_files()
