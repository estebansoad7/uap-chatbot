# UAP Chatbot - Deploy en Render

## Pasos para deployar

### 1. Crear cuenta en Render
- Ir a https://render.com
- Registrarse con GitHub

### 2. Subir código a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/uap-chatbot-api.git
git push -u origin main
```

### 3. Crear Web Service en Render
- New > Web Service
- Conectar con tu repo de GitHub
- Seleccionar "Node"
- Build Command: `npm install`
- Start Command: `node server.js`
- Deploy

### 4. Obtener URL
- Render te dará una URL como: `https://uap-chatbot-api.onrender.com`
- Guardar esta URL

### 5. Configurar frontend
- Actualizar `public/index.html` con la URL del backend
- Deployar frontend a Vercel

## Estructura
```
uap-chatbot/
├── server.js          # Backend API
├── public/
│   └── index.html     # Frontend chat
├── package.json
└── render.yaml        # Config Render
```

## Notas
- El backend corre en puerto 10000 (Render lo asigna automáticamente)
- Frontend apunta a `https://uap-chatbot-api.onrender.com/api/chat`
