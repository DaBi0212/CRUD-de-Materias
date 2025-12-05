const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist/web-movil-escolar-webapp')));

// Todas las rutas redirigen a index.html (SPA Angular)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/web-movil-escolar-webapp', 'index.html'));
});

// Puerto por defecto de Vercel o 3000 para local
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor Angular corriendo en puerto ${port}`);
});
