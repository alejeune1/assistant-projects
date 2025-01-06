document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("pvForm");
  const photosContainer = document.getElementById("photosContainer");
  const addPhotoBtn = document.getElementById("addPhoto");
  const generatePDFBtn = document.getElementById("generatePDF");

  let photoCount = 0;

  // Activer/Désactiver le bouton PDF en fonction de la validation du formulaire
  form.addEventListener("input", () => {
    const isFormValid = Array.from(form.elements).every((el) => {
      if (
        el.type === "file" ||
        el.id === "summary" ||
        el.className === "photo-label"
      )
        return true;
      return el.value.trim() !== "";
    });

    generatePDFBtn.disabled = !isFormValid;
  });

  // Ajouter un champ photo dynamique
  addPhotoBtn.addEventListener("click", () => {
    photoCount++;

    const photoDiv = document.createElement("div");
    photoDiv.className = "photo-group";
    photoDiv.innerHTML = `
          <label for="photo-${photoCount}">Photo ${photoCount} :</label>
          <input type="file" id="photo-${photoCount}" class="photo-input" accept="image/*" required>
          <label for="photoLabel-${photoCount}">Libellé :</label>
          <input type="text" id="photoLabel-${photoCount}" class="photo-label" placeholder="Ex: Photo avant travaux">
      `;
    photosContainer.appendChild(photoDiv);
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

    let yOffset = 100;

    // Ajouter les photos et leurs libellés
    const photoInputs = document.querySelectorAll(".photo-input");
    const photoLabels = document.querySelectorAll(".photo-label");

    for (let i = 0; i < photoInputs.length; i++) {
      const photoFile = photoInputs[i].files[0];
      const photoLabel = photoLabels[i].value;

      if (photoFile) {
        const photoData = await toDataURL(photoFile);
        pdf.addImage(photoData, "JPEG", 10, yOffset, 60, 40);
        pdf.text(
          photoLabel || `Photo ${i + 1} (pas de libellé)`,
          10,
          yOffset + 45
        );
        yOffset += 60;

        // Si on dépasse la page, ajouter une nouvelle page
        if (yOffset > 270) {
          pdf.addPage();
          yOffset = 10;
        }
      }
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
