'use strict'

let canvas = document.getElementById('mainCanvas');
let context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

alert("> click to select a vertex\n> press 'enter' to finish a polyon (2 polygons required to start morphing)");