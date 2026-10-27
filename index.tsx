/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Type } from "@google/genai";

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
    suggestions?: string[];
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

const chartInstances: Record<string, any> = {};

const app = {
    data: {
        currentStep: 0,
        activeView: 'form' as 'form' | 'report' | 'charts',
        reportFilter: 'all' as 'all' | 'perfil' | 'accion' | 'visualizacion',
        responses: {} as Record<string, any>,
        sessionId: '',
        aiConnected: false,
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
                    hint: 'Detalla tus responsabilidades cotidianas para que el análisis contextualice las recomendaciones.',
                    type: 'textarea',
                    placeholder: 'Ej.: docencia universitaria, diseño de instrumentos de evaluación, revisión bibliográfica y redacción de informes técnicos...',
                    suggestions: [
                        'Docencia universitaria, dirección de tesis, revisión bibliográfica y redacción de artículos científicos.',
                        'Gestión de proyectos técnicos, coordinación de equipos, elaboración de informes ejecutivos y análisis de indicadores.',
                        'Consultoría estratégica, levantamiento de procesos, síntesis de documentación normativa y presentaciones a clientes.'
                    ]
                },
                {
                    id: 'experiencia_ia',
                    text: '¿Cuál es tu nivel actual de experiencia con herramientas de IA?',
                    hint: 'Considera tanto la frecuencia de uso como la complejidad de integración en tu flujo de trabajo.',
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
                    hint: 'Incluye clasificación de correos, formateo de textos, transcripción o consolidación manual de datos.',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 5
                },
                {
                    id: 'tareas_creativas',
                    text: '¿Qué porcentaje requiere pensamiento creativo, juicio ético o análisis crítico?',
                    hint: 'Actividades que demandan interpretación experta, diseño metodológico, empatía o toma de decisiones.',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 5
                },
                {
                    id: 'tiempo_redaccion',
                    text: '¿Cuántas horas semanales dedicas a la redacción de documentos, informes o comunicaciones?',
                    hint: 'Considera borradores, correos extensos, retroalimentación escrita e informes.',
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
                    text: 'Identifica los tres principales desafíos o cuellos de botella en tu productividad',
                    hint: 'Señala aquellas etapas donde se concentra la mayor carga de tiempo o desgaste operativo.',
                    type: 'textarea',
                    placeholder: 'Ej.: revisión bibliográfica extensa, estandarización de formatos, procesamiento inicial de datos cualitativos...',
                    suggestions: [
                        'Sistematización de literatura extensa, adaptación de materiales didácticos y retroalimentación detallada a estudiantes.',
                        'Consolidación de información dispersa en múltiples documentos, redacción de minutas y preparación de presentaciones.',
                        'Limpieza de bases de datos, generación de código repetitivo para gráficos y documentación técnica.'
                    ]
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
                    hint: 'Puedes seleccionar todas las opciones que se vinculen directamente con tus funciones.',
                    type: 'multiple',
                    options: [
                        'Asistentes de redacción (GPT, Claude)',
                        'Generadores de código',
                        'Análisis de datos con IA',
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
                    hint: 'Identifica los obstáculos institucionales, formativos, éticos o presupuestarios existentes.',
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
                    hint: 'Contempla la curva de aprendizaje y la validación de protocolos de trabajo.',
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
                    hint: 'Desliza para indicar tu expectativa de optimización de tiempos y procesos.',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 5
                },
                {
                    id: 'areas_mayor_impacto',
                    text: '¿En qué áreas específicas proyectas el mayor impacto positivo?',
                    hint: 'Considera velocidad de redacción, estructuración de ideas, análisis exploratorio o síntesis.',
                    type: 'textarea',
                    placeholder: 'Ej.: aceleración de borradores iniciales, estructuración de programas formativos, exploración de enfoques analíticos...',
                    suggestions: [
                        'Aceleración en la elaboración de borradores académicos, síntesis de artículos en otros idiomas y diseño de rúbricas.',
                        'Automatización de resúmenes ejecutivos, contraste de escenarios estratégicos y mejora en la claridad comunicativa.'
                    ]
                },
                {
                    id: 'riesgos_preocupaciones',
                    text: '¿Qué riesgos o preocupaciones identificas en la implementación?',
                    hint: 'Evalúa aspectos como alucinaciones, sesgos, pérdida de autonomía cognitiva o confidencialidad.',
                    type: 'textarea',
                    placeholder: 'Ej.: dependencia tecnológica, imprecisiones bibliográficas, plagio involuntario, privacidad de datos sensibles...',
                    suggestions: [
                        'Riesgo de referencias inexistentes (alucinaciones), pérdida de rigor analítico propio y dilemas de autoría académica.',
                        'Filtración de información confidencial, homogenización del estilo de redacción y dependencia excesiva de asistentes.'
                    ]
                },
                {
                    id: 'cambios_habilidades',
                    text: '¿Qué nuevas competencias necesitarías desarrollar o fortalecer?',
                    hint: 'Menciona habilidades técnicas, metodológicas o de verificación crítica.',
                    type: 'textarea',
                    placeholder: 'Ej.: diseño avanzado de prompts, auditoría de resultados generados, marcos éticos de uso responsable...',
                    suggestions: [
                        'Formulación estructurada de instrucciones (prompting), verificación cruzada de fuentes y alfabetización ética en IA.',
                        'Integración de flujos automatizados, análisis crítico de sesgos algorítmicos y gobernanza de datos.'
                    ]
                }
            ]
        }
    ] as Step[],

    init() {
        this.data.sessionId =
            this.data.sessionId ||
            'sesion_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

        this.checkAI();
        this.loadProgress();

        if (this.data.isCompleted && this.data.currentAnalysis) {
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
        });
    },

    checkAI() {
        const statusText = document.getElementById('aiStatusText');
        try {
            if (process.env.API_KEY && process.env.API_KEY.length > 20) {
                this.data.aiConnected = true;
                if (statusText) {
                    statusText.textContent = 'Motor Gemini 2.5 activo';
                }
            } else {
                throw new Error('API Key not found');
            }
        } catch {
            this.data.aiConnected = false;
            if (statusText) {
                statusText.textContent = 'Modo de evaluación local activo';
            }
        }
    },

    getStepCompletion(step: Step): { answered: number; total: number } {
        let answered = 0;
        step.questions.forEach((q) => {
            const val = this.data.responses[q.id];
            if (Array.isArray(val)) {
                if (val.length > 0) answered++;
            } else if (val !== undefined && val !== null && String(val).trim() !== '') {
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
                    class="w-full py-3 px-2.5 flex items-center justify-between gap-3 text-left transition-colors rounded-lg cursor-pointer ${
                        isCurrent
                            ? 'bg-sky-50/80 text-sky-900 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }"
                >
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="font-mono-tabular text-xs ${
                            isCurrent ? 'text-sky-600 font-semibold' : isDone ? 'text-emerald-600' : 'text-slate-400'
                        }">${step.number}.</span>
                        <span class="text-xs truncate">${step.shortTitle}</span>
                    </div>
                    <span class="font-mono-tabular text-[11px] shrink-0 ${
                        isDone ? 'text-emerald-700 font-medium' : 'text-slate-400'
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
        const headerBtn = document.getElementById('headerPrimaryBtn');

        const { answered, total } = this.getTotalCompletion();
        if (counter) {
            counter.textContent = `${answered}/${total} respuestas`;
        }

        if (headerBtn) {
            if (this.data.isCompleted && this.data.currentAnalysis) {
                headerBtn.textContent = 'Descargar informe PDF';
            } else {
                headerBtn.textContent = 'Generar diagnóstico';
            }
        }

        if (!container) return;

        const r = this.data.responses;
        const sector = r.sector || 'Sin especificar';
        const experiencia = r.experiencia_ia || 'Sin especificar';
        const rutinarias = r.tareas_rutinarias !== undefined ? `${r.tareas_rutinarias}%` : '0%';
        const creativas = r.tareas_creativas !== undefined ? `${r.tareas_creativas}%` : '0%';
        const mejora = r.mejora_productividad !== undefined ? `+${r.mejora_productividad}%` : '0%';
        const horizonte = r.tiempo_implementacion || 'Sin definir';
        const herramientasCount = Array.isArray(r.herramientas_interes) ? r.herramientas_interes.length : 0;
        const barrerasCount = Array.isArray(r.barreras_implementacion) ? r.barreras_implementacion.length : 0;

        container.innerHTML = `
            <div class="flex items-baseline justify-between gap-4 py-1 border-b border-slate-100">
                <dt class="text-slate-500">Sector</dt>
                <dd class="font-medium text-slate-900 text-right truncate max-w-[180px]">${sector}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-1 border-b border-slate-100">
                <dt class="text-slate-500">Experiencia previa</dt>
                <dd class="font-medium text-slate-900 text-right truncate max-w-[180px]">${experiencia}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-1 border-b border-slate-100">
                <dt class="text-slate-500">Carga rutinaria / creativa</dt>
                <dd class="font-mono-tabular font-medium text-slate-900">${rutinarias} · ${creativas}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-1 border-b border-slate-100">
                <dt class="text-slate-500">Herramientas / barreras</dt>
                <dd class="font-mono-tabular font-medium text-slate-900">${herramientasCount} · ${barrerasCount}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-1 border-b border-slate-100">
                <dt class="text-slate-500">Horizonte estimado</dt>
                <dd class="font-medium text-slate-900">${horizonte}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 pt-1">
                <dt class="text-slate-500">Mejora proyectada</dt>
                <dd class="font-mono-tabular font-semibold text-sky-700">${mejora}</dd>
            </div>
        `;
    },

    updateTopNavHighlight() {
        const navDiagnostico = document.getElementById('navDiagnostico');
        const navInforme = document.getElementById('navInforme');
        const navVisualizacion = document.getElementById('navVisualizacion');

        const activeClasses = ['text-slate-900', 'border-sky-600'];
        const inactiveClasses = ['text-slate-600', 'border-transparent'];

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
            document.getElementById('loadingScreen')?.classList.add('hidden');
            document.getElementById('questionnaireWrapper')?.classList.remove('hidden');
            this.render();
            this.updateTopNavHighlight();
            return;
        }

        // If user clicks Report or Charts and hasn't generated analysis yet, generate it now
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
        this.switchView('form');
    },

    render() {
        this.data.activeView = 'form';
        const stepData = this.steps[this.data.currentStep];

        let html = `
            <div class="pb-6 mb-8 border-b border-slate-200">
                <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span class="font-mono-tabular font-medium text-sky-700">Dimensión ${stepData.number} de 0${this.steps.length}</span>
                    <span aria-hidden="true">·</span>
                    <span>${stepData.questions.length} criterios de evaluación</span>
                </div>
                <h2 class="font-display text-xl sm:text-2xl font-bold text-slate-900">
                    ${stepData.title}
                </h2>
                <p class="mt-2 text-sm text-slate-600 leading-relaxed">
                    ${stepData.description}
                </p>
            </div>
            <div class="divide-y divide-slate-200">
        `;

        stepData.questions.forEach((question, qIndex) => {
            html += `
                <div class="py-7 first:pt-0 last:pb-0">
                    <div class="mb-3.5">
                        <label for="${question.id}" class="block font-display text-base font-semibold text-slate-900">
                            <span class="font-mono-tabular text-xs text-slate-400 mr-1.5">${stepData.number}.${qIndex + 1}</span>
                            ${question.text}
                        </label>
                        ${
                            question.hint
                                ? `<p class="mt-1 text-xs text-slate-500">${question.hint}</p>`
                                : ''
                        }
                    </div>
                    ${this.renderQuestion(question)}
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
        this.renderStepRail();
        this.renderLiveTelemetry();
        this.updateTopNavHighlight();
    },

    getSliderDescriptor(questionId: string, val: number): string {
        if (questionId === 'tareas_rutinarias') {
            if (val <= 25) return 'Baja carga operativa rutinaria';
            if (val <= 55) return 'Carga operativa moderada · Oportunidad selectiva de automatización';
            return 'Alta carga rutinaria · Potencial significativo de delegación en IA';
        }
        if (questionId === 'tareas_creativas') {
            if (val <= 25) return 'Baja exigencia de diseño original';
            if (val <= 60) return 'Equilibrio entre análisis crítico y ejecución';
            return 'Alta exigencia intelectual y creativa · Requiere supervisión experta';
        }
        if (questionId === 'mejora_productividad') {
            if (val <= 20) return 'Expectativa conservadora y gradual';
            if (val <= 50) return 'Expectativa moderada y realista';
            return 'Expectativa elevada · Se evaluará riesgo de sobrestimación';
        }
        return '';
    },

    renderQuestion(question: Question) {
        const rawVal = this.data.responses[question.id];
        const value = rawVal !== undefined ? rawVal : '';

        switch (question.type) {
            case 'select': {
                const optionsHtml = (question.options || [])
                    .map((option) => {
                        const isSelected = value === option;
                        return `
                        <button
                            type="button"
                            onclick="app.selectOption('${question.id}', '${option.replace(/'/g, "\\'")}')"
                            class="text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                    ? 'bg-sky-50/90 border-sky-600 text-sky-950 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                            }"
                        >
                            <span>${option}</span>
                            <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
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
                const suggestionsHtml =
                    question.suggestions && question.suggestions.length > 0
                        ? `
                    <div class="mt-3">
                        <span class="block text-[11px] font-medium text-slate-500 mb-1.5">Ejemplos orientativos (clic para usar o adaptar):</span>
                        <div class="flex flex-col gap-1.5">
                            ${question.suggestions
                                .map(
                                    (s) => `
                                <button
                                    type="button"
                                    onclick="app.applySuggestion('${question.id}', '${s.replace(/'/g, "\\'")}')"
                                    class="text-left text-xs text-slate-600 hover:text-sky-800 bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-200 rounded-md px-3 py-2 transition-colors cursor-pointer"
                                >
                                    “${s}”
                                </button>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                `
                        : '';

                return `
                    <div>
                        <textarea
                            class="w-full px-4 py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 transition-all min-h-[116px] resize-y"
                            id="${question.id}"
                            placeholder="${question.placeholder || ''}"
                            oninput="app.updateResponse('${question.id}', this.value)"
                        >${value}</textarea>
                        ${suggestionsHtml}
                    </div>
                `;
            }

            case 'slider': {
                const numericVal =
                    value !== '' && value !== undefined ? Number(value) : question.min || 0;
                const descriptor = this.getSliderDescriptor(question.id, numericVal);

                return `
                    <div class="bg-slate-50 border border-slate-200 rounded-lg p-5">
                        <div class="flex items-baseline justify-between gap-4 mb-3">
                            <span id="${question.id}_desc" class="text-xs font-medium text-slate-600">${descriptor}</span>
                            <span id="${question.id}_value" class="font-mono-tabular text-2xl font-bold text-slate-900">${numericVal}%</span>
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
                        >
                        <div class="flex justify-between text-[11px] font-mono-tabular text-slate-400 mt-2">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>
                `;
            }

            case 'multiple': {
                const selectedArr = Array.isArray(value) ? value : [];
                const itemsHtml = (question.options || [])
                    .map((option) => {
                        const isChecked = selectedArr.includes(option);
                        return `
                        <button
                            type="button"
                            onclick="app.toggleMultipleOption('${question.id}', '${option.replace(/'/g, "\\'")}')"
                            class="text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isChecked
                                    ? 'bg-sky-50/90 border-sky-600 text-sky-950 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                            }"
                        >
                            <span>${option}</span>
                            <span class="w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isChecked ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white'
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
                        <div class="mt-2.5 text-xs text-slate-500 font-mono-tabular">
                            ${selectedArr.length} ${selectedArr.length === 1 ? 'opción seleccionada' : 'opciones seleccionadas'}
                        </div>
                    </div>
                `;
            }

            default:
                return '';
        }
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
            if (valLabel) valLabel.textContent = `${value}%`;
            if (descLabel) descLabel.textContent = this.getSliderDescriptor(question.id, Number(value));
        }
    },

    selectOption(questionId: string, option: string) {
        this.data.responses[questionId] = option;
        this.data.hasUnsavedChanges = true;
        this.updateSaveButton();
        this.render();
    },

    applySuggestion(questionId: string, text: string) {
        this.data.responses[questionId] = text;
        const el = document.getElementById(questionId) as HTMLTextAreaElement | null;
        if (el) {
            el.value = text;
            el.focus();
        }
        this.data.hasUnsavedChanges = true;
        this.updateSaveButton();
        this.renderStepRail();
        this.renderLiveTelemetry();
    },

    updateResponse(questionId: string, value: string) {
        this.data.responses[questionId] = value;
        this.data.hasUnsavedChanges = true;
        this.updateSaveButton();
        this.renderStepRail();
        this.renderLiveTelemetry();
    },

    updateSlider(questionId: string, value: string) {
        const numeric = parseInt(value, 10);
        this.data.responses[questionId] = numeric;
        const valEl = document.getElementById(`${questionId}_value`);
        const descEl = document.getElementById(`${questionId}_desc`);
        if (valEl) valEl.textContent = `${numeric}%`;
        if (descEl) descEl.textContent = this.getSliderDescriptor(questionId, numeric);
        this.data.hasUnsavedChanges = true;
        this.updateSaveButton();
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
        this.data.hasUnsavedChanges = true;
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
            progressText.textContent = `0${this.data.currentStep + 1} / 0${this.steps.length}`;
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
                nextBtn.textContent = 'Generar diagnóstico ejecutivo';
            } else {
                nextBtn.textContent = 'Siguiente dimensión →';
            }
        }
    },

    nextStep() {
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
            this.data.currentStep--;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    loadSampleCase() {
        this.data.responses = {
            sector: 'Educación e investigación',
            rol: 'Docencia universitaria de posgrado, dirección de proyectos de investigación aplicada, revisión sistemática de literatura y elaboración de artículos científicos.',
            experiencia_ia: 'Intermedio (uso regular de múltiples herramientas)',
            tareas_rutinarias: 40,
            tareas_creativas: 60,
            tiempo_redaccion: '10-20 horas',
            principales_desafios: 'Sistematización de grandes volúmenes de literatura en inglés, estandarización formal de informes de avance y retroalimentación individualizada a cohortes numerosas.',
            herramientas_interes: [
                'Asistentes de redacción (GPT, Claude)',
                'Síntesis de documentos',
                'Análisis bibliográfico',
                'Análisis de datos con IA'
            ],
            barreras_implementacion: [
                'Preocupaciones éticas',
                'Falta de capacitación',
                'Restricciones institucionales',
                'Preocupaciones de privacidad'
            ],
            tiempo_implementacion: '3-6 meses',
            mejora_productividad: 35,
            areas_mayor_impacto: 'Estructuración inicial de manuscritos, codificación exploratoria de datos cualitativos, diseño de rúbricas de evaluación y síntesis comparativa de marcos teóricos.',
            riesgos_preocupaciones: 'Riesgo de referencias bibliográficas inexistentes (alucinaciones), pérdida gradual de profundidad analítica propia y ambigüedad normativa respecto a la autoría.',
            cambios_habilidades: 'Diseño avanzado de instrucciones (prompting académico), protocolos de verificación documental y criterios de evaluación ética de resultados generados por IA.'
        };
        this.data.hasUnsavedChanges = true;
        this.saveProgress(false);
        this.render();
        this.showToast('Caso académico de ejemplo cargado');
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
                this.showToast('Progreso guardado en el navegador');
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
        }, 2400);
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

    async generateAnalysis(targetView: 'report' | 'charts' = 'report') {
        this.showLoading();

        let analysis = null;
        if (this.data.aiConnected) {
            analysis = await this.callAI();
        } else {
            analysis = this.getFallbackAnalysis();
        }

        this.data.isCompleted = true;
        this.data.currentAnalysis = analysis;
        this.hideLoading();
        this.showResults(analysis, targetView);
        this.saveProgress(false);
    },

    showLoading() {
        document.getElementById('questionnaireWrapper')?.classList.add('hidden');
        document.getElementById('resultsContainer')?.classList.add('hidden');
        document.getElementById('loadingScreen')?.classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loadingScreen')?.classList.add('hidden');
    },

    async callAI() {
        if (!this.data.aiConnected) {
            return this.getFallbackAnalysis();
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const schema = {
            type: Type.OBJECT,
            properties: {
                perfilProfesional: {
                    type: Type.OBJECT,
                    properties: {
                        resumen: {
                            type: Type.STRING,
                            description: 'Análisis específico del perfil profesional del usuario.'
                        },
                        caracteristicas: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Tres características clave del perfil.'
                        },
                        madurezTecnologica: {
                            type: Type.STRING,
                            description: 'Evaluación crítica del nivel de madurez tecnológica.'
                        }
                    },
                    required: ['resumen', 'caracteristicas', 'madurezTecnologica']
                },
                analisisProductividad: {
                    type: Type.OBJECT,
                    properties: {
                        potencialMejora: {
                            type: Type.STRING,
                            description: 'Análisis realista del potencial de mejora en la productividad.'
                        },
                        factoresClave: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Tres factores clave para mejorar la productividad.'
                        },
                        sobrestimaciones: {
                            type: Type.STRING,
                            description: 'Áreas donde el usuario podría estar sobrestimando el impacto de la IA.'
                        }
                    },
                    required: ['potencialMejora', 'factoresClave', 'sobrestimaciones']
                },
                recomendaciones: {
                    type: Type.OBJECT,
                    properties: {
                        inmediatas: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Tres recomendaciones de acción inmediata.'
                        },
                        medianoPlazo: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Dos recomendaciones a mediano plazo.'
                        },
                        habilidades: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Dos habilidades clave a desarrollar.'
                        }
                    },
                    required: ['inmediatas', 'medianoPlazo', 'habilidades']
                },
                conclusiones: {
                    type: Type.OBJECT,
                    properties: {
                        sintesis: {
                            type: Type.STRING,
                            description: 'Síntesis general del análisis.'
                        },
                        recomendacionPrincipal: {
                            type: Type.STRING,
                            description: 'La recomendación más importante y accionable.'
                        },
                        perspectivas: {
                            type: Type.STRING,
                            description: 'Perspectivas futuras para el perfil del usuario.'
                        }
                    },
                    required: ['sintesis', 'recomendacionPrincipal', 'perspectivas']
                }
            }
        };

        const prompt = `Eres un experto académico en transformación digital y análisis del impacto tecnológico. Tu tarea es analizar las respuestas de un usuario a una evaluación sobre el impacto de la inteligencia artificial generativa (IAGen) en su trabajo. Proporciona un análisis crítico, constructivo, riguroso y fundamentado en español. Las respuestas del usuario son:

${JSON.stringify(this.data.responses, null, 2)}

Basado en estas respuestas, genera un análisis completo que siga estrictamente el esquema JSON proporcionado.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature: 0.5
                }
            });

            const jsonText = (response.text || '').trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            window.logMessage('error', 'Error en la llamada a la API de Gemini', error);
            return this.getFallbackAnalysis();
        }
    },

    getFallbackAnalysis() {
        const r = this.data.responses;
        const sector = r.sector || 'Educación e investigación';
        const experiencia = r.experiencia_ia || 'Intermedio';
        const rutinarias = r.tareas_rutinarias !== undefined ? r.tareas_rutinarias : 35;
        const creativas = r.tareas_creativas !== undefined ? r.tareas_creativas : 65;
        const mejora = r.mejora_productividad !== undefined ? r.mejora_productividad : 30;

        return {
            perfilProfesional: {
                resumen: `Profesional vinculado al sector de ${sector.toLowerCase()}, cuya actividad combina un ${rutinarias}% de gestión operativa rutinaria con un ${creativas}% de trabajo analítico y creativo. Su familiaridad declarada (${experiencia.toLowerCase()}) ofrece una base favorable para una adopción selectiva y metodológicamente guiada.`,
                caracteristicas: [
                    `Desempeño en ${sector.toLowerCase()} con alta exigencia de producción documental y rigor conceptual`,
                    `Distribución laboral con ${rutinarias}% de procesos repetitivos automatizables y ${creativas}% de juicio experto indelegable`,
                    'Disposición hacia la incorporación de asistentes de síntesis, redacción y análisis estructurado'
                ],
                madurezTecnologica: `Nivel declarado: ${experiencia}. Se recomienda transitar desde el uso exploratorio o puntual hacia flujos de trabajo estandarizados con criterios explícitos de verificación de calidad.`
            },
            analisisProductividad: {
                potencialMejora: `La estimación declarada de un ${mejora}% de mejora en la productividad es alcanzable principalmente en la reducción de tiempos de preproducción documental, síntesis bibliográfica y estructuración de borradores. No obstante, el tiempo ahorrado en tareas operativas suele reasignarse a labores de revisión y validación.`,
                factoresClave: [
                    'Automatización de resúmenes preliminares, estructuración de esquemas y estandarización de formatos',
                    'Asistencia en la revisión estilística, traducción técnica y generación de variantes comunicativas',
                    'Sistematización temprana de cuellos de botella en la búsqueda y clasificación de información'
                ],
                sobrestimaciones: 'Existe riesgo de subestimar el tiempo requerido para auditar y corregir imprecisiones fácticas o referencias generadas por los modelos de lenguaje, especialmente en tareas de alta exigencia académica.'
            },
            recomendaciones: {
                inmediatas: [
                    'Definir dos casos de uso acotados de bajo riesgo (por ejemplo, esquematización de textos y síntesis de documentos internos)',
                    'Establecer una lista de verificación humana obligatoria para todo contenido asistido por IA antes de su difusión',
                    'Documentar plantillas de instrucciones (prompts) reutilizables adaptadas al vocabulario de su disciplina'
                ],
                medianoPlazo: [
                    'Implementar lineamientos éticos y de privacidad de datos alineados con las políticas de su institución',
                    'Evaluar empíricamente el ahorro real de horas semanales tras un trimestre de uso sistemático'
                ],
                habilidades: [
                    'Ingeniería de instrucciones contextualizada (diseño de contexto, restricciones y formato de salida)',
                    'Auditoría epistémica y verificación crítica de sesgos, omisiones y alucinaciones algorítmicas'
                ]
            },
            conclusiones: {
                sintesis: 'El perfil analizado presenta un alto potencial de aprovechamiento de la inteligencia artificial generativa como copiloto intelectual, siempre que se preserve la primacía del criterio humano en las etapas de interpretación y decisión.',
                recomendacionPrincipal: 'Concentrar la adopción inicial en los cuellos de botella operativos y de redacción preliminar, manteniendo trazabilidad y control estricto sobre la validez de las fuentes.',
                perspectivas: 'Una integración progresiva y éticamente resguardada permitirá liberar carga administrativa para fortalecer las labores de investigación, diseño estratégico y pensamiento crítico.'
            }
        };
    },

    setReportFilter(filter: 'all' | 'perfil' | 'accion' | 'visualizacion') {
        this.data.reportFilter = filter;
        if (this.data.currentAnalysis) {
            this.showResults(
                this.data.currentAnalysis,
                filter === 'visualizacion' ? 'charts' : 'report'
            );
        }
    },

    showResults(analysis: any, viewMode: 'report' | 'charts' = 'report') {
        this.data.activeView = viewMode;
        if (viewMode === 'charts') {
            this.data.reportFilter = 'visualizacion';
        } else if (this.data.reportFilter === 'visualizacion') {
            this.data.reportFilter = 'all';
        }

        const r = this.data.responses;
        const rutinarias = r.tareas_rutinarias !== undefined ? Number(r.tareas_rutinarias) : 35;
        const creativas = r.tareas_creativas !== undefined ? Number(r.tareas_creativas) : 65;
        const mejora = r.mejora_productividad !== undefined ? Number(r.mejora_productividad) : 30;
        const horizonte = r.tiempo_implementacion || '3-6 meses';
        const filter = this.data.reportFilter;

        const showPerfil = filter === 'all' || filter === 'perfil';
        const showAccion = filter === 'all' || filter === 'accion';
        const showViz = filter === 'all' || filter === 'visualizacion';

        const html = `
            <!-- Report Executive Header -->
            <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
                    <div>
                        <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                            <span>Informe ejecutivo de impacto</span>
                            <span aria-hidden="true">·</span>
                            <span>${this.data.aiConnected ? 'Generado con Google Gemini 2.5' : 'Generado con motor analítico local'}</span>
                            <span aria-hidden="true">·</span>
                            <span class="font-mono-tabular">${new Date().toLocaleDateString('es-ES')}</span>
                        </div>
                        <h2 class="font-display text-2xl font-bold text-slate-900">
                            Resultados del diagnóstico y plan de adopción
                        </h2>
                    </div>

                    <div class="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button type="button" onclick="app.switchView('form')" class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                            Editar respuestas
                        </button>
                        <button type="button" onclick="app.downloadPDF()" class="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Descargar PDF</span>
                        </button>
                    </div>
                </div>

                <!-- 4-Column Quantitative KPI Strip (Full-Width Row) -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 mb-6 border-b border-slate-200">
                    <div class="p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                        <div class="text-xs text-slate-500 mb-1">Carga rutinaria</div>
                        <div class="font-mono-tabular text-2xl font-bold text-slate-900">${rutinarias}%</div>
                        <div class="text-[11px] text-slate-500 mt-1">Automatización potencial</div>
                    </div>
                    <div class="p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                        <div class="text-xs text-slate-500 mb-1">Carga analítica y creativa</div>
                        <div class="font-mono-tabular text-2xl font-bold text-slate-900">${creativas}%</div>
                        <div class="text-[11px] text-slate-500 mt-1">Supervisión humana crítica</div>
                    </div>
                    <div class="p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                        <div class="text-xs text-slate-500 mb-1">Mejora proyectada</div>
                        <div class="font-mono-tabular text-2xl font-bold text-sky-700">+${mejora}%</div>
                        <div class="text-[11px] text-slate-500 mt-1">Expectativa declarada</div>
                    </div>
                    <div class="p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                        <div class="text-xs text-slate-500 mb-1">Horizonte de adopción</div>
                        <div class="font-mono-tabular text-lg font-bold text-slate-900 truncate">${horizonte}</div>
                        <div class="text-[11px] text-slate-500 mt-1">Implementación estimada</div>
                    </div>
                </div>

                <!-- Interactive Segmented Filter Controls -->
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg" role="tablist" aria-label="Secciones del informe">
                        <button type="button" onclick="app.setReportFilter('all')" class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }">
                            Informe completo
                        </button>
                        <button type="button" onclick="app.setReportFilter('perfil')" class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'perfil' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }">
                            Perfil y productividad
                        </button>
                        <button type="button" onclick="app.setReportFilter('accion')" class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'accion' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }">
                            Plan de acción
                        </button>
                        <button type="button" onclick="app.setReportFilter('visualizacion')" class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            filter === 'visualizacion' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }">
                            Visualización de datos
                        </button>
                    </div>

                    <button type="button" onclick="app.generateAnalysis('report')" class="text-xs font-medium text-sky-700 hover:text-sky-800 underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer">
                        Actualizar análisis
                    </button>
                </div>
            </div>

            ${
                showPerfil
                    ? `
            <!-- Section 01: Perfil Profesional & Productividad -->
            <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 divide-y divide-slate-200">
                <section class="pb-8">
                    <div class="text-xs font-mono-tabular text-sky-700 font-medium mb-1">Sección 01</div>
                    <h3 class="font-display text-lg font-bold text-slate-900 mb-3">
                        01. Perfil profesional y madurez tecnológica
                    </h3>
                    <p class="text-sm text-slate-700 leading-relaxed mb-6">
                        ${analysis.perfilProfesional.resumen}
                    </p>

                    <div class="mb-6">
                        <h4 class="font-display text-xs font-semibold text-slate-900 mb-3">Características observadas en el diagnóstico</h4>
                        <div class="divide-y divide-slate-100 border-t border-b border-slate-100">
                            ${(analysis.perfilProfesional.caracteristicas || [])
                                .map(
                                    (item: string, idx: number) => `
                                <div class="py-2.5 flex items-baseline gap-3 text-sm text-slate-700">
                                    <span class="font-mono-tabular text-xs text-slate-400 shrink-0">0${idx + 1}.</span>
                                    <span>${item}</span>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>

                    <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div class="text-xs font-semibold text-slate-900 mb-1">Diagnóstico de madurez tecnológica</div>
                        <p class="text-xs text-slate-600 leading-relaxed">${analysis.perfilProfesional.madurezTecnologica}</p>
                    </div>
                </section>

                <section class="pt-8">
                    <div class="text-xs font-mono-tabular text-sky-700 font-medium mb-1">Sección 02</div>
                    <h3 class="font-display text-lg font-bold text-slate-900 mb-3">
                        02. Análisis realista de productividad y posibles sobrestimaciones
                    </h3>
                    <p class="text-sm text-slate-700 leading-relaxed mb-6">
                        ${analysis.analisisProductividad.potencialMejora}
                    </p>

                    <div class="mb-6">
                        <h4 class="font-display text-xs font-semibold text-slate-900 mb-3">Factores determinantes de eficiencia</h4>
                        <div class="divide-y divide-slate-100 border-t border-b border-slate-100">
                            ${(analysis.analisisProductividad.factoresClave || [])
                                .map(
                                    (item: string, idx: number) => `
                                <div class="py-2.5 flex items-baseline gap-3 text-sm text-slate-700">
                                    <span class="font-mono-tabular text-xs text-slate-400 shrink-0">0${idx + 1}.</span>
                                    <span>${item}</span>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>

                    <div class="p-4 bg-amber-50/70 border border-amber-200 rounded-lg">
                        <div class="text-xs font-semibold text-amber-900 mb-1">Advertencia metodológica sobre expectativas</div>
                        <p class="text-xs text-amber-900/90 leading-relaxed">${analysis.analisisProductividad.sobrestimaciones}</p>
                    </div>
                </section>
            </div>
            `
                    : ''
            }

            ${
                showAccion
                    ? `
            <!-- Section 03: Plan de Acción & Conclusiones -->
            <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 divide-y divide-slate-200">
                <section class="pb-8">
                    <div class="text-xs font-mono-tabular text-sky-700 font-medium mb-1">Sección 03</div>
                    <h3 class="font-display text-lg font-bold text-slate-900 mb-6">
                        03. Hoja de ruta y competencias requeridas
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                            <div class="font-mono-tabular text-xs text-sky-700 font-semibold mb-1">Fase 01 · Corto plazo</div>
                            <h4 class="font-display text-sm font-bold text-slate-900 mb-3">Acciones inmediatas</h4>
                            <ul class="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                                ${(analysis.recomendaciones.inmediatas || [])
                                    .map((item: string) => `<li>· ${item}</li>`)
                                    .join('')}
                            </ul>
                        </div>

                        <div class="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                            <div class="font-mono-tabular text-xs text-sky-700 font-semibold mb-1">Fase 02 · Mediano plazo</div>
                            <h4 class="font-display text-sm font-bold text-slate-900 mb-3">Consolidación</h4>
                            <ul class="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                                ${(analysis.recomendaciones.medianoPlazo || [])
                                    .map((item: string) => `<li>· ${item}</li>`)
                                    .join('')}
                            </ul>
                        </div>

                        <div class="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                            <div class="font-mono-tabular text-xs text-sky-700 font-semibold mb-1">Fase 03 · Capacidades</div>
                            <h4 class="font-display text-sm font-bold text-slate-900 mb-3">Habilidades clave</h4>
                            <ul class="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                                ${(analysis.recomendaciones.habilidades || [])
                                    .map((item: string) => `<li>· ${item}</li>`)
                                    .join('')}
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="pt-8">
                    <div class="text-xs font-mono-tabular text-sky-700 font-medium mb-1">Sección 04</div>
                    <h3 class="font-display text-lg font-bold text-slate-900 mb-4">
                        04. Síntesis ejecutiva y perspectivas estratégicas
                    </h3>

                    <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
                        <div>
                            <div class="text-xs font-semibold text-slate-900 mb-1">Síntesis general</div>
                            <p>${analysis.conclusiones.sintesis}</p>
                        </div>
                        <div class="p-4 bg-sky-50/70 border border-sky-200 rounded-lg">
                            <div class="text-xs font-semibold text-sky-950 mb-1">Recomendación prioritaria</div>
                            <p class="text-xs text-sky-900 leading-relaxed">${analysis.conclusiones.recomendacionPrincipal}</p>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-slate-900 mb-1">Perspectivas futuras</div>
                            <p>${analysis.conclusiones.perspectivas}</p>
                        </div>
                    </div>
                </section>
            </div>
            `
                    : ''
            }

            ${
                showViz
                    ? `
            <!-- Section 05: Visualización de Datos -->
            <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
                <div class="pb-6 mb-6 border-b border-slate-200">
                    <div class="text-xs font-mono-tabular text-sky-700 font-medium mb-1">Sección 05</div>
                    <h3 class="font-display text-lg font-bold text-slate-900">
                        05. Visualización comparativa de indicadores
                    </h3>
                    <p class="mt-1 text-xs text-slate-500">
                        Representación gráfica de la composición de carga laboral, potencial de automatización y barreras institucionales declaradas.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                        <h4 class="font-display text-xs font-semibold text-slate-900 mb-4 text-center">
                            Distribución de tareas (rutinarias vs. creativas)
                        </h4>
                        <div class="relative h-64">
                            <canvas id="taskChart"></canvas>
                        </div>
                    </div>

                    <div class="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                        <h4 class="font-display text-xs font-semibold text-slate-900 mb-4 text-center">
                            Equilibrio de perfil laboral
                        </h4>
                        <div class="relative h-64">
                            <canvas id="profileChart"></canvas>
                        </div>
                    </div>

                    <div class="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-lg">
                        <h4 class="font-display text-xs font-semibold text-slate-900 mb-4 text-center">
                            Barreras percibidas para la adopción de IAGen
                        </h4>
                        <div class="relative h-64 max-w-lg mx-auto">
                            <canvas id="barriersChart"></canvas>
                        </div>
                    </div>
                </div>
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
        this.renderStepRail();
        this.renderLiveTelemetry();
        this.updateTopNavHighlight();

        if (showViz) {
            setTimeout(() => this.renderCharts(), 40);
        }
    },

    renderCharts() {
        if (!window.Chart) return;

        ['taskChart', 'profileChart', 'barriersChart'].forEach((id) => {
            if (chartInstances[id]) {
                chartInstances[id].destroy();
                delete chartInstances[id];
            }
        });

        const rutinarias = this.data.responses.tareas_rutinarias || 0;
        const creativas = this.data.responses.tareas_creativas || 0;
        const mejora = this.data.responses.mejora_productividad || 0;

        // Chart 1: Task Distribution
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
                                backgroundColor: ['rgba(100, 116, 139, 0.8)', 'rgba(2, 132, 199, 0.85)'],
                                borderColor: ['#475569', '#0284C7'],
                                borderWidth: 1.5,
                                borderRadius: 6
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
                                ticks: { callback: (v: any) => v + '%' }
                            }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }

        // Chart 2: Profile Radar
        const profileCanvas = document.getElementById('profileChart') as HTMLCanvasElement | null;
        if (profileCanvas) {
            const profileCtx = profileCanvas.getContext('2d');
            if (profileCtx) {
                chartInstances['profileChart'] = new window.Chart(profileCtx, {
                    type: 'radar',
                    data: {
                        labels: ['Productividad proyectada', 'Enfoque creativo', 'Potencial de automatización'],
                        datasets: [
                            {
                                label: 'Indicadores (%)',
                                data: [mejora, creativas, rutinarias],
                                backgroundColor: 'rgba(2, 132, 199, 0.18)',
                                borderColor: '#0284C7',
                                pointBackgroundColor: '#0284C7',
                                pointBorderColor: '#ffffff',
                                borderWidth: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                suggestedMin: 0,
                                suggestedMax: 100
                            }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }

        // Chart 3: Barriers Doughnut
        const barriersCanvas = document.getElementById('barriersChart') as HTMLCanvasElement | null;
        const barriersData: string[] =
            Array.isArray(this.data.responses.barreras_implementacion) &&
            this.data.responses.barreras_implementacion.length > 0
                ? this.data.responses.barreras_implementacion
                : ['Sin barreras seleccionadas'];

        if (barriersCanvas) {
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
                                    '#0284C7',
                                    '#0F172A',
                                    '#059669',
                                    '#D97706',
                                    '#64748B',
                                    '#0369A1',
                                    '#334155'
                                ],
                                borderWidth: 2,
                                borderColor: '#F8FAFC'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12, font: { size: 11 } }
                            }
                        }
                    }
                });
            }
        }
    },

    downloadPDF() {
        const jsPDFLib = window.jspdf;

        if (!jsPDFLib || !jsPDFLib.jsPDF || !jsPDFLib.autoTable) {
            this.showToast('La biblioteca de exportación PDF se está cargando. Intenta nuevamente.');
            window.logMessage('error', 'jsPDF o jspdf-autotable no encontrados');
            return;
        }

        if (!this.data.currentAnalysis) {
            this.data.currentAnalysis = this.getFallbackAnalysis();
        }

        try {
            const { jsPDF } = jsPDFLib;
            const doc = new jsPDF();
            let currentY = 20;
            const margin = 20;
            const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;

            const addPageIfNeeded = (spaceNeeded: number) => {
                if (currentY + spaceNeeded > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    currentY = margin;
                }
            };

            const addTitle = (text: string) => {
                doc.setFontSize(17);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#0F172A');
                doc.text(text, margin, currentY);
                currentY += 8;
            };

            const addSubtitle = (text: string) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#64748B');
                doc.text(text, margin, currentY);
                currentY += 12;
            };

            const addSectionHeader = (text: string) => {
                addPageIfNeeded(20);
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#0284C7');
                doc.text(text, margin, currentY);
                currentY += 5;
                doc.setDrawColor('#E2E8F0');
                doc.setLineWidth(0.4);
                doc.line(margin, currentY, margin + contentWidth, currentY);
                currentY += 7;
            };

            const addBodyText = (text: string, options = { spaceAfter: 5 }) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#334155');
                const lines = doc.splitTextToSize(text || '', contentWidth);
                addPageIfNeeded(lines.length * 6);
                doc.text(lines, margin, currentY);
                currentY += lines.length * 5 + (options.spaceAfter || 5);
            };

            const addBulletList = (items: string[], title: string) => {
                addPageIfNeeded(10 + items.length * 8);
                doc.setFontSize(10.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#0F172A');
                doc.text(title, margin, currentY);
                currentY += 6;

                doc.setFontSize(9.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#334155');
                items.forEach((item) => {
                    const itemLines = doc.splitTextToSize(item, contentWidth - 6);
                    addPageIfNeeded(itemLines.length * 6);
                    doc.text('•', margin + 1, currentY);
                    doc.text(itemLines, margin + 5, currentY);
                    currentY += itemLines.length * 4.8 + 2.5;
                });
                currentY += 4;
            };

            const addFooter = () => {
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(120, 120, 120);
                    const text = `Página ${i} de ${pageCount} · Generado el ${new Date().toLocaleDateString(
                        'es-ES'
                    )} · Evaluación de impacto: IAGen · Autor: Francisco Sereño`;
                    doc.text(text, margin, doc.internal.pageSize.getHeight() - 10);
                }
            };

            const analysis = this.data.currentAnalysis;

            addTitle('Evaluación de impacto: IAGen en el día a día');
            addSubtitle(`Informe ejecutivo de diagnóstico · Sesión: ${this.data.sessionId.substring(0, 16)}`);

            addSectionHeader('01. Síntesis de respuestas registradas');
            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Dimensión evaluada', 'Valor declarado']],
                body: [
                    ['Sector profesional', this.data.responses.sector || 'No especificado'],
                    ['Experiencia previa con IA', this.data.responses.experiencia_ia || 'No especificada'],
                    ['Proporción de tareas rutinarias', `${this.data.responses.tareas_rutinarias || 0}%`],
                    ['Proporción de tareas creativas y críticas', `${this.data.responses.tareas_creativas || 0}%`],
                    ['Mejora de productividad proyectada', `${this.data.responses.mejora_productividad || 0}%`],
                    ['Horizonte estimado de adopción', this.data.responses.tiempo_implementacion || 'No especificado'],
                    [
                        'Herramientas de interés',
                        (this.data.responses.herramientas_interes || []).join(', ') || 'No especificadas'
                    ],
                    [
                        'Barreras percibidas',
                        (this.data.responses.barreras_implementacion || []).join(', ') || 'No especificadas'
                    ]
                ],
                theme: 'grid',
                headStyles: { fillColor: '#0F172A' },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 10;
                }
            });

            addSectionHeader('02. Perfil profesional y madurez tecnológica');
            addBodyText(analysis.perfilProfesional.resumen);
            addBulletList(analysis.perfilProfesional.caracteristicas, 'Características observadas:');
            addBodyText(`Madurez tecnológica: ${analysis.perfilProfesional.madurezTecnologica}`, {
                spaceAfter: 8
            });

            addSectionHeader('03. Análisis de productividad');
            addBodyText(analysis.analisisProductividad.potencialMejora);
            addBulletList(analysis.analisisProductividad.factoresClave, 'Factores clave:');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#B45309');
            addBodyText(`Advertencia metodológica: ${analysis.analisisProductividad.sobrestimaciones}`, {
                spaceAfter: 8
            });

            addSectionHeader('04. Plan de acción recomendado');
            const recommendationsData: string[][] = [];
            analysis.recomendaciones.inmediatas.forEach((item: string) =>
                recommendationsData.push(['Corto plazo (inmediata)', item])
            );
            analysis.recomendaciones.medianoPlazo.forEach((item: string) =>
                recommendationsData.push(['Mediano plazo', item])
            );
            analysis.recomendaciones.habilidades.forEach((item: string) =>
                recommendationsData.push(['Competencia clave', item])
            );

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Horizonte / Tipo', 'Recomendación específica']],
                body: recommendationsData,
                theme: 'grid',
                headStyles: { fillColor: '#0284C7' },
                didDrawPage: (data: any) => {
                    currentY = data.cursor.y + 10;
                }
            });

            addSectionHeader('05. Conclusiones estratégicas');
            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Síntesis general:', margin, currentY);
            currentY += 5;
            addBodyText(analysis.conclusiones.sintesis);

            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Recomendación principal:', margin, currentY);
            currentY += 5;
            addBodyText(analysis.conclusiones.recomendacionPrincipal);

            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#0F172A');
            doc.text('Perspectivas futuras:', margin, currentY);
            currentY += 5;
            addBodyText(analysis.conclusiones.perspectivas);

            addFooter();
            doc.save(`Evaluacion_IAGen_${new Date().toISOString().split('T')[0]}.pdf`);
            this.showToast('Informe PDF descargado correctamente');
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