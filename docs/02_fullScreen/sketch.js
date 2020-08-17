//duplicated by JGL from https://editor.p5js.org/ml5/sketches/PoseNet_webcam
//also using https://github.com/CodingTrain/website/blob/master/Q_and_A/Q_6_p5_background/sketch.js
//via; https://www.youtube.com/watch?v=OIfEHD3KqCg
//and https://github.com/processing/p5.js/wiki/Beyond-the-canvas

/* ===
ml5 Example
PoseNet example using p5.js
=== */

// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let capture;
let poseNet;
let poses = [];
let canvas;
let captureWidth;
let captureHeight;
let horizontalRatio;
let verticalRatio;

function setup() {
  cameraWidth = 640;
  cameraHeight = 480;

  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  canvas.style('width', '100%');
  canvas.style('height', '100%');
  /* via https://github.com/CodingTrain/website/blob/master/Q_and_A/Q_6_p5_background/sketch.js and https://www.youtube.com/watch?v=OIfEHD3KqCg */
  //https://github.com/processing/p5.js/wiki/Beyond-the-canvas
  // canvas.parent("p5jsSketch");

  capture = createCapture(VIDEO);
  capture.size(cameraWidth, cameraHeight);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(capture, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function (results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  capture.hide();

  //https://github.com/CodingTrain/website/blob/master/Q_and_A/Q_6_p5_background/sketch.js
  // mic = new p5.AudioIn();
  // mic.start();
  horizontalRatio = windowWidth / cameraWidth;
  verticalRatio = windowHeight / cameraHeight;
}

function modelReady() {
  select('#status').html('Model Loaded');
  console.log("Model ready!");
}

function draw() {
  background(0);
  image(capture, 0, 0, windowWidth, windowHeight);

  // We can call both functions to draw all keypoints and the skeletons
  // drawKeypoints();
  // drawSkeleton();

  drawKeypointsScaled();
  drawSkeletonScaled();

  //https://github.com/CodingTrain/website/blob/master/Q_and_A/Q_6_p5_background/sketch.js
  if (mouseIsPressed) {
    stroke(255, 255, 255);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
  // var vol = mic.getLevel();
  // ellipse(windowWidth / 2, windowHeight / 2, vol * windowWidth);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypointsScaled() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x * horizontalRatio, keypoint.position.y * verticalRatio, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeletonScaled() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x * horizontalRatio, partA.position.y * verticalRatio, partB.position.x * horizontalRatio, partB.position.y * verticalRatio);
    }
  }
}

// function keyPressed() {
//   clear();
// }

function windowResized() {
  console.log("Resize!");
  resizeCanvas(windowWidth, windowHeight);
  horizontalRatio = windowWidth / cameraWidth;
  verticalRatio = windowHeight / cameraHeight;
}
