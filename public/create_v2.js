document.addEventListener("DOMContentLoaded", () => {
  // --- Template Loading ---
  const templateSelector = document.getElementById("template-selector");
  let availableTemplates = [];
  let selectedTemplateId = "tpl-Modern";
  let createdCount = 0;

  async function loadTemplates() {
    try {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      availableTemplates = await res.json();

      templateSelector.innerHTML = "";
      availableTemplates.forEach((tpl) => {
        const option = document.createElement("div");
        option.className = "template-option";
        option.dataset.id = tpl.id;
        option.innerHTML = `
          <div class="template-thumb"></div>
          <p>${tpl.name}</p>
        `;
        templateSelector.appendChild(option);
      });

      // Template selection
      templateSelector.querySelectorAll(".template-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          const selected = templateSelector.querySelector(".selected");
          if (selected) selected.classList.remove("selected");
          opt.classList.add("selected");
          selectedTemplateId = opt.dataset.id;
          updatePreview();
        });
      });

      // Default template highlight
      const defaultTemplate = templateSelector.querySelector(
        `[data-id="${selectedTemplateId}"]`
      );
      if (defaultTemplate) defaultTemplate.classList.add("selected");

      updatePreview();
    } catch (err) {
      console.error("Failed to load templates:", err);
      showToast("Failed to load templates. Check /api/templates.", "error");
    }
  }

  // --- Form + Preview ---
  const form = document.getElementById("cert-form");
  const previewWrapper = document.getElementById("certificate-preview-wrapper");
  const nameInput = document.getElementById("name");
  const orgInput = document.getElementById("org");
  const descInput = document.getElementById("desc");
  const sigInput = document.getElementById("sig");

  function updatePreview() {
    if (!selectedTemplateId) return;
    const templateNode = document.getElementById(selectedTemplateId);
    if (!templateNode) return;

    const clone = templateNode.cloneNode(true);
    clone.id = "certificate-node";

    // Gather field values (with defaults)
    const name = nameInput.value.trim() || "[Full Name]";
    const org = orgInput.value.trim() || "Aiking Solution";
    const desc = descInput.value.trim() || "For Outstanding Performance";
    const sigName = sigInput.value.trim() || "Project Director";
    const sigPrintName = ["Project Director", "CEO", "Manager"].includes(sigName)
      ? "Sarah Johnson"
      : sigName;
    const sigTitle = ["Project Director", "CEO", "Manager"].includes(sigName)
      ? sigName
      : "Authorized Signature";
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Apply text content safely
    clone.querySelector('[data-field="name"]').textContent = name;
    clone.querySelector('[data-field="org"]').textContent = org;
    clone.querySelector('[data-field="desc"]').textContent = desc;
    clone.querySelector('[data-field="sig"]').textContent = sigPrintName;
    clone.querySelector('[data-field="sig-title"]').textContent = sigTitle;
    clone.querySelector('[data-field="date"]').textContent = date;

    // Render in preview
    previewWrapper.innerHTML = "";
    previewWrapper.appendChild(clone);
  }

  form.addEventListener("input", updatePreview);

  // --- PDF Download ---
  const downloadBtn = document.getElementById("downloadBtn");
  const { jsPDF } = window.jspdf;

  downloadBtn.addEventListener("click", async () => {
    const certNode = document.getElementById("certificate-node");
    if (!certNode) {
      showToast("Please fill in the form and preview first.", "error");
      return;
    }

    if (!nameInput.value.trim()) {
      showToast("Please enter the certificate holder's name.", "error");
      return;
    }

    downloadBtn.disabled = true;
    downloadBtn.textContent = "Generating...";

    try {
    await document.fonts.ready; // ✅ ensure fonts fully loaded

    const canvas = await html2canvas(certNode, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [certNode.offsetWidth, certNode.offsetHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, certNode.offsetWidth, certNode.offsetHeight);
    pdf.save(`Certificate_${nameInput.value.replace(/\s+/g, '_')}.pdf`);
      createdCount++;
      const dashboardCount = document.getElementById("created-count");
      if (dashboardCount) dashboardCount.innerText = createdCount;

      showToast("Certificate downloaded successfully! 🎉");

      // Log generation to backend
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.value,
          template: selectedTemplateId,
        }),
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Error generating PDF. Try again.", "error");
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = "Download as PDF";
    }
  });

  // --- Toast Notification ---
  const toast = document.getElementById("toast");
  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.style.background = type === "error" ? "#d9534f" : "#28a745";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  // --- Initial Load ---
  console.log("✅ create_v2.js loaded successfully");
  loadTemplates();
});