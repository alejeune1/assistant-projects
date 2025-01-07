document.addEventListener("DOMContentLoaded", () => {
  const generatePDFBtn = document.getElementById("generatePDF");

  generatePDFBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let y = 20; // Position initiale verticale

    // En-tête
    pdf.setFontSize(16);
    pdf.text("PV Mise En Service Technique", 105, y, { align: "center" });
    y += 10;
    pdf.setFontSize(14);
    pdf.text("Achat Véhicule électrique SEIN", 105, y, { align: "center" });
    y += 20;

    // Informations EDF
    pdf.setFontSize(10);
    pdf.text("EDF SA", 20, y);
    pdf.text("22-30, avenue de Wagram", 20, y + 5);
    pdf.text("75382 Paris cedex 08", 20, y + 10);
    pdf.text("Capital de 960 069 513 euros", 20, y + 15);
    pdf.text("552 081 317 R.C.S. Paris", 20, y + 20);
    pdf.text("www.edf.com", 20, y + 25);
    y += 35;

    // Note interne
    pdf.setFontSize(12);
    pdf.text("Note interne", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(
      "Document associé : Note SEI PTE 34 Guide d’utilisation de l’outil de valorisation pour immobilisation des remises gratuites d’ouvrages (VRG 2009) pour les centres SEI",
      20,
      y,
      { maxWidth: 170 }
    );
    y += 20;
    pdf.text(
      "Animation métier : Concession, Réseau et Patrimoine, Gestion Finances",
      20,
      y
    );
    y += 10;
    pdf.text("Interlocuteurs : Frédéric MESCOFF", 20, y);
    y += 15;

    // Historique
    pdf.setFontSize(12);
    pdf.text("Historique", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text("Version : 1", 20, y);
    pdf.text("Date d’application : 13/10/2023", 70, y);
    pdf.text("Nature de la modification : Création", 140, y);
    y += 20;

    // Résumé
    pdf.setFontSize(12);
    pdf.text("Résumé", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(
      "L’objet de ce document est de proposer un descriptif des E.T.I. pour l’achat d’un véhicule électrique pour l’ile de Sein. (GOUPIL)",
      20,
      y,
      { maxWidth: 170 }
    );
    y += 20;

    // Validation
    pdf.setFontSize(12);
    pdf.text("Validation", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text("Rédacteurs : Courraud B.", 20, y);
    pdf.text("Approbateur : MESCOFF F.", 80, y);
    pdf.text("Délégué Réseaux et Patrimoine : Visa", 140, y);
    y += 20;

    // Infos commande
    pdf.setFontSize(12);
    pdf.text("Infos commande", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text("Responsable chantier : Stéphane", 20, y);
    y += 10;
    pdf.text("Entreprise : Technilevage", 20, y);
    y += 10;
    pdf.text("Lieu stockage dossier : SERVEUR", 20, y);
    y += 10;
    pdf.text("Début chantier : 05/06/2023", 20, y);
    pdf.text("Fin chantier : 29/06/2023", 100, y);
    pdf.text("Montant chantier : 5850€", 160, y);
    y += 20;

    // Ajouter des photos
    const photoInput = document.getElementById("photos");
    const photos = Array.from(photoInput.files);

    pdf.setFontSize(12);
    pdf.text("Photos :", 20, y);
    y += 10;

    for (const photo of photos) {
      if (photo) {
        const imgData = await toDataURL(photo);
        pdf.addImage(imgData, "JPEG", 20, y, 60, 40);
        y += 50;

        // Si dépassement de la page
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      }
    }

    // Pied de page
    pdf.setFontSize(10);
    pdf.text(
      "EDF SEI – Agence Ile du Ponant – 195 rue Ernestine de Trémaudan – BP 10017 – 29801 BREST CEDEX",
      20,
      290,
      { maxWidth: 170 }
    );

    // Sauvegarder le PDF
    pdf.save("pv_mise_en_service.pdf");
  });

  // Fonction pour convertir une image en DataURL
  function toDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
});
