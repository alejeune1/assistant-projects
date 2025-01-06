document.getElementById("generatePDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const title = document.getElementById("title").value;
  const responsable = document.getElementById("responsable").value;
  const entreprise = document.getElementById("entreprise").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const amount = document.getElementById("amount").value;
  const summary = document.getElementById("summary").value;

  const photoBeforeFile = document.getElementById("photoBefore").files[0];
  const photoAfterFile = document.getElementById("photoAfter").files[0];

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
  pdf.text(summary, 10, 90);

  if (photoBeforeFile) {
    const photoBeforeData = await toDataURL(photoBeforeFile);
    pdf.addImage(photoBeforeData, "JPEG", 10, 100, 60, 40);
    pdf.text("Photo avant :", 10, 95);
  }

  if (photoAfterFile) {
    const photoAfterData = await toDataURL(photoAfterFile);
    pdf.addImage(photoAfterData, "JPEG", 10, 150, 60, 40);
    pdf.text("Photo après :", 10, 145);
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
