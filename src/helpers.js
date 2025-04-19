export const getRandomItems = (items, usedCharacters, maxItems = 6) => {
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const usedCharacterSet = new Set(usedCharacters.map((item) => item.word));

  const availableItems = items.filter(
    (item) => !usedCharacterSet.has(item.word)
  );

  const getUniqueItems = (arr, count, firstItemPinyin) => {
    if (arr.length < count) return arr;

    let result = [];

    while (result.length < count) {
      const randomItem = getRandomItem(arr);
      if (
        randomItem &&
        randomItem.translation !== firstItemPinyin &&
        !result.find((item) => item.translation === randomItem.translation)
      ) {
        result.push(randomItem);
      }
      arr = arr.filter((item) => item !== randomItem);
    }

    return result;
  };

  const firstItem = getRandomItem(availableItems);
  if (!firstItem) return [];

  const remainingPool = items.filter((item) => item !== firstItem);

  const uniqueItems = getUniqueItems(
    remainingPool,
    maxItems - 1,
    firstItem.translation
  );

  const result = [firstItem, ...uniqueItems];

  return result.slice(0, maxItems);
};

export const removeDuplicates = (data) =>
  Object.values(
    data.reduce(
      (acc, cur) => (acc[cur.word] ? acc : { ...acc, [cur.word]: cur }),
      {}
    )
  );

export const filterUsedWords = (mainArray, usedCharacters) => {
  const filteredUsedCharacters = removeDuplicates(usedCharacters).map(
    (e) => e.word
  );

  const x = mainArray.filter((item) => {
    return !filteredUsedCharacters.find((e) => e === item.word);
  });

  return x;
};
