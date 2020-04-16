"use strict";
const gScriptUrl =
  "https://script.google.com/macros/s/AKfycbwUhPg4qa4ajsVtPAaf-ZtzreMzaRmQbcjP-P66IqsRVbLD8A/exec";
const AWS = require("aws-sdk");
const rekognition = new AWS.Rekognition({ region: "us-east-1" });
// const rp = require("request-promise");
const request = require("request");
// const sampledata = require("./data/sampledata3");

const createGameData = (rawData, playerOrder) => {
  // Now we can process
  let gameObject = {};

  if (rawData[2].DetectedText == "RATING") {
    console.log("Successfully parsed heading text");
  } else {
    return new Error("Error parsing heading text");
  }

  let detectIterator = 3;
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
        Name: srcKey
      }
    }
  };

  const imageText = await rekognition
    .detectText(params)
    .promise()
    .then(function(data) {
      console.log("got data from rekognition", data);
      return data;
    })
    .catch(function(err) {
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
      data: processedData
    })
  };

  console.log("preparing to send to gscripts", options);

  const postToGScripts = await new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) reject(error);

      console.log(body);
      resolve(response);
    });
  });

  return postToGScripts;
};

// console.log("starting");
// const myvar = createGameData(sampledata, ["Josh", "Shil", "Stud", "Copp"]);
// console.log(myvar)
