import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Garante path correto
sys.path.append(str(Path(__file__).resolve().parent))

from database import SessionLocal, engine, Base
import models

# Cria tabelas se não existirem
Base.metadata.create_all(bind=engine)

SAMPLE_INCIDENTS = [
    {
        "title": "Tombamento de carreta com bloqueio total",
        "description": "Carreta bi-trem bitrem carregada tombou no km 245. Ambas as faixas bloqueadas no sentido decrescente. Congestionamento de 7km.",
        "category": models.CategoryEnum.BLOQUEIO_PISTA,
        "criticality": models.CriticalityEnum.ALTA,
        "location": "BR-116, Km 245 - Vitória da Conquista/BA",
        "status": models.StatusEnum.ABERTO,
    },
    {
        "title": "Colisão frontal com vítimas presas às ferragens",
        "description": "Colisão entre caminhão tanque e utilitário. Equipes de socorro da concessionária acionadas. Pista operando em sistema pare-e-siga.",
        "category": models.CategoryEnum.ACIDENTE_VITIMAS,
        "criticality": models.CriticalityEnum.ALTA,
        "location": "BR-101, Km 180 - Feira de Santana/BA",
        "status": models.StatusEnum.EM_INVESTIGACAO,
    },
    {
        "title": "Derramamento de carga química (material corrosivo)",
        "description": "Vazamento de tambores de ácido após freada brusca. Risco ambiental e à segurança dos motoristas. Polícia Rodoviária e Defesa Civil no local.",
        "category": models.CategoryEnum.PERDA_CARGA,
        "criticality": models.CriticalityEnum.ALTA,
        "location": "BR-381, Km 490 - Betim/MG",
        "status": models.StatusEnum.ABERTO,
    },
    {
        "title": "Neblina densa com visibilidade inferior a 10 metros",
        "description": "Forte cerração na serra impedindo tráfego em velocidade operacional regular. Risco iminente de engavetamento.",
        "category": models.CategoryEnum.CLIMA_ATIPICO,
        "criticality": models.CriticalityEnum.ALTA,
        "location": "BR-277, Km 42 - Serra do Mar/PR",
        "status": models.StatusEnum.ABERTO,
    },
    {
        "title": "Quebra de eixo de veículo pesado na subida de serra",
        "description": "Caminhão trucado quebrou sobre a terceira faixa. Tráfego lento, guincho pesado já requisitado com previsão de chegada em 35 minutos.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.MEDIA,
        "location": "BR-040, Km 780 - Juiz de Fora/MG",
        "status": models.StatusEnum.EM_INVESTIGACAO,
    },
    {
        "title": "Bovino solto atravessando a pista de rolamento",
        "description": "Animal de grande porte na faixa de rolamento da direita. Concessionária enviou equipe de apreensão de animais.",
        "category": models.CategoryEnum.ACIDENTE_ANIMAL,
        "criticality": models.CriticalityEnum.MEDIA,
        "location": "BR-101, Km 82 - Alagoinhas/BA",
        "status": models.StatusEnum.ABERTO,
    },
    {
        "title": "Colisão traseira de baixa intensidade sem feridos",
        "description": "Colisão entre dois caminhões no acostamento. Apenas danos materiais na traseira e para-choque. Motoristas aguardando perícia.",
        "category": models.CategoryEnum.ACIDENTE_VEICULO,
        "criticality": models.CriticalityEnum.BAIXA,
        "location": "BR-116, Km 112 - Campina Grande do Sul/PR",
        "status": models.StatusEnum.EM_INVESTIGACAO,
    },
    {
        "title": "Superaquecimento de motor no acostamento",
        "description": "Caminhão parado no acostamento seguro aguardando resfriamento e reposição de líquido de arrefecimento. Sem impacto no fluxo.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.BAIXA,
        "location": "BR-050, Km 60 - Uberlândia/MG",
        "status": models.StatusEnum.FECHADO,
    },
    {
        "title": "Queda de barreira parcial após fortes chuvas",
        "description": "Deslizamento de terra ocupando meia pista na faixa da esquerda. Cones de sinalização já instalados a 200m.",
        "category": models.CategoryEnum.BLOQUEIO_PISTA,
        "criticality": models.CriticalityEnum.ALTA,
        "location": "BR-101, Km 440 - Ubatuba/SP",
        "status": models.StatusEnum.ABERTO,
    },
    {
        "title": "Derramamento de grãos de soja na via",
        "description": "Abertura acidental da bica do caminhão caçamba. Camada escorregadia de grãos por 300 metros. Equipe de varrição acionada.",
        "category": models.CategoryEnum.PERDA_CARGA,
        "criticality": models.CriticalityEnum.MEDIA,
        "location": "BR-163, Km 610 - Nova Mutum/MT",
        "status": models.StatusEnum.EM_INVESTIGACAO,
    },
    {
        "title": "Pneu estourado de caminhão em faixa de desaceleração",
        "description": "Veículo parado em local seguro próximo a posto de pesagem. Borracheiro móvel acionado pelo motorista.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.BAIXA,
        "location": "BR-153, Km 320 - Anápolis/GO",
        "status": models.StatusEnum.FECHADO,
    },
    {
        "title": "Queda de árvore de grande porte sobre a fiação e via",
        "description": "Ventania derrubou eucalipto obstruindo faixa 1 e 2. Corpo de Bombeiros no local realizando desobstrução com motosserras.",
        "category": models.CategoryEnum.BLOQUEIO_PISTA,
        "criticality": models.CriticalityEnum.ALTA,
        "location": "BR-116, Km 310 - Registro/SP",
        "status": models.StatusEnum.EM_INVESTIGACAO,
    },
    {
        "title": "Pista com lâmina d'água (Aquaplanagem)",
        "description": "Chuva torrencial repentina acumulando poças profundas no trecho em curva. Redução preventiva de velocidade recomendada no painel eletrônico.",
        "category": models.CategoryEnum.CLIMA_ATIPICO,
        "criticality": models.CriticalityEnum.MEDIA,
        "location": "BR-376, Km 668 - Guaratuba/PR",
        "status": models.StatusEnum.ABERTO,
    },
    {
        "title": "Alerta de animal silvestre (Tamanduá) na pista",
        "description": "Motorista avistou animal tentando atravessar via de fluxo intenso. Polícia Ambiental acionada para resgate seguro.",
        "category": models.CategoryEnum.ACIDENTE_ANIMAL,
        "criticality": models.CriticalityEnum.BAIXA,
        "location": "BR-262, Km 515 - Miranda/MS",
        "status": models.StatusEnum.INCONCLUSIVO,
    },
    {
        "title": "Pane elétrica no sistema de rastreamento e telemetria",
        "description": "Caminhão parou em ponto cego sem sinal de GPS. Motorista entrou em contato via rádio solicitando conferência e checagem de rota.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.MEDIA,
        "location": "BR-230, Km 150 - Marabá/PA",
        "status": models.StatusEnum.ABERTO,
    }
]

def seed_database():
    db = SessionLocal()
    try:
        # Verifica se já há dados
        count = db.query(models.Incident).count()
        if count > 0:
            print(f"Banco de dados já contém {count} incidentes cadastrados.")
            return

        now = datetime.now()
        for i, item in enumerate(SAMPLE_INCIDENTS):
            created_time = now - timedelta(minutes=(len(SAMPLE_INCIDENTS) - i) * 18 + random.randint(1, 10))
            incident = models.Incident(
                title=item["title"],
                description=item["description"],
                category=item["category"],
                criticality=item["criticality"],
                location=item["location"],
                status=item["status"],
                version=1,
                created_at=created_time,
                updated_at=created_time
            )
            db.add(incident)

        db.commit()
        print(f"Sucesso: {len(SAMPLE_INCIDENTS)} incidentes realistas foram inseridos no banco de dados!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
