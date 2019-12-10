"use strict";
const gScriptUrl =
  "https://script.google.com/macros/s/AKfycbwUhPg4qa4ajsVtPAaf-ZtzreMzaRmQbcjP-P66IqsRVbLD8A/exec";
const AWS = require("aws-sdk");
const rekognition = new AWS.Rekognition({ region: "us-east-1" });
const rp = require("request-promise");

exports.handler = async (event, context, callback) => {
  //   const srcBucket = "tf-mars-scoress";
  //   const srcKey = "this-is-it1.large.jpeg";

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

  const options = {
    uri: gScriptUrl,
    json: true,
    body: {
      text: "imageProcessed",
      data: imageText
    }
  };

  console.log("preparing to send to gscripts", options);

  const postToGScripts = await rp(options)
    .then(resp => {
      console.log("successfully posted", resp);
    })
    .catch(err => {
      console.log("failed to post to gscripts", err);
    });

  return postToGScripts;
};
