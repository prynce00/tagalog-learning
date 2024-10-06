import "./assets/styles/index.scss";
import HSK from "./data/hsk_characters.json";
import Select from "react-select";
import { useLocalStorageContext } from "./providers/localStorageProvider";
import { useEffect, useState } from "react";
import { STATES } from "./contants";
import { filterUsedCharacters, getRandomItems } from "./helpers";
import PlaySound, { usePlaySound } from "./components/playSound";
import useKeyPress from "./hooks/useKeyPress";

const App = () => {
  const { storage, setStorage } = useLocalStorageContext();
  const currentLevels = storage?.levels;
  const state = storage?.state || "reset";
  const correctAnswers = storage?.correctAnswers || 0;
  const processedCharacters = storage?.processedCharacters || 0;
  const usedCharacters = storage?.usedCharacters || [];
  const rating = storage?.rating || 0;
  const known = storage?.known || [];
  const [character, setCharacter] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [options, setOptions] = useState([]);
  const playSound = usePlaySound(character?.pinyin);
  const { isSpacePressed, characterPressed } = useKeyPress();
  const levels = [
    {
      level: 1,
      value: "HSK-1",
    },
    {
      level: 2,
      value: "HSK-2",
    },
    {
      level: 3,
      value: "HSK-3",
    },
    {
      level: 4,
      value: "HSK-4",
    },
    {
      level: 5,
      value: "HSK-5",
    },
    {
      level: 6,
      value: "HSK-6",
    },
    {
      level: "",
      value: "Advance",
    },
  ];

  const finalRating = (rating + known.length) / 2;

  const characterCount = known.length + 10;

  const loadCharacters = () => {
    // let allData = [];
    // currentLevels?.forEach(({ label }) => {
    //   const level = levels.find((e) => label === e.value).level;

    //   const data = HSK.filter((item) => item.hsk === String(level));

    //   allData = [...data, ...allData].sort(() => Math.random() - 0.5);
    //   allData = allData.filter(
    //     (item, index, self) =>
    //       index === self.findIndex((obj) => obj.character === item.character)
    //   );
    // });

    const orderedLevel = HSK.sort((a, b) => parseInt(a.hsk) - parseInt(b.hsk));

    const characterSet = orderedLevel
      .slice(0, characterCount)
      .sort(() => 0.5 - Math.random());

    setCharacters(characterSet);
  };

  useEffect(() => {
    if (isSpacePressed && state === STATES.REVEAL) {
      setCharacter(null);
      setStorage({
        selectedCharacter: null,
        state: STATES.ONGOING,
      });
    }
  }, [isSpacePressed]);

  useEffect(() => {
    const shortcuts = {
      E: 0,
      I: 1,
      D: 2,
      J: 3,
      C: 4,
      N: 5,
    };

    const optionkey = shortcuts[characterPressed];

    if (state === STATES.ONGOING && optionkey !== undefined) {
      document.querySelectorAll(".option-btn")[optionkey].click();
    }
  }, [characterPressed]);

  const handleStates = () => {
    if (state === STATES.ONGOING) {
      if (!character) {
        const randomItem = getRandomItems(characters, usedCharacters);

        if (randomItem.length === 6) {
          setCharacter(randomItem[0]);
          setOptions(randomItem.sort(() => Math.random() - 0.5));
        }
      }
    }
    if (state === STATES.REVEAL) {
      if (!character) {
        setStorage({
          selectedCharacter: null,
          state: STATES.ONGOING,
        });
      }
    }
  };

  const getUserCharactersLen = () =>
    filterUsedCharacters(characters, usedCharacters).length;

  const getRankAndStars = (rating) => {
    if (typeof rating !== "number" || rating < 0) {
      return { rank: "Invalid", stars: 0, starIcons: "" };
    }

    // Cap rating to a maximum of 10,000
    rating = Math.min(rating, 10000);

    const ranks = [
      { name: "Beginner", min: 0, max: 749 },
      { name: "Elementary", min: 750, max: 1499 },
      { name: "Intermediate", min: 1500, max: 2499 },
      { name: "Advanced", min: 2500, max: 4999 },
      { name: "Proficient", min: 5000, max: 10000 },
    ];

    for (let rank of ranks) {
      if (rating >= rank.min && rating <= rank.max) {
        const range = rank.max - rank.min + 1;
        let stars;

        if (rank.name === "Proficient") {
          stars = 5;
        } else {
          stars = Math.max(1, Math.floor((rating - rank.min) / (range / 5)));
        }

        const starIcons = "★".repeat(stars);
        return {
          rank: rank.name,
          stars: stars,
          starIcons: starIcons,
        };
      }
    }
  };

  const revealAnswer = (selected) => {
    if (state !== STATES.ONGOING) {
      return false;
    }

    const char = character.character;

    // Play sound
    playSound();

    const isCorrect = selected.character === char;

    const newCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;

    let newRating = rating;
    let newKnown = known;

    if (isCorrect) {
      let x = 0.1;
      if (!known.includes(char)) {
        newKnown.push(char);
        x = 1;
      }
      newRating += x;
    } else {
      if (known.includes(char)) {
        newKnown = known.filter((item) => item !== char);
      }

      newRating -= 5;
    }

    let newStoreItem = {
      state: STATES.REVEAL,
      selectedCharacter: selected.character,
      usedCharacters: [...usedCharacters, character],
      correctAnswers: newCorrectAnswers,
      processedCharacters: processedCharacters + 1,
      rating: newRating > 0 ? newRating : 0,
      known: newKnown,
    };

    setStorage(newStoreItem);
  };

  const reset = () => {
    setCharacter(null);
    setStorage({
      selectedCharacter: null,
      usedCharacters: [],
      correctAnswers: 0,
      processedCharacters: 0,
      state: STATES.RESET,
      rating: 0,
      known: [],
      unknown: [],
    });
  };

  const getScorePercentage = () => {
    const total = processedCharacters;
    const point = (correctAnswers / total) * 100;

    return isNaN(point) ? "0.00" : parseFloat(point).toFixed(2);
  };

  useEffect(() => {
    loadCharacters();
  }, [currentLevels]);

  useEffect(() => {
    handleStates();

    if (getUserCharactersLen() <= 0) {
      setStorage({
        usedCharacters: [],
      });
      loadCharacters();
    }
  }, [state, characters]);

  const ContinueBtn = ({ label, action }) => (
    <button
      onClick={() => {
        setStorage({
          state: STATES.ONGOING,
        });
        action?.();
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="app-container">
      <div className="level-selector">
        {/* <Select
            options={levels.map((e) => {
              return {
                value: e.level,
                label: e.value,
              };
            })}
            isMulti
            placeholder="Select Level"
            onChange={(e) => {
              setStorage({
                levels: e,
              });
            }}
            value={currentLevels}
          /> */}
      </div>
      <div className="info-container">
        <div className="game-info-container">
          <div className="info-item">
            <span className="title" title="Queued Characters">
              QC:
            </span>
            <span className="value">
              {getUserCharactersLen()}/{characters.length}
            </span>
          </div>
          <div className="info-item">
            <span className="title" title="Estimated Known Characters">
              EKC:
            </span>
            <span className="value">{known.length}</span>
          </div>
          <div className="info-item">
            <span className="title">Accuracy:</span>
            <span className="value">
              {correctAnswers}/{processedCharacters} ({getScorePercentage()}%)
            </span>
          </div>
          <div className="info-item">
            <span
              className="value"
              onClick={() => {
                setStorage({
                  state: STATES.ONGOING,
                });
                reset();
              }}
            >
              --Reset Rating
            </span>
          </div>
        </div>
        <div className="level-info-container">
          <div className="rank-box">
            <span className="stars">
              {getRankAndStars(finalRating).starIcons}
            </span>
            <span className="rank">{getRankAndStars(finalRating).rank}</span>
            <span className="rating">({Math.floor(finalRating)})</span>
          </div>
        </div>
      </div>
      <div className="game-container">
        {state === STATES.RESET && <ContinueBtn label="Start" />}
        {(state === STATES.ONGOING || state === STATES.REVEAL) && (
          <>
            {character ? (
              <>
                <div className="character-container">{character.character}</div>
                <div className="options-container">
                  {options.map((option, ok) => (
                    <div
                      key={`option-btn-${option.pinyin}-${ok}`}
                      className={`btn-container ${
                        state === STATES.REVEAL &&
                        (character.character === option.character
                          ? "correct"
                          : "")
                      }
                   ${
                     state === STATES.REVEAL &&
                     storage.selectedCharacter === option.character
                       ? character.character === option.character
                         ? "correct"
                         : "wrong"
                       : ""
                   }`}
                    >
                      <PlaySound filename={option.pinyin} />
                      <button
                        className="option-btn"
                        onClick={() => revealAnswer(option)}
                      >
                        {option.pinyin}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {!currentLevels ? (
                  <p>Select a level to continue</p>
                ) : (
                  <ContinueBtn
                    label="Reset"
                    action={() => {
                      reset();
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
        {state === STATES.REVEAL && (
          <div className="answer-container">
            <span className="info">{character?.definition}</span>
            <div className="action-box">
              <ContinueBtn
                label="Next"
                action={() => {
                  setCharacter(null);
                  setStorage({
                    selectedCharacter: null,
                  });
                }}
              />
              {/* {mode === "normal" && (
                <ContinueBtn
                  label="Reset"
                  action={() => {
                    reset();
                  }}
                />
              )} */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
