import "./assets/styles/index.scss";
import WORDS from "./data/filipino_words.json";
import { useLocalStorageContext } from "./providers/localStorageProvider";
import { useEffect, useState } from "react";
import { STATES } from "./contants";
import { filterUsedWords, getRandomItems } from "./helpers";
import PlaySound, { usePlaySound } from "./components/playSound";

const App = () => {
  const { storage, setStorage } = useLocalStorageContext();
  const state = storage?.state || "reset";
  const correctAnswers = storage?.correctAnswers || 0;
  const processedWords = storage?.processedWords || 0;
  const usedWords = storage?.usedWords || [];
  const mistakes = storage?.mistakes || 0;
  const nextReviewWord = storage?.nextReviewWord || 10;
  const counter = storage?.counter || 0;
  const masteryCount = 100;
  const known = storage?.known || [];
  const wordStats = storage?.wordStats || {};
  const [word, setWord] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [totalCharacters, setTotalCharacters] = useState([]);
  const [options, setOptions] = useState([]);

  const playSound = usePlaySound(word?.word);

  const loadWords = () => {
    setTotalCharacters(WORDS);

    setCharacters(WORDS);
  };

  const calculateRating = () => {
    const maxMultiplier = WORDS?.length / totalCharacters.length;

    return known.reduce((total, item) => {
      const contribution = Math.min(
        (item.correctCount / 1.5) * maxMultiplier,
        maxMultiplier
      );
      return total + contribution;
    }, 0);
  };

  const finalRating = calculateRating();

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    if (word) {
      playSound(word.word);
    }
  }, [word]);

  useEffect(() => {
    const reuseFrequency = 5;

    if (counter >= reuseFrequency) {
      setStorage({
        counter: 0,
      });
      reuseWords(1);
    }
  }, [counter]);

  const handleStates = () => {
    if (state === STATES.ONGOING) {
      if (!word) {
        const randomItem = getRandomItems(characters, known);

        if (randomItem.length === 6) {
          setWord(randomItem[0]);
          setOptions(randomItem.sort(() => Math.random() - 0.5));
        }
      }
    }
    if (state === STATES.REVEAL) {
      if (!word) {
        setStorage({
          selectedCharacter: null,
          state: STATES.ONGOING,
        });
      }
    }
  };

  const getUserWordsLen = () => filterUsedWords(characters, usedWords).length;

  const getRankAndStars = (rating) => {
    if (typeof rating !== "number" || rating < 0) {
      return { rank: "Invalid", stars: 0, starIcons: "" };
    }

    // Cap rating to a maximum of 10,000
    rating = Math.min(rating, 10000);

    // Define ranks with adjusted names
    const ranks = [
      { name: "Novice", min: 0, max: 99 },
      { name: "Beginner", min: 100, max: 224 },
      { name: "Aspiring", min: 225, max: 349 },
      { name: "Learner", min: 350, max: 474 },
      { name: "Elementary", min: 475, max: 599 },
      { name: "Explorer", min: 600, max: 724 },
      { name: "Intermediate", min: 725, max: 849 },
      { name: "Adventurer", min: 850, max: 974 },
      { name: "Achiever", min: 975, max: 1099 },
      { name: "Advanced", min: 1100, max: 1224 },
      { name: "Expert", min: 1225, max: 1349 },
      { name: "Master", min: 1350, max: 1474 },
      { name: "Virtuoso", min: 1475, max: 1599 },
      { name: "Adept", min: 1600, max: 1724 },
      { name: "Savant", min: 1725, max: 1849 },
      { name: "Legend", min: 1850, max: 2249 },
      { name: "Champion", min: 2250, max: 3249 },
      { name: "Hero", min: 3250, max: 4500 },
      { name: "Conqueror", min: 4501, max: 5750 },
      { name: "Invincible", min: 5751, max: 7000 },
      { name: "Titan", min: 7001, max: 8000 },
      { name: "Overlord", min: 8001, max: 8500 },
      { name: "Supreme", min: 8501, max: 9000 },
      { name: "Master", min: 9001, max: 9500 },
      { name: "Deity", min: 9501, max: 10000 },
    ];

    for (let rank of ranks) {
      if (rating >= rank.min && rating <= rank.max) {
        const range = rank.max - rank.min + 1;
        let stars;

        if (rank.name === "Deity") {
          stars = 5; // Maximum stars for Deity
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

    return { rank: "Unknown", stars: 0, starIcons: "" }; // Fallback case
  };

  const reuseWords = (words = 1) => {
    // Mastered words shouldn't be part of reuse words anymore
    const finalWords = usedWords.filter((e) => {
      const stats = wordStats?.[e.word] || 0;

      return stats < masteryCount;
    });

    const removed = [];
    const removedUsedChar = [...finalWords]; // so the original array isn't mutated

    const countToRemove = Math.min(words, removedUsedChar.length);

    for (let i = 0; i < countToRemove; i++) {
      const randomIndex = Math.floor(Math.random() * removedUsedChar.length);
      const [removedItem] = removedUsedChar.splice(randomIndex, 1);
      removed.push(removedItem.word);
    }

    const newKnown = known.filter((e) => !removed.includes(e.word));

    setTimeout(() => {
      setStorage({
        usedWords: removedUsedChar,
        known: newKnown,
      });
    }, 100);
  };

  const revealAnswer = (selected) => {
    if (state !== STATES.ONGOING) {
      return false;
    }

    const char = word.word;

    const isCorrect = selected.word === char;

    const newCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;

    let newUsedChar = usedWords;
    let newKnown = known;
    let newMistakes = mistakes;
    let newNextRevWord = nextReviewWord;

    if (!wordStats[char]) {
      wordStats[char] = 0;
    }

    if (isCorrect) {
      const knownItem = known.find((item) => item.word === char);

      if (!knownItem) {
        newKnown.push({ word: char, correctCount: 1 });
      } else {
        knownItem.correctCount += 1; // Increment correctCount for the known word
      }

      newUsedChar = [...usedWords, word];

      wordStats[char] += 1;
    } else {
      const knownItem = known.find((item) => item.word === char);
      if (knownItem) {
        knownItem.correctCount -= 1;
        if (knownItem.correctCount <= 0) {
          newKnown = known.filter((item) => item.word !== char);
        } else {
          newKnown = [...known];
        }
      } else {
        newKnown = [...known];
      }

      wordStats[char] -= 1;

      if (wordStats[char] < 0) {
        wordStats[char] = 0;
      }

      reuseWords(7);

      newMistakes = mistakes + 1;
    }

    let newStoreItem = {
      state: STATES.REVEAL,
      selectedCharacter: selected.word,
      usedWords: newUsedChar,
      correctAnswers: newCorrectAnswers,
      processedWords: processedWords + 1,
      counter: counter + 1,
      known: newKnown,
      wordStats,
      mistakes: newMistakes,
      nextReviewWord: newNextRevWord,
    };

    setStorage(newStoreItem);
  };

  const reset = () => {
    setWord(null);
    setStorage({
      selectedCharacter: null,
      usedWords: [],
      correctAnswers: 0,
      processedWords: 0,
      state: STATES.RESET,
      rating: 0,
      known: [],
      unknown: [],
      mistakes: 0,
      nextReviewWord: 0,
      counter: 0,
      wordStats: {},
    });
  };

  const getScorePercentage = () => {
    const total = processedWords;
    const point = (correctAnswers / total) * 100;

    return isNaN(point) ? "0.00" : parseFloat(point).toFixed(2);
  };

  useEffect(() => {
    handleStates();

    if (getUserWordsLen() <= 0) {
      loadWords();
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
      id="next-btn"
    >
      {label}
    </button>
  );

  return (
    <div className="app-container">
      <div className="level-selector"></div>
      <div className="info-container">
        <div className="game-info-container">
          <div className="info-item">
            <span className="title" title="Queued Characters">
              Words:
            </span>
            <span className="value">
              {known.length}/{totalCharacters.length}
            </span>
          </div>
          <div className="info-item">
            <span className="title">Accuracy:</span>
            <span className="value">
              {correctAnswers}/{processedWords} ({getScorePercentage()}%)
            </span>
          </div>
          <div className="info-item pointer" onClick={reset}>
            <span className="value">↻ Reset Progress</span>
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
            {word && (
              <>
                <div className="word-container">
                  {wordStats[word.word] >= masteryCount && (
                    <span className="master-icon">⭐</span>
                  )}
                  {word.word}
                </div>
                <PlaySound filename={word.word} />
                <div className="options-container">
                  {options.map((option, ok) => (
                    <div
                      key={`option-btn-${option.translation}-${ok}`}
                      className={`btn-container ${
                        state === STATES.REVEAL &&
                        (word.word === option.word ? "correct" : "")
                      }
                   ${
                     state === STATES.REVEAL &&
                     storage.selectedCharacter === option.word
                       ? word.word === option.word
                         ? "correct"
                         : "wrong"
                       : ""
                   }`}
                    >
                      <button
                        className="option-btn"
                        onClick={() => revealAnswer(option)}
                      >
                        {option.translation}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {state === STATES.REVEAL && (
          <div className="answer-container">
            <span className="info">{word?.definition}</span>
            <div className="action-box">
              <ContinueBtn
                label="Next"
                action={() => {
                  setWord(null);
                  setStorage({
                    selectedCharacter: null,
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
