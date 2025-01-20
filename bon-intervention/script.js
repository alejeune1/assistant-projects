document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cr");

  // Initialisation des canvases pour les signatures
  const canvasRepresentant = setupSignatureCanvas("signature-representant-canvas", "clear-representant");
  const canvasAgent = setupSignatureCanvas("signature-agent-canvas", "clear-agent");

  // Soumission du formulaire
  form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Récupération des données du formulaire
      const date = document.getElementById("date").value;
      const chantier = document.getElementById("chantier").value;
      const centrale = document.getElementById("centrale").value;
      const entreprise = document.getElementById("entreprise").value;
      const lieu = document.getElementById("lieu").value;
      const description = document.getElementById("description").value;
      const commentaires = document.getElementById("commentaires").value;

      const representantNom = document.getElementById("representant").value;
      const agentNom = document.getElementById("agent").value;

      const pieces = Array.from(document.querySelectorAll("#pieces-table tbody tr")).map(row => {
          const inputs = row.querySelectorAll("input");
          return {
              fabricant: inputs[0]?.value || "",
              designation: inputs[1]?.value || "",
              quantite: inputs[2]?.value || ""
          };
      });

      const interventions = Array.from(document.querySelectorAll("#intervention-table tbody tr")).map(row => {
          const inputs = row.querySelectorAll("input");
          return {
              technicien: inputs[0]?.value || "",
              date: inputs[1]?.value || "",
              heures: inputs[2]?.value || ""
          };
      });

      const photos = document.getElementById("photos").files;

      // Récupération des signatures depuis les canvas
      const signatures = {
          representant: canvasRepresentant.toDataURL("image/png"),
          agent: canvasAgent.toDataURL("image/png")
      };

      // Génération du PDF
      genererPDF(
          date,
          chantier,
          centrale,
          entreprise,
          lieu,
          description,
          pieces,
          interventions,
          photos,
          commentaires,
          representantNom,
          agentNom,
          signatures
      );
  });

  function genererPDF(date, chantier, centrale, entreprise, lieu, description, pieces, interventions, photos, commentaires, representantNom, agentNom, signatures) {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();

      const edfBlue = "#003366";
      const white = "#FFFFFF";

      // Ajout du logo EDF
      const logo = new Image();
      logo.src = "EDF.png";
      logo.onload = () => {
          pdf.addImage(logo, "PNG", 10, 10, 25, 15);

          // Titre principal
          pdf.setFontSize(16);
          pdf.setTextColor(edfBlue);
          pdf.text("BON D'INTERVENTION", 105, 20, { align: "center" });

          pdf.setFontSize(12);
          let y = 30;

          // Informations Générales
          pdf.setTextColor(edfBlue);
          pdf.text("Informations Générales", 20, y);
          y += 10;
          pdf.setTextColor("#000000");
          pdf.text(`Date : ${date}`, 20, y);
          y += 10;
          pdf.text(`Nom du Chantier : ${chantier}`, 20, y);
          y += 10;
          pdf.text(`Nom de la Centrale : ${centrale}`, 20, y);
          y += 10;
          pdf.text(`Nom de l'Entreprise : ${entreprise}`, 20, y);
          y += 10;
          pdf.text(`Lieu d'Intervention : ${lieu}`, 20, y);
          y += 15;

          // Description des Travaux
          pdf.setTextColor(edfBlue);
          pdf.text("Description des Travaux", 20, y);
          y += 10;
          pdf.setTextColor("#000000");
          const descLines = pdf.splitTextToSize(description, 170);
          pdf.text(descLines, 20, y);
          y += descLines.length * 7 + 10;

          // Pièces Fournies
          pdf.setTextColor(edfBlue);
          pdf.text("Désignations des Pièces Fournies", 20, y);
          y += 5;
          pdf.autoTable({
              startY: y,
              head: [["Fabricant", "Désignation", "Quantité"]],
              body: pieces.map(p => [p.fabricant, p.designation, p.quantite]),
              styles: { fillColor: edfBlue, textColor: white },
              alternateRowStyles: { fillColor: white, textColor: edfBlue }
          });
          y = pdf.lastAutoTable.finalY + 10;

          // Temps d'Intervention
          pdf.setTextColor(edfBlue);
          pdf.text("Temps d'Intervention", 20, y);
          y += 5;
          pdf.autoTable({
              startY: y,
              head: [["Technicien", "Date", "Nombre d'Heures"]],
              body: interventions.map(i => [i.technicien, i.date, i.heures]),
              styles: { fillColor: edfBlue, textColor: white },
              alternateRowStyles: { fillColor: white, textColor: edfBlue }
          });
          y = pdf.lastAutoTable.finalY + 10;

          // Photos
          if (photos.length > 0) {
              pdf.setTextColor(edfBlue);
              pdf.text("Photos de l'Intervention", 20, y);
              y += 10;
              Array.from(photos).forEach((photo, index) => {
                  toBase64(photo).then(imgData => {
                      pdf.addImage(imgData, "JPEG", 20, y, 80, 80);
                      y += 90;

                      if (y > 270) {
                          pdf.addPage();
                          y = 20;
                      }

                      if (index === photos.length - 1) {
                          finalizePDF(pdf, representantNom, agentNom, signatures, y);
                      }
                  });
              });
          } else {
              finalizePDF(pdf, representantNom, agentNom, signatures, y);
          }
      };
  }

  function finalizePDF(pdf, representantNom, agentNom, signatures, y) {
      // Signatures
      pdf.setTextColor("#003366");
      pdf.text("Signatures", 20, y);
      y += 10;
      pdf.setTextColor("#000000");
      pdf.text(`Représentant : ${representantNom}`, 20, y);
      pdf.addImage(signatures.representant, "PNG", 20, y + 10, 80, 50);
      y += 60;
      pdf.text(`Agent EDF : ${agentNom}`, 20, y);
      pdf.addImage(signatures.agent, "PNG", 20, y + 10, 80, 50);

      // Sauvegarde
      pdf.save("bon_intervention.pdf");
  }

  function setupSignatureCanvas(canvasId, clearButtonId) {
      const canvas = document.getElementById(canvasId);
      const context = canvas.getContext("2d");
      let isDrawing = false;

      const getPosition = (event) => {
          const rect = canvas.getBoundingClientRect();
          return {
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
          };
      };

      canvas.addEventListener("mousedown", (e) => {
          isDrawing = true;
          context.beginPath();
          context.moveTo(getPosition(e).x, getPosition(e).y);
      });

      canvas.addEventListener("mousemove", (e) => {
          if (!isDrawing) return;
          const pos = getPosition(e);
          context.lineTo(pos.x, pos.y);
          context.stroke();
      });

      canvas.addEventListener("mouseup", () => (isDrawing = false));
      canvas.addEventListener("mouseleave", () => (isDrawing = false));

      document.getElementById(clearButtonId).addEventListener("click", () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
      });

      return canvas;
  }

  function toBase64(file) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
      });
  }
});
