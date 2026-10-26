/**
 * Configuración Simplificada para IAGen Evaluation Tool
 */

// Configuración de la aplicación
var APP_CONFIG = {
    version: '1.1.0',
    name: 'IAGen Evaluation Tool',
    debug: false,  // Cambiar a true solo para desarrollo
    
    // Configuración de análisis de fallback
    fallbackEnabled: true,
    retryAttempts: 2,
    timeoutMs: 30000
};

// Función de logging simple
function logMessage(level, message, data) {
    if (APP_CONFIG.debug || level === 'error') {
        var timestamp = new Date().toISOString();
        console[level]('[IAGen-' + level.toUpperCase() + '] ' + timestamp + ' - ' + message, data || '');
    }
}

// Función de validación al cargar
function validateConfiguration() {
    var results = {
        app: !!(APP_CONFIG.version && APP_CONFIG.name)
    };
    
    if (APP_CONFIG.debug) {
        logMessage('info', 'Validación de configuración', results);
    }
    
    return results;
}

// Auto-validación al cargar
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        setTimeout(function() {
            validateConfiguration();
            logMessage('info', 'IAGen Evaluation Tool cargado - v' + APP_CONFIG.version);
        }, 100);
    });
    
    // Exportar configuraciones globalmente
    window.APP_CONFIG = APP_CONFIG;
    window.logMessage = logMessage;
}
