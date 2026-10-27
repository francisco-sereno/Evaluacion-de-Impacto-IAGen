/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

declare global {
    interface Window {
        jspdf: any;
        app: any;
        logMessage: (level: string, message: string, data?: any) => void;
        Chart: any;
    }
}

interface Question {
    id: string;
    text: string;
    hint?: string;
    type: 'select' | 'textarea' | 'slider' | 'multiple';
    options?: string[];
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
}

interface Step {
    id: string;
    number: string;
    shortTitle: string;
    title: string;
    description: string;
    questions: Question[];
}

interface DimensionMetric {
    code: string;
    name: string;
    shortLabel: string;
    currentScore: number;
    targetScore: number;
    gap: number;
    levelLabel: string;
    personalizedSuggestion: string;
}

interface PersonalizedSuggestionItem {
    dimension: string;
    horizon: string;
    action: string;
    rationale: string;
    priority: 'Alta' | 'Media' | 'Estratégica';
}

interface EmpiricalIndicators {
    iloClassification: string;
    iloComplementarityScore: number;
    jaggedFrontierRisk: number;
    jaggedFrontierLabel: string;
    iliaArchetype: 'Explorador' | 'Adoptante sistemático' | 'Pionero en gobernanza e integración';
    weeklyHoursSavedNet: number;
    verificationOverheadPct: number;
    sectorEmpiricalRange: string;
    skillCompressionEffect: string;
}

const chartInstances: Record<string, any> = {};

// Reglas heurísticas deterministas y parámetros empíricos por sector (OIT, CEPAL/ILIA, Harvard/BCG, Stanford AI Index 2025-2026)
const SECTOR_HEURISTICS: Record<
    string,
    {
        domainFocus: string;
        criticalRisk: string;
        governanceRule: string;
        automationWeight: number;
        empiricalRange: string;
        jaggedFrontierSensitivity: number;
        iloComplementarityBase: number;
    }
> = {
    'Educación e investigación': {
        domainFocus: 'producción académica, síntesis bibliográfica, diseño instruccional y evaluación formativa',
        criticalRisk: 'la generación de citas apócrifas (alucinaciones bibliográficas), sesgos epistemológicos y la dilución de la voz autoral en manuscritos e informes',
        governanceRule: 'declaración explícita de uso metodológico de IAGen, trazabilidad de prompts y verificación cruzada en bases indizadas (Scopus, WoS, SciELO)',
        automationWeight: 1.02,
        empiricalRange: '18% – 34% en preproducción documental y diseño instruccional (estudios MIT/Stanford)',
        jaggedFrontierSensitivity: 0.82,
        iloComplementarityBase: 86
    },
    Salud: {
        domainFocus: 'gestión documental clínica, síntesis de evidencia biomédica y estandarización de informes administrativos',
        criticalRisk: 'el sesgo en resúmenes clínicos, errores de interpretación diagnóstica fuera de la frontera del modelo y vulneración de datos sensibles de pacientes',
        governanceRule: 'anonimización estricta de registros de salud, cumplimiento normativo bioético y prohibición de delegar decisiones clínicas al sistema',
        automationWeight: 0.85,
        empiricalRange: '14% – 26% en descompresión administrativa y síntesis documental clínica (OIT/OMS)',
        jaggedFrontierSensitivity: 0.94,
        iloComplementarityBase: 88
    },
    Tecnología: {
        domainFocus: 'asistencia en desarrollo de software, documentación de arquitecturas, pruebas unitarias, sistemas RAG y refactorización',
        criticalRisk: 'la introducción de vulnerabilidades de seguridad en código generado, acumulación de deuda técnica y filtración de propiedad intelectual',
        governanceRule: 'revisión estática de seguridad (SAST), cobertura de pruebas automatizadas obligatoria y entornos aislados para repositorios privados',
        automationWeight: 1.15,
        empiricalRange: '24% – 42% en velocidad de codificación, pruebas y documentación técnica (NBER/Stanford AI Index)',
        jaggedFrontierSensitivity: 0.72,
        iloComplementarityBase: 82
    },
    'Servicios financieros': {
        domainFocus: 'análisis de reportes regulatorios, síntesis de mercado, modelamiento documental y atención de consultas normativas',
        criticalRisk: 'la inexactitud numérica en proyecciones financieras, opacidad algorítmica e incumplimiento de normativas de secreto bancario y protección de datos',
        governanceRule: 'auditoría determinista de cálculos financieros, trazabilidad completa de fuentes regulatorias y supervisión humana (Human-in-the-loop)',
        automationWeight: 0.96,
        empiricalRange: '16% – 32% en síntesis regulatoria y análisis documental financiero (OIT/McKinsey)',
        jaggedFrontierSensitivity: 0.88,
        iloComplementarityBase: 80
    },
    'Sector público': {
        domainFocus: 'elaboración de oficios, análisis de políticas públicas, síntesis de marcos legales y gestión de atención ciudadana',
        criticalRisk: 'el sesgo administrativo en la toma de decisiones, falta de fundamentación jurídica verificable y exposición de información reservada del Estado',
        governanceRule: 'transparencia algorítmica alineada con el marco ILIA (CEPAL), apego estricto al derecho administrativo y visado humano obligatorio',
        automationWeight: 0.92,
        empiricalRange: '15% – 29% en tramitación documental y síntesis de política pública (CEPAL/OIT)',
        jaggedFrontierSensitivity: 0.85,
        iloComplementarityBase: 84
    },
    'Comunicaciones y marketing': {
        domainFocus: 'estructuración de campañas, adaptación multicanal de contenidos, guiones editoriales y análisis de audiencias',
        criticalRisk: 'la homogeneización estilística (convergencia hacia el promedio estadístico), pérdida de identidad de marca e infracciones de derechos de autor',
        governanceRule: 'edición creativa humana de cierre, verificación de originalidad y manuales de estilo editorial propios',
        automationWeight: 1.12,
        empiricalRange: '25% – 40% en ideación, variaciones multicanal y borradores iniciales (Harvard/BCG)',
        jaggedFrontierSensitivity: 0.68,
        iloComplementarityBase: 76
    },
    Consultoría: {
        domainFocus: 'diagnóstico organizacional, estructuración de propuestas ejecutivas, síntesis sectorial y modelado de escenarios estratégicos',
        criticalRisk: 'la formulación de recomendaciones plausibles pero erróneas en problemas complejos (efecto Frontera Irregular) y exposición de acuerdos NDA',
        governanceRule: 'ofuscación de datos corporativos del cliente y validación empírica independiente de cada hipótesis estratégica',
        automationWeight: 1.06,
        empiricalRange: '22% – 38% en velocidad de entrega y +40% en calidad dentro de la frontera de capacidad (Harvard/BCG)',
        jaggedFrontierSensitivity: 0.86,
        iloComplementarityBase: 83
    },
    Industria: {
        domainFocus: 'documentación de procedimientos operativos estándar (SOP), reportes de mantenimiento, calidad y análisis de incidencias',
        criticalRisk: 'la imprecisión en protocolos técnicos o de seguridad operacional e incompatibilidad con normativas industriales ISO/OSHA',
        governanceRule: 'validación formal por ingeniería de planta y seguridad industrial antes de publicar cualquier instructivo asistido por IA',
        automationWeight: 0.94,
        empiricalRange: '14% – 27% en documentación técnica, reportes de turno y gestión de calidad (McKinsey/CEPAL)',
        jaggedFrontierSensitivity: 0.84,
        iloComplementarityBase: 79
    },
    Otro: {
        domainFocus: 'gestión documental, sistematización de información operativa y comunicación profesional',
        criticalRisk: 'la dependencia acrítica de borradores automáticos (complacencia algorítmica) y la falta de verificación de datos de origen',
        governanceRule: 'supervisión humana sistemática (Human-in-the-loop) y resguardo de información confidencial',
        automationWeight: 1.0,
        empiricalRange: '15% – 30% en tareas transversales de redacción y síntesis (OIT/Stanford AI Index)',
        jaggedFrontierSensitivity: 0.78,
        iloComplementarityBase: 80
    }
};

// Reglas deterministas de mitigación según barreras seleccionadas (alineadas con CEPAL/ILIA y NIST AI RMF)
const BARRIER_MITIGATIONS: Record<string, string> = {
    'Restricciones institucionales':
        'Acotar el uso a tareas de preproducción personal no sujetas a restricción y proponer un protocolo formal de uso transparente y auditable en su unidad.',
    'Falta de recursos técnicos':
        'Priorizar herramientas web de acceso estándar y plantillas estructuradas de contexto que no requieran infraestructura local dedicada.',
    'Preocupaciones éticas':
        'Implementar una pauta de trazabilidad académica/profesional donde toda salida asistida sea contrastada, reescrita y validada bajo responsabilidad del autor.',
    'Falta de capacitación':
        'Establecer un programa de aprendizaje incremental centrado en ingeniería de contexto, delimitación de la «Frontera Irregular» y evaluación crítica sobre 2 casos de uso reales.',
    'Resistencia al cambio':
        'Iniciar con pilotos individuales de bajo riesgo en tareas administrativas repetitivas para demostrar ahorro de tiempo verificable (curva J de adopción).',
    Costos:
        'Concentrar el flujo de trabajo en licencias institucionales disponibles o en un único asistente multimodal de alto rendimiento evitando redundancia de suscripciones.',
    'Preocupaciones de privacidad':
        'Aplicar un protocolo estricto de anonimización, desidentificación y exclusión de datos personales o sensibles antes de cualquier interacción con el modelo.'
};

const app = {
    data: {
        currentStep: 0,
        activeView: 'form' as 'form' | 'report' | 'charts',
        reportFilter: 'all' as 'all' | 'dashboard' | 'perfil' | 'accion',
        responses: {} as Record<string, any>,
        validationErrors: [] as string[],
        sessionId: '',
        hasUnsavedChanges: false,
        currentAnalysis: null as any,
        isCompleted: false,
    },

    steps: [
        {
            id: 'perfil_profesional',
            number: '01',
            shortTitle: 'Perfil profesional',
            title: '01. Perfil profesional y contexto laboral',
            description: 'Caracterización del ámbito de desempeño, responsabilidades principales y grado de familiaridad previa con sistemas de inteligencia artificial.',
            questions: [
                {
                    id: 'sector',
                    text: '¿En qué sector profesional te desempeñas principalmente?',
                    hint: 'Selecciona el ámbito que mejor represente tu actividad institucional o productiva.',
                    type: 'select',
                    options: [
                        'Educación e investigación',
                        'Salud',
                        'Tecnología',
                        'Servicios financieros',
                        'Sector público',
                        'Comunicaciones y marketing',
                        'Consultoría',
                        'Industria',
                        'Otro'
                    ]
                },
                {
                    id: 'rol',
                    text: 'Describe tu rol principal y las tareas que realizas habitualmente',
                    hint: 'Detalla tus responsabilidades cotidianas para que el motor heurístico contextualice el índice de exposición ocupacional (OIT/CEPAL).',
                    type: 'textarea',
                    placeholder: 'Describe tus funciones principales, tipo de documentos o análisis que elaboras y actividades clave...'
                },
                {
                    id: 'experiencia_ia',
                    text: '¿Cuál es tu nivel actual de experiencia con herramientas de IA?',
                    hint: 'Considera tanto la frecuencia de uso como la complejidad metodológica (prompting, RAG o flujos multipaso).',
                    type: 'select',
                    options: [
                        'Sin experiencia',
                        'Básico (ChatGPT ocasional)',
                        'Intermedio (uso regular de múltiples herramientas)',
                        'Avanzado (integración sistemática)'
                    ]
                }
            ]
        },
        {
            id: 'analisis_tareas',
            number: '02',
            shortTitle: 'Análisis de tareas',
            title: '02. Análisis de tareas y procesos',
            description: 'Distribución del tiempo operativo frente al trabajo analítico-creativo e identificación de fricciones en la productividad semanal.',
            questions: [
                {
                    id: 'tareas_rutinarias',
                    text: '¿Qué porcentaje de tu trabajo involucra tareas rutinarias o repetitivas?',
                    hint: 'Desliza el control para definir el porcentaje de labores operativas o codificables (alta exposición a automatización).',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 5
                },
                {
                    id: 'tareas_creativas',
                    text: '¿Qué porcentaje requiere pensamiento creativo, juicio ético o análisis crítico?',
                    hint: 'Desliza el control para indicar el porcentaje de actividades que demandan interpretación experta («Human-in-the-loop»).',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 5
                },
                {
                    id: 'tiempo_redaccion',
                    text: '¿Cuántas horas semanales dedicas a la redacción de documentos, informes o comunicaciones?',
                    hint: 'Considera borradores, informes técnicos, correos extensos y retroalimentación escrita.',
                    type: 'select',
                    options: [
                        'Menos de 5 horas',
                        '5-10 horas',
                        '10-20 horas',
                        '20-30 horas',
                        'Más de 30 horas'
                    ]
                },
                {
                    id: 'principales_desafios',
                    text: 'Identifica los principales desafíos o cuellos de botella en tu productividad',
                    hint: 'Señala aquellas etapas donde se concentra la mayor carga de tiempo o desgaste operativo.',
                    type: 'textarea',
                    placeholder: 'Describe las tareas o procesos que más retrasan o sobrecargan tu jornada laboral...'
                }
            ]
        },
        {
            id: 'implementacion_iagen',
            number: '03',
            shortTitle: 'Escenarios de adopción',
            title: '03. Escenarios de implementación de IAGen',
            description: 'Selección de tecnologías pertinentes, reconocimiento de barreras organizacionales y proyección del horizonte temporal de adopción.',
            questions: [
                {
                    id: 'herramientas_interes',
                    text: '¿Qué aplicaciones de IAGen resultan más relevantes para tu quehacer?',
                    hint: 'Selecciona al menos una opción vinculada directamente con tus funciones.',
                    type: 'multiple',
                    options: [
                        'Asistentes de redacción (GPT, Claude)',
                        'Generadores de código',
                        'Análisis de datos con IA',
                        'Sistemas RAG y consulta documental propia',
                        'Flujos agénticos multipaso',
                        'Traducción automática',
                        'Síntesis de documentos',
                        'Creación de presentaciones',
                        'Análisis bibliográfico',
                        'Generación de imágenes/gráficos'
                    ]
                },
                {
                    id: 'barreras_implementacion',
                    text: '¿Cuáles son las principales barreras para implementar IAGen en tu entorno?',
                    hint: 'Selecciona al menos un obstáculo institucional, formativo, ético o técnico presente en tu contexto.',
                    type: 'multiple',
                    options: [
                        'Restricciones institucionales',
                        'Falta de recursos técnicos',
                        'Preocupaciones éticas',
                        'Falta de capacitación',
                        'Resistencia al cambio',
                        'Costos',
                        'Preocupaciones de privacidad'
                    ]
                },
                {
                    id: 'tiempo_implementacion',
                    text: 'En un escenario realista, ¿en cuánto tiempo podrías integrar IAGen de manera efectiva?',
                    hint: 'Contempla la curva de aprendizaje (efecto curva J) y la validación de protocolos de trabajo.',
                    type: 'select',
                    options: [
                        '1-3 meses',
                        '3-6 meses',
                        '6-12 meses',
                        'Más de 1 año'
                    ]
                }
            ]
        },
        {
            id: 'impacto_proyectado',
            number: '04',
            shortTitle: 'Proyección de impactos',
            title: '04. Proyección de impactos y brechas',
            description: 'Estimación de ganancias de eficiencia, áreas de transformación positiva, riesgos percibidos y competencias necesarias.',
            questions: [
                {
                    id: 'mejora_productividad',
                    text: '¿En qué porcentaje estimas que podría mejorar tu productividad global?',
                    hint: 'Desliza el control para indicar tu expectativa subjetiva; el modelo la contrastará con la evidencia empírica (OIT, Harvard/BCG, Stanford).',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 5
                },
                {
                    id: 'areas_mayor_impacto',
                    text: '¿En qué áreas específicas proyectas el mayor impacto positivo?',
                    hint: 'Considera velocidad de preproducción, estructuración de ideas, análisis exploratorio o síntesis documental.',
                    type: 'textarea',
                    placeholder: 'Especifica las actividades concretas de tu trabajo donde esperas obtener mayores beneficios...'
                },
                {
                    id: 'riesgos_preocupaciones',
                    text: '¿Qué riesgos o preocupaciones identificas en la implementación?',
                    hint: 'Evalúa aspectos como alucinaciones, sesgos, pérdida de autonomía cognitiva, frontera irregular o confidencialidad.',
                    type: 'textarea',
                    placeholder: 'Detalla las preocupaciones éticas, técnicas o de calidad que observas en tu ámbito...'
                },
                {
                    id: 'cambios_habilidades',
                    text: '¿Qué nuevas competencias necesitarías desarrollar o fortalecer?',
                    hint: 'Menciona habilidades de ingeniería de contexto, verificación crítica, gobernanza de datos o diseño de flujos.',
                    type: 'textarea',
                    placeholder: 'Indica qué conocimientos o habilidades requieres adquirir para un uso riguroso de IAGen...'
                }
            ]
        }
    ] as Step[],

    init() {
        this.data.sessionId =
            this.data.sessionId ||
            'sesion_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

        this.loadProgress();

        if (this.data.isCompleted && this.data.currentAnalysis && this.validateAllSteps().valid) {
            this.showResults(this.data.currentAnalysis, 'report');
        } else {
            this.render();
        }

        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('modal')) {
                target.classList.add('hidden');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
            }
            if (e.altKey && this.data.activeView === 'form') {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextStep();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousStep();
                }
            }
        });
    },

    isQuestionAnswered(q: Question): boolean {
        const val = this.data.responses[q.id];
        if (q.type === 'multiple') {
            return Array.isArray(val) && val.length > 0;
        }
        if (q.type === 'slider') {
            return typeof val === 'number' && !isNaN(val);
        }
        return val !== undefined && val !== null && String(val).trim().length > 0;
    },

    validateStep(stepIndex: number): { valid: boolean; missingIds: string[] } {
        const step = this.steps[stepIndex];
        const missingIds: string[] = [];
        step.questions.forEach((q) => {
            if (!this.isQuestionAnswered(q)) {
                missingIds.push(q.id);
            }
        });
        return { valid: missingIds.length === 0, missingIds };
    },

    validateAllSteps(): { valid: boolean; firstIncompleteStep: number; missingIds: string[] } {
        for (let i = 0; i < this.steps.length; i++) {
            const res = this.validateStep(i);
            if (!res.valid) {
                return { valid: false, firstIncompleteStep: i, missingIds: res.missingIds };
            }
        }
        return { valid: true, firstIncompleteStep: -1, missingIds: [] };
    },

    /**
     * Calcula de forma determinista y heurística los puntajes (0-100) de las 5 dimensiones,
     * los 6 ejes del radar operativo y los indicadores empíricos (OIT/CEPAL, Harvard/BCG, Stanford AI Index)
     * a partir de las respuestas reales del usuario.
     */
    computeDimensionMetrics(): {
        dimensions: DimensionMetric[];
        operationalRadar: { labels: string[]; current: number[]; benchmark: number[] };
        globalIndex: number;
        realisticProductivityGain: number;
        empirical: EmpiricalIndicators;
    } {
        const r = this.data.responses;
        const sectorInfo = SECTOR_HEURISTICS[r.sector] || SECTOR_HEURISTICS['Otro'];

        // D1: Perfil y madurez tecnológica (alineado con marco ILIA CEPAL/CENIA)
        const expOptions = this.steps[0].questions[2].options || [];
        const expIndex = expOptions.indexOf(r.experiencia_ia);
        const expBaseScores = [20, 48, 74, 92];
        const expScore = expIndex >= 0 ? expBaseScores[expIndex] : 0;
        const roleWords = r.rol ? String(r.rol).trim().split(/\s+/).length : 0;
        const roleSpecificityBonus = Math.min(8, Math.floor(roleWords / 4));
        const d1Current = Math.min(100, expScore + roleSpecificityBonus);

        // D2: Potencial de automatización y exposición de tareas (OIT/CEPAL Task-Level Exposure)
        const rutinarias = typeof r.tareas_rutinarias === 'number' ? r.tareas_rutinarias : 0;
        const creativas = typeof r.tareas_creativas === 'number' ? r.tareas_creativas : 0;
        const writingOptions = this.steps[1].questions[2].options || [];
        const writingIndex = writingOptions.indexOf(r.tiempo_redaccion);
        const writingScores = [25, 50, 72, 88, 96];
        const writingMidpointHours = [3, 7.5, 15, 25, 34];
        const writingScore = writingIndex >= 0 ? writingScores[writingIndex] : 0;
        const weeklyWritingHours = writingIndex >= 0 ? writingMidpointHours[writingIndex] : 5;
        const rawAutomation = (rutinarias * 0.62 + writingScore * 0.38) * sectorInfo.automationWeight;
        const d2Current = Math.max(10, Math.min(98, Math.round(rawAutomation)));

        // D3: Viabilidad de implementación y factores habilitantes (CEPAL/Banco Mundial)
        const toolsArr: string[] = Array.isArray(r.herramientas_interes) ? r.herramientas_interes : [];
        const barriersArr: string[] = Array.isArray(r.barreras_implementacion) ? r.barreras_implementacion : [];
        const horizonOptions = this.steps[2].questions[2].options || [];
        const horizonIndex = horizonOptions.indexOf(r.tiempo_implementacion);
        const horizonScores = [90, 75, 58, 40];
        const horizonScore = horizonIndex >= 0 ? horizonScores[horizonIndex] : 50;

        const toolFocusScore =
            toolsArr.length >= 2 && toolsArr.length <= 5
                ? 85
                : toolsArr.length === 1
                ? 65
                : Math.max(55, 95 - toolsArr.length * 4);
        const barrierPenalty = barriersArr.length * 6;
        const d3Current = Math.max(
            15,
            Math.min(96, Math.round(horizonScore * 0.45 + toolFocusScore * 0.35 + d1Current * 0.2 - barrierPenalty))
        );

        // D5: Supervisión crítica y gobernanza ética (Human-in-the-loop)
        const riskWords = r.riesgos_preocupaciones
            ? String(r.riesgos_preocupaciones).trim().split(/\s+/).length
            : 0;
        const skillWords = r.cambios_habilidades
            ? String(r.cambios_habilidades).trim().split(/\s+/).length
            : 0;
        const ethicalBarrierBonus = barriersArr.some(
            (b) => b.includes('éticas') || b.includes('privacidad')
        )
            ? 10
            : 0;
        const reflectionBonus = Math.min(24, Math.floor((riskWords + skillWords) * 1.2));
        const d5Current = Math.max(
            20,
            Math.min(98, Math.round(creativas * 0.58 + reflectionBonus + ethicalBarrierBonus))
        );

        // D4: Impacto productivo ajustado y modelo empírico de ahorro de tiempo (Harvard/BCG + OIT)
        const mejoraDeclarada = typeof r.mejora_productividad === 'number' ? r.mejora_productividad : 0;
        // Porcentaje de sobrecarga de verificación humana (Human-in-the-loop overhead) según complejidad creativa y sensibilidad sectorial
        const verificationOverheadPct = Math.max(
            12,
            Math.min(45, Math.round(creativas * 0.28 * sectorInfo.jaggedFrontierSensitivity + barriersArr.length * 1.8))
        );
        const maxStructuralGain = Math.round(
            (rutinarias * 0.48 + writingScore * 0.26 + d1Current * 0.16) * (1 - verificationOverheadPct / 150) -
                barriersArr.length * 2.0
        );
        const realisticProductivityGain = Math.max(10, Math.min(62, maxStructuralGain));
        const overestimationDelta = Math.max(0, mejoraDeclarada - realisticProductivityGain);
        const d4Current = Math.max(
            15,
            Math.min(
                96,
                Math.round(realisticProductivityGain * 1.15 - overestimationDelta * 0.35 + d2Current * 0.2)
            )
        );

        // Indicadores empíricos internacionales (OIT/CEPAL, Harvard/BCG, Stanford AI Index, ILIA)
        const iloComplementarityScore = Math.max(
            25,
            Math.min(
                98,
                Math.round(sectorInfo.iloComplementarityBase * 0.45 + creativas * 0.35 + d5Current * 0.2)
            )
        );

        let iloClassification = 'Complementariedad aumentada (Human-in-the-loop)';
        if (rutinarias >= 60 && creativas <= 35) {
            iloClassification = 'Transformación operativa acelerada (alta exposición a automatización)';
        } else if (creativas >= 65 && rutinarias <= 35) {
            iloClassification = 'Complementariedad selectiva de alto juicio experto';
        }

        // Riesgo de Frontera Tecnológica Irregular (Harvard/BCG Jagged Frontier)
        const rawFrontierRisk = Math.round(
            creativas * 0.42 * sectorInfo.jaggedFrontierSensitivity +
                Math.max(0, mejoraDeclarada - realisticProductivityGain) * 0.65 +
                (100 - d1Current) * 0.22 -
                d5Current * 0.18
        );
        const jaggedFrontierRisk = Math.max(12, Math.min(95, rawFrontierRisk));
        const jaggedFrontierLabel =
            jaggedFrontierRisk >= 62
                ? 'Alto (riesgo de delegación fuera de frontera)'
                : jaggedFrontierRisk >= 38
                ? 'Moderado (requiere validación selectiva)'
                : 'Controlado (alta trazabilidad experta)';

        const globalIndexTemp = Math.round(
            (d1Current + d2Current + d3Current + d4Current + d5Current) / 5
        );
        const iliaArchetype: EmpiricalIndicators['iliaArchetype'] =
            globalIndexTemp >= 72 && d5Current >= 68
                ? 'Pionero en gobernanza e integración'
                : globalIndexTemp >= 48
                ? 'Adoptante sistemático'
                : 'Explorador';

        // Horas semanales netas recuperables (sobre redacción y gestión documental + fracción operativa)
        const estimatedRoutineHours = (rutinarias / 100) * 20;
        const baseCandidateHours = (weeklyWritingHours * 0.65 + estimatedRoutineHours * 0.45);
        const grossHoursSaved = baseCandidateHours * (realisticProductivityGain / 100);
        const weeklyHoursSavedNet = Math.max(
            1.0,
            Math.round(grossHoursSaved * (1 - verificationOverheadPct / 100) * 10) / 10
        );

        const skillCompressionEffect =
            expIndex <= 1
                ? 'Alto potencial de nivelación operativa («Skill Compression»): la evidencia empírica (Stanford/MIT) muestra que perfiles en etapa inicial o básica capturan las mayores ganancias relativas al estandarizar borradores y estructura.'
                : 'Efecto de amplificación experta y escalamiento agéntico: su madurez previa permite trascender la redacción básica hacia flujos multipaso, sistemas RAG y auditoría metodológica.';

        const computeTarget = (current: number, growthFactor: number) =>
            Math.min(98, Math.max(current + 8, Math.round(current + (100 - current) * growthFactor)));

        const d1Target = computeTarget(d1Current, 0.5);
        const d2Target = computeTarget(d2Current, 0.42);
        const d3Target = computeTarget(d3Current, 0.52);
        const d4Target = computeTarget(d4Current, 0.45);
        const d5Target = computeTarget(d5Current, 0.48);

        const getLevelLabel = (score: number) => {
            if (score >= 75) return 'Consolidado';
            if (score >= 48) return 'En desarrollo';
            return 'Inicial';
        };

        const dimensions: DimensionMetric[] = [
            {
                code: 'D1',
                name: '01. Perfil y madurez tecnológica (ILIA)',
                shortLabel: 'D1 · Madurez IA',
                currentScore: d1Current,
                targetScore: d1Target,
                gap: d1Target - d1Current,
                levelLabel: getLevelLabel(d1Current),
                personalizedSuggestion: `Perfil «${iliaArchetype}»: evolucionar desde «${r.experiencia_ia}» hacia protocolos reproducibles en ${r.sector.toLowerCase()}.`
            },
            {
                code: 'D2',
                name: '02. Exposición y automatización (OIT)',
                shortLabel: 'D2 · Automatización',
                currentScore: d2Current,
                targetScore: d2Target,
                gap: d2Target - d2Current,
                levelLabel: getLevelLabel(d2Current),
                personalizedSuggestion: `Intervenir sobre el ${rutinarias}% de carga rutinaria y redacción (${r.tiempo_redaccion}) liberando ~${weeklyHoursSavedNet} h/sem netas.`
            },
            {
                code: 'D3',
                name: '03. Viabilidad y factores habilitantes',
                shortLabel: 'D3 · Viabilidad',
                currentScore: d3Current,
                targetScore: d3Target,
                gap: d3Target - d3Current,
                levelLabel: getLevelLabel(d3Current),
                personalizedSuggestion: `Superar la curva J mitigando las ${barriersArr.length} barreras en el horizonte de ${r.tiempo_implementacion}.`
            },
            {
                code: 'D4',
                name: '04. Impacto productivo neto ajustado',
                shortLabel: 'D4 · Productividad',
                currentScore: d4Current,
                targetScore: d4Target,
                gap: d4Target - d4Current,
                levelLabel: getLevelLabel(d4Current),
                personalizedSuggestion: `Ganancia neta ajustada: +${realisticProductivityGain}% (descontando ${verificationOverheadPct}% de sobrecarga de verificación humana).`
            },
            {
                code: 'D5',
                name: '05. Gobernanza y frontera tecnológica',
                shortLabel: 'D5 · Rigor crítico',
                currentScore: d5Current,
                targetScore: d5Target,
                gap: d5Target - d5Current,
                levelLabel: getLevelLabel(d5Current),
                personalizedSuggestion: `Auditar el ${creativas}% de labor analítica frente a un riesgo de frontera irregular de ${jaggedFrontierRisk}/100.`
            }
        ];

        // Subdimensiones operativas deterministas para el Radar 02
        const hasWritingTool = toolsArr.some(
            (t) => t.includes('redacción') || t.includes('presentaciones') || t.includes('Traducción')
        );
        const hasSynthesisTool = toolsArr.some(
            (t) => t.includes('Síntesis') || t.includes('bibliográfico') || t.includes('RAG')
        );
        const hasDataOrAgentTool = toolsArr.some(
            (t) => t.includes('datos') || t.includes('código') || t.includes('imágenes') || t.includes('agénticos')
        );

        const opRedaccion = Math.min(96, Math.round(writingScore * 0.65 + (hasWritingTool ? 28 : 8)));
        const opSintesis = Math.min(96, Math.round(creativas * 0.55 + (hasSynthesisTool ? 32 : 10)));
        const opDatos = Math.min(96, Math.round(d1Current * 0.55 + (hasDataOrAgentTool ? 34 : 8)));
        const opMitigacion = d3Current;
        const opGobernanza = d5Current;
        const opPrompting = d1Current;

        const currentOp = [opRedaccion, opSintesis, opDatos, opMitigacion, opGobernanza, opPrompting];
        const benchmarkOp = currentOp.map((val) => computeTarget(val, 0.46));

        const globalIndex = Math.round(
            dimensions.reduce((acc, item) => acc + item.currentScore, 0) / dimensions.length
        );

        return {
            dimensions,
            operationalRadar: {
                labels: [
                    'Asistencia en redacción',
                    'Síntesis y sistemas RAG',
                    'Datos, código y agentes',
                    'Factores habilitantes',
                    'Gobernanza y ética',
                    'Ingeniería de contexto'
                ],
                current: currentOp,
                benchmark: benchmarkOp
            },
            globalIndex,
            realisticProductivityGain,
            empirical: {
                iloClassification,
                iloComplementarityScore,
                jaggedFrontierRisk,
                jaggedFrontierLabel,
                iliaArchetype,
                weeklyHoursSavedNet,
                verificationOverheadPct,
                sectorEmpiricalRange: sectorInfo.empiricalRange,
                skillCompressionEffect
            }
        };
    },

    /**
     * Construye la matriz de sugerencias personalizadas usando reglas heurísticas deterministas
     * y marcos empíricos internacionales (OIT, CEPAL/ILIA, Harvard/BCG, Stanford AI Index).
     */
    buildPersonalizedSuggestions(): PersonalizedSuggestionItem[] {
        const r = this.data.responses;
        const tools: string[] = Array.isArray(r.herramientas_interes) ? r.herramientas_interes : [];
        const barriers: string[] = Array.isArray(r.barreras_implementacion) ? r.barreras_implementacion : [];
        const sectorInfo = SECTOR_HEURISTICS[r.sector] || SECTOR_HEURISTICS['Otro'];
        const { realisticProductivityGain, empirical } = this.computeDimensionMetrics();

        const primaryBarrier = barriers[0] || 'Preocupaciones éticas';
        const barrierRule =
            BARRIER_MITIGATIONS[primaryBarrier] ||
            'Establecer lineamientos internos de validación y privacidad antes de escalar el uso.';

        return [
            {
                dimension: 'D1 · Madurez e ILIA (CEPAL)',
                horizon: 'Fase 01 (Semanas 1-4)',
                action: `Consolidar el tránsito hacia el arquetipo «${empirical.iliaArchetype}» en «${r.sector}» mediante plantillas de ingeniería de contexto enfocadas en ${sectorInfo.domainFocus}.`,
                rationale: `${empirical.skillCompressionEffect} Su rol (${r.rol}) exige parametrizar fuentes, rol experto y criterios de verificación antes de generar borradores.`,
                priority: 'Alta'
            },
            {
                dimension: 'D2 · Exposición ocupacional (OIT)',
                horizon: 'Corto plazo (Meses 1-2)',
                action: `Descomprimir los cuellos de botella declarados (${r.principales_desafios}) delegando la preproducción del ${r.tareas_rutinarias}% de carga rutinaria para recuperar ~${empirical.weeklyHoursSavedNet} h/sem netas.`,
                rationale: `Bajo la clasificación OIT de «${empirical.iloClassification}» (${empirical.iloComplementarityScore}/100), la IA no sustituye su puesto, sino que transforma la dedicación semanal a redacción (${r.tiempo_redaccion}).`,
                priority: 'Alta'
            },
            {
                dimension: 'D3 · Adopción y curva J',
                horizon: `Horizonte declarado (${r.tiempo_implementacion})`,
                action: `Desplegar un flujo enfocado con las tecnologías seleccionadas (${tools.join(', ')}) sobre las áreas de alto retorno: ${r.areas_mayor_impacto}.`,
                rationale: `La evidencia de McKinsey y CEPAL advierte que dispersar herramientas retrasa el retorno (curva J); focalizar permite capturar el +${realisticProductivityGain}% estimado (rango empírico sectorial: ${empirical.sectorEmpiricalRange}).`,
                priority: 'Media'
            },
            {
                dimension: 'D4 · Factores habilitantes',
                horizon: 'Transversal y permanente',
                action: `${barrierRule} (Barreras activas: ${barriers.join(', ')}).`,
                rationale: `En el sector ${r.sector.toLowerCase()}, la norma crítica de gobernanza institucional es: ${sectorInfo.governanceRule}.`,
                priority: 'Estratégica'
            },
            {
                dimension: 'D5 · Frontera tecnológica (BCG/HBS)',
                horizon: 'Auditoría continua',
                action: `Fortalecer las competencias declaradas (${r.cambios_habilidades}) y reservar un ${empirical.verificationOverheadPct}% del tiempo ahorrado para auditar salidas frente a: ${r.riesgos_preocupaciones}.`,
                rationale: `Su índice de riesgo en la «Frontera Tecnológica Irregular» es ${empirical.jaggedFrontierRisk}/100 (${empirical.jaggedFrontierLabel}), indispensable para neutralizar ${sectorInfo.criticalRisk}.`,
                priority: 'Estratégica'
            }
        ];
    },

    /**
     * Motor heurístico y determinista principal: genera todo el informe cualitativo y cuantitativo
     * mediante reglas formales fundamentadas en OIT, CEPAL/ILIA, Harvard/BCG y Stanford AI Index, sin llamadas a IA externa.
     */
    evaluateHeuristicAnalysis() {
        const r = this.data.responses;
        const tools: string[] = Array.isArray(r.herramientas_interes) ? r.herramientas_interes : [];
        const barriers: string[] = Array.isArray(r.barreras_implementacion) ? r.barreras_implementacion : [];
        const rutinarias = Number(r.tareas_rutinarias);
        const creativas = Number(r.tareas_creativas);
        const mejoraDeclarada = Number(r.mejora_productividad);
        const totalBalance = rutinarias + creativas;

        const sectorInfo = SECTOR_HEURISTICS[r.sector] || SECTOR_HEURISTICS['Otro'];
        const { dimensions, globalIndex, realisticProductivityGain, empirical } = this.computeDimensionMetrics();

        const balanceObservation =
            totalBalance > 105
                ? `Se observa una superposición del ${totalBalance}% entre tareas rutinarias (${rutinarias}%) y creativas (${creativas}%), característica de roles de alta complejidad cognitiva donde la ejecución documental y el juicio crítico ocurren simultáneamente.`
                : totalBalance < 95
                ? `La suma declarada entre labores rutinarias (${rutinarias}%) y creativas (${creativas}%) alcanza el ${totalBalance}%, dejando un ${100 - totalBalance}% de actividades de coordinación relacional o gestión institucional.`
                : `Existe una partición proporcional exacta (${rutinarias}% rutinario frente a ${creativas}% creativo/analítico) en la estructura de su jornada.`;

        const deltaExpectativa = mejoraDeclarada - realisticProductivityGain;
        let diagnosticoExpectativa = '';
        if (deltaExpectativa > 12) {
            diagnosticoExpectativa = `Se detecta una sobrestimación de +${deltaExpectativa} puntos porcentuales entre la mejora subjetiva declarada (+${mejoraDeclarada}%) y el techo estructural neto (+${realisticProductivityGain}%, equivalente a ~${empirical.weeklyHoursSavedNet} h/sem recuperadas). Conforme a la evidencia sobre la «Frontera Tecnológica Irregular» (Harvard/BCG) y la paradoja de adopción de la OIT, dado que el ${creativas}% de su labor exige juicio experto y existen ${barriers.length} barreras activas (${barriers.join(', ')}), usted deberá reinvertir aproximadamente un ${empirical.verificationOverheadPct}% del tiempo bruto ahorrado en auditoría de calidad y verificación frente a ${r.riesgos_preocupaciones}.`;
        } else if (deltaExpectativa < -10) {
            diagnosticoExpectativa = `Se observa una estimación conservadora (+${mejoraDeclarada}% declarado frente a un potencial técnico neto de +${realisticProductivityGain}%, ~${empirical.weeklyHoursSavedNet} h/sem recuperables). Su volumen de tareas rutinarias (${rutinarias}%) y carga de redacción (${r.tiempo_redaccion}) se sitúan dentro del rango empírico del sector (${empirical.sectorEmpiricalRange}), permitiendo capturar mayores ganancias mediante plantillas estructuradas y el efecto de nivelación operativa (Stanford AI Index).`;
        } else {
            diagnosticoExpectativa = `Existe alta convergencia entre su expectativa declarada (+${mejoraDeclarada}%) y la proyección heurística neta (+${realisticProductivityGain}%, ~${empirical.weeklyHoursSavedNet} h/sem recuperables), alineada con el rango empírico observado en ${r.sector.toLowerCase()} (${empirical.sectorEmpiricalRange}). Para sostener este retorno superando la curva J de adopción sin degradar el ${creativas}% de trabajo intelectual, se contempla una reserva técnica del ${empirical.verificationOverheadPct}% para revisión experta frente a ${r.riesgos_preocupaciones}.`;
        }

        return {
            perfilProfesional: {
                resumen: `Perfil perteneciente al sector «${r.sector}», clasificado según la taxonomía de exposición ocupacional de la OIT y la CEPAL en régimen de «${empirical.iloClassification}» (índice de complementariedad: ${empirical.iloComplementarityScore}/100). Sus funciones declaradas (${r.rol}) se enfocan en ${sectorInfo.domainFocus}, con un ${rutinarias}% de carga rutinaria, un ${creativas}% de actividad analítica-creativa y una dedicación semanal a redacción de «${r.tiempo_redaccion}». ${balanceObservation}`,
                caracteristicas: [
                    `Arquetipo de madurez «${empirical.iliaArchetype}» (D1: ${dimensions[0].currentScore}/100, nivel declarado: ${r.experiencia_ia}) según dimensiones del marco ILIA (CEPAL/CENIA)`,
                    `Exposición ocupacional D2 de ${dimensions[1].currentScore}/100 con un ahorro estimado de ~${empirical.weeklyHoursSavedNet} horas semanales netas de trabajo operativo y documental`,
                    `Índice de riesgo en la «Frontera Tecnológica Irregular» (Harvard/BCG) de ${empirical.jaggedFrontierRisk}/100 (${empirical.jaggedFrontierLabel}) ante ${barriers.length} barreras de entorno`
                ],
                madurezTecnologica: `Puntuación determinista D1: ${dimensions[0].currentScore}/100 (${dimensions[0].levelLabel}). ${empirical.skillCompressionEffect} Para alcanzar la meta objetivo de ${dimensions[0].targetScore}/100 en ${r.tiempo_implementacion}, se requiere institucionalizar la regla de gobernanza sectorial: ${sectorInfo.governanceRule}.`
            },
            analisisProductividad: {
                potencialMejora: `Cruzando su carga rutinaria (${rutinarias}%), su dedicación a redacción (${r.tiempo_redaccion}) y los cuellos de botella declarados (${r.principales_desafios}) con los parámetros empíricos sectoriales (${empirical.sectorEmpiricalRange}), el modelo determina una ganancia neta realista del +${realisticProductivityGain}% (~${empirical.weeklyHoursSavedNet} h/sem liberadas tras descontar un ${empirical.verificationOverheadPct}% de supervisión humana «Human-in-the-loop»), focalizada en: ${r.areas_mayor_impacto}.`,
                factoresClave: [
                    `Descompresión directa de los cuellos de botella reportados (${r.principales_desafios}) con recuperación estimada de ~${empirical.weeklyHoursSavedNet} h/sem`,
                    `Captura de valor dentro de la frontera de capacidad de la IA en: ${r.areas_mayor_impacto}`,
                    `Mitigación del desfase de la curva J articulando el horizonte de ${r.tiempo_implementacion} con ${tools.slice(0, 3).join(', ')}`
                ],
                sobrestimaciones: diagnosticoExpectativa
            },
            recomendaciones: {
                inmediatas: [
                    `Estandarizar un protocolo de preproducción para resolver el cuello de botella prioritario (${r.principales_desafios}) utilizando ${tools[0] || 'asistentes de redacción'} dentro de la frontera segura del modelo`,
                    `Aplicar la regla de gobernanza sectorial (${sectorInfo.governanceRule}) para neutralizar ${r.riesgos_preocupaciones}`,
                    `Sistematizar plantillas modulares para su bloque semanal de redacción (${r.tiempo_redaccion}) capturando las primeras ~${empirical.weeklyHoursSavedNet} h/sem de ahorro neto`
                ],
                medianoPlazo: [
                    `Desplegar un plan progresivo de ${r.tiempo_implementacion} que supere las barreras declaradas (${barriers.join(', ')}) evitando la fragmentación de herramientas`,
                    `Evolucionar desde consultas aisladas hacia flujos estructurados con ${tools.join(', ')} en las áreas de mayor retorno (${r.areas_mayor_impacto}), midiendo indicadores de tiempo y calidad antes y después`
                ],
                habilidades: [
                    `Formación focalizada en las competencias declaradas por la persona evaluada: ${r.cambios_habilidades}`,
                    `Auditoría epistemológica y delimitación de la «Frontera Tecnológica Irregular» para prevenir ${sectorInfo.criticalRisk}`
                ]
            },
            conclusiones: {
                sintesis: `El diagnóstico heurístico arroja un Índice Global de Impacto de ${globalIndex}/100 puntos y ubica al perfil en el arquetipo «${empirical.iliaArchetype}». En concordancia con los estudios empíricos de la OIT, la CEPAL y Harvard/BCG (2025-2026), el perfil evaluado en «${r.sector}» presenta alto potencial de complementariedad (${empirical.iloComplementarityScore}/100) para automatizar preproducción operativa (D2: ${dimensions[1].currentScore}/100), exigiendo simultáneamente supervisión crítica rigurosa (D5: ${dimensions[4].currentScore}/100) sobre el ${creativas}% de carga analítica y creativa.`,
                recomendacionPrincipal: `Priorizar la intervención sobre «${r.principales_desafios}» fortaleciendo «${r.cambios_habilidades}», reservando un ${empirical.verificationOverheadPct}% del tiempo ganado para verificación humana experta («Human-in-the-loop») antes de validar cualquier entregable definitivo.`,
                perspectivas: `En un horizonte de ${r.tiempo_implementacion}, la ejecución disciplinada de esta hoja de ruta permitirá consolidar una mejora productiva sostenible del +${realisticProductivityGain}% (~${empirical.weeklyHoursSavedNet} horas semanales netas), reinvirtiendo el tiempo liberado en pensamiento estratégico, innovación y calidad institucional.`
            }
        };
    },

    getStepCompletion(step: Step): { answered: number; total: number } {
        let answered = 0;
        step.questions.forEach((q) => {
            if (this.isQuestionAnswered(q)) {
                answered++;
            }
        });
        return { answered, total: step.questions.length };
    },

    getTotalCompletion(): { answered: number; total: number } {
        let answered = 0;
        let total = 0;
        this.steps.forEach((s) => {
            const c = this.getStepCompletion(s);
            answered += c.answered;
            total += c.total;
        });
        return { answered, total };
    },

    renderHorizontalStepper() {
        const stepper = document.getElementById('horizontalStepper');
        if (!stepper) return;

        stepper.innerHTML = this.steps
            .map((step, idx) => {
                const isCurrent = idx === this.data.currentStep && this.data.activeView === 'form';
                const { answered, total } = this.getStepCompletion(step);
                const isDone = answered === total;
                const pct = Math.round((answered / total) * 100);

                return `
                <button
                    type="button"
                    onclick="app.goToStep(${idx})"
                    class="p-4 text-left transition-colors cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isCurrent
                            ? 'bg-[#EDF5FF]/60 border-b-2 border-b-[#0F62FE]'
                            : 'bg-white hover:bg-[#F4F4F0]/80'
                    }"
                >
                    <div class="flex items-center justify-between gap-2 w-full">
                        <span class="font-mono-tabular text-[11px] font-semibold uppercase tracking-wider ${
                            isCurrent ? 'text-[#0F62FE]' : isDone ? 'text-[#198038]' : 'text-[#6F6F6F]'
                        }">Módulo ${step.number}</span>
                        <span class="font-mono-tabular text-[11px] font-semibold ${
                            isDone ? 'text-[#198038]' : isCurrent ? 'text-[#0F62FE]' : 'text-[#6F6F6F]'
                        }">${answered}/${total}</span>
                    </div>
                    <div class="text-xs font-semibold text-[#161616] truncate">${step.shortTitle}</div>
                    <div class="w-full h-1 bg-[#E0E0DA] overflow-hidden">
                        <div class="h-full transition-all duration-150 ${
                            isDone ? 'bg-[#198038]' : 'bg-[#0F62FE]'
                        }" style="width: ${pct}%"></div>
                    </div>
                </button>
            `;
            })
            .join('');
    },

    renderCriterionJumpBar() {
        const bar = document.getElementById('criterionJumpBar');
        if (!bar) return;

        const stepData = this.steps[this.data.currentStep];
        const { answered, total } = this.getStepCompletion(stepData);

        const pillsHtml = stepData.questions
            .map((q, qIdx) => {
                const done = this.isQuestionAnswered(q);
                const hasErr = this.data.validationErrors.includes(q.id);
                return `
                <button
                    type="button"
                    onclick="app.scrollToCriterion('${q.id}')"
                    class="px-2.5 py-1 text-[11px] font-mono-tabular font-medium border rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                        hasErr
                            ? 'border-[#DA1E28] bg-[#FFF1F1] text-[#DA1E28]'
                            : done
                            ? 'border-[#198038]/40 bg-[#DEFBE6]/50 text-[#198038]'
                            : 'border-[#D9D9D4] bg-white text-[#525252] hover:border-[#0F62FE] hover:text-[#0F62FE]'
                    }"
                >
                    <span>${stepData.number}.${qIdx + 1}</span>
                    <span>${done ? '✓' : '·'}</span>
                </button>
            `;
            })
            .join('');

        bar.innerHTML = `
            <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[11px] font-mono-tabular uppercase tracking-wider text-[#6F6F6F] mr-1.5">Ir al criterio:</span>
                ${pillsHtml}
            </div>
            <div class="text-[11px] font-mono-tabular text-[#525252]">
                <strong class="text-[#161616]">${answered}</strong> de <strong class="text-[#161616]">${total}</strong> completados en este módulo
            </div>
        `;
    },

    scrollToCriterion(questionId: string) {
        const wrapper = document.getElementById(`criterion_block_${questionId}`);
        const inputEl = document.getElementById(questionId);
        if (wrapper) {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (inputEl && (inputEl.tagName === 'TEXTAREA' || inputEl.tagName === 'INPUT')) {
            setTimeout(() => inputEl.focus(), 220);
        }
    },

    renderStepRail() {
        const rail = document.getElementById('stepRail');
        if (!rail) return;

        rail.innerHTML = this.steps
            .map((step, idx) => {
                const isCurrent = idx === this.data.currentStep && this.data.activeView === 'form';
                const { answered, total } = this.getStepCompletion(step);
                const isDone = answered === total;

                return `
                <button
                    type="button"
                    onclick="app.goToStep(${idx})"
                    class="w-full py-3 px-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isCurrent
                            ? 'bg-[#EDF5FF] text-[#0F62FE] font-semibold'
                            : 'text-[#525252] hover:bg-[#F4F4F0] hover:text-[#161616]'
                    }"
                >
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="font-mono-tabular text-xs ${
                            isCurrent ? 'text-[#0F62FE] font-semibold' : isDone ? 'text-[#198038] font-semibold' : 'text-[#8D8D8D]'
                        }">${step.number}.</span>
                        <span class="text-xs truncate">${step.shortTitle}</span>
                    </div>
                    <span class="font-mono-tabular text-[11px] shrink-0 ${
                        isDone ? 'text-[#198038] font-semibold' : isCurrent ? 'text-[#0F62FE]' : 'text-[#6F6F6F]'
                    }">
                        ${answered}/${total}
                    </span>
                </button>
            `;
            })
            .join('');
    },

    renderLiveTelemetry() {
        const container = document.getElementById('liveTelemetry');
        const counter = document.getElementById('completionCounter');
        const pctBadge = document.getElementById('completionPctBadge');
        const ribbonChapter = document.getElementById('ribbonActiveChapter');
        const ribbonArchetype = document.getElementById('ribbonArchetypeStatus');
        const ribbonScore = document.getElementById('ribbonGlobalScore');
        const headerBtn = document.getElementById('headerPrimaryBtn');

        const { answered, total } = this.getTotalCompletion();
        const allValid = answered === total;
        const pct = Math.round((answered / total) * 100);
        const stepData = this.steps[this.data.currentStep];

        if (counter) {
            counter.textContent = `${answered} / ${total} criterios`;
        }
        if (pctBadge) {
            pctBadge.textContent = `${pct}%`;
        }

        if (ribbonChapter) {
            if (this.data.activeView !== 'form') {
                ribbonChapter.textContent = 'Informe ejecutivo activo';
            } else {
                ribbonChapter.textContent = `${stepData.number} / 0${this.steps.length} · ${stepData.shortTitle}`;
            }
        }

        const r = this.data.responses;
        const selectedSector = r.sector ? String(r.sector) : '';
        const sectorBenchmark = selectedSector ? SECTOR_HEURISTICS[selectedSector] : null;
        const metrics = allValid ? this.computeDimensionMetrics() : null;

        if (ribbonArchetype) {
            if (metrics) {
                ribbonArchetype.textContent = `${metrics.empirical.iliaArchetype} · ${metrics.empirical.iloClassification}`;
            } else if (sectorBenchmark) {
                ribbonArchetype.textContent = `Sector ${selectedSector} (en captura)`;
            } else {
                ribbonArchetype.textContent = `Selecciona tu sector en 01.1`;
            }
        }

        if (ribbonScore) {
            if (metrics) {
                ribbonScore.textContent = `${metrics.globalIndex}/100 pts · +${metrics.realisticProductivityGain}% (~${metrics.empirical.weeklyHoursSavedNet} h/sem)`;
            } else {
                ribbonScore.textContent = `Pendiente (${total - answered} criterios restantes)`;
            }
        }

        if (headerBtn) {
            if (this.data.isCompleted && this.data.currentAnalysis) {
                headerBtn.textContent = 'Exportar informe PDF';
            } else {
                headerBtn.textContent = 'Emitir diagnóstico';
            }
        }

        if (!container) return;

        const sector = r.sector || 'Pendiente';
        const experiencia = r.experiencia_ia || 'Pendiente';
        const rutinarias = typeof r.tareas_rutinarias === 'number' ? `${r.tareas_rutinarias}%` : '—';
        const creativas = typeof r.tareas_creativas === 'number' ? `${r.tareas_creativas}%` : '—';
        const mejora = typeof r.mejora_productividad === 'number' ? `+${r.mejora_productividad}%` : '—';
        const horizonte = r.tiempo_implementacion || 'Pendiente';
        const herramientasCount = Array.isArray(r.herramientas_interes) ? r.herramientas_interes.length : 0;
        const barrerasCount = Array.isArray(r.barreras_implementacion) ? r.barreras_implementacion.length : 0;
        const globalIndexDisplay = metrics ? `${metrics.globalIndex} / 100` : `${pct}% capturado`;

        const renderTooltipLabel = (label: string, frameworkTag: string, description: string, isBold = false) => `
            <span tabindex="0" class="metric-tooltip-trigger ${isBold ? 'text-[#0F2C59] font-semibold' : 'text-[#475569]'} border-b border-dotted border-[#94A3B8] hover:text-[#0F62FE] hover:border-[#0F62FE] focus:outline-none">
                <span>${label}</span>
                <span class="font-mono-tabular text-[10px] text-[#0F62FE]" aria-hidden="true">ⓘ</span>
                <span role="tooltip" class="metric-tooltip-content">
                    <strong class="block text-[10px] font-mono-tabular uppercase tracking-wider text-[#78A9FF] mb-1">${frameworkTag}</strong>
                    ${description}
                </span>
            </span>
        `;

        const benchmarkPreviewHtml = sectorBenchmark
            ? `
            <div class="pt-3 mt-2 border-t border-[#D5DCE6]">
                <div class="text-[11px] font-mono-tabular uppercase tracking-wider text-[#0F62FE] font-semibold mb-1.5">
                    Referencia empírica · ${selectedSector}
                </div>
                <p class="text-[11px] text-[#475569] leading-relaxed mb-2.5">
                    ${sectorBenchmark.empiricalBenchmark}
                </p>
                <div class="grid grid-cols-2 gap-2 text-[11px] font-mono-tabular bg-[#F4F6F9] p-2.5 border border-[#D5DCE6]">
                    <div>
                        <div class="mb-0.5">
                            ${renderTooltipLabel(
                                'Rango realista',
                                'OIT · Stanford AI Index',
                                'Intervalo empírico de mejora neta de productividad documentado en estudios sectoriales (2025-2026) una vez estabilizada la curva de adopción.'
                            )}
                        </div>
                        <span class="font-semibold text-[#0F2C59] block mt-0.5">${sectorBenchmark.realisticRange}</span>
                    </div>
                    <div>
                        <div class="mb-0.5">
                            ${renderTooltipLabel(
                                'Auditoría humana',
                                'Frontera Irregular · BCG',
                                'Fracción del tiempo ahorrado que debe destinarse a verificación experta («Human-in-the-loop») para mitigar alucinaciones y errores sutiles.'
                            )}
                        </div>
                        <span class="font-semibold text-[#0F2C59] block mt-0.5">~${Math.round(sectorBenchmark.verificationOverheadFactor * 100)}% del ahorro</span>
                    </div>
                </div>
            </div>
        `
            : '';

        container.innerHTML = `
            <div class="flex items-baseline justify-between gap-4 py-2">
                <dt>
                    ${renderTooltipLabel(
                        'Sector profesional',
                        'Clasificación OIT / CEPAL',
                        'Define el régimen estructural de exposición ocupacional a la IAGen y la exigencia de verificación documental propia de tu actividad.'
                    )}
                </dt>
                <dd class="font-medium text-[#0F2C59] text-right truncate max-w-[170px]">${sector}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-2">
                <dt>
                    ${renderTooltipLabel(
                        'Nivel de experiencia',
                        'Madurez ILIA (CEPAL/CENIA)',
                        'Determina el arquetipo de adopción tecnológica (Explorador inicial, Adoptante táctico, Integrador sistemático o Transformador estratégico).'
                    )}
                </dt>
                <dd class="font-medium text-[#0F2C59] text-right truncate max-w-[170px]">${experiencia}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-2">
                <dt>
                    ${renderTooltipLabel(
                        'Carga rutinaria / crítica',
                        'Gradiente de exposición OIT',
                        'Contrasta la proporción de tareas codificables (automatizables) frente a las tareas analíticas y creativas de alta complementariedad humana.'
                    )}
                </dt>
                <dd class="font-mono-tabular font-semibold text-[#0F2C59]">${rutinarias} · ${creativas}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-2">
                <dt>
                    ${renderTooltipLabel(
                        'Herramientas / barreras',
                        'Viabilidad ecosistémica CEPAL',
                        'Relaciona la amplitud del repertorio funcional de IAGen seleccionado con las fricciones institucionales, éticas o técnicas del entorno.'
                    )}
                </dt>
                <dd class="font-mono-tabular font-semibold text-[#0F2C59]">${herramientasCount} · ${barrerasCount}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-2">
                <dt>
                    ${renderTooltipLabel(
                        'Horizonte estimado',
                        'Curva J de adopción (CEPAL)',
                        'Plazo proyectado para superar la fricción inicial de aprendizaje, estandarizar plantillas de contexto y consolidar flujos verificables.'
                    )}
                </dt>
                <dd class="font-medium text-[#0F2C59]">${horizonte}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-2">
                <dt>
                    ${renderTooltipLabel(
                        'Expectativa declarada',
                        'Contraste empírico OIT / BCG',
                        'Ganancia bruta subjetiva estimada por el usuario antes de aplicar el factor corrector por techo de tareas y sobrecarga de auditoría.'
                    )}
                </dt>
                <dd class="font-mono-tabular font-semibold text-[#0F62FE]">${mejora}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-2.5">
                <dt>
                    ${renderTooltipLabel(
                        'Estado del modelo',
                        'Índice heurístico (OIT / CEPAL)',
                        'Puntuación determinista global (0-100) que sintetiza las 5 dimensiones: madurez ILIA, complementariedad OIT, factibilidad, impacto neto y gobernanza.',
                        true
                    )}
                </dt>
                <dd class="font-mono-tabular font-bold text-[#0F62FE]">${globalIndexDisplay}</dd>
            </div>
            ${benchmarkPreviewHtml}
        `;
    },

    updateTopNavHighlight() {
        const navDiagnostico = document.getElementById('navDiagnostico');
        const navInforme = document.getElementById('navInforme');
        const navVisualizacion = document.getElementById('navVisualizacion');

        const activeClasses = ['text-white', 'border-[#78A9FF]'];
        const inactiveClasses = ['text-[#D0E2FF]', 'border-transparent'];

        [navDiagnostico, navInforme, navVisualizacion].forEach((el) => {
            if (!el) return;
            el.classList.remove(...activeClasses);
            el.classList.add(...inactiveClasses);
        });

        const currentEl =
            this.data.activeView === 'form'
                ? navDiagnostico
                : this.data.activeView === 'charts'
                ? navVisualizacion
                : navInforme;

        if (currentEl) {
            currentEl.classList.remove(...inactiveClasses);
            currentEl.classList.add(...activeClasses);
        }
    },

    switchView(view: 'form' | 'report' | 'charts') {
        if (view === 'form') {
            this.data.activeView = 'form';
            document.getElementById('resultsContainer')?.classList.add('hidden');
            document.getElementById('questionnaireWrapper')?.classList.remove('hidden');
            this.render();
            this.updateTopNavHighlight();
            return;
        }

        const validation = this.validateAllSteps();
        if (!validation.valid) {
            this.data.currentStep = validation.firstIncompleteStep;
            this.data.validationErrors = validation.missingIds;
            this.data.activeView = 'form';
            document.getElementById('resultsContainer')?.classList.add('hidden');
            document.getElementById('questionnaireWrapper')?.classList.remove('hidden');
            this.render();
            this.updateTopNavHighlight();
            this.showToast(
                `Completa los criterios pendientes del módulo 0${validation.firstIncompleteStep + 1} para emitir el informe`
            );
            return;
        }

        if (!this.data.currentAnalysis) {
            this.generateAnalysis(view);
        } else {
            this.showResults(this.data.currentAnalysis, view);
        }
    },

    handlePrimaryHeaderAction() {
        if (this.data.isCompleted && this.data.currentAnalysis) {
            this.downloadPDF();
        } else {
            this.generateAnalysis('report');
        }
    },

    goToStep(index: number) {
        if (index < 0 || index >= this.steps.length) return;
        this.data.currentStep = index;
        this.data.validationErrors = [];
        this.switchView('form');
    },

    render() {
        this.data.activeView = 'form';
        const stepData = this.steps[this.data.currentStep];

        let html = `
            <div class="pb-6 mb-8 border-b border-[#E5E5E0]">
                <div class="flex flex-wrap items-center gap-2 text-xs text-[#6F6F6F] mb-2">
                    <span class="font-mono-tabular font-semibold uppercase tracking-wider text-[#0F62FE]">Módulo ${stepData.number} de 0${this.steps.length}</span>
                    <span aria-hidden="true">·</span>
                    <span>${stepData.questions.length} criterios obligatorios</span>
                </div>
                <h2 class="font-display text-2xl sm:text-[26px] font-semibold text-[#161616] tracking-tight">
                    ${stepData.title}
                </h2>
                <p class="mt-1.5 text-sm text-[#525252] leading-relaxed max-w-2xl">
                    ${stepData.description}
                </p>
            </div>
            <div class="divide-y divide-[#E5E5E0]">
        `;

        stepData.questions.forEach((question, qIndex) => {
            const hasError = this.data.validationErrors.includes(question.id);
            const isDone = this.isQuestionAnswered(question);
            html += `
                <div id="criterion_block_${question.id}" class="py-7 first:pt-0 last:pb-0 scroll-mt-24">
                    <div class="mb-4">
                        <div class="flex items-baseline justify-between gap-4">
                            <label for="${question.id}" class="block font-display text-base font-semibold text-[#161616] leading-snug">
                                <span class="font-mono-tabular text-xs font-semibold text-[#0F62FE] mr-2">${stepData.number}.${qIndex + 1}</span>
                                ${question.text}
                            </label>
                            ${
                                hasError
                                    ? `<span class="text-xs font-mono-tabular font-semibold text-[#DA1E28] shrink-0">Respuesta obligatoria</span>`
                                    : isDone
                                    ? `<span class="text-[11px] font-mono-tabular font-medium text-[#198038] shrink-0">Registrado ✓</span>`
                                    : `<span class="text-[11px] font-mono-tabular text-[#6F6F6F] shrink-0">Pendiente</span>`
                            }
                        </div>
                        ${
                            question.hint
                                ? `<p class="mt-1 text-xs text-[#525252] leading-relaxed">${question.hint}</p>`
                                : ''
                        }
                    </div>
                    ${this.renderQuestion(question, hasError)}
                </div>
            `;
        });

        html += `</div>`;

        const stepContent = document.getElementById('stepContent');
        if (stepContent) {
            stepContent.innerHTML = html;
        }

        stepData.questions.forEach((question) => this.restoreValue(question));
        this.updateProgress();
        this.updateNavigation();
        this.renderHorizontalStepper();
        this.renderCriterionJumpBar();
        this.renderStepRail();
        this.renderLiveTelemetry();
        this.updateTopNavHighlight();
    },

    getSliderDescriptor(questionId: string, val: number | undefined): string {
        if (val === undefined) {
            return 'Desliza el control o pulsa un valor predefinido para registrar tu estimación';
        }
        if (questionId === 'tareas_rutinarias') {
            if (val <= 25) return 'Baja carga operativa rutinaria · Predominio de actividades no estandarizadas';
            if (val <= 55) return 'Carga operativa moderada · Oportunidad selectiva de delegación en IAGen';
            return 'Alta carga rutinaria · Elevado potencial de automatización de borradores y procesos';
        }
        if (questionId === 'tareas_creativas') {
            if (val <= 25) return 'Baja exigencia de diseño original o juicio experto complejo';
            if (val <= 60) return 'Equilibrio entre análisis crítico humano y ejecución asistida';
            return 'Alta exigencia intelectual y creativa · Requiere supervisión experta («Human-in-the-loop»)';
        }
        if (questionId === 'mejora_productividad') {
            if (val <= 20) return 'Expectativa conservadora y gradual';
            if (val <= 50) return 'Expectativa moderada alineada con pilotos empíricos (Stanford / BCG)';
            return 'Expectativa elevada · Se ajustará según techo de tareas y sobrecarga de verificación';
        }
        return '';
    },

    getAnalyticalDensityLabel(wordCount: number): { label: string; colorClass: string } {
        if (wordCount === 0) {
            return { label: 'Sin texto registrado', colorClass: 'text-[#6F6F6F]' };
        }
        if (wordCount < 10) {
            return { label: `${wordCount} palabras · Nivel descriptivo básico`, colorClass: 'text-[#B28600]' };
        }
        if (wordCount < 25) {
            return { label: `${wordCount} palabras · Nivel analítico adecuado`, colorClass: 'text-[#0F62FE]' };
        }
        return { label: `${wordCount} palabras · Alta especificidad contextual (+bonificación heurística)`, colorClass: 'text-[#198038]' };
    },

    renderQuestion(question: Question, hasError = false) {
        const rawVal = this.data.responses[question.id];
        const value = rawVal !== undefined ? rawVal : '';
        const borderErrorClass = hasError ? 'border-[#DA1E28] bg-[#FFF1F1]/40' : 'border-[#D9D9D4]';

        switch (question.type) {
            case 'select': {
                const optionsHtml = (question.options || [])
                    .map((option, idx) => {
                        const isSelected = value === option;
                        return `
                        <button
                            type="button"
                            onclick="app.selectOption('${question.id}', '${option.replace(/'/g, "\\'")}')"
                            class="text-left px-4 py-3.5 rounded-xs border text-sm font-medium transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                    ? 'bg-[#EDF5FF] border-[#0F62FE] text-[#161616]'
                                    : `bg-[#FAFAFA] ${borderErrorClass} text-[#161616] hover:border-[#8D8D8D] hover:bg-[#F4F4F0]`
                            }"
                        >
                            <div class="flex items-center gap-2.5 min-w-0">
                                <span class="font-mono-tabular text-[11px] ${
                                    isSelected ? 'text-[#0F62FE] font-semibold' : 'text-[#6F6F6F]'
                                }">0${idx + 1}</span>
                                <span class="truncate">${option}</span>
                            </div>
                            <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#0F62FE] bg-[#0F62FE]' : 'border-[#8D8D8D] bg-white'
                            }">
                                ${
                                    isSelected
                                        ? `<span class="w-1.5 h-1.5 rounded-full bg-white"></span>`
                                        : ''
                                }
                            </span>
                        </button>
                    `;
                    })
                    .join('');

                return `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="${question.id}_group">
                        ${optionsHtml}
                    </div>
                `;
            }

            case 'textarea': {
                const textStr = typeof value === 'string' ? value.trim() : '';
                const wordCount = textStr ? textStr.split(/\s+/).length : 0;
                const density = this.getAnalyticalDensityLabel(wordCount);
                return `
                    <div>
                        <textarea
                            class="w-full px-4 py-3.5 text-sm text-[#161616] bg-[#FAFAFA] border ${borderErrorClass} rounded-xs focus:outline-none focus:bg-white focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/15 transition-all min-h-[120px] resize-y leading-relaxed"
                            id="${question.id}"
                            placeholder="${question.placeholder || ''}"
                            oninput="app.updateResponse('${question.id}', this.value)"
                        >${value}</textarea>
                        <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular">
                            <span class="text-[#6F6F6F]">El motor heurístico pondera la especificidad terminológica y analítica</span>
                            <span id="${question.id}_words" class="font-medium ${density.colorClass}">${density.label}</span>
                        </div>
                    </div>
                `;
            }

            case 'slider': {
                const isAnswered = typeof rawVal === 'number';
                const numericVal = isAnswered ? Number(rawVal) : question.min || 0;
                const descriptor = this.getSliderDescriptor(
                    question.id,
                    isAnswered ? numericVal : undefined
                );

                return `
                    <div class="bg-[#FAFAFA] border ${borderErrorClass} rounded-xs p-5">
                        <div class="flex items-baseline justify-between gap-4 mb-3">
                            <span id="${question.id}_desc" class="text-xs font-medium ${
                                isAnswered ? 'text-[#161616]' : 'text-[#6F6F6F]'
                            }">${descriptor}</span>
                            <span id="${question.id}_value" class="font-mono-tabular text-2xl font-bold ${
                                isAnswered ? 'text-[#0F62FE]' : 'text-[#8D8D8D]'
                            }">${isAnswered ? `${numericVal}%` : 'Sin definir'}</span>
                        </div>
                        <input
                            type="range"
                            class="diagnostic-slider"
                            id="${question.id}"
                            min="${question.min}"
                            max="${question.max}"
                            step="${question.step}"
                            value="${numericVal}"
                            oninput="app.updateSlider('${question.id}', this.value)"
                            onchange="app.updateSlider('${question.id}', this.value)"
                        >
                        <div class="flex items-center justify-between gap-2 mt-3">
                            <span class="text-[11px] font-mono-tabular text-[#6F6F6F]">Selección rápida:</span>
                            <div class="flex flex-wrap items-center gap-1.5 font-mono-tabular text-[11px]">
                                ${[0, 15, 30, 50, 70, 85, 100]
                                    .map(
                                        (preset) => `
                                    <button
                                        type="button"
                                        onclick="app.updateSlider('${question.id}', '${preset}')"
                                        class="px-2 py-0.5 border rounded-xs transition-colors cursor-pointer ${
                                            isAnswered && numericVal === preset
                                                ? 'border-[#0F62FE] bg-[#0F62FE] text-white font-semibold'
                                                : 'border-[#D9D9D4] bg-white text-[#525252] hover:border-[#0F62FE] hover:text-[#0F62FE]'
                                        }"
                                    >${preset}%</button>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>
                    </div>
                `;
            }

            case 'multiple': {
                const selectedArr = Array.isArray(value) ? value : [];
                const itemsHtml = (question.options || [])
                    .map((option, idx) => {
                        const isChecked = selectedArr.includes(option);
                        return `
                        <button
                            type="button"
                            onclick="app.toggleMultipleOption('${question.id}', '${option.replace(/'/g, "\\'")}')"
                            class="text-left px-4 py-3 rounded-xs border text-sm font-medium transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                isChecked
                                    ? 'bg-[#EDF5FF] border-[#0F62FE] text-[#161616]'
                                    : `bg-[#FAFAFA] ${borderErrorClass} text-[#161616] hover:border-[#8D8D8D] hover:bg-[#F4F4F0]`
                            }"
                        >
                            <div class="flex items-center gap-2.5 min-w-0">
                                <span class="font-mono-tabular text-[11px] ${
                                    isChecked ? 'text-[#0F62FE] font-semibold' : 'text-[#6F6F6F]'
                                }">${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                <span class="truncate">${option}</span>
                            </div>
                            <span class="w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 ${
                                isChecked ? 'border-[#0F62FE] bg-[#0F62FE] text-white' : 'border-[#8D8D8D] bg-white'
                            }">
                                ${
                                    isChecked
                                        ? `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
                                        : ''
                                }
                            </span>
                        </button>
                    `;
                    })
                    .join('');

                return `
                    <div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            ${itemsHtml}
                        </div>
                        <div class="mt-2.5 flex items-center justify-between text-xs text-[#525252] font-mono-tabular">
                            <span>${selectedArr.length} ${selectedArr.length === 1 ? 'opción seleccionada' : 'opciones seleccionadas'}</span>
                            ${
                                selectedArr.length > 0
                                    ? `<button type="button" onclick="app.clearMultipleOptions('${question.id}')" class="text-[11px] text-[#0F62FE] hover:underline cursor-pointer">Limpiar selección</button>`
                                    : ''
                            }
                        </div>
                    </div>
                `;
            }

            default:
                return '';
        }
    },

    clearMultipleOptions(questionId: string) {
        this.data.responses[questionId] = [];
        this.data.hasUnsavedChanges = true;
        this.data.isCompleted = false;
        this.data.currentAnalysis = null;
        this.updateSaveButton();
        this.render();
    },

    restoreValue(question: Question) {
        const value = this.data.responses[question.id];
        if (value === undefined || value === null) return;

        if (question.type === 'textarea') {
            const el = document.getElementById(question.id) as HTMLTextAreaElement | null;
            if (el) el.value = value;
        } else if (question.type === 'slider') {
            const el = document.getElementById(question.id) as HTMLInputElement | null;
            const valLabel = document.getElementById(`${question.id}_value`);
            const descLabel = document.getElementById(`${question.id}_desc`);
            if (el) el.value = String(value);
            if (valLabel) {
                valLabel.textContent = `${value}%`;
                valLabel.classList.remove('text-[#8D8D8D]');
                valLabel.classList.add('text-[#0F62FE]');
            }
            if (descLabel) descLabel.textContent = this.getSliderDescriptor(question.id, Number(value));
        }
    },

    clearValidationError(questionId: string) {
        if (this.data.validationErrors.includes(questionId)) {
            this.data.validationErrors = this.data.validationErrors.filter((id) => id !== questionId);
        }
    },

    selectOption(questionId: string, option: string) {
        this.data.responses[questionId] = option;
        this.clearValidationError(questionId);
        this.data.hasUnsavedChanges = true;
        this.data.isCompleted = false;
        this.data.currentAnalysis = null;
        this.updateSaveButton();
        this.render();
    },

    updateResponse(questionId: string, value: string) {
        this.data.responses[questionId] = value;
        if (value.trim().length > 0) {
            this.clearValidationError(questionId);
        }
        const wordsEl = document.getElementById(`${questionId}_words`);
        if (wordsEl) {
            const trimmed = value.trim();
            const count = trimmed ? trimmed.split(/\s+/).length : 0;
            const density = this.getAnalyticalDensityLabel(count);
            wordsEl.textContent = density.label;
            wordsEl.className = `font-medium ${density.colorClass}`;
        }
        this.data.hasUnsavedChanges = true;
        this.data.isCompleted = false;
        this.data.currentAnalysis = null;
        this.updateSaveButton();
        this.renderHorizontalStepper();
        this.renderCriterionJumpBar();
        this.renderStepRail();
        this.renderLiveTelemetry();
    },

    updateSlider(questionId: string, value: string) {
        const numeric = parseInt(value, 10);
        this.data.responses[questionId] = numeric;
        this.clearValidationError(questionId);
        const sliderEl = document.getElementById(questionId) as HTMLInputElement | null;
        const valEl = document.getElementById(`${questionId}_value`);
        const descEl = document.getElementById(`${questionId}_desc`);
        if (sliderEl) sliderEl.value = String(numeric);
        if (valEl) {
            valEl.textContent = `${numeric}%`;
            valEl.classList.remove('text-[#8D8D8D]');
            valEl.classList.add('text-[#0F62FE]');
        }
        if (descEl) descEl.textContent = this.getSliderDescriptor(questionId, numeric);
        this.data.hasUnsavedChanges = true;
        this.data.isCompleted = false;
        this.data.currentAnalysis = null;
        this.updateSaveButton();
        this.renderHorizontalStepper();
        this.renderCriterionJumpBar();
        this.renderStepRail();
        this.renderLiveTelemetry();
    },

    toggleMultipleOption(questionId: string, option: string) {
        if (!Array.isArray(this.data.responses[questionId])) {
            this.data.responses[questionId] = [];
        }
        const currentArr = this.data.responses[questionId] as string[];
        if (currentArr.includes(option)) {
            this.data.responses[questionId] = currentArr.filter((item) => item !== option);
        } else {
            currentArr.push(option);
        }
        if ((this.data.responses[questionId] as string[]).length > 0) {
            this.clearValidationError(questionId);
        }
        this.data.hasUnsavedChanges = true;
        this.data.isCompleted = false;
        this.data.currentAnalysis = null;
        this.updateSaveButton();
        this.render();
    },

    updateSaveButton() {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            if (this.data.hasUnsavedChanges) {
                saveBtn.classList.remove('hidden');
            } else {
                saveBtn.classList.add('hidden');
            }
        }
    },

    updateProgress() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        if (progressText) {
            progressText.textContent = `Módulo 0${this.data.currentStep + 1} / 0${this.steps.length}`;
        }
        if (progressFill) {
            progressFill.style.width = `${((this.data.currentStep + 1) / this.steps.length) * 100}%`;
        }
    },

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
        const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;

        if (prevBtn) {
            prevBtn.disabled = this.data.currentStep === 0;
        }
        if (nextBtn) {
            if (this.data.currentStep === this.steps.length - 1) {
                nextBtn.textContent = 'Emitir informe ejecutivo →';
            } else {
                nextBtn.textContent = 'Siguiente módulo →';
            }
        }
    },

    nextStep() {
        const currentValidation = this.validateStep(this.data.currentStep);
        if (!currentValidation.valid) {
            this.data.validationErrors = currentValidation.missingIds;
            this.render();
            this.scrollToCriterion(currentValidation.missingIds[0]);
            this.showToast('Completa los criterios resaltados en este módulo antes de continuar');
            return;
        }

        this.data.validationErrors = [];
        this.saveProgress(false);

        if (this.data.currentStep < this.steps.length - 1) {
            this.data.currentStep++;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this.generateAnalysis('report');
        }
    },

    previousStep() {
        if (this.data.currentStep > 0) {
            this.data.validationErrors = [];
            this.data.currentStep--;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    saveProgress(notify = true) {
        const progressData = {
            sessionId: this.data.sessionId,
            currentStep: this.data.currentStep,
            responses: this.data.responses,
            isCompleted: this.data.isCompleted,
            currentAnalysis: this.data.currentAnalysis,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem('iagen_progress', JSON.stringify(progressData));
            this.data.hasUnsavedChanges = false;
            this.updateSaveButton();
            if (notify) {
                this.showToast('Borrador guardado en almacenamiento local');
            }
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
            this.showToast('Almacenamiento local no disponible en este modo');
        }
    },

    showToast(message: string) {
        const indicator = document.getElementById('saveIndicator');
        const msgEl = document.getElementById('toastMessage');
        if (!indicator) return;
        if (msgEl) msgEl.textContent = message;

        indicator.classList.remove('opacity-0', 'translate-y-2');
        indicator.classList.add('opacity-100', 'translate-y-0');

        setTimeout(() => {
            indicator.classList.remove('opacity-100', 'translate-y-0');
            indicator.classList.add('opacity-0', 'translate-y-2');
        }, 2600);
    },

    loadProgress() {
        try {
            const localData = localStorage.getItem('iagen_progress');
            if (localData) {
                const savedData = JSON.parse(localData);
                this.data.sessionId = savedData.sessionId || this.data.sessionId;
                this.data.currentStep = savedData.currentStep || 0;
                this.data.responses = savedData.responses || {};
                this.data.isCompleted = savedData.isCompleted || false;
                this.data.currentAnalysis = savedData.currentAnalysis || null;
            }
        } catch (e) {
            console.warn('Error loading from localStorage:', e);
        }
    },

    generateAnalysis(targetView: 'report' | 'charts' = 'report') {
        const validation = this.validateAllSteps();
        if (!validation.valid) {
            this.data.currentStep = validation.firstIncompleteStep;
            this.data.validationErrors = validation.missingIds;
            this.data.activeView = 'form';
            document.getElementById('resultsContainer')?.classList.add('hidden');
            document.getElementById('questionnaireWrapper')?.classList.remove('hidden');
            this.render();
            this.updateTopNavHighlight();
            this.scrollToCriterion(validation.missingIds[0]);
            this.showToast(
                `Completa los criterios pendientes del módulo 0${validation.firstIncompleteStep + 1} antes de emitir el diagnóstico`
            );
            return;
        }

        const analysis = this.evaluateHeuristicAnalysis();
        this.data.isCompleted = true;
        this.data.currentAnalysis = analysis;
        this.showResults(analysis, targetView);
        this.saveProgress(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setReportFilter(filter: 'all' | 'dashboard' | 'perfil' | 'accion') {
        this.data.reportFilter = filter;
        if (this.data.currentAnalysis) {
            this.showResults(
                this.data.currentAnalysis,
                filter === 'dashboard' ? 'charts' : 'report'
            );
        }
    },

    showResults(analysis: any, viewMode: 'report' | 'charts' = 'report') {
        this.data.activeView = viewMode;
        if (viewMode === 'charts') {
            this.data.reportFilter = 'dashboard';
        } else if (this.data.reportFilter === 'dashboard') {
            this.data.reportFilter = 'all';
        }

        const r = this.data.responses;
        const rutinarias = Number(r.tareas_rutinarias);
        const creativas = Number(r.tareas_creativas);
        const mejora = Number(r.mejora_productividad);
        const filter = this.data.reportFilter;

        const { dimensions, globalIndex, realisticProductivityGain, empirical } = this.computeDimensionMetrics();
        const personalizedSuggestions = this.buildPersonalizedSuggestions();

        const showDashboard = filter === 'all' || filter === 'dashboard';
        const showPerfil = filter === 'all' || filter === 'perfil';
        const showAccion = filter === 'all' || filter === 'accion';

        const html = `
            <!-- Report Executive Header -->
            <div class="bg-white border border-[#D9D9D4] p-6 sm:p-8">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 mb-6 border-b border-[#E5E5E0]">
                    <div>
                        <div class="flex flex-wrap items-center gap-2 text-xs text-[#6F6F6F] mb-2">
                            <span class="font-mono-tabular font-semibold uppercase tracking-wider text-[#0F62FE]">Informe ejecutivo de impacto</span>
                            <span aria-hidden="true">·</span>
                            <span>Marcos OIT · CEPAL/ILIA · Harvard/BCG · Stanford</span>
                            <span aria-hidden="true">·</span>
                            <span class="font-mono-tabular">${new Date().toLocaleDateString('es-ES')}</span>
                        </div>
                        <h2 class="font-display text-2xl sm:text-3xl font-semibold text-[#161616] tracking-tight">
                            Panel multidimensional de impacto y diagnóstico estratégico
                        </h2>
                    </div>

                    <div class="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button type="button" onclick="app.switchView('form')" class="px-3.5 py-2 text-xs font-medium text-[#161616] bg-[#F4F4F0] hover:bg-[#E8E8E3] border border-[#D9D9D4] rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                            ← Editar cuestionario
                        </button>
                        <button type="button" onclick="app.downloadPDF()" class="px-4 py-2 text-xs font-semibold text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Exportar informe académico PDF</span>
                        </button>
                    </div>
                </div>

                <!-- 4-Column Quantitative KPI Strip -->
                <div class="grid grid-cols-2 sm:grid-cols-4 border border-[#D9D9D4] bg-[#FAFAFA] divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E0] mb-6">
                    <div class="p-4">
                        <div class="text-[11px] font-mono-tabular uppercase tracking-wider text-[#6F6F6F] mb-1">Índice heurístico global</div>
                        <div class="font-mono-tabular text-2xl font-bold text-[#161616]">${globalIndex}<span class="text-sm font-normal text-[#6F6F6F]">/100</span></div>
                        <div class="text-[11px] text-[#525252] mt-1">Arquetipo ILIA: <strong class="text-[#161616]">${empirical.iliaArchetype}</strong></div>
                    </div>
                    <div class="p-4">
                        <div class="text-[11px] font-mono-tabular uppercase tracking-wider text-[#6F6F6F] mb-1">Complementariedad (OIT)</div>
                        <div class="font-mono-tabular text-2xl font-bold text-[#161616]">${empirical.iloComplementarityScore}<span class="text-sm font-normal text-[#6F6F6F]">/100</span></div>
                        <div class="text-[11px] text-[#525252] mt-1">${rutinarias}% rutinario · ${creativas}% experto</div>
                    </div>
                    <div class="p-4">
                        <div class="text-[11px] font-mono-tabular uppercase tracking-wider text-[#6F6F6F] mb-1">Ahorro semanal neto</div>
                        <div class="font-mono-tabular text-2xl font-bold text-[#198038]">~${empirical.weeklyHoursSavedNet} h</div>
                        <div class="text-[11px] text-[#525252] mt-1">Tras ${empirical.verificationOverheadPct}% de auditoría humana</div>
                    </div>
                    <div class="p-4">
                        <div class="text-[11px] font-mono-tabular uppercase tracking-wider text-[#6F6F6F] mb-1">Mejora neta ajustada</div>
                        <div class="font-mono-tabular text-2xl font-bold text-[#0F62FE]">+${realisticProductivityGain}%</div>
                        <div class="text-[11px] text-[#525252] mt-1">Declarada: +${mejora}% · ${r.tiempo_implementacion}</div>
                    </div>
                </div>

                <!-- Interactive Segmented Filter Controls -->
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex flex-wrap items-center gap-1 p-1 bg-[#F4F6F9] border border-[#D0E2FF] rounded-xs" role="tablist" aria-label="Secciones del informe">
                        <button type="button" onclick="app.setReportFilter('all')" class="px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'all' ? 'bg-[#0F2C59] text-white' : 'text-[#525252] hover:text-[#0F2C59]'
                        }">
                            Informe integrado
                        </button>
                        <button type="button" onclick="app.setReportFilter('dashboard')" class="px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'dashboard' ? 'bg-[#0F2C59] text-white' : 'text-[#525252] hover:text-[#0F2C59]'
                        }">
                            Gráficas de radar
                        </button>
                        <button type="button" onclick="app.setReportFilter('perfil')" class="px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'perfil' ? 'bg-[#0F2C59] text-white' : 'text-[#525252] hover:text-[#0F2C59]'
                        }">
                            Perfil y productividad
                        </button>
                        <button type="button" onclick="app.setReportFilter('accion')" class="px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'accion' ? 'bg-[#0F2C59] text-white' : 'text-[#525252] hover:text-[#0F2C59]'
                        }">
                            Sugerencias y hoja de ruta
                        </button>
                    </div>

                    <button type="button" onclick="app.generateAnalysis('report')" class="text-xs font-medium text-[#0F62FE] hover:text-[#0043CE] underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer">
                        Recalcular matriz heurística
                    </button>
                </div>
            </div>

            ${
                showDashboard
                    ? `
            <!-- Visual Impact Dashboard (Radar Comparison + Dimension Matrix) -->
            <div class="bg-white border border-[#D9D9D4] p-6 sm:p-8 space-y-8">
                <div class="pb-5 border-b border-[#E5E5E0] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div class="text-xs font-mono-tabular uppercase tracking-wider text-[#0F62FE] font-semibold mb-1">Cartografía analítica multidimensional</div>
                        <h3 class="font-display text-xl font-semibold text-[#161616]">
                            Comparativa de dimensiones evaluadas mediante gráficas de radar
                        </h3>
                        <p class="mt-1 text-xs text-[#525252]">
                            Contraste determinista entre el nivel actual diagnosticado y el potencial alcanzable tras ejecutar la hoja de ruta personalizada.
                        </p>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-[#525252] shrink-0">
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-xs bg-[#0F62FE] inline-block"></span> Diagnóstico actual</span>
                        <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-xs bg-[#198038] inline-block"></span> Potencial objetivo</span>
                    </div>
                </div>

                <!-- Dual Radar Charts Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="p-5 bg-[#FAFAFA] border border-[#E5E5E0] flex flex-col">
                        <div class="mb-3">
                            <h4 class="font-display text-sm font-semibold text-[#161616]">
                                Radar 01 · Comparativa de las 5 dimensiones del diagnóstico
                            </h4>
                            <p class="text-[11px] text-[#6F6F6F] mt-0.5">
                                Evalúa madurez (ILIA), exposición (OIT), viabilidad, impacto neto y gobernanza crítica (escala 0-100).
                            </p>
                        </div>
                        <div class="relative h-72 flex-1">
                            <canvas id="dimensionsRadarChart"></canvas>
                        </div>
                    </div>

                    <div class="p-5 bg-[#FAFAFA] border border-[#E5E5E0] flex flex-col">
                        <div class="mb-3">
                            <h4 class="font-display text-sm font-semibold text-[#161616]">
                                Radar 02 · Capacidades operativas frente a meta proyectada
                            </h4>
                            <p class="text-[11px] text-[#6F6F6F] mt-0.5">
                                Desglose funcional en redacción, sistemas RAG, análisis de datos y agentes, gobernanza e ingeniería de contexto.
                            </p>
                        </div>
                        <div class="relative h-72 flex-1">
                            <canvas id="capabilitiesRadarChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Comparative Dimension Table -->
                <div>
                    <h4 class="font-display text-sm font-semibold text-[#161616] mb-3">
                        Matriz cuantitativa de dimensiones evaluadas y brechas de adopción
                    </h4>
                    <div class="overflow-x-auto border border-[#D9D9D4]">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-[#F4F4F0] border-b border-[#D9D9D4] text-[#525252] font-semibold">
                                    <th class="py-3 px-4">Dimensión evaluada</th>
                                    <th class="py-3 px-3 text-right">Nivel actual</th>
                                    <th class="py-3 px-3 text-right">Meta objetivo</th>
                                    <th class="py-3 px-3 text-right">Brecha</th>
                                    <th class="py-3 px-3">Estado</th>
                                    <th class="py-3 px-4">Enfoque prioritario</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#E5E5E0] text-[#161616]">
                                ${dimensions
                                    .map(
                                        (d) => `
                                    <tr class="hover:bg-[#FAFAFA] transition-colors">
                                        <td class="py-3.5 px-4 font-semibold text-[#161616] whitespace-nowrap">${d.name}</td>
                                        <td class="py-3.5 px-3 text-right font-mono-tabular font-semibold text-[#0F62FE]">${d.currentScore}%</td>
                                        <td class="py-3.5 px-3 text-right font-mono-tabular font-medium text-[#198038]">${d.targetScore}%</td>
                                        <td class="py-3.5 px-3 text-right font-mono-tabular text-[#6F6F6F]">+${d.gap}%</td>
                                        <td class="py-3.5 px-3 whitespace-nowrap text-[#525252]">${d.levelLabel}</td>
                                        <td class="py-3.5 px-4 text-[#525252] min-w-[240px] leading-relaxed">${d.personalizedSuggestion}</td>
                                    </tr>
                                `
                                    )
                                    .join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Empirical Benchmarks Contrast Grid (OIT, CEPAL/ILIA, Harvard/BCG, Stanford AI Index) -->
                <div>
                    <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                        <h4 class="font-display text-sm font-semibold text-[#161616]">
                            Contraste con evidencia empírica internacional (OIT, CEPAL/ILIA, Harvard/BCG y Stanford 2025-2026)
                        </h4>
                        <span class="text-[11px] font-mono-tabular text-[#6F6F6F]">Parámetros calculados según sector «${r.sector}»</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 bg-[#FAFAFA] border border-[#E5E5E0]">
                            <div class="flex items-center justify-between gap-2 mb-1.5">
                                <span class="text-xs font-semibold text-[#161616]">Exposición ocupacional (OIT / CEPAL)</span>
                                <span class="font-mono-tabular text-xs font-bold text-[#0F62FE]">${empirical.iloComplementarityScore}/100</span>
                            </div>
                            <p class="text-xs text-[#525252] leading-relaxed">
                                Régimen identificado: <strong class="text-[#161616]">${empirical.iloClassification}</strong>. Prioriza la transformación de tareas sobre la sustitución laboral.
                            </p>
                        </div>

                        <div class="p-4 bg-[#FAFAFA] border border-[#E5E5E0]">
                            <div class="flex items-center justify-between gap-2 mb-1.5">
                                <span class="text-xs font-semibold text-[#161616]">Frontera tecnológica irregular (Harvard / BCG)</span>
                                <span class="font-mono-tabular text-xs font-bold ${
                                    empirical.jaggedFrontierRisk >= 62 ? 'text-[#B28600]' : 'text-[#198038]'
                                }">Riesgo ${empirical.jaggedFrontierRisk}/100</span>
                            </div>
                            <p class="text-xs text-[#525252] leading-relaxed">
                                Nivel: <strong class="text-[#161616]">${empirical.jaggedFrontierLabel}</strong>. Exige reservar un ${empirical.verificationOverheadPct}% del ahorro para auditoría humana.
                            </p>
                        </div>

                        <div class="p-4 bg-[#FAFAFA] border border-[#E5E5E0]">
                            <div class="flex items-center justify-between gap-2 mb-1.5">
                                <span class="text-xs font-semibold text-[#161616]">Rango empírico sectorial (Stanford / McKinsey)</span>
                                <span class="font-mono-tabular text-xs font-bold text-[#198038]">~${empirical.weeklyHoursSavedNet} h/sem netas</span>
                            </div>
                            <p class="text-xs text-[#525252] leading-relaxed">
                                Evidencia comparada en ${r.sector.toLowerCase()}: <strong class="text-[#161616]">${empirical.sectorEmpiricalRange}</strong>.
                            </p>
                        </div>

                        <div class="p-4 bg-[#FAFAFA] border border-[#E5E5E0]">
                            <div class="flex items-center justify-between gap-2 mb-1.5">
                                <span class="text-xs font-semibold text-[#161616]">Madurez ILIA y compresión de brechas</span>
                                <span class="font-mono-tabular text-xs font-bold text-[#0F62FE]">${empirical.iliaArchetype}</span>
                            </div>
                            <p class="text-xs text-[#525252] leading-relaxed">
                                ${empirical.skillCompressionEffect}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Complementary Charts Row: Task Distribution & Barriers -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div class="p-5 bg-[#FAFAFA] border border-[#E5E5E0]">
                        <h4 class="font-display text-sm font-semibold text-[#161616] mb-3">
                            Composición de la jornada laboral (rutinaria vs. analítica)
                        </h4>
                        <div class="relative h-56">
                            <canvas id="taskChart"></canvas>
                        </div>
                    </div>

                    <div class="p-5 bg-[#FAFAFA] border border-[#E5E5E0]">
                        <h4 class="font-display text-sm font-semibold text-[#161616] mb-3">
                            Distribución de barreras percibidas para la implementación
                        </h4>
                        <div class="relative h-56">
                            <canvas id="barriersChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            `
                    : ''
            }

            ${
                showPerfil
                    ? `
            <!-- Section: Perfil Profesional & Productividad -->
            <div class="bg-white border border-[#D9D9D4] p-6 sm:p-8 divide-y divide-[#E5E5E0]">
                <section class="pb-8">
                    <div class="text-xs font-mono-tabular uppercase tracking-wider text-[#0F62FE] font-semibold mb-1">Análisis diagnóstico · Módulo I</div>
                    <h3 class="font-display text-xl font-semibold text-[#161616] mb-3">
                        01. Perfil profesional y madurez tecnológica
                    </h3>
                    <p class="text-sm text-[#161616] leading-relaxed mb-6">
                        ${analysis.perfilProfesional.resumen}
                    </p>

                    <div class="mb-6">
                        <h4 class="font-display text-xs uppercase tracking-wider font-semibold text-[#6F6F6F] mb-3">Hallazgos registrados en el diagnóstico</h4>
                        <div class="divide-y divide-[#E5E5E0] border-t border-b border-[#E5E5E0]">
                            ${(analysis.perfilProfesional.caracteristicas || [])
                                .map(
                                    (item: string, idx: number) => `
                                <div class="py-3 flex items-baseline gap-3 text-sm text-[#161616]">
                                    <span class="font-mono-tabular text-xs font-semibold text-[#0F62FE] shrink-0">0${idx + 1}.</span>
                                    <span class="leading-relaxed">${item}</span>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>

                    <div class="p-4 bg-[#FAFAFA] border border-[#E5E5E0]">
                        <div class="text-xs font-semibold text-[#161616] mb-1">Diagnóstico de madurez tecnológica y gobernanza</div>
                        <p class="text-xs text-[#525252] leading-relaxed">${analysis.perfilProfesional.madurezTecnologica}</p>
                    </div>
                </section>

                <section class="pt-8">
                    <div class="text-xs font-mono-tabular uppercase tracking-wider text-[#0F62FE] font-semibold mb-1">Análisis diagnóstico · Módulo II</div>
                    <h3 class="font-display text-xl font-semibold text-[#161616] mb-3">
                        02. Análisis realista de productividad y contraste de expectativas
                    </h3>
                    <p class="text-sm text-[#161616] leading-relaxed mb-6">
                        ${analysis.analisisProductividad.potencialMejora}
                    </p>

                    <div class="mb-6">
                        <h4 class="font-display text-xs uppercase tracking-wider font-semibold text-[#6F6F6F] mb-3">Factores determinantes de eficiencia</h4>
                        <div class="divide-y divide-[#E5E5E0] border-t border-b border-[#E5E5E0]">
                            ${(analysis.analisisProductividad.factoresClave || [])
                                .map(
                                    (item: string, idx: number) => `
                                <div class="py-3 flex items-baseline gap-3 text-sm text-[#161616]">
                                    <span class="font-mono-tabular text-xs font-semibold text-[#0F62FE] shrink-0">0${idx + 1}.</span>
                                    <span class="leading-relaxed">${item}</span>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>

                    <div class="p-4 bg-[#FFF8E1] border border-[#F1C21B]">
                        <div class="text-xs font-semibold text-[#161616] mb-1">Evaluación heurística de expectativas y sobrecarga de verificación</div>
                        <p class="text-xs text-[#393939] leading-relaxed">${analysis.analisisProductividad.sobrestimaciones}</p>
                    </div>
                </section>
            </div>
            `
                    : ''
            }

            ${
                showAccion
                    ? `
            <!-- Section: Sugerencias Personalizadas & Hoja de Ruta -->
            <div class="bg-white border border-[#D9D9D4] p-6 sm:p-8 divide-y divide-[#E5E5E0]">
                <section class="pb-8">
                    <div class="text-xs font-mono-tabular uppercase tracking-wider text-[#0F62FE] font-semibold mb-1">Análisis diagnóstico · Módulo III</div>
                    <h3 class="font-display text-xl font-semibold text-[#161616] mb-2">
                        03. Matriz de sugerencias personalizadas según el diagnóstico
                    </h3>
                    <p class="text-xs text-[#525252] mb-5">
                        Recomendaciones parametrizadas determinísticamente a partir de su sector profesional, proporción de carga rutinaria/creativa y barreras declaradas.
                    </p>

                    <div class="overflow-x-auto border border-[#D9D9D4] mb-8">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-[#F4F4F0] border-b border-[#D9D9D4] text-[#525252] font-semibold">
                                    <th class="py-3 px-4">Dimensión / Horizonte</th>
                                    <th class="py-3 px-4">Sugerencia personalizada</th>
                                    <th class="py-3 px-4">Fundamento metodológico</th>
                                    <th class="py-3 px-3 text-right">Prioridad</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#E5E5E0] text-[#161616]">
                                ${personalizedSuggestions
                                    .map(
                                        (s) => `
                                    <tr class="hover:bg-[#FAFAFA] transition-colors align-top">
                                        <td class="py-3.5 px-4 whitespace-nowrap">
                                            <div class="font-semibold text-[#161616]">${s.dimension}</div>
                                            <div class="font-mono-tabular text-[11px] text-[#6F6F6F] mt-0.5">${s.horizon}</div>
                                        </td>
                                        <td class="py-3.5 px-4 font-medium text-[#161616] min-w-[220px] leading-relaxed">${s.action}</td>
                                        <td class="py-3.5 px-4 text-[#525252] min-w-[240px] leading-relaxed">${s.rationale}</td>
                                        <td class="py-3.5 px-3 text-right font-mono-tabular font-semibold ${
                                            s.priority === 'Alta'
                                                ? 'text-[#0F62FE]'
                                                : s.priority === 'Estratégica'
                                                ? 'text-[#198038]'
                                                : 'text-[#525252]'
                                        }">${s.priority}</td>
                                    </tr>
                                `
                                    )
                                    .join('')}
                            </tbody>
                        </table>
                    </div>

                    <h4 class="font-display text-sm font-semibold text-[#161616] mb-3">
                        Síntesis de acciones por fase de implementación
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="p-5 bg-[#FAFAFA] border border-[#E5E5E0]">
                            <div class="font-mono-tabular text-xs text-[#0F62FE] font-semibold mb-1">Fase 01 · Corto plazo</div>
                            <h5 class="font-display text-base font-semibold text-[#161616] mb-3">Acciones inmediatas</h5>
                            <ul class="space-y-2.5 text-xs text-[#525252] leading-relaxed">
                                ${(analysis.recomendaciones.inmediatas || [])
                                    .map((item: string) => `<li>· ${item}</li>`)
                                    .join('')}
                            </ul>
                        </div>

                        <div class="p-5 bg-[#FAFAFA] border border-[#E5E5E0]">
                            <div class="font-mono-tabular text-xs text-[#0F62FE] font-semibold mb-1">Fase 02 · Mediano plazo</div>
                            <h5 class="font-display text-base font-semibold text-[#161616] mb-3">Consolidación</h5>
                            <ul class="space-y-2.5 text-xs text-[#525252] leading-relaxed">
                                ${(analysis.recomendaciones.medianoPlazo || [])
                                    .map((item: string) => `<li>· ${item}</li>`)
                                    .join('')}
                            </ul>
                        </div>

                        <div class="p-5 bg-[#FAFAFA] border border-[#E5E5E0]">
                            <div class="font-mono-tabular text-xs text-[#0F62FE] font-semibold mb-1">Fase 03 · Capacidades</div>
                            <h5 class="font-display text-base font-semibold text-[#161616] mb-3">Habilidades clave</h5>
                            <ul class="space-y-2.5 text-xs text-[#525252] leading-relaxed">
                                ${(analysis.recomendaciones.habilidades || [])
                                    .map((item: string) => `<li>· ${item}</li>`)
                                    .join('')}
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="pt-8">
                    <div class="text-xs font-mono-tabular uppercase tracking-wider text-[#0F62FE] font-semibold mb-1">Análisis diagnóstico · Módulo IV</div>
                    <h3 class="font-display text-xl font-semibold text-[#161616] mb-4">
                        04. Síntesis ejecutiva y perspectivas estratégicas
                    </h3>

                    <div class="space-y-5 text-sm text-[#161616] leading-relaxed">
                        <div>
                            <div class="text-xs font-semibold uppercase tracking-wider text-[#6F6F6F] mb-2">Síntesis general</div>
                            <p>${analysis.conclusiones.sintesis}</p>
                        </div>
                        <div class="p-4 bg-[#EDF5FF] border border-[#0F62FE]/40">
                            <div class="text-xs font-semibold text-[#0043CE] mb-1">Recomendación estratégica prioritaria</div>
                            <p class="text-xs text-[#161616] leading-relaxed">${analysis.conclusiones.recomendacionPrincipal}</p>
                        </div>
                        <div>
                            <div class="text-xs font-semibold uppercase tracking-wider text-[#6F6F6F] mb-1.5">Perspectivas futuras (2025-2026)</div>
                            <p class="text-[#525252]">${analysis.conclusiones.perspectivas}</p>
                        </div>
                    </div>
                </section>
            </div>
            `
                    : ''
            }
        `;

        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.innerHTML = html;
            resultsContainer.classList.remove('hidden');
        }

        document.getElementById('questionnaireWrapper')?.classList.add('hidden');
        this.renderHorizontalStepper();
        this.renderStepRail();
        this.renderLiveTelemetry();
        this.updateTopNavHighlight();

        if (showDashboard) {
            setTimeout(() => this.renderCharts(), 40);
        }
    },

    renderCharts() {
        if (!window.Chart) return;

        ['dimensionsRadarChart', 'capabilitiesRadarChart', 'taskChart', 'barriersChart'].forEach((id) => {
            if (chartInstances[id]) {
                chartInstances[id].destroy();
                delete chartInstances[id];
            }
        });

        const { dimensions, operationalRadar } = this.computeDimensionMetrics();
        const rutinarias = Number(this.data.responses.tareas_rutinarias);
        const creativas = Number(this.data.responses.tareas_creativas);

        // 1. Primary Multidimensional Radar Chart (5 Dimensions Comparison)
        const dimRadarCanvas = document.getElementById('dimensionsRadarChart') as HTMLCanvasElement | null;
        if (dimRadarCanvas) {
            const ctx = dimRadarCanvas.getContext('2d');
            if (ctx) {
                chartInstances['dimensionsRadarChart'] = new window.Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: dimensions.map((d) => d.shortLabel),
                        datasets: [
                            {
                                label: 'Diagnóstico actual',
                                data: dimensions.map((d) => d.currentScore),
                                backgroundColor: 'rgba(15, 98, 254, 0.20)',
                                borderColor: '#0F62FE',
                                pointBackgroundColor: '#0F62FE',
                                pointBorderColor: '#FFFFFF',
                                borderWidth: 2.2
                            },
                            {
                                label: 'Potencial objetivo',
                                data: dimensions.map((d) => d.targetScore),
                                backgroundColor: 'rgba(25, 128, 56, 0.08)',
                                borderColor: '#198038',
                                borderDash: [5, 4],
                                pointBackgroundColor: '#198038',
                                pointBorderColor: '#FFFFFF',
                                borderWidth: 1.8
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                suggestedMin: 0,
                                suggestedMax: 100,
                                ticks: {
                                    stepSize: 25,
                                    backdropColor: 'transparent',
                                    color: '#6F6F6F',
                                    font: { family: "'IBM Plex Mono', monospace", size: 10 }
                                },
                                pointLabels: {
                                    font: { family: "'IBM Plex Sans', sans-serif", size: 11, weight: '600' },
                                    color: '#161616'
                                },
                                grid: { color: 'rgba(141, 141, 141, 0.25)' },
                                angleLines: { color: 'rgba(141, 141, 141, 0.25)' }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12, color: '#525252', font: { family: "'IBM Plex Sans', sans-serif", size: 11 } }
                            }
                        }
                    }
                });
            }
        }

        // 2. Operational Capabilities Radar Chart
        const capRadarCanvas = document.getElementById('capabilitiesRadarChart') as HTMLCanvasElement | null;
        if (capRadarCanvas) {
            const ctx = capRadarCanvas.getContext('2d');
            if (ctx) {
                chartInstances['capabilitiesRadarChart'] = new window.Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: operationalRadar.labels,
                        datasets: [
                            {
                                label: 'Perfil operativo actual',
                                data: operationalRadar.current,
                                backgroundColor: 'rgba(22, 22, 22, 0.16)',
                                borderColor: '#161616',
                                pointBackgroundColor: '#161616',
                                pointBorderColor: '#FFFFFF',
                                borderWidth: 2
                            },
                            {
                                label: 'Meta proyectada',
                                data: operationalRadar.benchmark,
                                backgroundColor: 'rgba(15, 98, 254, 0.08)',
                                borderColor: '#0F62FE',
                                borderDash: [4, 4],
                                pointBackgroundColor: '#0F62FE',
                                pointBorderColor: '#FFFFFF',
                                borderWidth: 1.8
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                suggestedMin: 0,
                                suggestedMax: 100,
                                ticks: {
                                    stepSize: 25,
                                    backdropColor: 'transparent',
                                    color: '#6F6F6F',
                                    font: { family: "'IBM Plex Mono', monospace", size: 10 }
                                },
                                pointLabels: {
                                    font: { family: "'IBM Plex Sans', sans-serif", size: 10.5, weight: '500' },
                                    color: '#393939'
                                },
                                grid: { color: 'rgba(141, 141, 141, 0.25)' },
                                angleLines: { color: 'rgba(141, 141, 141, 0.25)' }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12, color: '#525252', font: { family: "'IBM Plex Sans', sans-serif", size: 11 } }
                            }
                        }
                    }
                });
            }
        }

        // 3. Task Distribution Bar Chart
        const taskCanvas = document.getElementById('taskChart') as HTMLCanvasElement | null;
        if (taskCanvas) {
            const taskCtx = taskCanvas.getContext('2d');
            if (taskCtx) {
                chartInstances['taskChart'] = new window.Chart(taskCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Tareas rutinarias', 'Tareas creativas y críticas'],
                        datasets: [
                            {
                                label: '% del tiempo',
                                data: [rutinarias, creativas],
                                backgroundColor: ['rgba(82, 82, 82, 0.82)', 'rgba(15, 98, 254, 0.88)'],
                                borderColor: ['#393939', '#0F62FE'],
                                borderWidth: 1.5,
                                borderRadius: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { color: '#6F6F6F', font: { family: "'IBM Plex Mono', monospace" }, callback: (v: any) => v + '%' },
                                grid: { color: 'rgba(141, 141, 141, 0.18)' }
                            },
                            x: {
                                ticks: { color: '#161616', font: { family: "'IBM Plex Sans', sans-serif" } },
                                grid: { display: false }
                            }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }

        // 4. Barriers Doughnut Chart
        const barriersCanvas = document.getElementById('barriersChart') as HTMLCanvasElement | null;
        const barriersData: string[] = Array.isArray(this.data.responses.barreras_implementacion)
            ? this.data.responses.barreras_implementacion
            : [];

        if (barriersCanvas && barriersData.length > 0) {
            const barriersCtx = barriersCanvas.getContext('2d');
            if (barriersCtx) {
                chartInstances['barriersChart'] = new window.Chart(barriersCtx, {
                    type: 'doughnut',
                    data: {
                        labels: barriersData,
                        datasets: [
                            {
                                label: 'Barreras',
                                data: barriersData.map(() => 1),
                                backgroundColor: [
                                    '#0F62FE',
                                    '#161616',
                                    '#198038',
                                    '#B28600',
                                    '#525252',
                                    '#0043CE',
                                    '#8D8D8D'
                                ],
                                borderWidth: 2,
                                borderColor: '#FAFAFA'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12, color: '#525252', font: { family: "'IBM Plex Sans', sans-serif", size: 11 } }
                            }
                        }
                    }
                });
            }
        }
    },

    downloadPDF() {
        const validation = this.validateAllSteps();
        if (!validation.valid) {
            this.switchView('report');
            return;
        }

        const jsPDFLib = window.jspdf;

        if (!jsPDFLib || !jsPDFLib.jsPDF || !jsPDFLib.autoTable) {
            this.showToast('La biblioteca de exportación PDF se está cargando. Intenta nuevamente.');
            window.logMessage('error', 'jsPDF o jspdf-autotable no encontrados');
            return;
        }

        if (!this.data.currentAnalysis) {
            this.data.currentAnalysis = this.evaluateHeuristicAnalysis();
        }

        try {
            const { jsPDF } = jsPDFLib;
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - margin * 2;
            let currentY = margin;

            const analysis = this.data.currentAnalysis;
            const r = this.data.responses;
            const { dimensions, globalIndex, realisticProductivityGain, empirical } = this.computeDimensionMetrics();
            const personalizedSuggestions = this.buildPersonalizedSuggestions();
            const dateStr = new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const addPageIfNeeded = (spaceNeeded: number) => {
                if (currentY + spaceNeeded > pageHeight - 22) {
                    doc.addPage();
                    currentY = 24;
                }
            };

            const addSectionHeader = (num: string, title: string) => {
                addPageIfNeeded(22);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#0284C7');
                doc.text(`SECCIÓN ${num}`, margin, currentY);
                currentY += 5;

                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#0F172A');
                doc.text(title, margin, currentY);
                currentY += 3.5;

                doc.setDrawColor('#CBD5E1');
                doc.setLineWidth(0.4);
                doc.line(margin, currentY, margin + contentWidth, currentY);
                currentY += 7;
            };

            const addBodyParagraph = (text: string, spaceAfter = 5) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#334155');
                const lines = doc.splitTextToSize(text || '', contentWidth);
                addPageIfNeeded(lines.length * 5.2 + spaceAfter);
                doc.text(lines, margin, currentY);
                currentY += lines.length * 4.8 + spaceAfter;
            };

            // =========================================================================
            // PÁGINA 1: PORTADA ACADÉMICA PROFESIONAL
            // =========================================================================
            doc.setFillColor('#0F172A');
            doc.rect(0, 0, pageWidth, 12, 'F');
            doc.setFillColor('#0284C7');
            doc.rect(0, 12, pageWidth, 2, 'F');

            currentY = 30;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0284C7');
            doc.text('DOCUMENTO TÉCNICO DE DIAGNÓSTICO Y EVALUACIÓN DE IMPACTO', margin, currentY);

            currentY += 10;
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            const coverTitleLines = doc.splitTextToSize(
                'Evaluación de impacto: inteligencia artificial generativa en el día a día',
                contentWidth
            );
            doc.text(coverTitleLines, margin, currentY);
            currentY += coverTitleLines.length * 9 + 2;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor('#475569');
            const coverSubLines = doc.splitTextToSize(
                'Informe académico personalizado sobre madurez tecnológica (ILIA), exposición ocupacional (OIT/CEPAL), frontera tecnológica irregular (Harvard/BCG) y hoja de ruta responsable.',
                contentWidth
            );
            doc.text(coverSubLines, margin, currentY);
            currentY += coverSubLines.length * 5.5 + 6;

            doc.setDrawColor('#E2E8F0');
            doc.setLineWidth(0.5);
            doc.line(margin, currentY, margin + contentWidth, currentY);
            currentY += 8;

            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Ficha técnica de la evaluación', margin, currentY);
            currentY += 4;

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Parámetro de identificación', 'Detalle registrado']],
                body: [
                    ['Identificador de sesión', this.data.sessionId],
                    ['Fecha de emisión del informe', dateStr],
                    ['Sector profesional o académico', String(r.sector)],
                    ['Nivel de experiencia previa con IA', String(r.experiencia_ia)],
                    ['Arquetipo de madurez (marco ILIA - CEPAL/CENIA)', empirical.iliaArchetype],
                    ['Régimen de exposición ocupacional (OIT/CEPAL)', `${empirical.iloClassification} (${empirical.iloComplementarityScore}/100)`],
                    ['Riesgo de frontera irregular (Harvard/BCG)', `${empirical.jaggedFrontierRisk}/100 · ${empirical.jaggedFrontierLabel}`],
                    ['Índice heurístico global de impacto', `${globalIndex} / 100 puntos`],
                    [
                        'Mejora neta y ahorro semanal estimado',
                        `+${realisticProductivityGain}% ajustada (~${empirical.weeklyHoursSavedNet} h/sem netas tras ${empirical.verificationOverheadPct}% de auditoría)`
                    ]
                ],
                theme: 'grid',
                styles: { fontSize: 8.8, cellPadding: 2.5, textColor: '#1E293B' },
                headStyles: { fillColor: '#0F172A', textColor: '#FFFFFF', fontStyle: 'bold' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 74, fillColor: '#F8FAFC' },
                    1: { cellWidth: contentWidth - 74 }
                },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 8;
                }
            });

            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Síntesis cuantitativa de las dimensiones evaluadas', margin, currentY);
            currentY += 4;

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Código', 'Dimensión analítica', 'Puntaje actual', 'Meta objetivo', 'Brecha', 'Nivel']],
                body: dimensions.map((d) => [
                    d.code,
                    d.name.replace(/^\d+\.\s*/, ''),
                    `${d.currentScore}%`,
                    `${d.targetScore}%`,
                    `+${d.gap}%`,
                    d.levelLabel
                ]),
                theme: 'striped',
                styles: { fontSize: 9, cellPadding: 2.6, textColor: '#334155' },
                headStyles: { fillColor: '#0284C7', textColor: '#FFFFFF', fontStyle: 'bold' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 16 },
                    2: { halign: 'right', fontStyle: 'bold' },
                    3: { halign: 'right' },
                    4: { halign: 'right' }
                },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 8;
                }
            });

            doc.setFillColor('#F8FAFC');
            doc.setDrawColor('#CBD5E1');
            const summaryLines = doc.splitTextToSize(
                `Resumen ejecutivo: ${analysis.conclusiones.sintesis}`,
                contentWidth - 10
            );
            const boxHeight = summaryLines.length * 4.6 + 9;
            if (currentY + boxHeight < pageHeight - 36) {
                doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#334155');
                doc.text(summaryLines, margin + 5, currentY + 6);
                currentY += boxHeight + 6;
            }

            doc.setDrawColor('#E2E8F0');
            doc.line(margin, pageHeight - 30, margin + contentWidth, pageHeight - 30);
            doc.setFontSize(8.2);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text(
                'Autoría: Francisco Sereño Ahumada — Líder del Área de Tecnologías Educativas e IA, VTI, Universidad de Chile',
                margin,
                pageHeight - 24
            );
            doc.setFont('helvetica', 'normal');
            doc.setTextColor('#475569');
            doc.text(
                'Doctorando (PhDc) en Educación y Sociedad y máster (Universidad de Barcelona) · Magíster en Pedagogía Universitaria y profesor (UMCE)',
                margin,
                pageHeight - 19
            );
            doc.setTextColor('#64748B');
            doc.text(
                'Portafolio: https://franciscosereno.cl · LinkedIn: linkedin.com/in/franciscosereno · Licencia: CC BY-NC-SA 4.0 Internacional',
                margin,
                pageHeight - 14
            );

            // =========================================================================
            // PÁGINA 2: TABLAS DE RESULTADOS DECLARADOS Y GRÁFICA DE RADAR
            // =========================================================================
            doc.addPage();
            currentY = 24;

            addSectionHeader('01', 'Resultados registrados en el cuestionario de diagnóstico');
            addBodyParagraph(
                'A continuación se sistematizan las respuestas cuantitativas y cualitativas proporcionadas por la persona evaluada a lo largo de las cuatro dimensiones del instrumento.'
            );

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Dimensión', 'Indicador / Pregunta evaluada', 'Respuesta registrada']],
                body: [
                    ['01. Perfil', 'Sector de desempeño', String(r.sector)],
                    ['01. Perfil', 'Rol y responsabilidades habituales', String(r.rol)],
                    ['01. Perfil', 'Experiencia previa con IA', String(r.experiencia_ia)],
                    [
                        '02. Tareas',
                        'Proporción de tareas rutinarias / creativas',
                        `${r.tareas_rutinarias}% rutinarias  ·  ${r.tareas_creativas}% creativas y críticas`
                    ],
                    ['02. Tareas', 'Dedicación semanal a redacción', String(r.tiempo_redaccion)],
                    ['02. Tareas', 'Principales cuellos de botella', String(r.principales_desafios)],
                    [
                        '03. Adopción',
                        'Herramientas de IAGen relevantes',
                        (r.herramientas_interes as string[]).join(', ')
                    ],
                    [
                        '03. Adopción',
                        'Barreras percibidas',
                        (r.barreras_implementacion as string[]).join(', ')
                    ],
                    ['03. Adopción', 'Horizonte estimado de adopción', String(r.tiempo_implementacion)],
                    ['04. Impacto', 'Mejora de productividad estimada', `+${r.mejora_productividad}%`],
                    ['04. Impacto', 'Áreas de mayor impacto positivo', String(r.areas_mayor_impacto)],
                    ['04. Impacto', 'Riesgos y preocupaciones éticas', String(r.riesgos_preocupaciones)],
                    ['04. Impacto', 'Nuevas competencias requeridas', String(r.cambios_habilidades)]
                ],
                theme: 'grid',
                styles: { fontSize: 8.8, cellPadding: 2.8, textColor: '#334155', valign: 'top' },
                headStyles: { fillColor: '#0F172A', textColor: '#FFFFFF', fontStyle: 'bold' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 26, fillColor: '#F8FAFC' },
                    1: { fontStyle: 'bold', cellWidth: 54 },
                    2: { cellWidth: contentWidth - 80 }
                },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 10;
                }
            });

            const radarCanvas = document.getElementById('dimensionsRadarChart') as HTMLCanvasElement | null;
            if (radarCanvas) {
                try {
                    const radarImg = radarCanvas.toDataURL('image/png', 1.0);
                    addPageIfNeeded(82);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor('#0F172A');
                    doc.text('Representación en radar de las dimensiones evaluadas', margin, currentY);
                    currentY += 4;
                    doc.addImage(radarImg, 'PNG', margin + 35, currentY, 100, 68);
                    currentY += 74;
                } catch {
                    // Continuar sin imagen si el canvas no pudo serializarse
                }
            }

            // =========================================================================
            // SECCIÓN 02: EVALUACIÓN DE PERFIL PROFESIONAL, PRODUCTIVIDAD Y EVIDENCIA EMPÍRICA
            // =========================================================================
            addSectionHeader('02', 'Análisis crítico de perfil, productividad y evidencia empírica');
            addBodyParagraph(analysis.perfilProfesional.resumen, 4);
            addBodyParagraph(`Diagnóstico de madurez tecnológica: ${analysis.perfilProfesional.madurezTecnologica}`, 6);
            addBodyParagraph(analysis.analisisProductividad.potencialMejora, 6);

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Marco internacional de referencia', 'Indicador calculado', 'Interpretación aplicada al perfil']],
                body: [
                    [
                        'OIT / CEPAL (Exposición ocupacional)',
                        `${empirical.iloComplementarityScore}/100 puntos`,
                        empirical.iloClassification
                    ],
                    [
                        'Harvard / BCG (Jagged Frontier)',
                        `Riesgo ${empirical.jaggedFrontierRisk}/100`,
                        `${empirical.jaggedFrontierLabel} · Reserva de verificación: ${empirical.verificationOverheadPct}%`
                    ],
                    [
                        'CEPAL / CENIA (Marco ILIA)',
                        empirical.iliaArchetype,
                        empirical.skillCompressionEffect
                    ],
                    [
                        'Stanford AI Index / McKinsey',
                        `~${empirical.weeklyHoursSavedNet} h/sem netas`,
                        `Rango empírico sectorial: ${empirical.sectorEmpiricalRange}`
                    ]
                ],
                theme: 'grid',
                styles: { fontSize: 8.8, cellPadding: 2.8, textColor: '#334155', valign: 'top' },
                headStyles: { fillColor: '#0F172A', textColor: '#FFFFFF', fontStyle: 'bold' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 50, fillColor: '#F8FAFC' },
                    1: { fontStyle: 'bold', cellWidth: 34 },
                    2: { cellWidth: contentWidth - 84 }
                },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 8;
                }
            });

            const maxRows = Math.max(
                (analysis.perfilProfesional.caracteristicas || []).length,
                (analysis.analisisProductividad.factoresClave || []).length
            );
            const comparativeRows: string[][] = [];
            for (let i = 0; i < maxRows; i++) {
                comparativeRows.push([
                    `0${i + 1}`,
                    analysis.perfilProfesional.caracteristicas[i] || '',
                    analysis.analisisProductividad.factoresClave[i] || ''
                ]);
            }

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['#', 'Características observadas en el perfil', 'Factores determinantes de productividad']],
                body: comparativeRows,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3, textColor: '#334155' },
                headStyles: { fillColor: '#0284C7', textColor: '#FFFFFF', fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
                    1: { cellWidth: (contentWidth - 10) / 2 },
                    2: { cellWidth: (contentWidth - 10) / 2 }
                },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 8;
                }
            });

            addPageIfNeeded(22);
            doc.setFontSize(9.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#B45309');
            doc.text('Evaluación heurística de expectativas y ajuste de productividad:', margin, currentY);
            currentY += 5;
            addBodyParagraph(analysis.analisisProductividad.sobrestimaciones, 8);

            // =========================================================================
            // SECCIÓN 03: SUGERENCIAS PERSONALIZADAS Y PLAN DE ACCIÓN
            // =========================================================================
            addSectionHeader('03', 'Sugerencias personalizadas basadas en el diagnóstico');
            addBodyParagraph(
                'La siguiente matriz articula sugerencias personalizadas construidas determinísticamente a partir de las puntuaciones de cada dimensión, el volumen de tareas rutinarias frente a creativas y las barreras institucionales declaradas.'
            );

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Dimensión y horizonte', 'Sugerencia personalizada', 'Fundamento metodológico', 'Prioridad']],
                body: personalizedSuggestions.map((s) => [
                    `${s.dimension}\n(${s.horizon})`,
                    s.action,
                    s.rationale,
                    s.priority
                ]),
                theme: 'grid',
                styles: { fontSize: 8.8, cellPadding: 3, textColor: '#334155', valign: 'top' },
                headStyles: { fillColor: '#0F172A', textColor: '#FFFFFF', fontStyle: 'bold' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 36, fillColor: '#F8FAFC' },
                    1: { fontStyle: 'bold', cellWidth: 58 },
                    2: { cellWidth: contentWidth - 114 },
                    3: { fontStyle: 'bold', cellWidth: 20, halign: 'center' }
                },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 10;
                }
            });

            addPageIfNeeded(35);
            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Hoja de ruta operativa por fase y competencias requeridas', margin, currentY);
            currentY += 4;

            const roadmapRows: string[][] = [];
            (analysis.recomendaciones.inmediatas || []).forEach((item: string) =>
                roadmapRows.push(['Fase 01 · Corto plazo', item])
            );
            (analysis.recomendaciones.medianoPlazo || []).forEach((item: string) =>
                roadmapRows.push(['Fase 02 · Mediano plazo', item])
            );
            (analysis.recomendaciones.habilidades || []).forEach((item: string) =>
                roadmapRows.push(['Fase 03 · Competencias clave', item])
            );

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Fase / Categoría', 'Línea de acción recomendada']],
                body: roadmapRows,
                theme: 'striped',
                styles: { fontSize: 9, cellPadding: 3, textColor: '#334155' },
                headStyles: { fillColor: '#059669', textColor: '#FFFFFF', fontStyle: 'bold' },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 48 },
                    1: { cellWidth: contentWidth - 48 }
                },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 10;
                }
            });

            // =========================================================================
            // SECCIÓN 04: CONCLUSIONES Y REFERENCIAS METODOLÓGICAS
            // =========================================================================
            addSectionHeader('04', 'Conclusiones ejecutivas y referencias empíricas');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Síntesis general del diagnóstico:', margin, currentY);
            currentY += 5;
            addBodyParagraph(analysis.conclusiones.sintesis, 5);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Recomendación principal:', margin, currentY);
            currentY += 5;
            addBodyParagraph(analysis.conclusiones.recomendacionPrincipal, 5);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Perspectivas de evolución profesional:', margin, currentY);
            currentY += 5;
            addBodyParagraph(analysis.conclusiones.perspectivas, 6);

            doc.setFontSize(9.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            addPageIfNeeded(26);
            doc.text('Referencias teóricas y empíricas del motor heurístico:', margin, currentY);
            currentY += 4.5;
            addBodyParagraph(
                '1. OIT / Banco Mundial (2025-2026). Inteligencia artificial generativa y empleos: índice de exposición ocupacional y efecto de complementariedad frente a sustitución.\n2. CEPAL / CENIA (2025-2026). Índice Latinoamericano de Inteligencia Artificial (ILIA): factores habilitantes, adopción y gobernanza.\n3. Dell’Acqua, F. et al. — Harvard Business School & BCG. Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality.\n4. Stanford HAI (2025-2026). Artificial Intelligence Index Report: efecto de compresión de habilidades (Skill Compression) y adopción sectorial.',
                4
            );

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                if (i > 1) {
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor('#64748B');
                    doc.text('Evaluación de impacto: IAGen en el día a día · Informe académico', margin, 12);
                    doc.text(dateStr, pageWidth - margin, 12, { align: 'right' });
                    doc.setDrawColor('#E2E8F0');
                    doc.setLineWidth(0.3);
                    doc.line(margin, 14.5, pageWidth - margin, 14.5);
                }

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#64748B');
                doc.text(
                    `Evaluación IAGen · Autor: Francisco Sereño (VTI, Universidad de Chile · linkedin.com/in/franciscosereno)`,
                    margin,
                    pageHeight - 9
                );
                doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 9, {
                    align: 'right'
                });
            }

            doc.save(`Informe_Academico_IAGen_${new Date().toISOString().split('T')[0]}.pdf`);
            this.showToast('Informe académico PDF descargado correctamente');
        } catch (error) {
            console.error('Error generando PDF:', error);
            this.showToast('Error al generar el archivo PDF');
            window.logMessage('error', 'Error generando PDF', error);
        }
    },

    requestRestart() {
        this.openModal('confirmModal');
    },

    confirmRestart() {
        this.closeModal('confirmModal');
        this.data.currentStep = 0;
        this.data.responses = {};
        this.data.validationErrors = [];
        this.data.hasUnsavedChanges = false;
        this.data.isCompleted = false;
        this.data.currentAnalysis = null;
        this.data.activeView = 'form';
        this.data.reportFilter = 'all';
        this.data.sessionId =
            'sesion_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

        try {
            localStorage.removeItem('iagen_progress');
        } catch (e) {
            console.warn('Error clearing storage:', e);
        }

        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.classList.add('hidden');
            resultsContainer.innerHTML = '';
        }
        document.getElementById('questionnaireWrapper')?.classList.remove('hidden');

        this.updateSaveButton();
        this.render();
        this.showToast('Diagnóstico reiniciado');
    },

    restart() {
        this.requestRestart();
    },

    openModal(modalId: string) {
        document.getElementById(modalId)?.classList.remove('hidden');
    },

    closeModal(modalId: string) {
        document.getElementById(modalId)?.classList.add('hidden');
    }
};

window.app = app;

window.addEventListener('load', () => app.init());

window.addEventListener('beforeunload', (e) => {
    if (app.data.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
    }
});