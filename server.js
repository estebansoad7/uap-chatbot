const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Almacenar sesiones activas
const sessions = new Map();

// Endpoint para chat
app.post('/api/chat', async (req, res) => {
    const { message, sessionId = 'uap-web-' + Date.now() } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Mensaje requerido' });
    }
    
    try {
        // Enviar mensaje al agente OpenClaw usando spawn
        const result = await sendToAgent(sessionId, message);
        res.json({ response: result, sessionId });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error procesando mensaje', details: error.message });
    }
});

function sendToAgent(sessionId, message) {
    return new Promise((resolve, reject) => {
        // Usar openclaw agent para enviar mensaje al agente uap-chatbot
        const args = [
            'agent',
            '--agent', 'uap-chatbot',
            '--session-id', sessionId,
            '--message', message,
            '--json'
        ];
        
        const child = spawn('openclaw', args, {
            timeout: 30000,
            env: { ...process.env }
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            if (code !== 0) {
                console.error('Error ejecutando openclaw:', errorOutput);
                // Si falla, usar respuesta fallback
                resolve(getFallbackResponse(message));
                return;
            }
            
            try {
                // Intentar parsear JSON
                const jsonResponse = JSON.parse(output);
                if (jsonResponse.result && jsonResponse.result.payloads && jsonResponse.result.payloads[0]) {
                    resolve(jsonResponse.result.payloads[0].text || jsonResponse.result.payloads[0].content || output.trim());
                } else if (jsonResponse.text || jsonResponse.content) {
                    resolve(jsonResponse.text || jsonResponse.content);
                } else {
                    resolve(output.trim() || getFallbackResponse(message));
                }
            } catch (e) {
                // Si no es JSON, usar texto plano
                const cleanOutput = output.trim() || getFallbackResponse(message);
                resolve(cleanOutput);
            }
        });
        
        child.on('error', (error) => {
            console.error('Error spawn:', error);
            resolve(getFallbackResponse(message));
        });
    });
}

function getFallbackResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes('hola')) {
        return '¡Hola! 👋 Soy el asistente de Admisiones de la Universidad Autónoma del Paraguay (UAP).\n\n¿Buscás carrera de grado o posgrado? ¿O querés información sobre algún programa específico?';
    }
    if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuánto')) {
        return '💰 **Precios actualizados:**\n\n**Diplomados Online:**\n• Gs. 3.500.000 total\n• Con 30% descuento: Gs. 2.450.000\n• 5 cuotas de Gs. 490.000\n\n**Especializaciones/Maestrías/Doctorados:**\n• Desde Gs. 500.000\n• Cuotas según duración\n\n¿Te interesa algún programa en particular?';
    }
    if (lower.includes('salud')) {
        return '🏥 **Carreras de Salud:**\n\n**Grado:**\n• Odontología (10 semestres)\n• Fisioterapia\n• Podología\n• Fonoaudiología\n• Psicología\n• Óptica y Contactología\n• Prótesis Dental\n\n**Posgrados:**\n• Especialización en Psicología Clínica\n• Especialización en Endodoncia\n• Maestría en Ciencias Odontológicas\n• Doctorado en Ciencias Odontológicas\n\n¿Te interesa alguno?';
    }
    if (lower.includes('negocio') || lower.includes('admin')) {
        return '💼 **Carreras de Negocios:**\n\n**Grado:**\n• Administración de Empresas\n• Ciencias Contables\n• Marketing y Publicidad\n\n**Diplomados:**\n• Comunicación Estratégica\n• Business Analytics\n• Gestión de Personas\n\n¿Cuál te interesa?';
    }
    if (lower.includes('tecnología') || lower.includes('data') || lower.includes('python')) {
        return '💻 **Tecnología:**\n\n**Diplomados Online:**\n• Python y Data Science\n• Inteligencia Artificial\n• Arquitectura de Software\n• Business Analytics\n\nTodos de 5 meses, online, con 30% descuento.\n\n¿Te interesa alguno?';
    }
    return 'Entiendo. ¿Podés darme más detalles sobre lo que necesitás? Podés preguntarme por:\n• Áreas (Salud, Negocios, Tecnología, Educación)\n• Tipos de programa (Grado, Diplomado, Especialización, Maestría, Doctorado)\n• Precios\n• Programas específicos';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor UAP Chatbot corriendo en http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}/`);
    console.log(`🔌 API: http://localhost:${PORT}/api/chat`);
});
