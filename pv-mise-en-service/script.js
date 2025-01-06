document.addEventListener("DOMContentLoaded", () => {
  const generatePDFBtn = document.getElementById("generatePDF");
  const form = document.getElementById("pvForm");

  // Activer/Désactiver le bouton PDF
  form.addEventListener("input", () => {
    const isValid = Array.from(form.elements).every((el) => {
      if (el.type === "file" || el.id === "summary") return true; // Champs optionnels
      return el.value.trim() !== "";
    });
    generatePDFBtn.disabled = !isValid;
  });

  // Fonction de génération du PDF
  generatePDFBtn.addEventListener("click", async () => {
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();

      // Récupération des champs du formulaire
      const title = document.getElementById("title").value;
      const responsable = document.getElementById("responsable").value;
      const entreprise = document.getElementById("entreprise").value;
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      const amount = document.getElementById("amount").value;
      const summary =
        document.getElementById("summary").value || "Aucun résumé fourni";

      // Récupération des photos
      const photosInput = document.getElementById("photos");
      const photos = Array.from(photosInput.files);

      // Remplir le PDF
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

      // Ajouter les photos au PDF
      y += 20;
      for (const photo of photos) {
        if (photo) {
          const imgData = await toDataURL(photo);
          pdf.addImage(imgData, "JPEG", 20, y, 60, 40);
          y += 50;

          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
        }
      }

      // Sauvegarder le PDF
      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      alert(
        "Une erreur est survenue lors de la génération du PDF. Vérifiez vos entrées."
      );
    }
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
