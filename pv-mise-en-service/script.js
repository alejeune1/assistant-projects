document.addEventListener("DOMContentLoaded", () => {
  console.log("Document chargé");

  const generatePDFBtn = document.getElementById("generatePDF");
  const form = document.getElementById("pvForm");

  // Activer/Désactiver le bouton PDF
  form.addEventListener("input", () => {
    console.log("Validation des champs...");
    const isValid = Array.from(form.elements).every((el) => {
      if (el.type === "file" || el.id === "summary") return true; // Champs optionnels
      return el.value.trim() !== "";
    });
    console.log("Formulaire valide :", isValid);
    generatePDFBtn.disabled = !isValid;
  });

  // Fonction de génération du PDF
  generatePDFBtn.addEventListener("click", async () => {
    console.log("Bouton 'Générer PDF' cliqué");

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      console.log("jsPDF initialisé");

      // Récupération des champs
      const title = document.getElementById("title").value;
      const responsable = document.getElementById("responsable").value;
      const entreprise = document.getElementById("entreprise").value;
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      const amount = document.getElementById("amount").value;
      const summary =
        document.getElementById("summary").value || "Aucun résumé fourni";

      console.log("Champs récupérés :", {
        title,
        responsable,
        entreprise,
        startDate,
        endDate,
        amount,
        summary,
      });

      // Ajout au PDF
      pdf.setFontSize(16);
      pdf.text("PV de Mise en Service Technique", 105, 20, { align: "center" });
      pdf.setFontSize(12);
      let y = 30;
      pdf.text(`Titre : ${title}`, 20, y);
      y += 10;
      pdf.text(`Responsable : ${responsable}`, 20, y);
      y += 10;
      pdf.text(`Entreprise : ${entreprise}`, 20, y);
      y += 10;
      pdf.text(`Date début : ${startDate}`, 20, y);
      y += 10;
      pdf.text(`Date fin : ${endDate}`, 20, y);
      y += 10;
      pdf.text(`Montant : ${amount} €`, 20, y);
      y += 10;
      pdf.text("Résumé :", 20, y);
      y += 10;
      pdf.text(summary, 20, y);

      console.log("Contenu PDF ajouté");

      // Sauvegarde du PDF
      pdf.save(`${title}.pdf`);
      console.log("PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      alert(
        "Une erreur est survenue lors de la génération du PDF. Vérifiez vos entrées."
      );
    }
  });
});
