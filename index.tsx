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

const app = {
    data: {
        currentStep: 0,
        responses: {},
        sessionId: null,
        aiConnected: false,
        hasUnsavedChanges: false,
        currentAnalysis: null,
        isCompleted: false,
        chartsRendered: false,
    },

    steps: [
        {
            id: 'perfil_profesional',
            title: 'Perfil profesional y contexto laboral',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            questions: [
                {
                    id: 'sector',
                    text: '¿En qué sector profesional te desempeñas?',
                    type: 'select',
                    options: ['Educación e investigación', 'Salud', 'Tecnología', 'Servicios financieros', 'Sector público', 'Comunicaciones y marketing', 'Consultoría', 'Industria', 'Otro']
                },
                {
                    id: 'rol',
                    text: 'Describe tu rol principal y las tareas que realizas habitualmente',
                    type: 'textarea',
                    placeholder: 'Ej: investigador universitario, análisis de datos, redacción de papers, docencia...'
                },
                {
                    id: 'experiencia_ia',
                    text: '¿Cuál es tu nivel actual de experiencia con herramientas de IA?',
                    type: 'select',
                    options: ['Sin experiencia', 'Básico (ChatGPT ocasional)', 'Intermedio (uso regular de múltiples herramientas)', 'Avanzado (integración sistemática)']
                }
            ]
        },
        {
            id: 'analisis_tareas',
            title: 'Análisis de tareas y procesos',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
            questions: [
                {
                    id: 'tareas_rutinarias',
                    text: '¿Qué porcentaje de tu trabajo involucra tareas rutinarias o repetitivas?',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 10
                },
                {
                    id: 'tareas_creativas',
                    text: '¿Qué porcentaje requiere pensamiento creativo o análisis crítico?',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 10
                },
                {
                    id: 'tiempo_redaccion',
                    text: '¿Cuántas horas semanales dedicas a redacción de documentos, informes o comunicaciones?',
                    type: 'select',
                    options: ['Menos de 5 horas', '5-10 horas', '10-20 horas', '20-30 horas', 'Más de 30 horas']
                },
                {
                    id: 'principales_desafios',
                    text: 'Identifica los tres principales desafíos o "cuellos de botella" en tu productividad',
                    type: 'textarea',
                    placeholder: 'Ej: revisión bibliográfica extensa, formateo de documentos, análisis de datos repetitivos...'
                }
            ]
        },
        {
            id: 'implementacion_iagen',
            title: 'Escenarios de implementación de IAGen',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
            questions: [
                {
                    id: 'herramientas_interes',
                    text: '¿Qué herramientas de IAGen podrían ser más relevantes para tu trabajo?',
                    type: 'multiple',
                    options: ['Asistentes de redacción (GPT, Claude)', 'Generadores de código', 'Análisis de datos con IA', 'Traducción automática', 'Síntesis de documentos', 'Creación de presentaciones', 'Análisis bibliográfico', 'Generación de imágenes/gráficos']
                },
                {
                    id: 'barreras_implementacion',
                    text: '¿Cuáles serían las principales barreras para implementar IAGen en tu trabajo?',
                    type: 'multiple',
                    options: ['Restricciones institucionales', 'Falta de recursos técnicos', 'Preocupaciones éticas', 'Falta de capacitación', 'Resistencia al cambio', 'Costos', 'Preocupaciones de privacidad']
                },
                {
                    id: 'tiempo_implementacion',
                    text: 'En un escenario ideal, ¿en cuánto tiempo podrías implementar IAGen de manera efectiva?',
                    type: 'select',
                    options: ['1-3 meses', '3-6 meses', '6-12 meses', 'Más de 1 año']
                }
            ]
        },
        {
            id: 'impacto_proyectado',
            title: 'Proyección de impactos',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
            questions: [
                {
                    id: 'mejora_productividad',
                    text: '¿En qué porcentaje estimas que podría mejorar tu productividad?',
                    type: 'slider',
                    min: 0,
                    max: 100,
                    step: 5
                },
                {
                    id: 'areas_mayor_impacto',
                    text: '¿En qué áreas específicas proyectas el mayor impacto positivo?',
                    type: 'textarea',
                    placeholder: 'Considera aspectos como: velocidad de redacción, calidad de análisis, tiempo de investigación, etc.'
                },
                {
                    id: 'riesgos_preocupaciones',
                    text: '¿Qué riesgos o preocupaciones identificas en la implementación?',
                    type: 'textarea',
                    placeholder: 'Ej: dependencia tecnológica, pérdida de habilidades, problemas de calidad, aspectos éticos...'
                },
                {
                    id: 'cambios_habilidades',
                    text: '¿Qué nuevas habilidades necesitarías desarrollar?',
                    type: 'textarea',
                    placeholder: 'Ej: prompt engineering, verificación de información, integración de herramientas...'
                }
            ]
        }
    ],

    init() {
        console.log('Iniciando aplicación IAGen...');
        this.data.sessionId = this.data.sessionId || 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.checkAI();
        this.loadProgress();
        
        if (this.data.isCompleted && this.data.currentAnalysis) {
            this.showResults(this.data.currentAnalysis);
        } else {
            this.render();
        }

        // Add event listener for modals
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('modal')) {
                target.classList.add('hidden');
            }
        });
    },

    checkAI() {
        const indicator = document.getElementById('aiIndicator');
        const status = document.getElementById('aiStatus');
        
        // Assume process.env.API_KEY is replaced by a build tool
        try {
            if (process.env.API_KEY && process.env.API_KEY.length > 20) {
                this.data.aiConnected = true;
                indicator.className = 'indicator status-connected';
                status.textContent = 'IA configurada';
            } else {
                throw new Error("API Key not found or invalid.");
            }
        } catch(e) {
            this.data.aiConnected = false;
            indicator.className = 'indicator status-local';
            status.textContent = 'IA no configurada';
            console.warn("API_KEY for Gemini not found in environment variables.");
        }
    },

    render() {
        const stepData = this.steps[this.data.currentStep];
        let html = `
            <div class="step-header">
                <div class="step-icon">${stepData.icon}</div>
                <div>
                    <div class="step-title">${stepData.title}</div>
                    <div class="step-subtitle">Sección ${this.data.currentStep + 1} de ${this.steps.length}</div>
                </div>
            </div>
        `;
        
        stepData.questions.forEach(question => {
            html += `<div class="question-block">
                <label class="question-label">${question.text}</label>
                ${this.renderQuestion(question)}
            </div>`;
        });
        
        document.getElementById('stepContent').innerHTML = html;
        
        stepData.questions.forEach(question => this.restoreValue(question));
        this.updateProgress();
        this.updateNavigation();
    },

    renderQuestion(question) {
        const value = this.data.responses[question.id] || '';
        
        switch (question.type) {
            case 'select':
                let options = '<option value="">Selecciona una opción</option>';
                question.options.forEach(option => {
                    options += `<option value="${option}">${option}</option>`;
                });
                return `<select class="form-input" id="${question.id}" onchange="app.updateResponse('${question.id}', this.value)">${options}</select>`;
            
            case 'textarea':
                return `<textarea class="form-input form-textarea" id="${question.id}" placeholder="${question.placeholder || ''}" onchange="app.updateResponse('${question.id}', this.value)" oninput="app.updateResponse('${question.id}', this.value)"></textarea>`;
            
            case 'slider':
                return `
                    <div class="slider-container">
                        <input type="range" class="slider" id="${question.id}" min="${question.min}" max="${question.max}" step="${question.step}" value="${value || question.min}" oninput="app.updateSlider('${question.id}', this.value)">
                        <div class="slider-value" id="${question.id}_value">${value || question.min}%</div>
                    </div>
                `;
            
            case 'multiple':
                let checkboxes = '<div class="checkbox-grid">';
                question.options.forEach((option, index) => {
                    const checked = Array.isArray(value) && value.includes(option) ? 'checked' : '';
                    const checkboxId = `${question.id}_${index}`;
                    checkboxes += `
                        <div class="checkbox-item">
                            <input type="checkbox" id="${checkboxId}" value="${option}" ${checked} onchange="app.updateMultiple('${question.id}', '${option}', this.checked)">
                            <label for="${checkboxId}">${option}</label>
                        </div>
                    `;
                });
                checkboxes += '</div>';
                return checkboxes;
            
            default:
                return '<p>Tipo de pregunta no soportado</p>';
        }
    },

    restoreValue(question) {
        const element = document.getElementById(question.id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const value = this.data.responses[question.id];
        
        if (!element || !value) return;
        
        switch (question.type) {
            case 'select':
            case 'textarea':
                element.value = value;
                break;
            
            case 'slider':
                element.value = value;
                document.getElementById(question.id + '_value').textContent = value + '%';
                break;
            
            case 'multiple':
                if (Array.isArray(value)) {
                    question.options.forEach((option, index) => {
                        const checkbox = document.getElementById(`${question.id}_${index}`) as HTMLInputElement;
                        if (checkbox) checkbox.checked = value.includes(option);
                    });
                }
                break;
        }
    },

    updateResponse(questionId, value) {
        this.data.responses[questionId] = value;
        this.data.hasUnsavedChanges = true;
        this.updateSaveButton();
    },

    updateSlider(questionId, value) {
        this.data.responses[questionId] = parseInt(value);
        document.getElementById(questionId + '_value').textContent = value + '%';
        this.data.hasUnsavedChanges = true;
        this.updateSaveButton();
    },

    updateMultiple(questionId, option, checked) {
        if (!this.data.responses[questionId] || !Array.isArray(this.data.responses[questionId])) {
            this.data.responses[questionId] = [];
        }
        
        const currentValue = this.data.responses[questionId] as string[];
        if (checked) {
            if (!currentValue.includes(option)) {
                currentValue.push(option);
            }
        } else {
            this.data.responses[questionId] = currentValue.filter(item => item !== option);
        }
        
        this.data.hasUnsavedChanges = true;
        this.updateSaveButton();
    },

    updateSaveButton() {
        const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
        if (this.data.hasUnsavedChanges) {
            saveBtn.style.display = 'inline-flex';
        }
    },

    updateProgress() {
        document.getElementById('progressText').textContent = `${this.data.currentStep + 1} de ${this.steps.length}`;
        (document.getElementById('progressFill') as HTMLElement).style.width = `${((this.data.currentStep + 1) / this.steps.length) * 100}%`;
    },

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
        const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
        
        prevBtn.disabled = this.data.currentStep === 0;
        
        if (this.data.currentStep === this.steps.length - 1) {
            nextBtn.innerHTML = 'Generar análisis con IA';
        } else {
            nextBtn.innerHTML = 'Siguiente →';
        }
    },

    nextStep() {
        this.saveProgress();
        
        if (this.data.currentStep < this.steps.length - 1) {
            this.data.currentStep++;
            this.render();
        } else {
            this.generateAnalysis();
        }
    },

    previousStep() {
        if (this.data.currentStep > 0) {
            this.data.currentStep--;
            this.render();
        }
    },

    saveProgress() {
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
            this.showSaveIndicator();
            this.data.hasUnsavedChanges = false;
            (document.getElementById('saveBtn') as HTMLElement).style.display = 'none';
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
            alert('Error: No se pudo guardar tu progreso. Es posible que el almacenamiento local esté deshabilitado o lleno.');
        }
    },

    showSaveIndicator() {
        const indicator = document.getElementById('saveIndicator');
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 2000);
    },

    loadProgress() {
        let savedData = null;
        try {
            const localData = localStorage.getItem('iagen_progress');
            if (localData) {
                savedData = JSON.parse(localData);
            }
        } catch (e) {
            console.warn('Error loading from localStorage:', e);
        }
        
        if (savedData) {
            this.data.sessionId = savedData.sessionId;
            this.data.currentStep = savedData.currentStep || 0;
            this.data.responses = savedData.responses || {};
            this.data.isCompleted = savedData.isCompleted || false;
            this.data.currentAnalysis = savedData.currentAnalysis || null;
            console.log('Progress loaded:', savedData);
        }
    },

    async generateAnalysis() {
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
        this.showResults(analysis);
        this.saveProgress();
    },

    showLoading() {
        document.getElementById('stepContent').classList.add('hidden');
        document.getElementById('navigationSection').classList.add('hidden');
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('loadingScreen').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loadingScreen').classList.add('hidden');
    },

    async callAI() {
        if (!this.data.aiConnected) {
            console.warn("AI not connected, returning fallback analysis.");
            return this.getFallbackAnalysis();
        }
    
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
        const schema = {
            type: Type.OBJECT,
            properties: {
              perfilProfesional: {
                type: Type.OBJECT,
                properties: {
                  resumen: { type: Type.STRING, description: "Análisis específico del perfil profesional del usuario." },
                  caracteristicas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tres características clave del perfil." },
                  madurezTecnologica: { type: Type.STRING, description: "Evaluación crítica del nivel de madurez tecnológica." }
                },
                required: ["resumen", "caracteristicas", "madurezTecnologica"]
              },
              analisisProductividad: {
                type: Type.OBJECT,
                properties: {
                  potencialMejora: { type: Type.STRING, description: "Análisis realista del potencial de mejora en la productividad." },
                  factoresClave: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tres factores clave para mejorar la productividad." },
                  sobrestimaciones: { type: Type.STRING, description: "Áreas donde el usuario podría estar sobrestimando el impacto de la IA." }
                },
                required: ["potencialMejora", "factoresClave", "sobrestimaciones"]
              },
              recomendaciones: {
                type: Type.OBJECT,
                properties: {
                  inmediatas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tres recomendaciones de acción inmediata." },
                  medianoPlazo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dos recomendaciones a mediano plazo." },
                  habilidades: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dos habilidades clave a desarrollar." }
                },
                required: ["inmediatas", "medianoPlazo", "habilidades"]
              },
              conclusiones: {
                type: Type.OBJECT,
                properties: {
                  sintesis: { type: Type.STRING, description: "Síntesis general del análisis." },
                  recomendacionPrincipal: { type: Type.STRING, description: "La recomendación más importante y accionable." },
                  perspectivas: { type: Type.STRING, description: "Perspectivas futuras para el perfil del usuario." }
                },
                required: ["sintesis", "recomendacionPrincipal", "perspectivas"]
              }
            }
          };
          
        const prompt = `Eres un experto académico chileno en transformación digital y análisis del impacto tecnológico. Tu tarea es analizar las respuestas de un usuario a una evaluación sobre el impacto de la Inteligencia Artificial Generativa (IAGen) en su trabajo. Proporciona un análisis crítico, constructivo y fundamentado. Las respuestas del usuario son:

        ${JSON.stringify(this.data.responses, null, 2)}
        
        Basado en estas respuestas, genera un análisis completo que siga estrictamente el esquema JSON proporcionado.`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.5,
                },
            });
    
            const jsonText = response.text.trim();
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            window.logMessage('error', 'Error en la llamada a la API de Gemini', error);
            return this.getFallbackAnalysis();
        }
    },

    getFallbackAnalysis() {
        return {
            perfilProfesional: {
                resumen: `Profesional del sector ${this.data.responses.sector || 'no especificado'} con experiencia ${this.data.responses.experiencia_ia || 'no definida'} en IA.`,
                caracteristicas: [
                    "Perfil en proceso de adopción tecnológica",
                    "Necesita mayor claridad en objetivos de IA",
                    "Requiere evaluación más detallada"
                ],
                madurezTecnologica: `Nivel declarado: ${this.data.responses.experiencia_ia || 'no especificado'}. Se requiere evaluación práctica.`
            },
            analisisProductividad: {
                potencialMejora: `Estima una mejora del ${this.data.responses.mejora_productividad || 0}% en productividad. Requiere validación práctica.`,
                factoresClave: [
                    "Automatización de tareas rutinarias",
                    "Mejora en procesos de redacción",
                    "Optimización de tiempo de análisis"
                ],
                sobrestimaciones: "Posible sobrestimación de la velocidad de implementación y beneficios inmediatos."
            },
            recomendaciones: {
                inmediatas: [
                    "Realizar capacitación básica en herramientas de IA",
                    "Definir casos de uso específicos",
                    "Establecer métricas de evaluación"
                ],
                medianoPlazo: [
                    "Implementar pilotos controlados",
                    "Desarrollar protocolos éticos"
                ],
                habilidades: [
                    "Prompt engineering",
                    "Evaluación crítica de outputs de IA"
                ]
            },
            conclusiones: {
                sintesis: "Perfil con potencial para implementación exitosa de IA, pero requiere enfoque más estructurado.",
                recomendacionPrincipal: "Desarrollar mayor conciencia crítica sobre implicancias éticas del uso de IA.",
                perspectivas: "Con preparación adecuada, puede lograr beneficios significativos manteniendo estándares éticos."
            }
        };
    },

    showResults(analysis) {
        this.data.chartsRendered = false;
        const productivityImprovement = this.data.responses.mejora_productividad || 0;

        const getIconForSection = (id) => this.steps.find(step => step.id === id)?.icon || '';
        const conclusionsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`;
        const recommendationsIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        const vizIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`;

        const sections = [
            {
                id: 'perfil_profesional',
                icon: getIconForSection('perfil_profesional'),
                title: 'Perfil profesional',
                content: `
                    <p>${analysis.perfilProfesional.resumen}</p>
                    <h4 style="color: var(--primary-dark); margin: 1.5rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Características clave:</h4>
                    <div class="tags-container">
                        ${analysis.perfilProfesional.caracteristicas.map(item => `<span class="tag">${item}</span>`).join('')}
                    </div>
                    <div class="highlight-box hb-perfil">
                        <strong>Madurez tecnológica:</strong>
                        <span>${analysis.perfilProfesional.madurezTecnologica}</span>
                    </div>
                `
            },
            {
                id: 'analisis_productividad',
                icon: getIconForSection('analisis_tareas'),
                title: 'Análisis de productividad',
                content: `
                    <div class="progress-circle-container">
                         <div class="progress-circle" style="--p:${productivityImprovement};" role="progressbar" aria-valuenow="${productivityImprovement}" aria-valuemin="0" aria-valuemax="100">
                           <span>${productivityImprovement}%</span>
                         </div>
                         <span>Potencial de mejora de productividad estimado</span>
                    </div>
                    <p>${analysis.analisisProductividad.potencialMejora}</p>
                    <h4 style="color: var(--primary-dark); margin: 1.5rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Factores clave:</h4>
                     <div class="tags-container">
                        ${analysis.analisisProductividad.factoresClave.map(item => `<span class="tag">${item}</span>`).join('')}
                    </div>
                    <div class="highlight-box hb-productividad">
                        <strong>⚠️ Punto de atención:</strong>
                        <span>${analysis.analisisProductividad.sobrestimaciones}</span>
                    </div>
                `
            },
            {
                id: 'recomendaciones',
                icon: recommendationsIcon,
                title: 'Recomendaciones',
                content: `
                    <h4 style="color: var(--primary-dark); margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Acciones inmediatas:</h4>
                    <ul class="result-list">
                        ${analysis.recomendaciones.inmediatas.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <h4 style="color: var(--primary-dark); margin: 1.5rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Mediano plazo:</h4>
                    <ul class="result-list">
                        ${analysis.recomendaciones.medianoPlazo.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <h4 style="color: var(--primary-dark); margin: 1.5rem 0 0.5rem 0; font-size: 1rem; font-weight: 600;">Habilidades a desarrollar:</h4>
                    <ul class="result-list">
                        ${analysis.recomendaciones.habilidades.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                `
            },
            {
                id: 'conclusiones',
                icon: conclusionsIcon,
                title: 'Conclusiones',
                content: `
                    <div style="margin-bottom: 1.5rem;">
                        <strong>Síntesis general:</strong>
                        <p>${analysis.conclusiones.sintesis}</p>
                    </div>
                    <div class="highlight-box hb-perfil" style="margin-bottom: 1.5rem;">
                        <strong>Recomendación principal:</strong>
                        <p>${analysis.conclusiones.recomendacionPrincipal}</p>
                    </div>
                    <div>
                        <strong>Perspectivas futuras:</strong>
                        <p>${analysis.conclusiones.perspectivas}</p>
                    </div>
                `
            },
            {
                id: 'visualizacion',
                icon: vizIcon,
                title: 'Visualización de datos',
                content: `
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h4>Distribución de tareas</h4>
                            <canvas id="taskChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h4>Perfil laboral</h4>
                            <canvas id="profileChart"></canvas>
                        </div>
                        <div class="chart-container full-width">
                            <h4>Barreras percibidas</h4>
                            <canvas id="barriersChart"></canvas>
                        </div>
                    </div>
                `
            }
        ];

        let accordionHtml = sections.map((section, index) => `
            <div class="accordion-item ${index === 0 ? 'active' : ''}" data-id="${section.id}">
                <button class="accordion-header" onclick="app.toggleAccordion(this)" aria-expanded="${index === 0 ? 'true' : 'false'}">
                    <span class="accordion-title-icon">${section.icon}</span>
                    <span>${section.title}</span>
                    <span class="accordion-icon" aria-hidden="true"></span>
                </button>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        ${section.content}
                    </div>
                </div>
            </div>
        `).join('');

        const html = `
            <div style="text-align: center; margin-bottom: 2.5rem;">
                <div class="header-icon">✨</div>
                <h1 style="color: var(--primary-dark);">Análisis de Impacto: IAGen</h1>
                <p style="color: var(--text-muted);">Evaluación personalizada generada ${this.data.aiConnected ? 'con IA avanzada (Gemini)' : 'con análisis local'}</p>
            </div>
            
            <div class="results-accordion">
                ${accordionHtml}
            </div>
            
            <div style="text-align: center; margin-top: 2.5rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="app.restart()">🔄 Reiniciar evaluación</button>
                <button class="btn pdf-btn" onclick="app.downloadPDF()">📄 Descargar PDF</button>
                <button class="btn btn-primary" onclick="app.openModal('infoModal')">ℹ️ Sobre la herramienta</button>
            </div>
        `;
        
        document.getElementById('resultsContainer').innerHTML = html;
        document.getElementById('stepContent').classList.add('hidden');
        document.getElementById('navigationSection').classList.add('hidden');
        document.getElementById('progressSection').classList.add('hidden');
        document.getElementById('resultsContainer').classList.remove('hidden');

        // Set initial height for active accordion
        const activeItem = document.querySelector('.accordion-item.active .accordion-content');
        if (activeItem) {
            (activeItem as HTMLElement).style.maxHeight = activeItem.scrollHeight + "px";
        }
    },

    toggleAccordion(headerElement) {
        const item = headerElement.closest('.accordion-item');
        if (!item) return;

        const content = item.querySelector('.accordion-content') as HTMLElement;
        const isActive = item.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.accordion-item').forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                (otherItem.querySelector('.accordion-content') as HTMLElement).style.maxHeight = null;
            }
        });

        // Toggle the clicked item
        if (isActive) {
            item.classList.remove('active');
            headerElement.setAttribute('aria-expanded', 'false');
            content.style.maxHeight = null;
        } else {
            item.classList.add('active');
            headerElement.setAttribute('aria-expanded', 'true');
            content.style.maxHeight = content.scrollHeight + 'px';

            if (item.dataset.id === 'visualizacion' && !this.data.chartsRendered) {
                this.renderCharts();
                this.data.chartsRendered = true;
            }
        }
    },
    
    renderCharts() {
        if (!window.Chart) {
            console.error("Chart.js not loaded");
            return;
        }

        // --- Chart 1: Task Distribution (Bar) ---
        const taskCtx = (document.getElementById('taskChart') as HTMLCanvasElement)?.getContext('2d');
        if (taskCtx) {
            new window.Chart(taskCtx, {
                type: 'bar',
                data: {
                    labels: ['Tareas rutinarias', 'Tareas creativas'],
                    datasets: [{
                        label: '% del tiempo',
                        data: [
                            this.data.responses.tareas_rutinarias || 0,
                            this.data.responses.tareas_creativas || 0
                        ],
                        backgroundColor: [
                            'rgba(108, 117, 125, 0.7)', // secondary
                            'rgba(0, 123, 255, 0.7)'  // primary
                        ],
                        borderColor: [
                            '#6c757d',
                            '#007BFF'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } },
                    plugins: { legend: { display: false } }
                }
            });
        }

        // --- Chart 2: Profile (Radar) ---
        const profileCtx = (document.getElementById('profileChart') as HTMLCanvasElement)?.getContext('2d');
        if (profileCtx) {
             new window.Chart(profileCtx, {
                type: 'radar',
                data: {
                    labels: ['Productividad estimada', 'Enfoque creativo', 'Potencial de automatización'],
                    datasets: [{
                        label: 'Perfil laboral',
                        data: [
                            this.data.responses.mejora_productividad || 0,
                            this.data.responses.tareas_creativas || 0,
                            this.data.responses.tareas_rutinarias || 0
                        ],
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        borderColor: '#007BFF',
                        pointBackgroundColor: '#007BFF',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#007BFF'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        r: {
                            angleLines: { display: false },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
        
        // --- Chart 3: Barriers (Doughnut) ---
        const barriersCtx = (document.getElementById('barriersChart') as HTMLCanvasElement)?.getContext('2d');
        const barriersData = this.data.responses.barreras_implementacion || [];
        if (barriersCtx && barriersData.length > 0) {
            new window.Chart(barriersCtx, {
                type: 'doughnut',
                data: {
                    labels: barriersData,
                    datasets: [{
                        label: 'Barreras',
                        data: barriersData.map(() => 1), // Equal weight for each
                        backgroundColor: [
                            'rgba(220, 53, 69, 0.8)', 'rgba(0, 123, 255, 0.8)',
                            'rgba(255, 193, 7, 0.8)', 'rgba(40, 167, 69, 0.8)',
                            'rgba(111, 66, 193, 0.8)', 'rgba(23, 162, 184, 0.8)',
                            'rgba(253, 126, 20, 0.8)'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                    }
                }
            });
        }
    },


    downloadPDF() {
        const jsPDFLib = window.jspdf;
        
        if (!jsPDFLib || !jsPDFLib.jsPDF || !jsPDFLib.autoTable) {
            alert('Error: La librería PDF no está disponible. Intenta recargar la página.');
            window.logMessage('error', 'jsPDF o jspdf-autotable no encontrados');
            return;
        }

        try {
            const { jsPDF } = jsPDFLib;
            const doc = new jsPDF();
            let currentY = 20;
            const margin = 20;
            const contentWidth = doc.internal.pageSize.getWidth() - (margin * 2);

            // --- HELPER FUNCTIONS ---
            const addPageIfNeeded = (spaceNeeded) => {
                if (currentY + spaceNeeded > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    currentY = margin;
                }
            };
            const addTitle = (text) => {
                doc.setFontSize(18);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#212529');
                doc.text(text, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
                currentY += 10;
            };
            const addSubtitle = (text) => {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#6c757d');
                doc.text(text, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
                currentY += 15;
            };
            const addSectionHeader = (text) => {
                addPageIfNeeded(20);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#007BFF');
                doc.text(text, margin, currentY);
                currentY += 6;
                doc.setDrawColor('#007BFF');
                doc.setLineWidth(0.5);
                doc.line(margin, currentY, margin + 50, currentY);
                currentY += 8;
            };
            const addBodyText = (text, options = { spaceAfter: 5 }) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#343a40');
                const lines = doc.splitTextToSize(text, contentWidth);
                addPageIfNeeded(lines.length * 7);
                doc.text(lines, margin, currentY);
                currentY += (lines.length * 5) + (options.spaceAfter || 5);
            };
            const addBulletList = (items, title) => {
                addPageIfNeeded(10 + items.length * 8);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#212529');
                doc.text(title, margin, currentY);
                currentY += 6;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                items.forEach(item => {
                    const bullet = '•';
                    const itemLines = doc.splitTextToSize(item, contentWidth - 5);
                    addPageIfNeeded(itemLines.length * 6);
                    doc.text(bullet, margin + 2, currentY);
                    doc.text(itemLines, margin + 5, currentY);
                    currentY += (itemLines.length * 5) + 3;
                });
                currentY += 5;
            };
            const addFooter = () => {
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    const text = `Página ${i} de ${pageCount} | Generado el ${new Date().toLocaleDateString('es-ES')} | Evaluación IAGen`;
                    doc.text(text, margin, doc.internal.pageSize.getHeight() - 10);
                }
            };
            
            const analysis = this.data.currentAnalysis;

            // --- PDF CONTENT ---
            addTitle('Análisis de Impacto: IAGen');
            addSubtitle(`Informe personalizado para sesión: ${this.data.sessionId.substring(0, 15)}...`);
            
            addSectionHeader("Resumen de respuestas");
            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Pregunta clave', 'Respuesta del usuario']],
                body: [
                    ['Sector profesional', this.data.responses.sector || 'N/A'],
                    ['Experiencia con IA', this.data.responses.experiencia_ia || 'N/A'],
                    ['% Tareas rutinarias', `${this.data.responses.tareas_rutinarias || 0}%`],
                    ['% Tareas creativas', `${this.data.responses.tareas_creativas || 0}%`],
                    ['Mejora de productividad estimada', `${this.data.responses.mejora_productividad || 0}%`],
                    ['Herramientas de interés', (this.data.responses.herramientas_interes || []).join(', ') || 'N/A'],
                ],
                theme: 'striped',
                headStyles: { fillColor: '#007BFF' },
                didDrawPage: (data) => { currentY = data.cursor.y + 10; }
            });

            addSectionHeader('Perfil profesional');
            addBodyText(analysis.perfilProfesional.resumen);
            addBulletList(analysis.perfilProfesional.caracteristicas, 'Características clave:');
            addBodyText(`Madurez tecnológica: ${analysis.perfilProfesional.madurezTecnologica}`, {spaceAfter: 10});
            
            addSectionHeader('Análisis de productividad');
            addBodyText(analysis.analisisProductividad.potencialMejora);
            addBulletList(analysis.analisisProductividad.factoresClave, 'Factores clave:');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#dc3545');
            addBodyText(`Punto de atención: ${analysis.analisisProductividad.sobrestimaciones}`, {spaceAfter: 10});
            
            addSectionHeader('Plan de acción recomendado');
            const recommendationsData = [];
            analysis.recomendaciones.inmediatas.forEach(item => recommendationsData.push(['Acción inmediata', item]));
            analysis.recomendaciones.medianoPlazo.forEach(item => recommendationsData.push(['Mediano plazo', item]));
            analysis.recomendaciones.habilidades.forEach(item => recommendationsData.push(['Habilidad a desarrollar', item]));

            jsPDFLib.autoTable(doc, {
                startY: currentY,
                head: [['Categoría', 'Recomendación específica']],
                body: recommendationsData,
                theme: 'grid',
                headStyles: { fillColor: '#28a745' },
                didDrawPage: (data) => { currentY = data.cursor.y + 10; }
            });

            addSectionHeader('Conclusiones finales');
            doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor('#212529');
            doc.text('Síntesis general:', margin, currentY); currentY += 6;
            addBodyText(analysis.conclusiones.sintesis);

            doc.setFontSize(11); doc.setFont('helvetica', 'bold');
            doc.text('Recomendación principal:', margin, currentY); currentY += 6;
            addBodyText(analysis.conclusiones.recomendacionPrincipal);
            
            doc.setFontSize(11); doc.setFont('helvetica', 'bold');
            doc.text('Perspectivas futuras:', margin, currentY); currentY += 6;
            addBodyText(analysis.conclusiones.perspectivas);

            addFooter();
            doc.save(`Evaluación_IAGen_${new Date().toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor intenta de nuevo.');
            window.logMessage('error', 'Error generando PDF', error);
        }
    },

    restart() {
        if (confirm('¿Estás seguro de que quieres iniciar una nueva evaluación? Se perderá el progreso actual.')) {
            this.data.currentStep = 0;
            this.data.responses = {};
            this.data.hasUnsavedChanges = false;
            this.data.isCompleted = false;
            this.data.currentAnalysis = null;
            this.data.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            try {
                localStorage.removeItem('iagen_progress');
            } catch (e) {
                console.warn('Error clearing storage:', e);
            }
            
            document.getElementById('resultsContainer').classList.add('hidden');
            document.getElementById('resultsContainer').innerHTML = '';
            document.getElementById('stepContent').classList.remove('hidden');
            document.getElementById('navigationSection').classList.remove('hidden');
            document.getElementById('progressSection').classList.remove('hidden');
            
            this.render();
        }
    },

    openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
};

// Make app global for onclick handlers
window.app = app;

// Initialize the app after the DOM is fully loaded
window.addEventListener('load', () => app.init());

window.addEventListener('beforeunload', (e) => {
    if (app.data.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
    }
});