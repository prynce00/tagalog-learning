import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeUp } from "@fortawesome/free-solid-svg-icons";

export const usePlaySound = (filename) => {
  const audioRef = useRef(new Audio());

  const playSound = () => {
    const voice = "Zhiyu";
    audioRef.current.src = require(`../assets/sounds/${voice}/${filename}.mp3`);

    audioRef.current
      .play()
      .then(() => {
        console.log("Audio playback started.");
      })
      .catch((err) => {
        console.error("Error playing sound:", err);
      });
  };

  return playSound; // Return the playSound function
};

const PlaySound = ({ filename }) => {
  const play = usePlaySound(filename); // Get play function from hook

  return (
    <div>
      <FontAwesomeIcon
        icon={faVolumeUp}
        onClick={play} // Trigger play on click
        style={{ cursor: "pointer", fontSize: "24px" }}
      />
    </div>
  );
};

export default PlaySound;
