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
const fontSizeValue = document.querySelector("#fontSizeValue");
const captionPosition = document.querySelector("#captionPosition");
const captionAnimation = document.querySelector("#captionAnimation");

const characterCount = document.querySelector("#characterCount");

const status = document.querySelector("#status");
const generateButton = document.querySelector("#generate");
const generateText = document.querySelector("#generateText");
const generateArrow = document.querySelector("#generateArrow");

const connectionDot = document.querySelector("#connectionDot");
const connectionText = document.querySelector("#connectionText");

let objectUrl = null;


// ==============================
// API CONNECTION STATUS
// ==============================

async function checkAPI() {
  connectionText.textContent = "Checking API...";
  connectionDot.classList.remove("connected", "error");

  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error("API reported an error.");
    }

    connectionDot.classList.add("connected");
    connectionText.textContent = "API Connected";

  } catch (error) {
    console.error("API health check failed:", error);

    connectionDot.classList.add("error");
    connectionText.textContent = "API Offline";
  }
}


// ==============================
// CHARACTER COUNT
// ==============================

function updateCharacterCount() {
  const count = lyrics.value.length;

  characterCount.textContent = count;

  if (count >= 5000) {
    characterCount.classList.add("limit");
  } else {
    characterCount.classList.remove("limit");
  }
}


// ==============================
// CAPTION PREVIEW
// ==============================

function updateCaption() {
  const text = lyrics.value.trim();

  caption.textContent =
    text || "Your lyrics will appear here";

  caption.style.fontSize =
    `${fontSize.value}px`;

  caption.classList.remove(
    "caption-upper",
    "caption-center",
    "caption-lower"
  );

  caption.classList.add(
    `caption-${captionPosition.value}`
  );

  caption.classList.remove(
    "pop",
    "fade"
  );

  if (captionAnimation.value === "pop") {
    void caption.offsetWidth;
    caption.classList.add("pop");
  }

  if (captionAnimation.value === "fade") {
    void caption.offsetWidth;
    caption.classList.add("fade");
  }

  if (fontSizeValue) {
    fontSizeValue.textContent =
      `${fontSize.value}px`;
  }
}


// ==============================
// LYRICS EVENTS
// ==============================

lyrics.addEventListener(
  "input",
  () => {
    updateCaption();
    updateCharacterCount();
  }
);

fontSize.addEventListener(
  "input",
  updateCaption
);

captionPosition.addEventListener(
  "change",
  updateCaption
);

captionAnimation.addEventListener(
  "change",
  updateCaption
);


// ==============================
// BACKGROUND IMAGE
// ==============================

background.addEventListener(
  "change",
  () => {
    const file = background.files[0];

    if (!file) {
      return;
    }

    // Only images/GIFs are allowed.
    if (!file.type.startsWith("image/")) {
      status.textContent =
        "Please choose an image or GIF.";

      background.value = "";

      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    objectUrl = URL.createObjectURL(file);

    // Hide everything first.
    fallback.hidden = true;
    bgImage.hidden = true;
    bgVideo.hidden = true;

    // Stop any previous video.
    bgVideo.pause();
    bgVideo.removeAttribute("src");
    bgVideo.load();

    // Show image/GIF.
    bgImage.src = objectUrl;
    bgImage.hidden = false;

    status.textContent =
      "Background added.";
  }
);


// ==============================
// CLEAR BACKGROUND
// ==============================

document
  .querySelector("#clearBackground")
  .addEventListener(
    "click",
    () => {

      background.value = "";

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }

      bgVideo.pause();
      bgVideo.removeAttribute("src");
      bgVideo.load();

      bgImage.removeAttribute("src");

      bgVideo.hidden = true;
      bgImage.hidden = true;

      fallback.hidden = false;

      status.textContent =
        "";
    }
  );


// ==============================
// GENERATE DITTY
// ==============================

generateButton.addEventListener(
  "click",
  async () => {

    const text = lyrics.value.trim();

    // Validate lyrics.
    if (!text) {
      status.textContent =
        "Add some lyrics first.";

      lyrics.focus();

      return;
    }

    // Validate length.
    if (text.length > 5000) {
      status.textContent =
        "Your lyrics are too long.";

      return;
    }

    // Disable button.
    generateButton.disabled = true;

    generateText.textContent =
      "Generating...";

    generateArrow.textContent =
      "…";

    status.textContent =
      "Connecting to Ditty Revival...";

    try {

      console.log(
        "Sending generation request..."
      );

      const requestBody = {
        lyrics: text,
        song_id: song.value,
        voice_id: voice.value,
        caption_animation:
          captionAnimation.value
      };

      console.log(
        "Request:",
        requestBody
      );

      const response = await fetch(
        `${API_URL}/api/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(
            requestBody
          )
        }
      );

      console.log(
        "API response status:",
        response.status
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `API returned invalid JSON (HTTP ${response.status}).`
        );
      }

      console.log(
        "API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
          `Generation failed (HTTP ${response.status}).`
        );
      }

      if (data.ok !== true) {
        throw new Error(
          data.error ||
          "The API rejected the generation request."
        );
      }

      if (data.status === "queued") {

        status.textContent =
          `Generation queued! Job ID: ${data.job_id}`;

        generateText.textContent =
          "Queued!";

        generateArrow.textContent =
          "✓";

      } else {

        status.textContent =
          data.message ||
          "Generation request accepted.";

        generateText.textContent =
          "Request sent";

        generateArrow.textContent =
          "✓";
      }

    } catch (error) {

      console.error(
        "Ditty generation error:",
        error
      );

      status.textContent =
        `Generation failed: ${error.message}`;

      generateText.textContent =
        "Try Again";

      generateArrow.textContent =
        "→";

    } finally {

      setTimeout(() => {
        generateButton.disabled = false;

        if (
          generateText.textContent === "Queued!" ||
          generateText.textContent === "Request sent"
        ) {
          generateText.textContent =
            "Generate Ditty";

          generateArrow.textContent =
            "→";
        }
      }, 1500);
    }
  }
);


// ==============================
// INITIALIZE
// ==============================

updateCaption();
updateCharacterCount();
checkAPI();
