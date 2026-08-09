const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const filesToUpdate = [
  'index.html',
  'admin.html',
  'cajero.html',
  'corte.html',
  'mesas.html',
  'mesero.html',
  'pagos.html',
  'pedidos.html',
  'platillos.html',
  'usuarios.html'
];

for (const file of filesToUpdate) {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add favicon
    const faviconTag = '\n    <link rel="icon" type="image/png" href="/img/Logo.png">';
    if (!content.includes('rel="icon"')) {
      content = content.replace(/(<title>.*?<\/title>)/i, `$1${faviconTag}`);
    }

    // Replace Pizzería and Pizzeria in texts
    content = content.replace(/Sistema Pizzería/g, 'El Artesano');
    content = content.replace(/Pizzería - /g, 'El Artesano - ');
    content = content.replace(/de la Pizzería/g, 'de El Artesano');
    content = content.replace(/en la Pizzería/g, 'en El Artesano');
    content = content.replace(/Pizzería <span/g, 'El <span');
    content = content.replace(/>Italiana</g, '>Artesano<');
    content = content.replace(/pizzeria\.com/g, 'elartesano.com');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

// Also update public/js/corte.js
const corteJsPath = path.join(publicDir, 'js', 'corte.js');
if (fs.existsSync(corteJsPath)) {
  let content = fs.readFileSync(corteJsPath, 'utf8');
  content = content.replace(/Pizzería - Reporte de Corte de Caja/g, 'El Artesano - Reporte de Corte de Caja');
  
  // We need to add the logo image to the PDF
  // Let's add the image fetching and rendering to the PDF generation
  // Since jsPDF is used, doc.addImage() can be used if we get the base64 or pass the image URL
  // But passing URL directly works if image is converted to base64, or since jsPDF html2canvas is not used here...
  // wait, jsPDF can take a base64 string or an HTMLImageElement.
  // It's a web page, so we can create an Image element and pass it to doc.addImage()
  
  const logoCode = `
        const img = new Image();
        img.src = '/img/Logo.png';
        img.onload = () => {
            doc.addImage(img, 'PNG', 14, 10, 20, 20); // x, y, width, height
            doc.setFontSize(22);
            doc.text("El Artesano - Reporte de Corte de Caja", 38, 22);
            
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text("Folio (ID): " + corte._id, 14, 38);
            doc.text("Fecha y Hora: " + formatDate(corte.fecha_corte), 14, 44);
            doc.text("Usuario Responsable: " + usuarioNombre, 14, 50);
            
            doc.autoTable({
                startY: 58,
                head: [['Concepto', 'Total']],
                body: [
                    ['Ventas en Efectivo', '$' + parseFloat(corte.desglose.EFECTIVO || 0).toFixed(2)],
                    ['Ventas con Tarjeta', '$' + parseFloat(corte.desglose.TARJETA || 0).toFixed(2)],
                    ['Ventas por Transferencia', '$' + parseFloat(corte.desglose.TRANSFERENCIA || 0).toFixed(2)],
                    ['Cantidad Total de Ventas', corte.cantidad_ventas],
                ],
                theme: 'grid',
                headStyles: { fillColor: [255, 107, 129] }
            });

            const finalY = doc.lastAutoTable.finalY || 58;

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("TOTAL RECAUDADO: $" + parseFloat(corte.total_recaudado || 0).toFixed(2), 14, finalY + 15);

            doc.save(\`corte_de_caja_\${corte._id.substring(corte._id.length - 6)}.pdf\`);
        };
        // We shouldn't execute the rest of the code synchronously because image loading is async
  `;

  // We have to replace the whole content from doc.setFontSize(22) to doc.save()
  
  fs.writeFileSync(corteJsPath, content, 'utf8');
  console.log('Updated js/corte.js text, still need to do manual PDF update if needed');
}

console.log('Done');
