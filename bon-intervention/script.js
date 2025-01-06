document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cr");

  // Prévisualisation des images
  document.getElementById("photos").addEventListener("change", (event) => {
    const previewContainer = document.getElementById("photo-preview");
    previewContainer.innerHTML = ""; // Efface les anciennes prévisualisations

    Array.from(event.target.files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  });

  // Initialisation des canvases pour les signatures
  const canvasRepresentant = setupSignatureCanvas(
    "signature-representant-canvas",
    "clear-representant"
  );
  const canvasAgent = setupSignatureCanvas(
    "signature-agent-canvas",
    "clear-agent"
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Récupération des valeurs des champs
    const date = document.getElementById("date").value;
    const chantier = document.getElementById("chantier").value;
    const centrale = document.getElementById("centrale").value;
    const entreprise = document.getElementById("entreprise").value;
    const lieu = document.getElementById("lieu").value;
    const description = document.getElementById("description").value;
    const commentaires = document.getElementById("commentaires").value;

    const pieces = Array.from(document.querySelectorAll("#pieces-table tr"))
      .slice(1)
      .map((row) => {
        const cells = row.querySelectorAll("input");
        return {
          fabricant: cells[0].value,
          designation: cells[1].value,
          quantite: cells[2].value,
        };
      });

    const interventions = Array.from(
      document.querySelectorAll("#intervention-table tr")
    )
      .slice(1)
      .map((row) => {
        const cells = row.querySelectorAll("input");
        return {
          technicien: cells[0].value,
          date: cells[1].value,
          horaires: cells[2].value,
          heures: cells[3].value,
        };
      });

    // Récupération des photos
    const photoInput = document.getElementById("photos");
    const photos = Array.from(photoInput.files);

    genererPDF(
      date,
      chantier,
      centrale,
      entreprise,
      lieu,
      description,
      pieces,
      interventions,
      commentaires,
      photos,
      canvasRepresentant,
      canvasAgent
    );
  });

  async function genererPDF(
    date,
    chantier,
    centrale,
    entreprise,
    lieu,
    description,
    pieces,
    interventions,
    commentaires,
    photos,
    canvasRepresentant,
    canvasAgent
  ) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("BON D'INTERVENTION", 105, 20, { align: "center" });

    pdf.setFontSize(12);
    let y = 30;
    const leftX = 20;

    const drawSectionLine = () => {
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.line(10, y, 200, y);
      y += 5;
    };

    pdf.text("Informations Générales :", leftX, y);
    y += 10;
    pdf.text(`Date : ${date}`, leftX, y);
    y += 10;
    pdf.text(`Nom du Chantier : ${chantier}`, leftX, y);
    y += 10;
    pdf.text(`Nom de la Centrale : ${centrale}`, leftX, y);
    y += 10;
    pdf.text(`Nom de l'Entreprise : ${entreprise}`, leftX, y);
    y += 10;
    pdf.text(`Lieu d'Intervention : ${lieu}`, leftX, y);
    y += 10;
    drawSectionLine();

    pdf.text("Description des Travaux :", leftX, y);
    y += 10;
    const descLines = pdf.splitTextToSize(description, 170);
    pdf.text(descLines, leftX, y);
    y += descLines.length * 7 + 10;
    drawSectionLine();

    pdf.text("Désignations des Pièces Fournies :", leftX, y);
    y += 5;
    pdf.autoTable({
      startY: y,
      head: [["Fabricant", "Désignation", "Quantité"]],
      body: pieces.map((p) => [p.fabricant, p.designation, p.quantite]),
      theme: "grid",
    });
    y = pdf.lastAutoTable.finalY + 10;
    drawSectionLine();

    pdf.text("Temps d'Intervention :", leftX, y);
    y += 5;
    pdf.autoTable({
      startY: y,
      head: [["Technicien", "Date", "Horaires", "Nombre d'Heures"]],
      body: interventions.map((i) => [
        i.technicien,
        i.date,
        i.horaires,
        i.heures,
      ]),
      theme: "grid",
    });
    y = pdf.lastAutoTable.finalY + 10;
    drawSectionLine();

    pdf.text("Commentaires :", leftX, y);
    y += 10;
    const commentLines = pdf.splitTextToSize(commentaires, 170);
    pdf.text(commentLines, leftX, y);
    y += commentLines.length * 7 + 10;
    drawSectionLine();

    // Modification de la section Signatures

    // Signatures
    pdf.text("Signatures :", leftX, y);
    y += 10;

    const signatureRepresentant = canvasRepresentant.toDataURL("image/png");
    const signatureAgent = canvasAgent.toDataURL("image/png");

    const totalWidth = 170;
    const signatureWidth = 80;
    const spacing = 10;

    // Calcul des positions X
    const xRepresentant = leftX;
    const xAgent = leftX + signatureWidth + spacing;

    // Signature du représentant (à gauche)
    pdf.text("Représentant :", xRepresentant, y);
    pdf.text(
      document.getElementById("representant").value,
      xRepresentant + 50,
      y
    );
    pdf.rect(xRepresentant, y + 10, signatureWidth, 50, "S"); // Cadre pour la signature
    pdf.addImage(
      signatureRepresentant,
      "PNG",
      xRepresentant,
      y + 10,
      signatureWidth,
      50
    );

    // Signature de l'agent EDF (à droite)
    pdf.text("Agent EDF :", xAgent, y);
    pdf.text(document.getElementById("agent").value, xAgent + 50, y);
    pdf.rect(xAgent, y + 10, signatureWidth, 50, "S"); // Cadre pour la signature
    pdf.addImage(signatureAgent, "PNG", xAgent, y + 10, signatureWidth, 50);

    y += 70;
    drawSectionLine();

    // Photos
    await ajouterPhotos(pdf, photos, leftX, y);
    pdf.save("bon_intervention.pdf");
  }

  async function ajouterPhotos(pdf, photos, leftX, startY) {
    let y = startY;

    for (const photo of photos) {
      if (photo) {
        const imgData = await lireImage(photo);
        const maxWidth = 100;
        const maxHeight = 100;

        const img = new Image();
        img.src = imgData;

        await new Promise((resolve) => {
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;

            if (y + height > 280) {
              pdf.addPage();
              y = 20;
            }

            pdf.addImage(imgData, "JPEG", leftX, y, width, height);
            y += height + 10;
            resolve();
          };
        });
      }
    }
  }

  function lireImage(photo) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(photo);
    });
  }

  function setupSignatureCanvas(canvasId, clearButtonId) {
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext("2d");
    let isDrawing = false;

    const getPosition = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (event.touches) {
        return {
          x: event.touches[0].clientX - rect.left,
          y: event.touches[0].clientY - rect.top,
        };
      } else {
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }
    };

    const startDrawing = (event) => {
      isDrawing = true;
      const pos = getPosition(event);
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    };

    const draw = (event) => {
      if (!isDrawing) return;
      const pos = getPosition(event);
      context.lineTo(pos.x, pos.y);
      context.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
      context.closePath();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);

    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startDrawing(e);
    });
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      draw(e);
    });
    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      stopDrawing(e);
    });

    document.getElementById(clearButtonId).addEventListener("click", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    });

    return canvas;
  }
});
