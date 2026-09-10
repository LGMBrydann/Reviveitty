const lyrics = document.querySelector("#lyrics");
const background = document.querySelector("#background");
const bgVideo = document.querySelector("#bgVideo");
const bgImage = document.querySelector("#bgImage");
const fallback = document.querySelector("#previewFallback");
const caption = document.querySelector("#caption");
const fontSize = document.querySelector("#fontSize");
const captionPosition = document.querySelector("#captionPosition");
const captionAnimation = document.querySelector("#captionAnimation");
const status = document.querySelector("#status");

let objectUrl = null;

function updateCaption() {
  const text = lyrics.value.trim();
  caption.textContent = text || "Your lyrics will appear here";
  caption.style.fontSize = `${fontSize.value}px`;

  caption.classList.remove("caption-upper", "caption-center", "caption-lower");
  caption.classList.add(`caption-${captionPosition.value}`);

  if (captionAnimation.value === "pop") {
    caption.classList.remove("pop");
    void caption.offsetWidth;
    caption.classList.add("pop");
  }
}

lyrics.addEventListener("input", updateCaption);
fontSize.addEventListener("input", updateCaption);
captionPosition.addEventListener("change", updateCaption);
captionAnimation.addEventListener("change", updateCaption);

background.addEventListener("change", () => {
  const file = background.files[0];
  if (!file) return;

  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);

  fallback.hidden = true;
  bgImage.hidden = true;
  bgVideo.hidden = true;

  if (file.type.startsWith("video/")) {
    bgVideo.src = objectUrl;
    bgVideo.hidden = false;
    bgVideo.play().catch(() => {});
  } else {
    bgImage.src = objectUrl;
    bgImage.hidden = false;
  }
});

document.querySelector("#clearBackground").addEventListener("click", () => {
  background.value = "";
  bgVideo.pause();
  bgVideo.removeAttribute("src");
  bgVideo.load();
  bgImage.removeAttribute("src");
  bgVideo.hidden = true;
  bgImage.hidden = true;
  fallback.hidden = false;
});

document.querySelector("#generate").addEventListener("click", async () => {
  const text = lyrics.value.trim();

  if (!text) {
    status.textContent = "Add some lyrics first.";
    return;
  }

  status.textContent = "Prototype: generation backend comes next...";
  const button = document.querySelector("#generate");
  button.disabled = true;

  await new Promise(resolve => setTimeout(resolve, 1200));

  status.textContent = "Preview ready. Next step: real singing + MP4 rendering.";
  button.disabled = false;
});

updateCaption();
