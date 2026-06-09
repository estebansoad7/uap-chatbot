const express = require('express');
const cors = require('cors');
const { WebSocket } = require('ws');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del Gateway OpenClaw
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'wss://mac-mini-de-esteban.tail95199b.ts.net/ws';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

// Almacenar sesiones WebSocket
const sessions = new Map();

// Endpoint para chat
app.post('/api/chat', async (req, res) => {
    const { message, sessionId = 'uap-web-' + Date.now() } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Mensaje requerido' });
    }
    
    try {
        // Usar fallback local si no hay conexión al gateway
        const result = await sendToAgent(sessionId, message);
        res.json({ response: result, sessionId });
    } catch (error) {
        console.error('Error:', error);
        // Fallback a respuestas locales
        const fallback = getFallbackResponse(message);
        res.json({ response: fallback, sessionId, fallback: true });
    }
});

function sendToAgent(sessionId, message) {
    return new Promise((resolve, reject) => {
        // Por ahora, usar respuestas fallback inteligentes
        // En producción, esto se conectará vía WebSocket al Gateway
        const response = getFallbackResponse(message);
        resolve(response);
    });
}

function getFallbackResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hey')) {
        return '¡Hola! 👋 Soy tu asistente de Admisiones de la Universidad Autónoma del Paraguay (UAP).\n\n¿Buscás carrera de grado o posgrado? ¿O querés información sobre algún programa específico?';
    }
    
    if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuánto') || lower.includes('valor')) {
        return '💰 **Precios actualizados:**\n\n**Diplomados Online:**\n• Gs. 3.500.000 total\n• Con 30% descuento: Gs. 2.450.000\n• 5 cuotas de Gs. 490.000\n\n**Especializaciones/Maestrías/Doctorados:**\n• Desde Gs. 500.000\n• Cuotas según duración\n\n¿Te interesa algún programa en particular?';
    }
    
    if (lower.includes('salud') || lower.includes('medicina') || lower.includes('doctor')) {
        return '🏥 **Carreras de Salud:**\n\n**Grado:**\n• Odontología (10 semestres)\n• Fisioterapia\n• Podología\n• Fonoaudiología\n• Psicología\n• Óptica y Contactología\n• Prótesis Dental\n\n**Posgrados:**\n• Especialización en Psicología Clínica\n• Especialización en Endodoncia\n• Maestría en Ciencias Odontológicas\n• Doctorado en Ciencias Odontológicas\n\n¿Te interesa alguno?';
    }
    
    if (lower.includes('negocio') || lower.includes('admin') || lower.includes('empresa') || lower.includes('contable') || lower.includes('marketing')) {
        return '💼 **Carreras de Negocios:**\n\n**Grado:**\n• Administración de Empresas\n• Ciencias Contables\n• Marketing y Publicidad\n\n**Diplomados:**\n• Comunicación Estratégica\n• Business Analytics\n• Gestión de Personas\n\n¿Cuál te interesa?';
    }
    
    if (lower.includes('tecnología') || lower.includes('data') || lower.includes('python') || lower.includes('software') || lower.includes('inteligencia artificial') || lower.includes('ia')) {
        return '💻 **Tecnología:**\n\n**Diplomados Online:**\n• Python y Data Science\n• Inteligencia Artificial\n• Arquitectura de Software\n• Business Analytics\n\nTodos de 5 meses, online, con 30% descuento.\n\n¿Te interesa alguno?';
    }
    
    if (lower.includes('grado') || lower.includes('licenciatura') || lower.includes('carrera')) {
        return '🎓 **Carreras de Grado (Licenciaturas):**\n\n**Salud:**\n• Odontología (10 semestres)\n• Fisioterapia\n• Podología\n• Fonoaudiología\n• Psicología\n• Óptica y Contactología\n• Prótesis Dental\n\n**Negocios:**\n• Administración de Empresas\n• Ciencias Contables\n• Marketing y Publicidad\n\n¿Te interesa alguna área?';
    }
    
    if (lower.includes('posgrado') || lower.includes('diplomado') || lower.includes('especialización') || lower.includes('maestría') || lower.includes('doctorado')) {
        return '📚 **Posgrados UAP:**\n\n**Diplomados (38 programas):**\n• Python y Data Science\n• Inteligencia Artificial\n• Business Analytics\n• Comunicación Estratégica\n• Gestión de Personas\n• Neuroeducación\n• Y muchos más...\n\n**Especializaciones:**\n• Endodoncia\n• Psicología Clínica\n• Cirugía Oral\n• Periodoncia\n• Rehabilitación Oral\n\n**Maestrías:**\n• Ciencias Odontológicas\n• Psicología con menciones\n\n**Doctorados:**\n• Ciencias Odontológicas\n• Psicología\n\n¿Te interesa alguno? Te puedo dar más detalles.';
    }
    
    if (lower.includes('contacto') || lower.includes('teléfono') || lower.includes('llamar') || lower.includes('asesor') || lower.includes('humano')) {
        return '📞 **Contacto con asesor humano:**\n\nPerfecto, voy a conectarte con uno de nuestros asesores de admisiones.\n\nPara poder ayudarte mejor, ¿me podés dar:\n• Tu nombre completo\n• Número de WhatsApp\n• Programa de interés\n• Mejor horario para contactarte\n\nUn asesor se comunicará con vos pronto.';
    }
    
    if (lower.includes('gracias') || lower.includes('thank')) {
        return '¡De nada! 😊 Estoy acá para lo que necesites. ¿Hay algo más en lo que pueda ayudarte?';
    }
    
    return 'Entiendo. ¿Podés darme más detalles sobre lo que necesitás? Podés preguntarme por:\n• Áreas (Salud, Negocios, Tecnología, Educación)\n• Tipos de programa (Grado, Diplomado, Especialización, Maestría, Doctorado)\n• Precios\n• Programas específicos\n• Contacto con asesor';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor UAP Chatbot corriendo en puerto ${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}/`);
    console.log(`🔌 API: http://localhost:${PORT}/api/chat`);
});
