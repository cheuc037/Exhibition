/* Interactive Exhibition Page — Vanilla JS
   Loads layout + layer metadata from /data/exhibit.json
*/

const exhibitEl = document.getElementById("exhibit");

const layerModal = document.getElementById("layerModal");
const menuModal = document.getElementById("menuModal");

const modalTitle = document.getElementById("modalTitle");
const modalP1 = document.getElementById("modalP1");
const modalP2 = document.getElementById("modalP2");
const modalImg = document.getElementById("modalImg");
const modalCrop = document.getElementById("modalCrop");

const menuP1 = document.getElementById("menuP1");
const menuP2 = document.getElementById("menuP2");
const menuP3 = document.getElementById("menuP3");

let data = null;
let selectedLayerId = null;

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function setHidden(el, hidden) {
  el.classList.toggle("hidden", hidden);
}

function blurBackground(on) {
  qs(".baseArea")?.classList.toggle("blurred", on);
  qs(".menuTab")?.classList.toggle("blurred", on);
  qsa(".layer").forEach((l) => l.classList.toggle("blurred", on));
  // disable pointer events when modal open
  qsa(".layer").forEach((l) => (l.style.pointerEvents = on ? "none" : ""));
  if (qs(".menuTab")) qs(".menuTab").style.pointerEvents = on ? "none" : "";
}

function openLayerModal(layer) {
  selectedLayerId = layer.id;

  // title + placeholder text
  modalTitle.textContent = layer.name;
  modalP1.textContent = layer.description?.p1 || "";
  modalP2.textContent = layer.description?.p2 || "";

  // pick size logic similar to React
  const size = getEnlargedSize(layer);
  modalCrop.style.width = size.width + "px";
  modalCrop.style.height = size.height + "px";

  modalImg.src = layer.image;
  modalImg.alt = layer.name;

  // apply crop image style exactly
  modalImg.style.height = layer.imgStyle.height;
  modalImg.style.left = layer.imgStyle.left;
  modalImg.style.top = layer.imgStyle.top;
  modalImg.style.width = layer.imgStyle.width;
  modalImg.style.position = "absolute";
  modalImg.style.maxWidth = "none";
  modalImg.style.objectFit = "cover";

  setHidden(layerModal, false);
  blurBackground(true);
}

function closeLayerModal() {
  selectedLayerId = null;
  setHidden(layerModal, true);
  blurBackground(false);
}

function openMenu() {
  menuP1.textContent = data?.menu?.p1 || "";
  menuP2.textContent = data?.menu?.p2 || "";
  menuP3.textContent = data?.menu?.p3 || "";
  setHidden(menuModal, false);
  blurBackground(true);
}

function closeMenu() {
  setHidden(menuModal, true);
  blurBackground(false);
}

function getEnlargedSize(layer) {
  let scaleFactor = 1.5;
  let maxSize = 600;

  // Scale up for larger displays
  const is2K = window.innerWidth >= 2000;
  const is4K = window.innerWidth >= 3200;

  if (is4K) {
    scaleFactor *= 2.2;
    maxSize = 1800;
  } else if (is2K) {
    scaleFactor *= 1.67;
    maxSize = 1200;
  }

  if (layer.id === "yuzu") {
    scaleFactor = 0.833;
    maxSize = 1000;
    if (is4K) {
      scaleFactor *= 2.2;
      maxSize = 2400;
    } else if (is2K) {
      scaleFactor *= 1.67;
      maxSize = 1800;
    }
  } else if (layer.id === "pride") {
    scaleFactor = 0.5;
    maxSize = 1000;
    if (is4K) {
      scaleFactor *= 2.2;
      maxSize = 2400;
    } else if (is2K) {
      scaleFactor *= 1.67;
      maxSize = 1800;
    }
  } else if (layer.id === "collage") {
    scaleFactor = 0.8;
    if (is4K) {
      scaleFactor *= 2.86; // 2.2 * 1.3 (30% bigger)
      maxSize = 2340; // 1800 * 1.3
    } else if (is2K) {
      scaleFactor *= 1.67;
      maxSize = 1200;
    }
  } else if (layer.id === "bojackBalloons") {
    if (is4K) {
      scaleFactor *= 2.0; // Reduced size for 4K
      maxSize = 1600;
    }
  } else if (layer.id === "phos") {
    if (is4K) {
      scaleFactor *= 1.144; // 60% smaller
      maxSize = 936;
    }
  } else if (layer.id === "promise") {
    if (is4K) {
      scaleFactor *= 2.0; // Reduced size for 4K
      maxSize = 1600;
    }
  } else if (layer.id === "horse") {
    if (is4K) {
      scaleFactor *= 1.4; // 30% smaller
      maxSize = 1120;
    }
  }
  return {
    width: Math.min(layer.width * scaleFactor, maxSize),
    height: Math.min(layer.height * scaleFactor, maxSize),
  };
}

function percentX(px) {
  return (px / data.base.width) * 100;
}
function percentY(px) {
  return (px / data.base.totalHeight) * 100;
}
function percentW(px) {
  return (px / data.base.width) * 100;
}
function percentH(px) {
  return (px / data.base.totalHeight) * 100;
}

function render() {
  exhibitEl.innerHTML = "";

  // top border
  const top = document.createElement("div");
  top.className = "borderTop";
  exhibitEl.appendChild(top);

  // base image area
  const baseArea = document.createElement("div");
  baseArea.className = "baseArea";
  const baseImg = document.createElement("img");
  baseImg.src = data.base.image;
  baseImg.alt = "Exhibition Base";
  baseArea.appendChild(baseImg);

  // menu tab - positioned inside baseArea for clipping
  const menu = document.createElement("div");
  menu.className = "menuTab";
  menu.style.left = percentX(1352) + "%";
  // Adjust top position: subtract border height (66px) and calculate relative to baseArea height (897px)
  const baseTop = 66; // border height
  const baseHeight = 897; // baseArea height from CSS
  menu.style.top = ((103 - baseTop) / baseHeight) * 100 + "%";
  menu.style.width = percentW(194) + "%";
  menu.style.height = (79 / baseHeight) * 100 + "%";
  menu.addEventListener("click", openMenu);

  const plus = document.createElement("div");
  plus.className = "menuPlus";
  plus.textContent = "+";
  menu.appendChild(plus);
  baseArea.appendChild(menu); // Append to baseArea instead of exhibitEl

  exhibitEl.appendChild(baseArea);

  // bottom border
  const bottom = document.createElement("div");
  bottom.className = "borderBottom";
  exhibitEl.appendChild(bottom);

  // layers
  for (const layer of data.layers) {
    const el = document.createElement("div");
    el.className = "layer";
    el.style.left = percentX(layer.left) + "%";
    el.style.top = percentY(layer.top) + "%";
    el.style.width = percentW(layer.width) + "%";
    el.style.height = percentH(layer.height) + "%";
    el.addEventListener("click", () => openLayerModal(layer));

    const inner = document.createElement("div");
    inner.className = "layerInner";

    const img = document.createElement("img");
    img.src = layer.image;
    img.alt = layer.name;
    img.style.height = layer.imgStyle.height;
    img.style.left = layer.imgStyle.left;
    img.style.top = layer.imgStyle.top;
    img.style.width = layer.imgStyle.width;

    inner.appendChild(img);
    el.appendChild(inner);
    exhibitEl.appendChild(el);
  }
}

function wireModalClose(modalEl, closeFn) {
  modalEl.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.matches("[data-close]")) closeFn();
  });
  qsa("[data-close]", modalEl).forEach((btn) =>
    btn.addEventListener("click", closeFn),
  );
}

wireModalClose(layerModal, closeLayerModal);
wireModalClose(menuModal, closeMenu);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!layerModal.classList.contains("hidden")) closeLayerModal();
    if (!menuModal.classList.contains("hidden")) closeMenu();
  }
});

async function init() {
  const res = await fetch("./data/exhibit.json", { cache: "no-store" });
  data = await res.json();
  render();
}

init().catch((err) => {
  exhibitEl.innerHTML = `<div style="padding:24px;color:white">Failed to load data/exhibit.json<br>${String(err)}</div>`;
});
