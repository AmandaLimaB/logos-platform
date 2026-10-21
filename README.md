# 🛡️ Logos — Central de Resposta a Incidentes

> **Plataforma de Missão Crítica para Gestão de Incidentes Logísticos em Tempo Real**  
> Desenvolvido para transformar o caos de planilhas e mensagens de aplicativo em uma central de inteligência ágil, garantindo que o tempo de resposta a incidentes nas rodovias seja reduzido de horas para minutos.

---

## 📌 Sumário Executivo do Projeto

A **AutoU** foi contratada para digitalizar a operação logística de uma frota com mais de 5.000 caminhões em rota. O **Logos** atua como o cérebro operacional da central de decisão, fornecendo aos analistas uma interface de alta densidade informativa para triagem instantânea, gestão por exceção e resolução colaborativa sem conflitos de concorrência.

---

## 🏛️ Respostas às Decisões de Arquitetura & Engenharia

### 1. Ingestão e Visualização de Dados (100+ Incidentes em Milissegundos)
> *Pergunta do Edital: "Como você apresenta 100 incidentes simultâneos garantindo que o analista identifique o que é prioridade em milissegundos?"*

* **Hierarquia Visual de Alto Contraste:** Inspirada em consoles de resposta a emergências e plataformas como Datadog e AWS GuardDuty, a criticidade **`ALTA`** possui prioridade visual absoluta com **borda lateral vermelha vibrante e indicador de pulso luminoso**.
* **Cards de KPIs no Topo:** O analista não precisa rolar a página para saber a situação da frota; o sumário executivo no topo informa o número exato de ocorrências críticas abertas, em investigação e resolvidas.
* **Ordenação Nativa no Banco de Dados:** A query na API utiliza cláusula `CASE` condicional no SQL para garantir que ocorrências de criticidade `ALTA` sempre venham em primeiro lugar, seguidas por `MEDIA` e `BAIXA`, ordenadas pelas mais recentes dentro do mesmo nível.

### 2. Gestão por Exceção
> *Pergunta do Edital: "O sistema deve permitir filtrar por criticidade e categorias."*

* **Chips de Filtro Rápido:** Alternância com um único clique entre "Todas", "🚨 ALTA (Prioridade Máxima)", "⚠️ Média" e "ℹ️ Baixa".
* **Filtros Combinados:** Suporte a filtros simultâneos por Categoria (*Acidente com Veículo, Acidente com Vítimas, Acidente com Animal, Derramamento de Carga, Condição Climática Atípica, Problema Mecânico, Bloqueio de Pista*) e Status.
* **Busca Textual Abrangente:** Campo de busca que filtra dinamicamente por trecho da rodovia, KM, placa ou detalhes da ocorrência.

### 3. Integridade no Ciclo de Vida & Prevenção de Concorrência
> *Pergunta do Edital: "Como sua aplicação garante que dois analistas não tentem resolver o mesmo problema ao mesmo tempo?"*

* **Controle de Concorrência Otimista (Optimistic Locking):** Cada incidente possui um atributo inteiro `version` no banco de dados.
* **Validação Atômica no Backend:** Ao atualizar um incidente (ex: de *Aberto* para *Em Investigação*), o frontend envia o `expected_version`.
  * Se a versão no banco coincidir, a transação é efetivada e a versão é incrementada (`version = version + 1`).
  * Se outro analista tiver alterado o registro milissegundos antes, a versão não coincidirá e a API rejeita a requisição imediatamente com **`HTTP 409 Conflict`**.
* **Feedback Imediato na Interface:** Caso ocorra conflito 409, a interface dispara um **Banner de Alerta Visual** explicando que outro analista assumiu a ocorrência e sincroniza os dados mais recentes na tela sem perda de integridade.
* **Botão de Demonstração:** Incluímos o botão `⚡ Simular Conflito (409)` em cada card para facilitar a validação e demonstração desse mecanismo durante a avaliação e gravação do vídeo.

### 4. Resiliência e Performance
> *Pergunta do Edital: "Como seu código trata o estado da aplicação enquanto o banco de dados processa uma atualização?"*

* **Optimistic UI:** Ao clicar para iniciar uma investigação ou fechar um incidente, o estado local da interface é atualizado imediatamente, eliminando percepção de lentidão de rede para o analista.
* **Rollback Automático em Falhas:** Se o servidor retornar erro ou timeout, o estado da interface é revertido automaticamente (*rollback*) ao estado anterior acompanhado de notificação.
* **Resiliência a Quedas de Conexão:** A aplicação detecta falhas de rede e exibe banner de aviso de conectividade sem travar a interface.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Backend** | Python 3 + FastAPI | Alta performance assíncrona, validação com tipagem estrita (Pydantic v2) e documentação interativa automática OpenAPI/Swagger. |
| **ORM / Banco** | SQLAlchemy 2.0 + SQLite / PostgreSQL | Abstração sólida e agnóstica de banco, permitindo SQLite local de zero configuração e migração direta para PostgreSQL em produção na nuvem. |
| **Frontend** | React 19 + Vite | Renderização veloz com HMR instantâneo, componentização limpa e bundle ultra leve para máxima responsividade sob alta carga. |
| **Design System** | CSS Moderno / Dark Mode Ops | Paleta de alta densidade sem dependências pesadas, garantindo fidelidade visual e tempo de carregamento imediato. |

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Python 3.10+ instalado
* Node.js 18+ e npm instalados

---

### 1. Inicializando o Backend

```bash
# Navegue até a pasta do backend
cd backend

# Crie e ative o ambiente virtual (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# (Ou no Linux/macOS)
# source .venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Popule o banco com ocorrências realistas de teste
python app/seed.py

# Inicie o servidor FastAPI
uvicorn app.main:app --reload --port 8000
```

> 📖 **Swagger / Documentação da API:** Acesse [http://localhost:8000/docs](http://localhost:8000/docs) para testar os endpoints interativamente.

---

### 2. Inicializando o Frontend

Abra um novo terminal:

```bash
# Navegue até a pasta do frontend
cd frontend

# Inicie o servidor de desenvolvimento
npm run dev
```

> 🌐 **Interface do Analista:** Acesse [http://localhost:5173](http://localhost:5173).

---

## 🧪 Roteiro Sugerido para Apresentação em Vídeo (Pitch & Demo)

1. **Introdução (30s):** Apresentar o problema (caos de WhatsApp e planilhas em frota de 5.000 caminhões) e o papel do Logos como cérebro de triagem.
2. **Visualização em Milissegundos (45s):** Demonstrar os KPIs no topo e como a criticidade ALTA salta aos olhos imediatamente na listagem ordenada.
3. **Gestão por Exceção (45s):** Filtrar por criticidade ALTA, categoria de Bloqueio de Pista e realizar busca textual instantânea.
4. **Ciclo de Vida & Concorrência Otimista (1m):**
   * Transicionar um status de "Aberto" para "Em Investigação" (mostrar incremento do número de revisão `rev 2`).
   * Clicar no botão `⚡ Simular Conflito (409)` e mostrar o bloqueio atômico funcionando com o banner explicativo.
5. **Cadastro de Novo Incidente (30s):** Registrar uma nova ocorrência crítica e demonstrar sua priorização imediata no topo da lista.

---

## 📂 Estrutura de Pastas

```text
logos-platform/
├── backend/
│   ├── app/
│   │   ├── database.py       # Configuração da sessão do banco (SQLAlchemy)
│   │   ├── main.py           # Endpoints da API REST, CORS e ordenação por criticidade
│   │   ├── models.py         # Modelos de dados e Enums com controle de versão
│   │   ├── schemas.py        # Validação de contratos de entrada/saída (Pydantic)
│   │   └── seed.py           # Script para popular ocorrências realistas em rodovias
│   └── requirements.txt      # Dependências do backend
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, KpiCards, FilterBar, IncidentCard, Modais
│   │   ├── constants/        # Cores, categorias e status padronizados
│   │   ├── services/         # Cliente de integração com a API (fetch com gestão de 409)
│   │   ├── App.jsx           # Orquestração do estado, Optimistic UI e filtros
│   │   ├── App.css           # Estilização com alta densidade informativa e animações
│   │   └── index.css         # Tipografia e variáveis de cores
│   ├── package.json
│   └── vite.config.js        # Configuração do Vite com proxy reverso
├── .gitignore                # Regras de exclusão do Git
└── README.md                 # Documentação completa da arquitetura e setup
```

---

*Desenvolvido com foco em excelência de engenharia de software para o desafio técnico AutoU.*
