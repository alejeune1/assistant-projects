document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cr");

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

    const pieces = Array.from(
      document.querySelectorAll("#pieces-table tbody tr")
    ).map((row) => {
      const cells = row.querySelectorAll("input");
      return {
        fabricant: cells[0]?.value || "",
        designation: cells[1]?.value || "",
        quantite: cells[2]?.value || "",
      };
    });

    const interventions = Array.from(
      document.querySelectorAll("#intervention-table tbody tr")
    ).map((row) => {
      const cells = row.querySelectorAll("input");
      return {
        technicien: cells[0]?.value || "",
        date: cells[1]?.value || "",
        horaires: cells[2]?.value || "",
        heures: cells[3]?.value || "",
      };
    });

    const addTechnicianButton = document.getElementById("add-technician");
    const interventionTableBody = document.querySelector(
      "#intervention-table tbody"
    );

    // Ajouter une ligne pour un nouveau technicien
    addTechnicianButton.addEventListener("click", () => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
      <td><input type="text" name="techniciens[]" placeholder="Nom du technicien" /></td>
      <td><input type="date" name="date_intervention[]" /></td>
      <td><input type="number" name="nbr_heures[]" min="0" placeholder="Heures" /></td>
      <td><button type="button" class="remove-technicien">Supprimer</button></td>
    `;
      interventionTableBody.appendChild(newRow);
    });

    // Supprimer une ligne de technicien
    interventionTableBody.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-technicien")) {
        const row = event.target.closest("tr");
        if (row) {
          interventionTableBody.removeChild(row);
        }
      }
    });

    const signatures = {
      representant: canvasRepresentant.toDataURL("image/png"),
      agent: canvasAgent.toDataURL("image/png"),
    };

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
      signatures
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
    signatures
  ) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("BON D'INTERVENTION", 105, 20, { align: "center" });

    pdf.setFontSize(12);
    let y = 30;

    // Informations Générales
    pdf.text("Informations Générales :", 20, y);
    y += 10;
    pdf.text(`Date : ${date}`, 20, y);
    y += 10;
    pdf.text(`Nom du Chantier : ${chantier}`, 20, y);
    y += 10;
    pdf.text(`Nom de la Centrale : ${centrale}`, 20, y);
    y += 10;
    pdf.text(`Nom de l'Entreprise : ${entreprise}`, 20, y);
    y += 10;
    pdf.text(`Lieu d'Intervention : ${lieu}`, 20, y);
    y += 10;

    // Description des Travaux
    pdf.text("Description des Travaux :", 20, y);
    y += 10;
    const descLines = pdf.splitTextToSize(description, 170);
    pdf.text(descLines, 20, y);
    y += descLines.length * 7;

    // Pièces Fournies
    pdf.text("Désignations des Pièces Fournies :", 20, y);
    y += 5;
    pdf.autoTable({
      startY: y,
      head: [["Fabricant", "Désignation", "Quantité"]],
      body: pieces.map((p) => [p.fabricant, p.designation, p.quantite]),
      theme: "grid",
    });
    y = pdf.lastAutoTable.finalY + 10;

    // Temps d'Intervention
    pdf.text("Temps d'Intervention :", 20, y);
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

    // Commentaires
    pdf.text("Commentaires :", 20, y);
    y += 10;
    const commentLines = pdf.splitTextToSize(commentaires, 170);
    pdf.text(commentLines, 20, y);
    y += commentLines.length * 7 + 10;

    // Signatures
    pdf.text("Signatures :", 20, y);
    y += 10;

    // Signature du représentant
    pdf.text("Représentant :", 20, y);
    pdf.addImage(signatures.representant, "PNG", 20, y + 10, 80, 50);

    // Signature de l'agent EDF
    pdf.text("Agent EDF :", 120, y);
    pdf.addImage(signatures.agent, "PNG", 120, y + 10, 80, 50);

    y += 70;

    pdf.save("bon_intervention.pdf");
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

    canvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      context.beginPath();
      context.moveTo(getPosition(e).x, getPosition(e).y);
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDrawing) return;
      const pos = getPosition(e);
      context.lineTo(pos.x, pos.y);
      context.stroke();
    });

    canvas.addEventListener("mouseup", () => (isDrawing = false));
    canvas.addEventListener("mouseleave", () => (isDrawing = false));

    document.getElementById(clearButtonId).addEventListener("click", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    });

    return canvas;
  }
});
