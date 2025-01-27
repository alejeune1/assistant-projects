document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cr");

    // Initialisation des canvases pour les signatures
    const canvasRepresentant = setupSignatureCanvas("signature-representant-canvas", "clear-representant");
    const canvasAgent = setupSignatureCanvas("signature-agent-canvas", "clear-agent");

    // Gestion des pièces fournies
    manageDynamicTable(
        "add-piece",
        "#pieces-table tbody",
        `
            <td><input type="text" name="fabricant[]" placeholder="Fabricant" /></td>
            <td><input type="text" name="designation[]" placeholder="Désignation" /></td>
            <td><input type="number" name="quantite[]" min="1" placeholder="Quantité" /></td>
            <td><button type="button" class="remove-row">Supprimer</button></td>
        `
    );

    // Gestion des intervenants
    manageDynamicTable(
        "add-technician",
        "#intervention-table tbody",
        `
            <td><input type="text" name="techniciens[]" placeholder="Nom du technicien" /></td>
            <td><input type="date" name="date_intervention[]" /></td>
            <td><input type="number" name="nbr_heures[]" min="1" placeholder="Heures" /></td>
            <td><button type="button" class="remove-row">Supprimer</button></td>
        `
    );

    // Gestion des photos
    const photosInput = document.getElementById("photos");
    const photoPreviewContainer = document.getElementById("photo-preview");
    const takePhotoButton = document.getElementById("take-photo");
    const savePhotoButton = document.getElementById("save-photo");
    const camera = document.getElementById("camera");
    const cameraCanvas = document.getElementById("camera-canvas");
    const cameraContext = cameraCanvas.getContext("2d");
    let photoList = []; // Liste des photos (caméra + galerie)

    // Gestion des photos ajoutées depuis la galerie
    photosInput.addEventListener("change", (event) => {
        const files = Array.from(event.target.files);
        files.forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    addPhotoToPreview(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Gestion de la caméra pour prendre une photo
    takePhotoButton.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            camera.srcObject = stream;
            camera.style.display = "block";
            savePhotoButton.style.display = "inline-block";
        } catch (error) {
            console.error("Impossible d'accéder à la caméra :", error);
        }
    });

    // Enregistrer une photo prise avec la caméra
    savePhotoButton.addEventListener("click", () => {
        cameraContext.drawImage(camera, 0, 0, cameraCanvas.width, cameraCanvas.height);
        const photoData = cameraCanvas.toDataURL("image/png");
        addPhotoToPreview(photoData);

        // Arrêter la caméra après la capture
        const stream = camera.srcObject;
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        camera.style.display = "none";
        savePhotoButton.style.display = "none";
    });

    // Ajouter une photo à l'aperçu
    function addPhotoToPreview(photoData) {
        const img = document.createElement("img");
        img.src = photoData;
        img.style.width = "100px";
        img.style.margin = "5px";
        photoPreviewContainer.appendChild(img);
        photoList.push(photoData); // Ajouter à la liste des photos pour le PDF
    }

    // Soumission du formulaire et génération du PDF
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
            date: document.getElementById("date").value,
            chantier: document.getElementById("chantier").value,
            centrale: document.getElementById("centrale").value,
            entreprise: document.getElementById("entreprise").value,
            lieu: document.getElementById("lieu").value,
            description: document.getElementById("description").value,
            commentaires: document.getElementById("commentaires").value,
            representantNom: document.getElementById("representant").value,
            agentNom: document.getElementById("agent").value,
            pieces: collectTableData("#pieces-table tbody"),
            interventions: collectTableData("#intervention-table tbody"),
            photos: photoList, // Utilisation des photos capturées et sélectionnées
            signatures: {
                representant: canvasRepresentant.toDataURL("image/png"),
                agent: canvasAgent.toDataURL("image/png")
            }
        };

        await genererPDF(data);
    });

    // Fonction pour gérer les ajouts/suppressions dynamiques des lignes des tableaux
    function manageDynamicTable(addButtonId, tableBodySelector, rowHTML) {
        const tableBody = document.querySelector(tableBodySelector);
        const addButton = document.getElementById(addButtonId);

        addButton.addEventListener("click", () => {
            const newRow = document.createElement("tr");
            newRow.style.backgroundColor = "#FFFFFF";
            newRow.innerHTML = rowHTML;
            tableBody.appendChild(newRow);
        });

        tableBody.addEventListener("click", (event) => {
            if (event.target.classList.contains("remove-row")) {
                const row = event.target.closest("tr");
                if (row) tableBody.removeChild(row);
            }
        });
    }

    // Fonction pour collecter les données des tableaux dynamiques
    function collectTableData(tableBodySelector) {
        return Array.from(document.querySelectorAll(`${tableBodySelector} tr`)).map(row => {
            return Array.from(row.querySelectorAll("input")).map(input => input.value || "");
        });
    }

    // Fonction de génération du PDF
    async function genererPDF(data) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        const edfBlue = "#003366";
        const white = "#FFFFFF";

        const logo = new Image();
        logo.src = "EDF.png";

        logo.onload = async () => {
            pdf.addImage(logo, "PNG", 10, 10, 25, 15);

            pdf.setFontSize(16);
            pdf.setTextColor(edfBlue);
            pdf.text("BON D'INTERVENTION", 105, 20, { align: "center" });

            pdf.setFontSize(12);
            let y = 30;

            pdf.setTextColor(edfBlue);
            pdf.text("Informations Générales", 20, y);
            y += 10;
            pdf.setTextColor("#000000");
            pdf.text(`Date : ${data.date}`, 20, y);
            y += 10;
            pdf.text(`Nom du Chantier : ${data.chantier}`, 20, y);
            y += 10;
            pdf.text(`Nom de la Centrale : ${data.centrale}`, 20, y);
            y += 10;
            pdf.text(`Nom de l'Entreprise : ${data.entreprise}`, 20, y);
            y += 10;
            pdf.text(`Lieu d'Intervention : ${data.lieu}`, 20, y);
            y += 15;

            pdf.setTextColor(edfBlue);
            pdf.text("Description des Travaux", 20, y);
            y += 10;
            pdf.setTextColor("#000000");
            const descLines = pdf.splitTextToSize(data.description, 170);
            pdf.text(descLines, 20, y);
            y += descLines.length * 7 + 10;

            pdf.setTextColor(edfBlue);
            pdf.text("Désignations des Pièces Fournies", 20, y);
            y += 5;
            pdf.autoTable({
                startY: y,
                head: [["Fabricant", "Désignation", "Quantité"]],
                body: data.pieces,
                styles: { fillColor: edfBlue, textColor: white, lineWidth: 0.1 },
                alternateRowStyles: { fillColor: white, textColor: edfBlue }
            });
            y = pdf.lastAutoTable.finalY + 10;

            pdf.setTextColor(edfBlue);
            pdf.text("Temps d'Intervention", 20, y);
            y += 5;
            pdf.autoTable({
                startY: y,
                head: [["Technicien", "Date", "Nombre d'Heures"]],
                body: data.interventions,
                styles: { fillColor: edfBlue, textColor: white, lineWidth: 0.1 },
                alternateRowStyles: { fillColor: white, textColor: edfBlue }
            });
            y = pdf.lastAutoTable.finalY + 10;

            // Gestion des photos
            for (const photo of data.photos) {
                pdf.addImage(photo, "JPEG", 20, y, 80, 80);
                y += 90;
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
            }

            addSignatures(pdf, data.representantNom, data.agentNom, data.signatures, y);
        };
    }

    // Fonction pour ajouter les signatures dans le PDF
    function addSignatures(pdf, representantNom, agentNom, signatures, startY) {
        const y = startY + 20;

        pdf.setDrawColor(0);
        pdf.line(20, y - 5, 190, y - 5);

        pdf.addImage(signatures.representant, "PNG", 20, y, 60, 40);
        pdf.text("Représentant : " + representantNom, 20, y + 50);

        pdf.addImage(signatures.agent, "PNG", 120, y, 60, 40);
        pdf.text("Agent EDF : " + agentNom, 120, y + 50);

        pdf.line(100, y - 5, 100, y + 55);

        pdf.save("bon_intervention.pdf");
    }

    // Fonction pour initialiser un canvas avec support tactile et souris
    function setupSignatureCanvas(canvasId, clearButtonId) {
        const canvas = document.getElementById(canvasId);
        const context = canvas.getContext("2d");
        let isDrawing = false;

        const getPosition = (event) => {
            const rect = canvas.getBoundingClientRect();
            if (event.touches && event.touches[0]) {
                return {
                    x: event.touches[0].clientX - rect.left,
                    y: event.touches[0].clientY - rect.top
                };
            } else {
                return {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
            }
        };

        const startDrawing = (event) => {
            isDrawing = true;
            const pos = getPosition(event);
            context.beginPath();
            context.moveTo(pos.x, pos.y);
        };

        const draw = (event) => {
            if (!isDrawing) return;
            const pos = getPosition(event);
            context.lineTo(pos.x, pos.y);
            context.stroke();
        };

        const stopDrawing = () => {
            isDrawing = false;
        };

        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("mouseleave", stopDrawing);

        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            startDrawing(e);
        });
        canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            draw(e);
        });
        canvas.addEventListener("touchend", stopDrawing);
        canvas.addEventListener("touchcancel", stopDrawing);

        document.getElementById(clearButtonId).addEventListener("click", () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
        });

        return canvas;
    }

    // Convertir un fichier en base64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
});
