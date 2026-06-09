const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Gateway OpenClaw remoto (via Tailscale)
const GATEWAY_URL = 'https://mac-mini-de-esteban.tail95199b.ts.net';

// Endpoint para chat
app.post('/api/chat', async (req, res) => {
    const { message, sessionId = 'uap-web-' + Date.now() } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Mensaje requerido' });
    }
    
    try {
        const result = await sendToAgent(sessionId, message);
        res.json({ response: result, sessionId });
    } catch (error) {
        console.error('Error:', error);
        // Fallback si falla la conexión
        const fallback = getFallbackResponse(message);
        res.json({ response: fallback, sessionId, fallback: true });
    }
});

function sendToAgent(sessionId, message) {
    return new Promise((resolve, reject) => {
        // Construir el payload para OpenClaw Gateway
        const payload = {
            kind: 'userTurn',
            agentId: 'uap-chatbot',
            sessionId: sessionId,
            text: message,
            userId: 'web-user-' + sessionId
        };

        // Enviar vía HTTPS POST al Gateway
        const data = JSON.stringify(payload);
        
        const options = {
            hostname: 'mac-mini-de-esteban.tail95199b.ts.net',
            path: '/v1/agent/turn',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
            rejectUnauthorized: false // Para Tailscale self-signed cert
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    const response = extractResponse(json);
                    resolve(response || getFallbackResponse(message));
                } catch (e) {
                    console.error('Parse error:', e);
                    resolve(getFallbackResponse(message));
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e);
            resolve(getFallbackResponse(message));
        });

        req.write(data);
        req.end();
    });
}

function extractResponse(json) {
    // Extraer texto de la respuesta del Gateway
    if (json.result && json.result.payloads && json.result.payloads[0]) {
        return json.result.payloads[0].text || json.result.payloads[0].content;
    }
    if (json.text) return json.text;
    if (json.content) return json.content;
    return null;
}

function getFallbackResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('hola') || lower.includes('buenas')) {
        return '¡Hola! 👋 Soy tu asistente de Admisiones de la Universidad Autónoma del Paraguay (UAP).\n\n¿Buscás carrera de grado o posgrado? ¿O querés información sobre algún programa específico?';
    }
    
    if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuánto')) {
        return '💰 **Precios actualizados:**\n\n**Diplomados Online:**\n• Gs. 3.500.000 total\n• Con 30% descuento: Gs. 2.450.000\n• 5 cuotas de Gs. 490.000\n\n**Especializaciones/Maestrías/Doctorados:**\n• Desde Gs. 500.000\n• Cuotas según duración\n\n¿Te interesa algún programa en particular?';
    }
    
    if (lower.includes('salud')) {
        return '🏥 **Carreras de Salud:**\n\n**Grado:**\n• Odontología (10 semestres)\n• Fisioterapia\n• Podología\n• Fonoaudiología\n• Psicología\n• Óptica y Contactología\n• Prótesis Dental\n\n**Posgrados:**\n• Especialización en Psicología Clínica\n• Especialización en Endodoncia\n• Maestría en Ciencias Odontológicas\n• Doctorado en Ciencias Odontológicas\n\n¿Te interesa alguno?';
    }
    
    if (lower.includes('negocio') || lower.includes('admin') || lower.includes('empresa')) {
        return '💼 **Carreras de Negocios:**\n\n**Grado:**\n• Administración de Empresas\n• Ciencias Contables\n• Marketing y Publicidad\n\n**Diplomados:**\n• Comunicación Estratégica\n• Business Analytics\n• Gestión de Personas\n\n¿Cuál te interesa?';
    }
    
    if (lower.includes('tecnología') || lower.includes('data') || lower.includes('python')) {
        return '💻 **Tecnología:**\n\n**Diplomados Online:**\n• Python y Data Science\n• Inteligencia Artificial\n• Arquitectura de Software\n• Business Analytics\n\nTodos de 5 meses, online, con 30% descuento.\n\n¿Te interesa alguno?';
    }
    
    return 'Entiendo. ¿Podés darme más detalles sobre lo que necesitás? Podés preguntarme por:\n• Áreas (Salud, Negocios, Tecnología, Educación)\n• Tipos de programa (Grado, Diplomado, Especialización, Maestría, Doctorado)\n• Precios\n• Programas específicos';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor UAP Chatbot corriendo en puerto ${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}/`);
    console.log(`🔌 API: http://localhost:${PORT}/api/chat`);
    console.log(`🌐 Gateway: ${GATEWAY_URL}`);
});
