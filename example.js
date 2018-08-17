"use strict";

// Colors
var bgColor = tinycolor("#303030");
var bgAccent = tinycolor("#393939");
var primaryColor = tinycolor("#AA7539");
var secondaryColor = tinycolor("#A23645");
var tertiaryColor = tinycolor("#27566B");
var quaternaryColor = tinycolor("#479030");

// Globals
var padding = 100;
var width;
var height;
var bbox;
var hatching;
var rng;

var params = {
    // Parameters
    spacing: 10,
    angle: 0,
};

function setup() {
    width = document.body.clientWidth || window.innerWidth;
    height = document.body.clientHeight || window.innerHeight;
    bbox = {
        x : padding,
        y : padding,
        width : width -  (2 * padding),
        height : height - (2 * padding)
    };

    createCanvas(width, height);

    setUpGui();
    createAndRender();
}

function setUpGui() {
    var gui = new dat.GUI();

    gui.add(params, "spacing", 1, 100, 1).name("Line Spacing").onChange(createAndRender);
    gui.add(params, "angle", 0, 360, 1).name("Hatching Angle").onChange(createAndRender);
}

function createAndRender() {
    create();
    render();
}

function create() {
    hatching = boundingboxCrosshatching(bbox, params.spacing, params.angle / 180 * Math.PI);
}

function render() {
    noFill();
    background(bgColor.toHexString());

    strokeWeight(2);
    stroke(primaryColor.toHexString());
    for (var hatch of hatching) {
        console.log(hatch);
        line(hatch[0][0], hatch[0][1], hatch[1][0], hatch[1][1]);
    }

    strokeWeight(4);
    stroke(tertiaryColor.toHexString());
    rect(bbox.x, bbox.y, bbox.width, bbox.height);
}