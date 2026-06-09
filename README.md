# Porra Mundial 2026

Web estática para consultar partidos, grupos, fase final, preguntas y ranking desde Google Sheets publicado como CSV.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Publicar

### Vercel
Sube el repo a GitHub e impórtalo en Vercel. Build command: `npm run build`. Output: `dist`.

### GitHub Pages
1. En `vite.config.js`, cambia `base: '/'` por `base: '/NOMBRE_REPO/'`.
2. Ejecuta `npm run build`.
3. Publica la carpeta `dist` con GitHub Pages o con GitHub Actions.

## Login
Usuario: `porra`
Contraseña: `mundial2026`

Esto no es seguridad real; solo barrera visual para una web estática.
