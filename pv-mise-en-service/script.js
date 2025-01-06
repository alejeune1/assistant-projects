document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("pvForm");
  const generatePDFBtn = document.getElementById("generatePDF");

  // Activer/Désactiver le bouton en fonction des champs obligatoires
  form.addEventListener("input", () => {
    const isFormValid = Array.from(form.elements).every((el) => {
      if (el.type === "file" || el.id === "summary") return true;
      return el.value.trim() !== "";
    });

    generatePDFBtn.disabled = !isFormValid;
  });

  // Générer le PDF
  generatePDFBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const title = document.getElementById("title").value;
    const responsable = document.getElementById("responsable").value;
    const entreprise = document.getElementById("entreprise").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const amount = document.getElementById("amount").value;
    const summary = document.getElementById("summary").value;
    const photoFile = document.getElementById("photo").files[0];
    const photoLabel = document.getElementById("photoLabel").value;

    pdf.setFontSize(16);
    pdf.text("PV Mise en Service Technique", 10, 10);

    pdf.setFontSize(12);
    pdf.text(`Titre : ${title}`, 10, 20);
    pdf.text(`Responsable : ${responsable}`, 10, 30);
    pdf.text(`Entreprise : ${entreprise}`, 10, 40);
    pdf.text(`Date début : ${startDate}`, 10, 50);
    pdf.text(`Date fin : ${endDate}`, 10, 60);
    pdf.text(`Montant : ${amount} €`, 10, 70);
    pdf.text("Résumé :", 10, 80);
    pdf.text(summary || "Aucun résumé fourni", 10, 90);

    if (photoFile) {
      const photoData = await toDataURL(photoFile);
      pdf.addImage(photoData, "JPEG", 10, 100, 60, 40);
      pdf.text(photoLabel || "Photo (pas de libellé)", 10, 95);
    }

    pdf.save(`${title}.pdf`);
  });

  function toDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
});
