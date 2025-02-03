document.addEventListener("DOMContentLoaded", async () => {
  const generatePDFBtn = document.getElementById("generatePDF");
  const addPhotoGroupBtn = document.getElementById("addPhotoGroup");
  const photosContainer = document.getElementById("photosContainer");

  addPhotoGroupBtn.addEventListener("click", () => {
    const photoGroup = document.createElement("div");
    photoGroup.className = "photoGroup";

    photoGroup.innerHTML = `
      <label>Ajouter des photos : *</label>
      <input type="file" class="photoInput" accept="image/*" multiple required />
      <label>Catégorie : *</label>
      <select class="photoCategory" required>
        <option value="">-- Sélectionner --</option>
        <option value="infosCommandes">Infos commandes</option>
        <option value="photos">Photos</option>
      </select>
      <button type="button" class="removePhotoGroup">Supprimer ce groupe</button>
    `;

    photosContainer.appendChild(photoGroup);

    photoGroup.querySelector(".removePhotoGroup").addEventListener("click", () => {
      photosContainer.removeChild(photoGroup);
    });
  });

  generatePDFBtn.addEventListener("click", async () => {
    if (!validateForm()) {
      alert("⚠️ Veuillez remplir tous les champs obligatoires avant de générer le PDF !");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    let y = 25;
    const margin = 20;
    const pageHeight = 297;

    try {
      // ✅ Correction du logo EDF
      const logo = new Image();
      logo.src = "EDF.png";
      await new Promise((resolve, reject) => {
        logo.onload = () => {
          pdf.addImage(logo, "PNG", 10, 10, 30, 20);
          resolve();
        };
        logo.onerror = () => {
          console.warn("⚠️ Impossible de charger 'EDF.png'. Vérifiez le chemin du fichier.");
          resolve();
        };
      });

      y += 25;

      pdf.setFontSize(18);
      pdf.setTextColor("#003366");
      pdf.text("PV Mise En Service Technique", 105, y, { align: "center" });
      y += 20;

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);

      const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value : "Non renseigné";
      };

      y = addSection(pdf, "Informations Générales", y);
      y = addText(pdf, `Titre : ${getValue("title")}`, y);
      y = addText(pdf, `Responsable chantier : ${getValue("responsable")}`, y);
      y = addText(pdf, `Entreprise : ${getValue("entreprise")}`, y);
      y = addText(pdf, `Date début : ${getValue("startDate")}`, y);
      y = addText(pdf, `Date fin : ${getValue("endDate")}`, y);

      y = addSection(pdf, "Historique", y);
      y = addText(pdf, `Date d'application : ${getValue("historique")}`, y);

      y = addSection(pdf, "Description du projet", y);
      const summary = getValue("summary");
      const descLines = pdf.splitTextToSize(summary, 170);
      pdf.text(descLines, margin, y);
      y += descLines.length * 7 + 15;

      const photoGroups = document.querySelectorAll(".photoGroup");

      let infosCommandesPhotos = [];
      let generalPhotos = [];

      for (const group of photoGroups) {
        const filesInput = group.querySelector(".photoInput");
        if (filesInput.files.length === 0) continue;

        const category = group.querySelector(".photoCategory").value;
        const photos = Array.from(filesInput.files);

        if (category === "infosCommandes") {
          infosCommandesPhotos.push(...photos);
        } else {
          generalPhotos.push(...photos);
        }
      }

      if (infosCommandesPhotos.length > 0) {
        y = await addImagesWithTitle(pdf, "Infos commandes", infosCommandesPhotos, y);
      }

      if (generalPhotos.length > 0) {
        y = await addImagesWithTitle(pdf, "Photos", generalPhotos, y);
      }

      pdf.save("pv_mise_en_service.pdf");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    }
  });

  // ✅ Validation des champs obligatoires
  function validateForm() {
    let isValid = true;
    document.querySelectorAll("input[required], textarea[required], select[required]").forEach((input) => {
      if (!input.value || (input.type === "file" && input.files.length === 0)) {
        input.style.border = "2px solid red"; // Met une bordure rouge si champ vide
        isValid = false;
      } else {
        input.style.border = ""; // Supprime la bordure rouge si champ rempli
      }
    });
    return isValid;
  }

  function addSection(pdf, title, y) {
    pdf.setTextColor("#003366");
    pdf.setFontSize(14);
    pdf.text(title, 20, y);
    pdf.setTextColor(0, 0, 0);
    pdf.line(20, y + 2, 190, y + 2);
    return y + 15;
  }

  function addText(pdf, text, y) {
    pdf.setFontSize(12);
    pdf.text(text, 20, y);
    return y + 10;
  }

  async function addImagesWithTitle(pdf, title, images, y) {
    const maxWidth = 130;
    const maxHeight = 90;
    const margin = 20;
    const pageHeight = 297;
    let titleAdded = false;

    for (const image of images) {
        try {
            const imgData = await toDataURL(image);
            const img = new Image();
            img.src = imgData;

            await new Promise((resolve) => {
                img.onload = function () {
                    let imgWidth = img.width;
                    let imgHeight = img.height;
                    const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                    imgWidth *= scale;
                    imgHeight *= scale;

                    if (y + imgHeight + 20 > pageHeight - margin) {
                        pdf.addPage();
                        y = margin + 10;

                        if (!titleAdded) {
                            y = addSection(pdf, title, y);
                            titleAdded = true;
                        }
                    }

                    if (!titleAdded) {
                        y = addSection(pdf, title, y);
                        titleAdded = true;
                    }

                    pdf.addImage(imgData, "JPEG", margin, y, imgWidth, imgHeight);
                    y += imgHeight + 20;

                    resolve();
                };
            });
        } catch (error) {
            console.error("Erreur de conversion d'image :", error);
        }
    }

    return y + 10;
  }

  function toDataURL(file) {
    return new Promise((resolve, reject) => {
      if (file instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      } else {
        reject(new Error("Le fichier sélectionné n'est pas valide."));
      }
    });
  }
});