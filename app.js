const API_URL = "https://reviveitty-api.yeeter.workers.dev";

const lyrics = document.querySelector("#lyrics");
const song = document.querySelector("#song");
const voice = document.querySelector("#voice");
const background = document.querySelector("#background");
const bgVideo = document.querySelector("#bgVideo");
const bgImage = document.querySelector("#bgImage");
const fallback = document.querySelector("#previewFallback");
const caption = document.querySelector("#caption");
const fontSize = document.querySelector("#fontSize");
const captionPosition = document.querySelector("#captionPosition");
const captionAnimation = document.querySelector("#captionAnimation");
const status = document.querySelector("#status");
const generateButton = document.querySelector("#generate");

let objectUrl = null;

function updateCaption() {
  const text = lyrics.value.trim();

  caption.textContent = text || "Your lyrics will appear here";
  caption.style.fontSize = `${fontSize.value}px`;

  caption.classList.remove(
    "caption-upper",
    "caption-center",
    "caption-lower"
  );

  caption.classList.add(`caption-${captionPosition.value}`);

  caption.classList.remove("pop", "fade");

  if (captionAnimation.value === "pop") {
    void caption.offsetWidth;
    caption.classList.add("pop");
  }

  if (captionAnimation.value === "fade") {
    void caption.offsetWidth;
    caption.classList.add("fade");
  }
}

lyrics.addEventListener("input", updateCaption);
fontSize.addEventListener("input", updateCaption);
captionPosition.addEventListener("change", updateCaption);
captionAnimation.addEventListener("change", updateCaption);

background.addEventListener("change", () => {
  const file = background.files[0];

  if (!file) return;

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }

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

generateButton.addEventListener("click", async () => {
  const text = lyrics.value.trim();

  if (!text) {
    status.textContent = "Add some lyrics first.";
    return;
  }

  generateButton.disabled = true;
  status.textContent = "Connecting to Ditty Revival...";

  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lyrics: text,
        song_id: song.value,
        voice_id: voice.value,
        caption_animation: captionAnimation.value,
      }),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The API returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Generation request failed.");
    }

    if (data.status === "queued") {
      status.textContent =
        `Generation queued! Job ID: ${data.job_id}`;
    } else {
      status.textContent =
        data.message || "Generation request accepted.";
    }

  } catch (error) {
    console.error(error);

    status.textContent =
      `Couldn't reach the Ditty Revival API: ${error.message}`;
  } finally {
    generateButton.disabled = false;
  }
});

updateCaption();
