const express = require('express');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const sass = require('sass');

const app = express();
const PORT = 8080;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Process SCSS files
app.get('/assets/css/style.css', (req, res) => {
  try {
    const scssFilePath = path.join(__dirname, 'assets', 'css', 'style.scss');
    const scssContent = fs.readFileSync(scssFilePath, 'utf8');
    
    // Remove Jekyll front matter
    const cleanedScssContent = scssContent.replace(/^---\n.*?\n---\n/s, '');
    
    // Replace Jekyll liquid tags with placeholder values
    const processedScss = cleanedScssContent.replace(/\{\{\s*site\.theme\s*\}\}/, 'base');
    
    // Compile SCSS to CSS
    const result = sass.compileString(processedScss);
    
    res.setHeader('Content-Type', 'text/css');
    res.send(result.css);
  } catch (error) {
    console.error('SCSS compilation error:', error);
    res.status(500).send('Error compiling SCSS');
  }
});

// Special handling for index.md - convert to HTML
app.get('/', (req, res) => {
  try {
    const mdFilePath = path.join(__dirname, 'index.md');
    let mdContent = fs.readFileSync(mdFilePath, 'utf8');
    
    // Remove Jekyll front matter
    mdContent = mdContent.replace(/^---\n.*?\n---\n/s, '');
    
    // Convert Markdown to HTML
    const htmlContent = marked.parse(mdContent);
    
    // Create a basic HTML structure with the style.css link
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dr. Isha Jain</title>
        <link rel="stylesheet" href="/assets/css/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      </head>
      <body>
        <div class="main-content">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(fullHtml);
  } catch (error) {
    console.error('Error processing index.md:', error);
    res.status(500).send('Error processing Markdown');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});