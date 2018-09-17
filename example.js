"use strict";

// Colors
const bgColor = tinycolor("#303030");
const bgAccent = tinycolor("#393939");
const primaryColor = tinycolor("#AA7539");
const secondaryColor = tinycolor("#A23645");
const tertiaryColor = tinycolor("#27566B");
const quaternaryColor = tinycolor("#479030");

// Globals
let padding = 100;
let width;
let height;
let polygon;
let polygon_segments;
let hatching;
let rng;

const inverse_function = fn => {
    return x => 1 - fn(x)
};

let params = {
    // Parameters
    min_spacing: 5,
    max_spacing: 30,
    angle: 30,
    redistribution: 'Linear',
    distribution_strength: 1,
    inverse: false,

    // Options
    redistribution_options: [
        'Linear',
        'Exponential',
        'Sinusoidal',
        'Random',
        // 'Logarithmic',
    ],

    // Functions
    redistribution_functions: {
        Linear : _ => {
            return x => x;
        },
        Exponential : strength => {
            return x => Math.pow(x, strength);
        },
        Sinusoidal : strength => {
            return x => remap(Math.sin(strength * x * 2*Math.PI), -1, 1, 0, 1);
        },
        Random : _ => {
            return _ => Math.random();
        },
    },
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
    gui.add(params, "min_spacing", 1, 50, 1).name("Start Density").onChange(createAndRender);
    gui.add(params, "max_spacing", 1, 50, 1).name("End Density").onChange(createAndRender);
    gui.add(params, "redistribution", params.redistribution_options).name("Redistribution").onChange(createAndRender);
    gui.add(params, "distribution_strength", 1, 10, 1).name("Strength").onChange(createAndRender);
    gui.add(params, "inverse").name("Inverse Distribution").onChange(createAndRender);
}

function createAndRender() {
    create();
    render();
}

function create() {
    let redistribution_function = 
        params.redistribution_functions[params.redistribution](params.distribution_strength);

    redistribution_function = params.inverse
        ? inverse_function(redistribution_function)
        : redistribution_function;

    hatching = polygonCrosshatching(polygon, params.angle / 180 * Math.PI,
        params.min_spacing, params.max_spacing, redistribution_function);
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

function remap(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }