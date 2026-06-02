import soundSucces from "@/assets/sounds/correct.mp3"
import soundError from "@/assets/sounds/incorrect.mp3"

export function playSucces() {
  const sussec = new Audio(soundSucces);
  sussec.play();
}

export function playError() {
  const error = new Audio(soundError);
  error.play();
}