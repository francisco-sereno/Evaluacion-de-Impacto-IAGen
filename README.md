# Evaluación de Impacto: IAGen en el Día a Día
**Recurso Evaluativo con IA ─ VTI IA · Universidad de Chile**

Herramienta interactiva de análisis académico y profesional diseñada para diagnosticar, proyectar y evaluar de manera crítica el potencial impacto de la **Inteligencia Artificial Generativa (IAGen)** en el quehacer laboral y académico cotidiano. Utiliza la API de **Google Gemini (`@google/genai`)** con esquemas JSON estructurados para ofrecer retroalimentación personalizada, detección de sesgos o sobrestimaciones, visualización de datos y generación de reportes descargables en PDF.

---

## Características Principales

- **Diagnóstico Estructurado en 4 Dimensiones**:
  1. **Perfil profesional y contexto laboral**: Sector de desempeño, rol habitual y nivel de familiaridad con herramientas de IA.
  2. **Análisis de tareas y procesos**: Proporción de tareas rutinarias frente a creativas/analíticas, carga de redacción semanal y cuellos de botella en la productividad.
  3. **Escenarios de implementación de IAGen**: Selección de herramientas relevantes, identificación de barreras institucionales/técnicas/éticas y horizonte temporal de adopción.
  4. **Proyección de impactos**: Estimación de mejora en productividad, áreas de impacto positivo, riesgos éticos/operativos y brechas de habilidades.
- **Análisis Crítico Impulsado por IA**:
  - Integración directa con el modelo `gemini-2.5-flash` mediante `@google/genai`.
  - Evaluación estructurada del nivel de madurez tecnológica, potencial real de mejora, advertencias sobre posibles sobrestimaciones y plan de acción en el corto y mediano plazo.
  - Modo de respaldo (*fallback local*) automático cuando no se detecta conexión o clave de API configurada.
- **Visualización Interactiva de Datos**:
  - Gráficos dinámicos generados con **Chart.js** (distribución de tareas en barras, radar de perfil laboral y gráfico de anillo para barreras percibidas).
- **Persistencia Local y Exportación a PDF**:
  - Guardado automático y manual del progreso en el navegador (`localStorage`).
  - Generación de informes ejecutivos detallados en formato **PDF** mediante `jsPDF` y `jspdf-autotable`.

---

## Estructura del Proyecto

```text
├── index.html       # Interfaz principal, estilos (Glassmorphism) y modales informativos
├── index.tsx        # Lógica de estado, flujo de evaluación, integración con Gemini, gráficos y exportación PDF
├── config.js        # Parámetros de configuración general y utilidades de validación
├── vite.config.ts   # Configuración del servidor de desarrollo y empaquetado con Vite
├── package.json     # Dependencias y scripts del proyecto
├── tsconfig.json    # Configuración de TypeScript
└── metadata.json    # Metadatos de la aplicación
```

---

## Requisitos e Instalación Local

### Requisitos previos
- **Node.js** (versión 18 o superior recomendada)
- Una clave de API de **Google Gemini** (obtenible en [Google AI Studio](https://aistudio.google.com/))

### Pasos de instalación

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
   Crea o edita el archivo `.env.local` en la raíz del proyecto y define tu clave de API de Gemini:
   ```env
   GEMINI_API_KEY=tu_clave_api_de_gemini_aqui
   ```
   > **Nota de seguridad**: Nunca insertes tu clave de API directamente en el código fuente ni subas el archivo `.env.local` a repositorios públicos.

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

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3 (Diseño responsivo con Variables CSS y Glassmorphism), TypeScript
- **Bundler**: [Vite](https://vitejs.dev/)
- **Inteligencia Artificial**: [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai)
- **Visualización de Datos**: [Chart.js](https://www.chartjs.org/)
- **Generación de Documentos**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

---

## Créditos y Autoría

- **Autor**: **Francisco Sereño** — Profesor, Doctor (c) en Educación y Sociedad, Universitat de Barcelona.
- **LinkedIn**: [https://www.linkedin.com/in/franciscosereno](https://www.linkedin.com/in/franciscosereno)
- **Institución**: VTI IA · Universidad de Chile

---

## Licenciamiento

- **Código fuente**: Distribuido bajo la licencia **GNU General Public License v3.0 (GPL-3.0)**.
- **Contenido didáctico y metodológico**: Distribuido bajo la licencia **Creative Commons Atribución-NoComercial 4.0 Internacional (CC BY-NC 4.0)**.

© VTI IA ─ Universidad de Chile
