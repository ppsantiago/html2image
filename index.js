const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;
const token = "333"

// Ruta para servir contenido estático (archivo HTML y otros recursos)
app.use(express.static('public'));

// Ruta para generar la imagen a partir del HTML y guardarla en disco
app.post('/generate-image', async (req, res) => {


  
  if (req.headers.token !== token) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  const {title, img} = req.query
  console.log(img)
  console.log(title)
  if (!title || !img) {
    res.status(400).send('Bad Request');
    return;
  }

  console.log(img)
  console.log(title)
  const slug = title.replace(/ /g, '-').toLowerCase();

  try {
    // Ruta al archivo HTML en la carpeta 'public'
    const filePath = path.join(__dirname, 'public', 'template.html');
    
    // Lee el archivo HTML
    const htmlContent = fs.readFileSync(filePath, 'utf8');

    // Reemplaza los valores en el archivo HTML
    const newHtmlContent = htmlContent
      .replace(/{{title}}/g, title)
      .replace(/{{url}}/g, img);

      console.log(newHtmlContent)
    // Inicia Puppeteer
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    
    // Establece el contenido HTML
    await page.setContent(newHtmlContent);

    // Establece el tamaño de la página
    await page.setViewport({ width: 1024, height: 1024 });

    // Define la ruta donde se guardará la imagen
    const outputFilePath = path.join(__dirname, 'output', `${slug}-output.png`);

    // Crea la carpeta 'output' si no existe
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Genera la captura de pantalla en formato PNG y la guarda en disco
    await page.screenshot({ path: outputFilePath, type: 'png' });

    // Cierra el navegador
    await browser.close();

    console.log(`Imagen guardada en: ${outputFilePath}`);

    // Envía el archivo de imagen generado al cliente
    res.sendFile(outputFilePath);
    
  } catch (error) {
    console.error('Error al generar la imagen:', error);
    res.status(500).send('Error al generar la imagen');
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});

