"use strict";
const gScriptUrl =
  "https://script.google.com/macros/s/AKfycbwUhPg4qa4ajsVtPAaf-ZtzreMzaRmQbcjP-P66IqsRVbLD8A/exec";
const AWS = require("aws-sdk");
const rekognition = new AWS.Rekognition({ region: "us-east-1" });
const request = require("request");

const createGameData = (rawData, playerOrder) => {
  const nameKeys = ["Shil", "Stud", "Raines", "Copp"];

  const gameObject = {
    [playerOrder[0]]: [],
    [playerOrder[1]]: [],
    [playerOrder[2]]: [],
    [playerOrder[3]]: [],
  };

  if (nameKeys.every((key) => Object.keys(gameObject).includes(key))) {
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

exports.handler = async (event, context, callback) => {
  //   const srcBucket = "tf-mars-scoress";
  //   const srcKey = "this-is-it1.large.jpeg";

  console.log("MYEVENT", event);

  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  var params = {
    Image: {
      S3Object: {
        Bucket: srcBucket,
        Name: srcKey,
      },
    },
  };

  const imageText = await rekognition
    .detectText(params)
    .promise()
    .then(function (data) {
      console.log("got data from rekognition", data);
      return data;
    })
    .catch(function (err) {
      return err;
    });

  // here we will need some processing on the result
  const playerOrder = srcKey.split("111").slice(0, -1);
  const processedData = createGameData(imageText.TextDetections, playerOrder);
  console.log("processedData", processedData);

  const options = {
    url: gScriptUrl,
    method: "POST",
    headers: { "Content-Type": "application/javascript" },
    body: JSON.stringify({
      text: "imageProcessed",
      data: processedData,
    }),
  };

  console.log("preparing to send to gscripts", options);

  const postToGScripts = await new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) reject(error);

      console.log(body);
      resolve(response);
    });
  });

  return postToGScripts;
};
