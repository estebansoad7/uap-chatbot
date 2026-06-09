# UAP Chatbot - Guía de Deploy

## Estado Actual

### Frontend (Vercel)
- URL: https://uap-chatbot-deploy.vercel.app
- Status: ✅ Activo

### Backend (Localtunnel)
- URL: https://thin-keys-clap.loca.lt
- Status: ⚠️ Temporal

## Migrar a Ngrok (Recomendado)

### 1. Crear cuenta
- https://dashboard.ngrok.com/signup

### 2. Obtener token
- https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Configurar
```bash
ngrok config add-authtoken TU_TOKEN
```

### 4. Ejecutar
```bash
ngrok http 3000
```

### 5. Actualizar frontend
- Editar `public/index.html`
- Cambiar `API_URL` por la nueva URL de ngrok
- Deployar a Vercel

## Comandos útiles

### Iniciar todo
```bash
cd ~/.openclaw/workspace/uap-chatbot
node server.js &
lt --port 3000
```

### Deployar frontend
```bash
cp public/index.html /tmp/uap-chatbot-deploy/
cd /tmp/uap-chatbot-deploy
vercel --prod
```

## Notas
- Localtunnel es temporal (cambia URL cada vez)
- Ngrok con cuenta gratuita da URLs más estables
- El backend necesita que la Mac esté encendida
