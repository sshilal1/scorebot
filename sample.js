// gameObject = {
//   Stud: [40, 7, 5, 3, 3, 22, 80],
//   Copp: [31, 5, 5, 7, 12, 7, 67, 54],
//   Raines
//   etc...
// };

// rawData = [
//   {
//     "DetectedText": "HAVEN",
//     "Type": "LINE",
//     "Id": 0,
//     "Confidence": 95.71684265136719,
//     "Geometry": ["Object"]
//   },
//   ...

const data = require("./data/studrainescoppshilecoline-elysium.json");

const createGameData = (rawData, playerOrder) => {
  // Now we can process
  let gameObject = {};

  let detectIterator = 2;

  if (rawData[1].DetectedText.includes("RATING")) {
    console.log("Successfully parsed heading text");
    detectIterator = 2;
  } else if (rawData[2].DetectedText.includes("RATING")) {
    console.log("Successfully parsed heading text");
    detectIterator = 3;
  } else if (rawData[3].DetectedText.includes("RATING")) {
    console.log("Successfully parsed heading text");
    detectIterator = 4;
  } else {
    return new Error("Error parsing heading text");
  }

  const firstScore = rawData[detectIterator].DetectedText.replace(
    /O/gi,
    "0"
  ).split(" ");
  gameObject[playerOrder[0]] = firstScore;

  if (firstScore.length >= 7) {
    console.log("good first line");
  } else if (firstScore.length == 6) {
    console.log("missing 1 score from first line");
    if (rawData[detectIterator + 1].DetectedText.split(" ").length <= 2) {
      console.log("found 1 on next line, should be good");
      detectIterator++;
      gameObject[playerOrder[0]].push(
        rawData[detectIterator].DetectedText.replace(/O/gi, "0")
      );
    } else {
      return new Error("Error parsing first line score");
    }
  }
  detectIterator++;

  const secondScore = rawData[detectIterator].DetectedText.replace(
    /O/gi,
    "0"
  ).split(" ");
  gameObject[playerOrder[1]] = secondScore;

  if (secondScore.length >= 7) {
    console.log("good second line");
  } else if (secondScore.length == 6) {
    console.log("missing 1 score from second line");
    if (rawData[detectIterator + 1].DetectedText.split(" ").length <= 2) {
      console.log("found 1 on next line, should be good");
      detectIterator++;
      gameObject[playerOrder[1]].push(
        rawData[detectIterator].DetectedText.replace(/O/gi, "0")
      );
    } else {
      return new Error("Error parsing second line score");
    }
  }
  detectIterator++;

  const thirdScore = rawData[detectIterator].DetectedText.replace(
    /O/gi,
    "0"
  ).split(" ");
  gameObject[playerOrder[2]] = thirdScore;

  if (thirdScore.length >= 7) {
    console.log("good third line");
  } else if (thirdScore.length == 6) {
    console.log("missing 1 score from third line");
    if (rawData[detectIterator + 1].DetectedText.split(" ").length <= 2) {
      console.log("found 1 on next line, should be good");
      detectIterator++;
      gameObject[playerOrder[2]].push(
        rawData[detectIterator].DetectedText.replace(/O/gi, "0")
      );
    } else {
      return new Error("Error parsing third line score");
    }
  }
  detectIterator++;

  const fourthScore = rawData[detectIterator].DetectedText.replace(
    /O/gi,
    "0"
  ).split(" ");
  gameObject[playerOrder[3]] = fourthScore;

  if (fourthScore.length >= 7) {
    console.log("good fourth line");
  } else if (fourthScore.length == 6) {
    console.log("missing 1 score from fourth line");
    if (rawData[detectIterator + 1].DetectedText.split(" ").length <= 2) {
      console.log("found 1 on next line, should be good");
      detectIterator++;
      gameObject[playerOrder[3]].push(
        rawData[detectIterator].DetectedText.replace(/O/gi, "0")
      );
    } else {
      return new Error("Error parsing fourth line score");
    }
  }

  return gameObject;
};

const newCreateGameData = (rawData, playerOrder) => {
  const nameKeys = ["Shil", "Stud", "Raines", "Copp"];

  const gameObject = {
    [playerOrder[0]]: [],
    [playerOrder[1]]: [],
    [playerOrder[2]]: [],
    [playerOrder[3]]: [],
  };

  if (nameKeys.every((key) => Object.keys(gameObject).includes(key))) {
    // continue
    const studIndex = rawData.findIndex(
      (detectedItem) =>
        detectedItem.DetectedText.toLowerCase().includes("stud") &&
        detectedItem.Type === "LINE"
    );
    console.log("studIndex", studIndex);
    for (let i = studIndex; i <= studIndex + 8; i++) {
      let detected = rawData[i];

      const shouldAdd = shouldAddScore(detected.DetectedText);

      if (shouldAdd.should) {
        gameObject.Stud.push(shouldAdd.value);
      }
    }

    const coppIndex = rawData.findIndex(
      (detectedItem) =>
        detectedItem.DetectedText.toLowerCase().includes("cope") &&
        detectedItem.Type === "LINE"
    );
    console.log("coppIndex", coppIndex);
    for (let i = coppIndex; i <= coppIndex + 8; i++) {
      let detected = rawData[i];

      const shouldAdd = shouldAddScore(detected.DetectedText);

      if (shouldAdd.should) {
        gameObject.Copp.push(shouldAdd.value);
      }
    }

    const shilIndex = rawData.findIndex(
      (detectedItem) =>
        detectedItem.DetectedText.toLowerCase().includes("shil") &&
        detectedItem.Type === "LINE"
    );
    console.log("shilIndex", shilIndex);
    for (let i = shilIndex; i <= shilIndex + 8; i++) {
      let detected = rawData[i];

      const shouldAdd = shouldAddScore(detected.DetectedText);

      if (shouldAdd.should) {
        gameObject.Shil.push(shouldAdd.value);
      }
    }

    const rainesIndex = rawData.findIndex(
      (detectedItem) =>
        detectedItem.DetectedText.toLowerCase().includes("rain") &&
        detectedItem.Type === "LINE"
    );
    console.log("rainesIndex", rainesIndex);
    for (let i = rainesIndex; i <= rainesIndex + 8; i++) {
      let detected = rawData[i];

      const shouldAdd = shouldAddScore(detected.DetectedText);

      if (shouldAdd.should) {
        gameObject.Raines.push(shouldAdd.value);
      }
    }

    return gameObject;
  } else {
    throw new Error("ERROR: Couldn't parse names from playerOrder object");
  }
};

const shouldAddScore = (detectedText) => {
  const lowerCasedNames = ["shil", "stud", "rain", "cope"];

  if (
    lowerCasedNames.some((name) => detectedText.toLowerCase().includes(name))
  ) {
    return { should: false };
  } else {
    if (isNaN(parseInt(detectedText))) {
      console.log("NaN", detectedText);
      const isZero = detectedText.replace(/O/gi, "0").split(" ");
      if (isZero[0] === "0") {
        return { should: true, value: "0" };
      }
      return { should: false };
    } else {
      return { should: true, value: detectedText };
    }
  }
};

const result = newCreateGameData(data, ["Shil", "Raines", "Copp", "Stud"]);

console.log("result", result);
