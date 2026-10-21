import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Garante path correto
sys.path.append(str(Path(__file__).resolve().parent))

from database import SessionLocal, engine, Base
import models

# Cria as tabelas se não existirem
Base.metadata.create_all(bind=engine)

# Rodovias e trechos reais para dar realismo ao dashboard
HIGHWAYS = [
    ("BR-116", ["Feira de Santana/BA", "Vitória da Conquista/BA", "Registro/SP", "Campina Grande do Sul/PR", "Além Paraíba/MG"]),
    ("BR-101", ["Feira de Santana/BA", "Alagoinhas/BA", "Lauro de Freitas/BA", "Ubatuba/SP", "Tubarao/SC", "Joinville/SC"]),
    ("BR-381", ["Betim/MG", "Ipatinga/MG", "Guarulhos/SP", "Sabará/MG"]),
    ("BR-277", ["Serra do Mar/PR", "Guarapuava/PR", "Cascavel/PR", "Foz do Iguaçu/PR"]),
    ("BR-040", ["Juiz de Fora/MG", "Ribeirão das Neves/MG", "Luziânia/GO", "Petrópolis/RJ"]),
    ("BR-163", ["Nova Mutum/MT", "Rondonópolis/MT", "Sinop/MT", "Campo Grande/MS"]),
    ("BR-153", ["Anápolis/GO", "Gurupi/TO", "Araguaína/TO", "Marília/SP"]),
    ("BR-376", ["Guaratuba/PR", "Maringá/PR", "Tijucas do Sul/PR"]),
    ("BR-230", ["Marabá/PA", "Altamira/PA", "Araguaína/TO"]),
    ("BR-050", ["Uberlândia/MG", "Araguari/MG", "Catalão/GO"]),
    ("BR-262", ["Miranda/MS", "Corumbá/MS", "Manhuaçu/MG"]),
]

# Moldes de incidentes compatíveis exatamente com as suas categorias do models.py
TEMPLATES_INCIDENTS = [
    # ALTA CRITICIDADE
    {
        "title": "Tombamento de carreta com bloqueio total da via",
        "description": "Carreta bitrem carregada tombou na pista. Ambas as faixas bloqueadas no sentido decrescente. Congestionamento extenso na rodovia.",
        "category": models.CategoryEnum.BLOQUEIO_PISTA,
        "criticality": models.CriticalityEnum.ALTA,
    },
    {
        "title": "Colisão frontal severa com vítimas presas às ferragens",
        "description": "Colisão entre caminhão tanque e utilitário. Equipes de resgate da concessionária e SAMU acionados no local.",
        "category": models.CategoryEnum.ACIDENTE_VITIMAS,
        "criticality": models.CriticalityEnum.ALTA,
    },
    {
        "title": "Derramamento de carga química (material corrosivo)",
        "description": "Vazamento de tambores de ácido na pista após freada brusca. Risco ambiental e de explosão isolando a área.",
        "category": models.CategoryEnum.PERDA_CARGA,
        "criticality": models.CriticalityEnum.ALTA,
    },
    {
        "title": "Queda de barreira de grande porte cobrindo o asfalto",
        "description": "Deslizamento de encosta ocupando totalmente a pista após fortes chuvas. Maquinário pesado em deslocamento.",
        "category": models.CategoryEnum.BLOQUEIO_PISTA,
        "criticality": models.CriticalityEnum.ALTA,
    },
    {
        "title": "Neblina densa com visibilidade inferior a 5 metros",
        "description": "Forte cerração no trecho de serra impedindo o tráfego seguro de veículos de carga. Operação comboio ativada.",
        "category": models.CategoryEnum.CLIMA_ATIPICO,
        "criticality": models.CriticalityEnum.ALTA,
    },
    {
        "title": "Engavetamento envolvendo múltiplos veículos de carga",
        "description": "Colisão em cadeia envolvendo 3 caminhões pesados devido à pista molhada e baixa visibilidade.",
        "category": models.CategoryEnum.ACIDENTE_VITIMAS,
        "criticality": models.CriticalityEnum.ALTA,
    },

    # MEDIA CRITICIDADE
    {
        "title": "Quebra de eixo de veículo pesado na subida de serra",
        "description": "Caminhão trucado quebrou sobre a terceira faixa. Tráfego lento, guincho pesado requisitado pela central.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.MEDIA,
    },
    {
        "title": "Bovino solto atravessando a faixa de rolamento",
        "description": "Animal de grande porte na pista. Concessionária enviou equipe de apreensão para contenção e segurança da via.",
        "category": models.CategoryEnum.ACIDENTE_ANIMAL,
        "criticality": models.CriticalityEnum.MEDIA,
    },
    {
        "title": "Derramamento de grãos de soja na pista",
        "description": "Abertura acidental da bica do caminhão caçamba. Camada escorregadia de grãos por 300 metros. Equipe de varrição acionada.",
        "category": models.CategoryEnum.PERDA_CARGA,
        "criticality": models.CriticalityEnum.MEDIA,
    },
    {
        "title": "Acúmulo de lâmina d'água na pista (Aquaplanagem)",
        "description": "Chuva torrencial acumulando poças profundas em trecho de curva. Alerta emitido nos painéis eletrônicos da rodovia.",
        "category": models.CategoryEnum.CLIMA_ATIPICO,
        "criticality": models.CriticalityEnum.MEDIA,
    },
    {
        "title": "Pane elétrica no sistema de telemetria do veículo",
        "description": "Caminhão parou sem sinal de GPS em ponto cego. Motorista em contato via rádio solicitando apoio operacional.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.MEDIA,
    },
    {
        "title": "Tombamento parcial de carga de engradados",
        "description": "Carga lateral cedeu espalhando caixas no acostamento e parte da faixa da direita. Pessoal em limpeza.",
        "category": models.CategoryEnum.PERDA_CARGA,
        "criticality": models.CriticalityEnum.MEDIA,
    },

    # BAIXA CRITICIDADE
    {
        "title": "Colisão traseira leve entre caminhões sem feridos",
        "description": "Pequena colisão no acostamento gerando apenas danos materiais no para-choque. Motoristas aguardando perícia.",
        "category": models.CategoryEnum.ACIDENTE_VEICULO,
        "criticality": models.CriticalityEnum.BAIXA,
    },
    {
        "title": "Superaquecimento de motor no acostamento seguro",
        "description": "Caminhão parado no acostamento aguardando resfriamento do motor. Sem impacto no fluxo de veículos.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.BAIXA,
    },
    {
        "title": "Pneu estourado na faixa de desaceleração",
        "description": "Veículo posicionado em local seguro próximo a posto de combustível. Borracheiro móvel acionado.",
        "category": models.CategoryEnum.PROBLEMA_MECANICO,
        "criticality": models.CriticalityEnum.BAIXA,
    },
    {
        "title": "Presença de animal de pequeno porte no acostamento",
        "description": "Animal avistado próximo à rodovia. Inspeção da rodovia acionada em patrulha para prevenção.",
        "category": models.CategoryEnum.ACIDENTE_ANIMAL,
        "criticality": models.CriticalityEnum.BAIXA,
    },
    {
        "title": "Colisão lateral de baixa velocidade em posto de pesagem",
        "description": "Raspagem de retrovisores entre dois veículos na balança. Situação controlada no local.",
        "category": models.CategoryEnum.ACIDENTE_VEICULO,
        "criticality": models.CriticalityEnum.BAIXA,
    }
]

# Pesos de distribuição de status
STATUS_WEIGHTS = [
    (models.StatusEnum.ABERTO, 0.40),
    (models.StatusEnum.EM_INVESTIGACAO, 0.35),
    (models.StatusEnum.INCONCLUSIVO, 0.10),
    (models.StatusEnum.FECHADO, 0.15)
]

def get_random_status():
    statuses, weights = zip(*STATUS_WEIGHTS)
    return random.choices(statuses, weights=weights)[0]

def generate_100_incidents():
    incidents = []
    
    for i in range(100):
        template = random.choice(TEMPLATES_INCIDENTS)
        highway, cities = random.choice(HIGHWAYS)
        city = random.choice(cities)
        km = random.randint(12, 820)
        
        location_str = f"{highway}, Km {km} - {city}"
        
        title = f"{template['title']} #{i+101}"
        description = f"{template['description']} [Registrado via Central de Telemetria #{random.randint(1000, 9999)}]."
        
        incidents.append({
            "title": title,
            "description": description,
            "category": template["category"],
            "criticality": template["criticality"],
            "location": location_str,
            "status": get_random_status()
        })
        
    return incidents

def seed_database():
    db = SessionLocal()
    try:
        # Verifica se o banco já está populado com 100 ou mais registros
        count = db.query(models.Incident).count()
        if count >= 100:
            print(f"O banco de dados já possui {count} incidentes cadastrados.")
            return

        print("Iniciando inserção de 100 incidentes simulados no banco de dados...")
        sample_data = generate_100_incidents()

        now = datetime.now()
        for i, item in enumerate(sample_data):
            # Distribui as datas de criação ao longo dos últimos dias de forma realista
            minutes_ago = (100 - i) * 20 + random.randint(1, 10)
            created_time = now - timedelta(minutes=minutes_ago)
            
            incident = models.Incident(
                title=item["title"],
                description=item["description"],
                category=item["category"],
                criticality=item["criticality"],
                location=item["location"],
                status=item["status"],
                version=1,  # Inicia a versão do Bloqueio Otimista em 1
                created_at=created_time,
                updated_at=created_time
            )
            db.add(incident)

        db.commit()
        print("Sucesso! 100 incidentes foram gravados no banco de dados com sucesso.")
    except Exception as e:
        db.rollback()
        print(f"Erro ao popular o banco de dados: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()