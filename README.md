# Evaluación de impacto: IAGen en el día a día

Herramienta interactiva de análisis académico y profesional diseñada para diagnosticar, proyectar y evaluar de manera crítica el potencial impacto de la inteligencia artificial generativa (IAGen) en el quehacer laboral cotidiano.

El recurso combina un cuestionario estructurado con un motor de análisis basado en la API de Google Gemini (`@google/genai`), generando retroalimentación personalizada, detección de posibles sesgos o sobrestimaciones, visualizaciones gráficas interactivas y un informe ejecutivo descargable en formato PDF.

---

## Propósito y enfoque metodológico

La adopción de herramientas de inteligencia artificial generativa suele estar acompañada tanto de expectativas desmedidas como de resistencias institucionales o éticas. Este instrumento propone un ejercicio de reflexión guiada que permite al usuario:

1. Mapear la composición real de su carga de trabajo (tareas rutinarias frente a tareas analíticas y creativas).
2. Identificar cuellos de botella operativos susceptibles de optimización o asistencia tecnológica.
3. Contrastar sus expectativas de mejora productiva con un análisis crítico automatizado que advierte sobre riesgos de dependencia tecnológica, brechas de competencias y desafíos éticos.

---

## Características principales

- **Diagnóstico estructurado en cuatro dimensiones**:
  1. **Perfil profesional y contexto laboral**: sector de desempeño, descripción del rol habitual y nivel actual de familiaridad con herramientas de IA.
  2. **Análisis de tareas y procesos**: proporción de labores rutinarias frente a creativas, dedicación semanal a la redacción de documentos e identificación de los principales cuellos de botella.
  3. **Escenarios de implementación de IAGen**: selección de herramientas pertinentes según el rol, reconocimiento de barreras de adopción (éticas, técnicas, institucionales o de privacidad) y estimación del horizonte de implementación.
  4. **Proyección de impactos**: estimación porcentual de mejora en la productividad, áreas de impacto positivo esperado, preocupaciones identificadas y nuevas habilidades requeridas.
- **Evaluación crítica mediante IA generativa**:
  - Integración con el modelo `gemini-2.5-flash` utilizando esquemas de respuesta estructurados (`responseSchema` en formato JSON).
  - Generación de un diagnóstico dividido en cuatro ejes: *perfil profesional y madurez tecnológica*, *análisis realista de productividad y posibles sobrestimaciones*, *plan de recomendaciones (acciones inmediatas, mediano plazo y habilidades)* y *conclusiones estratégicas*.
  - Sistema de respaldo (*fallback* local) que garantiza la entrega de una evaluación base incluso cuando la aplicación se ejecuta sin conexión a la API.
- **Visualización dinámica de resultados**:
  - Gráficos interactivos renderizados con Chart.js que representan la distribución temporal de tareas, el radar de perfil laboral y la proporción de barreras percibidas.
- **Privacidad, persistencia local y exportación documental**:
  - Almacenamiento automático y manual del avance de la sesión directamente en el navegador del usuario (`localStorage`), sin enviar datos personales a servidores intermedios.
  - Generación de un informe completo en formato PDF mediante jsPDF y jsPDF-AutoTable, listo para su archivo o uso en actividades de formación y docencia.

---

## Estructura del proyecto

```text
├── index.html       # Estructura principal, estilos (glassmorphism) y ventana modal informativa
├── index.tsx        # Lógica de la aplicación, flujo de pasos, conexión con Gemini, gráficos y exportación a PDF
├── config.js        # Parámetros generales de configuración y registro de eventos
├── vite.config.ts   # Configuración del entorno de desarrollo y empaquetado con Vite
├── package.json     # Declaración de dependencias y scripts de ejecución
├── tsconfig.json    # Configuración del compilador de TypeScript
└── metadata.json    # Metadatos descriptivos de la aplicación
```

---

## Requisitos e instalación local

### Requisitos previos
- **Node.js** (versión 18 o superior recomendada).
- Una clave de API de **Google Gemini**, que puede obtenerse en [Google AI Studio](https://aistudio.google.com/).

### Pasos de instalación y uso

1. **Clonar o descargar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-del-directorio>
   ```

2. **Instalar las dependencias**:
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno**:
   Crea o edita el archivo `.env.local` en la raíz del proyecto e incorpora tu clave de API:
   ```env
   GEMINI_API_KEY=tu_clave_api_de_gemini_aqui
   ```
   > **Nota de seguridad**: Nunca incluyas tu clave de API directamente en el código fuente ni subas el archivo `.env.local` a un repositorio público. Si no se configura una clave, la herramienta funcionará automáticamente en modo de análisis local.

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

5. **Compilar para producción**:
   ```bash
   npm run build
   npm run preview
   ```

---

## Tecnologías utilizadas

- **Interfaz y lógica de cliente**: HTML5, CSS3 (variables nativas, diseño adaptable y efectos *glassmorphism*) y TypeScript.
- **Entorno de construcción**: [Vite](https://vitejs.dev/).
- **Inteligencia artificial**: [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai).
- **Visualización de datos**: [Chart.js](https://www.chartjs.org/).
- **Generación de informes PDF**: [jsPDF](https://github.com/parallax/jsPDF) y [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable).

---

## Créditos y autoría

- **Autor**: Francisco Sereño — Profesor, doctor (c) en Educación y Sociedad, Universitat de Barcelona.
- **LinkedIn**: [https://www.linkedin.com/in/franciscosereno](https://www.linkedin.com/in/franciscosereno)

---

## Licenciamiento

- **Código fuente**: distribuido bajo la licencia **GNU General Public License v3.0 (GPL-3.0)**.
- **Contenido didáctico y metodológico**: distribuido bajo la licencia **Creative Commons Atribución-NoComercial 4.0 Internacional (CC BY-NC 4.0)**.
