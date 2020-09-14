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
// p5.gui wants var variables NOT let variables...
var gui;
var guiVisible;
var strokeWidth;
var strokeWidthMin;
var strokeWidthMax;
var strokeWidthStep;
var backgroundColour;
var strokeColour;
var showCamera;
var fillColour;
var drawStroke;
var drawFilled;
var shapeToDraw;
var shapeRadius;
var shapeRadiusMin;
var shapeRadiusMax;
var shapeRadiusStep;
var strokeOpacity;
var strokeOpacityMin;
var strokeOpacityMax;
var strokeOpacityStep;
var fillOpacity;
var fillOpacityMin;
var fillOpacityMax;
var fillOpacityStep;
var drawSkeleton;
var drawEffects;
var drawHistory;
var historyOfPoses = [];
var lengthOfHistory;
var lengthOfHistoryMin;
var lengthOfHistoryMax;
var lengthOfHistoryStep;

function setup() {
  textAlign(CENTER, CENTER); //https://p5js.org/reference/#/p5/textAlign

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
  // This sets up a new function newPose that processes the results array of poses every time a new one 
  // is created
  // see coding train for more info:
  // https://www.youtube.com/watch?time_continue=334&v=OIo-DIOkNVg
  poseNet.on('pose', gotPose);
  // Hide the video element, and just show the canvas
  capture.hide();

  //https://github.com/CodingTrain/website/blob/master/Q_and_A/Q_6_p5_background/sketch.js
  horizontalRatio = windowWidth / cameraWidth;
  verticalRatio = windowHeight / cameraHeight;

  //GUI setup below
  guiVisible = true;
  strokeWidth = 8;
  strokeWidthMin = 0;
  strokeWidthMax = 42;
  strokeWidthStep = 1;
  backgroundColour = [255, 255, 255]; // white
  strokeColour = [0, 0, 0]; //black
  showCamera = true;
  fillColour = [255, 0, 0]; //red
  drawStroke = true;
  drawFilled = true;
  shapeToDraw = ['vertical line', 'horizontal line', 'circle', 'triangle', 'square', 'pentagon', 'star'];
  shapeRadius = 10;
  shapeRadiusMin = 0;
  shapeRadiusMax = 42;
  shapeRadiusStep = 1;
  strokeOpacity = 255;
  strokeOpacityMin = 0;
  strokeOpacityMax = 255;
  strokeOpacityStep = 1;
  fillOpacity = 255;
  fillOpacityMin = 0;
  fillOpacityMax = 255;
  fillOpacityStep = 1;
  drawSkeleton = true;
  drawEffects = true;
  drawHistory = false;

  lengthOfHistory = 10;
  lengthOfHistoryMin = 2;
  lengthOfHistoryMax = 30;
  lengthOfHistoryStep = 1;

  // Create Layout GUI
  gui = createGui('Press g to hide or show me');
  gui.addGlobals('drawHistory', 'drawSkeleton', 'drawEffects', 'backgroundColour', 'drawStroke', 'strokeColour', 'strokeOpacity', 'strokeWidth', 'drawFilled', 'fillColour', 'fillOpacity', 'showCamera', 'shapeToDraw', 'shapeRadius', 'lengthOfHistory');
}

function modelReady() {
  select('#status').html('Model Loaded');
  console.log("Model ready!");
}

function draw() {
  // clear all
  clear();
  background(backgroundColour);

  // set fill style
  if (drawFilled) {
    //https://p5js.org/reference/#/p5/fill
    let c = color(fillColour);
    fill(red(c), green(c), blue(c), fillOpacity);
  } else {
    noFill();
  }

  // set stroke style
  if (drawStroke) {
    //https://p5js.org/reference/#/p5/stroke
    let c = color(strokeColour);
    stroke(red(c), green(c), blue(c), strokeOpacity);
    strokeWeight(strokeWidth);
  } else {
    noStroke();
  }

  if (showCamera) {
    image(capture, 0, 0, windowWidth, windowHeight);
  }

  // We call both functions to draw all keypoints and the skeleton, only draw skeleton if wanted and effects
  if (drawEffects) {
    if (drawHistory) {
      drawHistoryOfEffectsScaled();
    } else {
      drawEffectsScaled();
    }
  }
  if (drawSkeleton) {
    if (drawHistory) {
      drawHistoryOfSkeletonScaled();
    } else {
      drawSkeletonScaled();
    }
  }
}

function drawHistoryOfEffectsScaled() {
  for (let i = 0; i < historyOfPoses.length; i++) {
    poses = historyOfPoses[i];
    drawEffectsScaled();
  }
}

// A function to draw effects over the detected keypoints
function drawEffectsScaled() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        let d = shapeRadius;
        let x = keypoint.position.x * horizontalRatio;
        let y = keypoint.position.y * verticalRatio;

        // pick a shape
        switch (shapeToDraw) {
          case 'vertical line':
            //https://p5js.org/reference/#/p5/line
            //line(x1, y1, x2, y2)
            line(x, 0, x, windowHeight);
            break;

          case 'horizontal line':
            //https://p5js.org/reference/#/p5/line
            //line(x1, y1, x2, y2)
            line(0, y, windowWidth, y);
            break;

          case 'circle':
            ellipse(x, y, d, d);
            break;

          case 'square':
            //rectMode(CENTER);
            rect(x, y, d, d);
            break;

          case 'triangle':
            ngon(3, x, y, d);
            break;

          case 'pentagon':
            ngon(5, x, y, d);
            break;

          case 'star':
            star(9, x, y, d / sqrt(3), d);
            break;

        }
      }
    }
  }
}

function drawHistoryOfSkeletonScaled() {
  for (let i = 0; i < historyOfPoses.length; i++) {
    poses = historyOfPoses[i];
    drawSkeletonScaled();
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

// draw a regular n-gon with n sides - stolen from https://github.com/bitcraftlab/p5.gui/blob/master/examples/quicksettings-1/sketch.js
function ngon(n, x, y, d) {
  beginShape();
  for (var i = 0; i < n; i++) {
    var angle = TWO_PI / n * i;
    var px = x + sin(angle) * d / 2;
    var py = y - cos(angle) * d / 2;
    vertex(px, py);
  }
  endShape(CLOSE);
}


// draw a regular n-gon with n sides - stolen from https://github.com/bitcraftlab/p5.gui/blob/master/examples/quicksettings-1/sketch.js
function star(n, x, y, d1, d2) {
  beginShape();
  for (var i = 0; i < 2 * n; i++) {
    var d = (i % 2 === 1) ? d1 : d2;
    var angle = PI / n * i;
    var px = x + sin(angle) * d / 2;
    var py = y - cos(angle) * d / 2;
    vertex(px, py);
  }
  endShape(CLOSE);
}

function gotPose(aNewPose) {
  poses = aNewPose;

  historyOfPoses.push(aNewPose);
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
  while (historyOfPoses.length > lengthOfHistory) {
    historyOfPoses.shift(); // The shift() method removes the first element from an array and returns that removed element. This method changes the length of the array.
  }
}
