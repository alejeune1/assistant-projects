document.addEventListener("DOMContentLoaded", () => {
  const generatePDFBtn = document.getElementById("generatePDF");

  generatePDFBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let y = 20;

    // ** Page 1 : En-tête et sections descriptives **
    pdf.addImage("EDF.png", "PNG", 10, 10, 20, 15); // Logo EDF
    pdf.setFillColor(0, 51, 153); // Couleur bleue pour la bannière
    pdf.rect(0, 30, 210, 15, "F"); // Bannière décalée sous le logo
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

    // ** Page 3 : Photos **
    pdf.addPage();
    pdf.addImage("EDF.png", "PNG", 10, 10, 20, 15); // Logo EDF
    pdf.setFontSize(16);
    pdf.text("Photos :", 20, 30);

    let x = 20;
    y = 40;
    const pageWidth = 190;
    const maxHeight = 100;
    const padding = 10;

    const photosInput = document.getElementById("photos");
    const photos = Array.from(photosInput.files);

    for (const photo of photos) {
      const imgData = await toDataURL(photo);

      const img = new Image();
      img.src = imgData;

      const ratio = img.width / img.height;
      let displayWidth = Math.min(pageWidth - 2 * x, img.width);
      let displayHeight = displayWidth / ratio;

      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = displayHeight * ratio;
      }

      pdf.addImage(imgData, "JPEG", x, y, displayWidth, displayHeight);

      y += displayHeight + padding;

      if (y + displayHeight + padding > 280) {
        pdf.addPage();
        pdf.addImage("EDF.png", "PNG", 10, 10, 20, 15); // Nouveau logo pour la page
        y = 40;
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
