"use strict";

exports.handler = (event, context, callback) => {
  const AWS = require("aws-sdk");
  const s3 = new AWS.S3({ region: "us-east-1" });
  const request = require("request").defaults({ encoding: null });

  console.log("got a request to move file to s3", event);

  const eventBody = JSON.parse(event.body);
  console.log(eventBody);

  const imageUrl = eventBody.attachments[0].url;
  const playersString =
    eventBody.players[1] +
    "111" +
    eventBody.players[2] +
    "111" +
    eventBody.players[3] +
    "111" +
    eventBody.players[4] +
    "111";
  const bucketKey = playersString + imageUrl.replace("/", "") + ".jpeg";

  request.get(imageUrl, function(err, res, body) {
    var params = {
      Bucket: "tf-mars-scores-pics",
      Key: bucketKey,
      Body: res.body,
      GrantFullControl:
        "id=c42ca4ef9885f3fa43d723c3195f5099feeb49883ea2e7b7ae2880b28e9ed9dc"
    };

    s3.upload(params, function(err, data) {
      if (err) {
        console.log("error uploading image", err);
      } else {
        console.log("successfully uploaded image", data);
      }
    });
  });
};
