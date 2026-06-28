document.addEventListener("DOMContentLoaded", () => {
  // --- Template Loading ---
  const templateSelector = document.getElementById("template-selector");
  let availableTemplates = [];
  let selectedTemplateId = "tpl-modern";

  async function loadTemplates() {
    try {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      availableTemplates = await res.json();

      templateSelector.innerHTML = "";
      availableTemplates.forEach((tpl) => {
        const option = document.createElement("div");
        option.className = "template-option fade-in-up";
        option.dataset.id = tpl.id;
        option.innerHTML = `
          <div class="template-thumb" style="background-image: url('${tpl.thumbnail}'), linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"></div>
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
      // Check if modern exists, otherwise just pick the first
      const defaultTemplate = templateSelector.querySelector(`[data-id="${selectedTemplateId}"]`) || templateSelector.firstElementChild;
      if (defaultTemplate) {
          defaultTemplate.classList.add("selected");
          selectedTemplateId = defaultTemplate.dataset.id;
      }

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
    if (clone.querySelector('[data-field="org"]')) clone.querySelector('[data-field="org"]').textContent = org;
    if (clone.querySelector('[data-field="desc"]')) clone.querySelector('[data-field="desc"]').textContent = desc;
    if (clone.querySelector('[data-field="sig"]')) clone.querySelector('[data-field="sig"]').textContent = sigPrintName;
    if (clone.querySelector('[data-field="sig-title"]')) clone.querySelector('[data-field="sig-title"]').textContent = sigTitle;
    if (clone.querySelector('[data-field="date"]')) clone.querySelector('[data-field="date"]').textContent = date;

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
      nameInput.focus();
      return;
    }

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg> Generating...
    `;

    try {
      await document.fonts.ready; 

      const canvas = await html2canvas(certNode, {
          scale: 3, // High resolution
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
      
      // Update LocalStorage count
      let currentCount = parseInt(localStorage.getItem('cert_count') || "0", 10);
      localStorage.setItem('cert_count', currentCount + 1);

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
      downloadBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
      `;
    }
  });

  // --- Toast Notification ---
  const toast = document.getElementById("toast");
  function showToast(message, type = "success") {
    toast.innerHTML = type === "error" 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${message}`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ${message}`;
    
    toast.style.background = type === "error" ? "var(--error-color)" : "var(--accent-color)";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
  }

  // --- Initial Load ---
  // Add quick CSS animation class for the spinner
  const style = document.createElement('style');
  style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`;
  document.head.appendChild(style);

  loadTemplates();
});