// -------------------- ELEMENTS --------------------
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const themeToggle = document.getElementById("theme-toggle");
const newChatBtn = document.getElementById("new-chat-btn");
const clearBtn = document.getElementById("clear-history-btn"); // fixed ID
const voiceBtn = document.getElementById("voice-btn");

// -------------------- VOICE RECOGNITION --------------------
let recognizing = false;
let recognition;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    recognizing = true;
    voiceBtn.textContent = "🎙 Listening...";
  };

  recognition.onend = () => {
    recognizing = false;
    voiceBtn.textContent = "🎤";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage(true); // Voice-based message
  };
}

voiceBtn.addEventListener("click", () => {
  if (recognizing) {
    recognition.stop();
    return;
  }
  recognition.start();
});

// -------------------- TEXT TO SPEECH --------------------
function speak(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.pitch = 1;
    utterance.rate = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

// -------------------- THEME TOGGLE --------------------
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
});

// -------------------- FILE UPLOAD --------------------
uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileName = file.name;
  const fileType = file.type;

  // Display file or image in chat
  if (fileType.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      img.className = "user-image";
      appendMessage("user", img);
    };
    reader.readAsDataURL(file);
  } else {
    appendMessage("user", `📎 Uploaded: ${fileName}`);
  }

  // Send to backend
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", "Analyze this file or image.");

  const typing = appendTypingIndicator();

  try {
    const response = await fetch("http://localhost:8080/api/chat", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    typing.remove();
    appendBotResponse(result);
    speak(result);
  } catch (error) {
    typing.remove();
    appendBotResponse("⚠️ Error processing file. Please try again.");
  }
});

// -------------------- SEND MESSAGE --------------------
sendBtn.addEventListener("click", () => sendMessage(false));
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage(false);
});

async function sendMessage(fromVoice = false) {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  const typing = appendTypingIndicator();

  try {
    const response = await fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const result = await response.text();
    typing.remove();
    appendBotResponse(result);

    if (fromVoice) speak(result);
  } catch (error) {
    typing.remove();
    appendBotResponse("⚠️ Unable to connect to the server.");
  }
}

// -------------------- CHAT DISPLAY FUNCTIONS --------------------
function appendMessage(sender, content) {
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "user-message" : "bot-message fade-in";

  if (typeof content === "string") msgDiv.textContent = content;
  else msgDiv.appendChild(content);

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBotResponse(text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "bot-message fade-in";
  msgDiv.innerHTML = text.replace(/\n/g, "<br>");
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// -------------------- TYPING INDICATOR --------------------
function appendTypingIndicator() {
  const div = document.createElement("div");
  div.className = "bot-message typing-dots";
  div.innerHTML = "<span>•</span><span>•</span><span>•</span>";
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

// -------------------- NEW CHAT --------------------
newChatBtn.addEventListener("click", () => {
  chatBox.innerHTML = "";
  appendMessage("bot", "👋 New chat started! You can talk or type now.");
});

// -------------------- CLEAR CHAT --------------------
clearBtn.addEventListener("click", () => {
  chatBox.innerHTML = "";
});
