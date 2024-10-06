import { useEffect, useState } from "react";

const useKeyPress = () => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isEnterPressed, setIsEnterPressed] = useState(false);
  const [isEscapePressed, setIsEscapePressed] = useState(false);
  const [characterPressed, setCharacterPressed] = useState(null);

  const handleKeyDown = (event) => {
    switch (event.code) {
      case "Space":
        setIsSpacePressed(true);
        setCharacterPressed(" ");
        break;
      case "Enter":
        setIsEnterPressed(true);
        setCharacterPressed("Enter");
        break;
      case "Escape":
        setIsEscapePressed(true);
        setCharacterPressed("Escape");
        break;
      default:
        if (event.code.startsWith("Key")) {
          const char = event.code.charAt(3);
          setCharacterPressed(char.toUpperCase());
        }
        break;
    }
  };

  const handleKeyUp = (event) => {
    switch (event.code) {
      case "Space":
        setIsSpacePressed(false);
        break;
      case "Enter":
        setIsEnterPressed(false);
        break;
      case "Escape":
        setIsEscapePressed(false);
        break;
    }
    setCharacterPressed(null);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return {
    isSpacePressed,
    isEnterPressed,
    isEscapePressed,
    characterPressed,
  };
};

export default useKeyPress;
