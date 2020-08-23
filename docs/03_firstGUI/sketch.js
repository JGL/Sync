//duplicated by JGL from https://editor.p5js.org/ml5/sketches/PoseNet_webcam
//also using https://github.com/CodingTrain/website/blob/master/Q_and_A/Q_6_p5_background/sketch.js
//via; https://www.youtube.com/watch?v=OIfEHD3KqCg
//and https://github.com/processing/p5.js/wiki/Beyond-the-canvas

/*
ml5 Example
PoseNet example using p5.js
Copyright (c) 2019 ml5
This software is released under the MIT License.
https://opensource.org/licenses/MIT
*/

let capture;
let poseNet;
let poses = [];
let canvas;
let captureWidth;
let captureHeight;
let horizontalRatio;
let verticalRatio;

// GUI controls: https://github.com/bitcraftlab/p5.gui
let gui;
let guiVisible;
let lineWidth;
let lineWidthMin;
let lineWidthMax;
let lineWidthStep;
let backgroundColour;
let lineColour;
let showCamera;

function setup() {
  textAlign(CENTER, CENTER); //https://p5js.org/reference/#/p5/textAlign
  //setting up colour mode and fill mode
  colorMode(HSB); //https://p5js.org/reference/#/p5/colorMode have to do it right at the start of setup, otherwise other created colours remember the colour mode they were created in
  //colorMode(HSB, 360, 100, 100, 1) is default

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
  horizontalRatio = windowWidth / cameraWidth;
  verticalRatio = windowHeight / cameraHeight;

  //GUI setup below
  guiVisible = true;
  lineWidth = 8;
  lineWidthMin = 0;
  lineWidthMax = 42;
  lineWidthStep = 1;
  backgroundColour = [0, 0, 100]; //https://rgb.to/white
  lineColour = [0, 0, 0]; //black in hsl, https://rgb.to/black
  showCamera = false;

  // Create Layout GUI
  gui = createGui('Press g to hide or show me');
  gui.addGlobals('backgroundColour', 'lineColour', 'lineWidth', 'showCamera');
}

function modelReady() {
  select('#status').html('Model Loaded');
  console.log("Model ready!");
}

function draw() {
  // clear all
  clear();
  background(backgroundColour);

  strokeWeight(lineWidth);
  stroke(lineColour);
  noFill();

  if (showCamera) {
    image(capture, 0, 0, windowWidth, windowHeight);
  }

  // We call both functions to draw all keypoints and the skeletons
  drawKeypointsScaled();
  drawSkeletonScaled();
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
      line(partA.position.x * horizontalRatio, partA.position.y * verticalRatio, partB.position.x * horizontalRatio, partB.position.y * verticalRatio);
    }
  }
}

// check for keyboard events
function keyPressed() {
  switch (key) {
    case 'g':
      guiVisible = !guiVisible;
      if (guiVisible) {
        gui.show();
      } else {
        gui.hide();
      }
      break;
  }
}

function windowResized() {
  console.log("Resize!");
  resizeCanvas(windowWidth, windowHeight);
  horizontalRatio = windowWidth / cameraWidth;
  verticalRatio = windowHeight / cameraHeight;
}
