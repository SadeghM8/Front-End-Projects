let speech = new SpeechSynthesisUtterance();
const button = document.querySelector('button');
const textarea = document.querySelector('textarea');

let voices = [];
let voiceSelect = document.querySelector('select');

window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0];
    // Display each voices in the dropdown
    voices.forEach((voice, i) => (voiceSelect.options[i] = new Option(voice.name, i)));
};

// Change speech voice that will be selected in the dropdown
voiceSelect.addEventListener('change', () => {
    speech.voice = voices[voiceSelect.value];
})

// Play the voice
button.addEventListener('click', () =>{
    speech.text = textarea.value;
    window.speechSynthesis.speak(speech);
})
