import { $, $$, esc } from "../../core/dom.js";
export function createCompanionVoice({ state, lifetime, status, ask }) {
  function voiceStatus(text) {
    $("#companion-voice-state").hidden = false;
    $("#companion-voice-state").textContent = text;
  }
  function stopVoice() {
    state.voiceMode = false;
    state.recognition?.abort();
    state.recognition = null;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    $("#companion-stop-voice").hidden = true;
    $("#companion-open-voice").setAttribute("aria-pressed", "false");
    status();
  }
  function listen() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      voiceStatus(
        "Voice input is unavailable in this browser. You can type below.",
      );
      state.voiceMode = false;
      return;
    }
    state.recognition = new Speech();
    state.recognition.lang = "en-US";
    state.recognition.interimResults = true;
    state.recognition.continuous = false;
    state.recognition.onstart = () =>
      voiceStatus("Listening… speak your question.");
    state.recognition.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++)
        text += e.results[i][0].transcript;
      if (e.results[e.results.length - 1].isFinal) {
        $("#companion-question").value = "";
        ask(text);
      } else $("#companion-question").value = text;
    };
    state.recognition.onerror = (e) => {
      voiceStatus(
        e.error === "not-allowed"
          ? "Microphone permission was not granted. You can type below."
          : "Voice input stopped. Press the voice icon to try again.",
      );
      state.voiceMode = false;
      $("#companion-stop-voice").hidden = true;
    };
    state.recognition.onend = () => {
      if (state.voiceMode && !state.busy && !state.voiceSpeaking)
        voiceStatus("Tap the voice icon to speak again.");
    };
    try {
      state.recognition.start();
    } catch {
      voiceStatus("Voice input could not start. You can type below.");
      state.voiceMode = false;
    }
  }
  function speakReply(text) {
    if (!state.voiceMode || !("speechSynthesis" in window)) return;
    state.voiceSpeaking = true;
    state.recognition?.abort();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.onend = () => {
      state.voiceSpeaking = false;
      if (state.voiceMode) {
        voiceStatus("Ready. Tap the voice icon for your next question.");
      }
    };
    utterance.onerror = () => {
      state.voiceSpeaking = false;
      voiceStatus("The reply is available in the chat.");
    };
    voiceStatus("Speaking · standard device voice");
    speechSynthesis.speak(utterance);
  }
  return { voiceStatus, stopVoice, listen, speakReply };
}
