export function createModalController({
  modalRoot,
  titleElement,
  contentElement,
  closeButton,
  onOpen,
  onClose,
  logger = console,
}) {
  if (!modalRoot || !titleElement || !contentElement || !closeButton) {
    throw new Error("Modal elements were not found.");
  }

  const panelElement = modalRoot.querySelector(".modal-panel");
  if (!panelElement) {
    throw new Error("Modal panel element was not found.");
  }

  let open = false;
  const defaultMaxWidth = "720px";
  const defaultMaxHeight = "86vh";

  function setVisibility(shouldShow) {
    open = shouldShow;
    modalRoot.classList.toggle("hidden", !shouldShow);
    modalRoot.setAttribute("aria-hidden", String(!shouldShow));
  }

  function clearContent() {
    contentElement.innerHTML = "";
  }

  function normalizeCssSize(value, label) {
    if (value === undefined || value === null) {
      return null;
    }

    if (Number.isFinite(value) && value > 0) {
      return `${value}px`;
    }

    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }

    logger.warn(`[modal] Invalid ${label} value. Using default size.`);
    return null;
  }

  function applyPanelSize({ maxWidth, maxHeight }) {
    const resolvedMaxWidth =
      normalizeCssSize(maxWidth, "maxWidth") || defaultMaxWidth;
    const resolvedMaxHeight =
      normalizeCssSize(maxHeight, "maxHeight") || defaultMaxHeight;

    panelElement.style.setProperty("--modal-max-width", resolvedMaxWidth);
    panelElement.style.setProperty("--modal-max-height", resolvedMaxHeight);
  }

  function openModal({ title, renderContent, maxWidth, maxHeight }) {
    clearContent();
    applyPanelSize({ maxWidth, maxHeight });
    titleElement.textContent = title || "";
    renderContent(contentElement);
    setVisibility(true);

    if (typeof onOpen === "function") {
      onOpen();
    }

    closeButton.focus();
    return true;
  }

  function openText({ title, text, maxWidth, maxHeight }) {
    if (typeof text !== "string" || text.trim() === "") {
      logger.warn("[modal] openModalText was called with empty text.");
      return false;
    }

    return openModal({
      title,
      maxWidth,
      maxHeight,
      renderContent(target) {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        target.appendChild(paragraph);
      },
    });
  }

  function openVideo({
    title,
    src,
    type = "video/mp4",
    description = "",
    maxWidth,
    maxHeight,
  }) {
    if (typeof src !== "string" || src.trim() === "") {
      logger.warn("[modal] openModalVideo was called without a valid src.");
      return false;
    }

    return openModal({
      title,
      maxWidth,
      maxHeight,
      renderContent(target) {
        const video = document.createElement("video");
        video.controls = true;
        video.preload = "metadata";
        video.setAttribute("playsinline", "true");

        const source = document.createElement("source");
        source.src = src;
        source.type = type;
        video.appendChild(source);

        video.addEventListener("error", () => {
          logger.warn(`[modal] Video failed to load: ${src}`);
        });

        target.appendChild(video);

        if (description) {
          const note = document.createElement("p");
          note.textContent = description;
          target.appendChild(note);
        }

        const fallback = document.createElement("p");
        fallback.textContent = "Your browser cannot play this video.";
        video.appendChild(fallback);
      },
    });
  }

  function openHtml({ title, html, maxWidth, maxHeight }) {
    if (typeof html !== "string" || html.trim() === "") {
      logger.warn("[modal] openModalHtml was called without HTML content.");
      return false;
    }

    return openModal({
      title,
      maxWidth,
      maxHeight,
      renderContent(target) {
        // HTML here must come from predefined content entries only.
        target.innerHTML = html;
      },
    });
  }

  function close() {
    if (!open) {
      return;
    }

    setVisibility(false);
    clearContent();

    if (typeof onClose === "function") {
      onClose();
    }
  }

  closeButton.addEventListener("click", close);

  modalRoot.addEventListener("click", (event) => {
    const clickedBackdrop =
      event.target instanceof HTMLElement &&
      event.target.dataset.closeModal === "true";
    if (clickedBackdrop) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && open) {
      close();
    }
  });

  setVisibility(false);

  return {
    openText,
    openVideo,
    openHtml,
    close,
    isOpen() {
      return open;
    },
  };
}
