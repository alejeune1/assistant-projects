document.addEventListener("DOMContentLoaded", () => {
  const generatePDFBtn = document.getElementById("generatePDF");
  const addValidationRowBtn = document.getElementById("addValidationRow");
  const validationTableBody = document.querySelector("#validationTable tbody");

  // Ajouter une ligne dans le tableau Validation
  addValidationRowBtn.addEventListener("click", () => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td><input type="text" name="redacteurs[]" placeholder="Nom du rédacteur" /></td>
          <td><input type="text" name="approbateurs[]" placeholder="Nom de l'approbateur" /></td>
          <td><input type="text" name="delegue[]" placeholder="Nom du délégué" /></td>
      `;
    validationTableBody.appendChild(row);
  });

  generatePDFBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let y = 20;

    // ** Page 1 : En-tête et sections descriptives **
    pdf.addImage("EDF.png", "PNG", 10, 10, 25, 15); // Logo EDF ajusté
    pdf.setFillColor(0, 51, 153); // Couleur bleue pour la bannière
    pdf.rect(0, 30, 210, 15, "F"); // Bannière bleue
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text("PV Mise En Service Technique", 105, 40, { align: "center" });

    const title = document.getElementById("title").value;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(title, 20, 55);

    // Nouvelles sections ajoutées
    const documentAssocie = document.getElementById("documentAssocie").value;
    pdf.setFontSize(12);
    pdf.text("Document associé :", 20, 65);
    pdf.setFontSize(10);
    pdf.text(documentAssocie, 20, 70, { maxWidth: 170 });

    const animationMetier = document.getElementById("animationMetier").value;
    pdf.setFontSize(12);
    pdf.text("Animation métier :", 20, 85);
    pdf.setFontSize(10);
    pdf.text(animationMetier, 20, 90, { maxWidth: 170 });

    const interlocuteurs = document.getElementById("interlocuteurs").value;
    pdf.setFontSize(12);
    pdf.text("Interlocuteurs :", 20, 105);
    pdf.setFontSize(10);
    pdf.text(interlocuteurs, 20, 110, { maxWidth: 170 });

    // Historique avec données réparties
    const historique =
      document.getElementById("historique").value ||
      "Version 1, 13/10/2023, Création";
    const historiqueData = historique.split(",").map((item) => item.trim());
    pdf.autoTable({
      startY: 120,
      head: [["Version", "Date d'application", "Nature de la modification"]],
      body: [historiqueData],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 153] },
    });

    // Résumé
    const summary =
      document.getElementById("summary").value || "Aucun résumé fourni";
    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 10,
      head: [["Résumé"]],
      body: [[summary]],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 153] },
    });

    // Validation dynamique
    const validationRows = Array.from(
      validationTableBody.querySelectorAll("tr")
    );
    const validationData = validationRows.map((row) => {
      const inputs = row.querySelectorAll("input");
      return Array.from(inputs).map((input) => input.value.trim());
    });

    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 10,
      head: [["Rédacteurs", "Approbateurs", "Délégué Réseaux et Patrimoine"]],
      body: validationData,
      theme: "grid",
      headStyles: { fillColor: [0, 51, 153] },
    });

    // ** Page 2 : Infos commande **
    pdf.addPage();
    pdf.addImage("EDF.png", "PNG", 10, 10, 25, 15); // Logo EDF
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 0); // Couleur verte pour le titre
    pdf.text("Infos commande :", 20, 30);

    // Photos ou captures en haut de la page
    const photosInput = document.getElementById("photos");
    const photos = Array.from(photosInput.files);

    let x = 20;
    y = 40;

    for (let i = 0; i < Math.min(2, photos.length); i++) {
      const imgData = await toDataURL(photos[i]);
      const img = new Image();
      img.src = imgData;

      const ratio = img.width / img.height;
      let displayWidth = Math.min(80, img.width); // Largeur maximale : 80
      let displayHeight = displayWidth / ratio;

      pdf.addImage(imgData, "JPEG", x, y, displayWidth, displayHeight);
      y += displayHeight + 10;
    }

    // Tableau Infos commande
    const responsable = document.getElementById("responsable").value;
    const entreprise = document.getElementById("entreprise").value;
    const stockage = document.getElementById("stockage").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const amount = document.getElementById("amount").value;
    const eotp = document.getElementById("eotp").value || "Non spécifié";

    pdf.autoTable({
      startY: y + 10,
      head: [["Responsable chantier", "Entreprise", "Lieu stockage dossier"]],
      body: [[responsable, entreprise, stockage]],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 153] },
    });

    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 10,
      head: [["Début chantier", "Fin chantier", "Montant chantier", "EOTP"]],
      body: [[startDate, endDate, amount ? `${amount}€` : "N/A", eotp]],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 153] },
    });

    // Ajout du titre "Photos :" après les tableaux
    y = pdf.lastAutoTable.finalY + 20; // Correction de la position
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 0);
    pdf.text("Photos :", 20, y);

    // Affichage des photos supplémentaires sous le titre
    y += 10;
    if (photos.length > 2) {
      const imgData = await toDataURL(photos[2]);
      pdf.addImage(imgData, "JPEG", 20, y, 80, 60);
    }

    // ** Page 3 : Photos supplémentaires **
    if (photos.length > 3) {
      pdf.addPage();
      pdf.addImage("EDF.png", "PNG", 10, 10, 25, 15); // Logo EDF
      pdf.setFontSize(16);
      pdf.text("Photos :", 20, 30);

      y = 40;

      for (let i = 3; i < photos.length; i++) {
        const imgData = await toDataURL(photos[i]);
        const img = new Image();
        img.src = imgData;

        const ratio = img.width / img.height;
        let displayWidth = Math.min(190, img.width); // Largeur maximale
        let displayHeight = displayWidth / ratio;

        if (displayHeight > 100) {
          displayHeight = 100;
          displayWidth = displayHeight * ratio;
        }

        pdf.addImage(imgData, "JPEG", x, y, displayWidth, displayHeight);
        y += displayHeight + 10;

        if (y + displayHeight > 280) {
          pdf.addPage();
          pdf.addImage("EDF.png", "PNG", 10, 10, 25, 15); // Nouveau logo
          y = 40;
        }
      }
    }

    // Sauvegarder le PDF
    pdf.save("pv_mise_en_service.pdf");
  });

  // Convertir une image en DataURL
  function toDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
});
