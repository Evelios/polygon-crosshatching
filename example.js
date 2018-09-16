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
var polygon;
var polygon_segments;
var hatching;
var rng;

var params = {
    // Parameters
    min_spacing: 5,
    max_spacing: 30,
    angle: 30,
};

function setup() {
    width = document.body.clientWidth || window.innerWidth;
    height = document.body.clientHeight || window.innerHeight;
    polygon = [
        [padding, 1/3 * height + padding],
        [1/2 * (width - padding), padding],
        [width - padding, 1/3 * height + padding],
        [7/8 * (width - padding), 7/8 * (height - padding)],
        [1/3 * width + padding, height - padding]
    ];

    polygon_segments = polygon.map((vertex, index, array) => {
        const next_vertex = array[(index + 1) % array.length];
        return [vertex, next_vertex];
    });

    createCanvas(width, height);

    setUpGui();
    createAndRender();
}

function setUpGui() {
    var gui = new dat.GUI();

    gui.add(params, "angle", 0, 360, 1).name("Hatching Angle").onChange(createAndRender);
    gui.add(params, "min_spacing", 1, 50, 1).name("Spacing Start").onChange(createAndRender);
    gui.add(params, "max_spacing", 1, 50, 1).name("Spacing End").onChange(createAndRender);
}

function createAndRender() {
    create();
    render();
}

function create() {
    hatching = polygonCrosshatching(polygon, params.angle / 180 * Math.PI,
        params.min_spacing, params.max_spacing);
}

function render() {
    noFill();
    background(bgColor.toHexString());

    strokeWeight(2);
    stroke(primaryColor.toHexString());
    hatching.forEach(hatch => {
        line(hatch[0][0], hatch[0][1], hatch[1][0], hatch[1][1]);
    });

    strokeWeight(4);
    stroke(tertiaryColor.toHexString());
    polygon_segments.forEach((segment) => {
        line(segment[0][0], segment[0][1], segment[1][0], segment[1][1]);
    });
    
}