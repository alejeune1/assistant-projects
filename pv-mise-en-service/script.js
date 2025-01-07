document.addEventListener("DOMContentLoaded", () => {
  const generatePDFBtn = document.getElementById("generatePDF");

  generatePDFBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let y = 20;

    // ** Page 1 : En-tête et sections descriptives **
    pdf.addImage("EDF.png", "PNG", 10, 10, 20, 15); // Logo EDF ajusté
    pdf.setFillColor(0, 51, 153); // Couleur bleue pour la bannière
    pdf.rect(0, 30, 210, 15, "F"); // Bannière bleue
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text("PV Mise En Service Technique", 105, 40, { align: "center" });

    const title = document.getElementById("title").value;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(title, 20, 55);

    pdf.setFontSize(10);
    pdf.text("Note interne", 20, 65);
    pdf.text(
      "Document associé : Note SEI PTE 34 Guide d’utilisation de l’outil de valorisation pour immobilisation des remises gratuites d’ouvrages.",
      20,
      70,
      { maxWidth: 170 }
    );
    pdf.text(
      "Animation métier : Concession, Réseau et Patrimoine, Gestion Finances",
      20,
      80
    );
    pdf.text("Interlocuteurs : Frédéric MESCOFF", 20, 90);

    // Historique avec données réparties
    const historique =
      document.getElementById("historique").value ||
      "Version 1, 13/10/2023, Création";
    const historiqueData = historique.split(",").map((item) => item.trim());
    pdf.autoTable({
      startY: 100,
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

    // Validation
    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 10,
      head: [["Rédacteurs", "Approbateurs", "Délégué Réseaux et Patrimoine"]],
      body: [["Courraud B.", "MESCOFF F.", "Visa"]],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 153] },
    });

    // ** Page 2 : Infos commande **
    pdf.addPage();
    pdf.addImage("EDF.png", "PNG", 10, 10, 20, 15); // Logo EDF
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
      body: [[startDate, endDate, `${amount}€`, eotp]],
      theme: "grid",
      headStyles: { fillColor: [0, 51, 153] },
    });

    // Ajout du titre "Photos :" après les tableaux
    y = pdf.lastAutoTable.finalY + 20;
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Photos :", 20, y);

    // Afficher la première photo supplémentaire sous le titre "Photos :"
    y += 10;
    if (photos.length > 2) {
      const imgData = await toDataURL(photos[2]);
      pdf.addImage(imgData, "JPEG", 20, y, 80, 60);
    }

    // ** Page 3 : Photos supplémentaires **
    if (photos.length > 3) {
      pdf.addPage();
      pdf.addImage("EDF.png", "PNG", 10, 10, 20, 15); // Logo EDF
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
          pdf.addImage("EDF.png", "PNG", 10, 10, 20, 15); // Nouveau logo
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
