document.addEventListener("DOMContentLoaded", () => {
  const generatePDFBtn = document.getElementById("generatePDF");

  generatePDFBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let y = 20; // Position verticale initiale

    // ** Page 1 : En-tête et sections descriptives **
    pdf.addImage(
      "C:UsersAntoninDocumentsGitHubassistant-projectsEDF.png",
      "PNG",
      10,
      10,
      30,
      10
    ); // Logo EDF
    pdf.setFillColor(0, 51, 153); // Couleur bleue pour l'encadré
    pdf.rect(0, 20, 210, 15, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text("PV Mise En Service Technique", 105, 30, { align: "center" });

    const title = document.getElementById("title").value;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(title, 20, 50);

    pdf.setFontSize(10);
    pdf.text("Note interne", 20, 60);
    pdf.text(
      "Document associé : Note SEI PTE 34 Guide d’utilisation de l’outil de valorisation pour immobilisation des remises gratuites d’ouvrages.",
      20,
      65,
      { maxWidth: 170 }
    );
    pdf.text(
      "Animation métier : Concession, Réseau et Patrimoine, Gestion Finances",
      20,
      75
    );
    pdf.text("Interlocuteurs : Frédéric MESCOFF", 20, 85);

    // Historique
    const historique =
      document.getElementById("historique").value || "Aucun historique fourni";
    pdf.autoTable({
      startY: 90,
      head: [["Version", "Date d'application", "Nature de la modification"]],
      body: [[historique.split(",").map((item) => item.trim())]],
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

    pdf.addPage();

    // ** Page 2 : Infos commande **
    pdf.addImage(
      "C:UsersAntoninDocumentsGitHubassistant-projectsEDF.png",
      "PNG",
      10,
      10,
      30,
      10
    );
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 0); // Vert
    pdf.text("Infos commande :", 20, 30);

    // Photos en haut
    const photosInput = document.getElementById("photos");
    const photos = Array.from(photosInput.files);

    let imageY = 40;
    for (let i = 0; i < Math.min(2, photos.length); i++) {
      const imgData = await toDataURL(photos[i]);
      pdf.addImage(imgData, "JPEG", 20, imageY, 60, 40);
      imageY += 50;
    }

    // Tableau infos commande
    const responsable = document.getElementById("responsable").value;
    const entreprise = document.getElementById("entreprise").value;
    const stockage = document.getElementById("stockage").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const amount = document.getElementById("amount").value;
    const eotp = document.getElementById("eotp").value || "Non spécifié";

    pdf.autoTable({
      startY: imageY + 10,
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

    pdf.addPage();

    // ** Page 3 : Photos supplémentaires **
    pdf.addImage(
      "C:UsersAntoninDocumentsGitHubassistant-projectsEDF.png",
      "PNG",
      10,
      10,
      30,
      10
    );
    let photoY = 30;
    for (let i = 2; i < photos.length; i++) {
      const imgData = await toDataURL(photos[i]);
      pdf.addImage(imgData, "JPEG", 20, photoY, 60, 40);
      photoY += 50;

      if (photoY > 270) {
        pdf.addPage();
        photoY = 30;
      }
    }

    // Sauvegarde
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
