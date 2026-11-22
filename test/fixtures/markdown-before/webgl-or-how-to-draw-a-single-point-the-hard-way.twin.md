# WebGL. Or... how to draw a single point, the hard way.

- Author: Jorge Romero
- Published: 2023-01-20
- Tags: WebGL, TypeScript, JavaScript, 3d
- Web page: https://jrlgs.dev/blog/webgl-or-how-to-draw-a-single-point-the-hard-way

---

This time let's start with WebGL. For today let's walk through setting up a project and writing a basic WebGL program.

If you are familiar with Three.js, you will notice that WebGL is much *much* more low level.

WebGL is just an API for using the GPU to draw pixels on the screen. It is not, contrary to what you may think, a 3D graphics library.

There is *a lot* of work before we can draw triangles on the screen...

## Initial Setup

You can set up your project however you want. I am using Vite with plain TypeScript. My folder structure looks something like this:

```plaintext
./root
|-- src
   |-- utils
     |-- WebGLUtils.ts
   |-- webgl_programs
     |-- simple_program
       |-- shaders
         |-- fragment.glsl
         |-- vertex.glsl
       |-- simple.module.ts
   |-- main.ts
   |-- style.css
|-- index.html
|-- package.json
|-- tsconfig.json
```

Nothing too complicated if you have used Vite or some other frontend tooling before.

The only thing to note is those `.glsl` files. Those are *shaders* written in *GLSL*, a strongly typed language similar to C, and they are the code that is run by the GPU. We will get to that in a bit, don't worry!

As I am using Vite, I will use the ES Module style:

```html
<body>
	<canvas id="webgl"></canvas>
	<script type="module" src="./src/main.ts"></script>
<body>
```

We start with an HTML `canvas` element somewhere on our page as you can see above. Then, from `main.ts` we get a reference and get its webgl2 context.

```TypeScript
import "./style.css"

function main () {

	// WebGL setup
	const canvas = document.querySelector<HTMLCanvasElement>("#webgl")
	const gl = canvas.getContext("webgl2")
}

document.addEventListener("DOMContentLoaded", () => {
	main()
})
```

A few notes before continuing. First, I am writing this file as if it was an ES module, that's what the `type` attribute of the `<script>` tag means. Also, Vite will handle importing CSS files in this manner.

Second, I am not running the "main" function directly, nor am I using an immediate function invocation. Instead, I am just telling the browser to run `main()` when the `DOMContentLoaded` event is fired. This happens whenever the browser has finished loading the DOM. You shouldn't use the "load" event in this case.

Third, you may want to add some error handling. But I will omit some of that on the example code. Use your own judgment. For example:

```typescript
const gl = canvas?.getContext("webgl2")
if (!gl) {
	console.error("No webgl2 context")
	return
}
gl.drawArrays(gl.POINTS, 0, 1) // this would crash if there is not gl context object
```

## The Deal with WebGL

WebGL is just a fancy way to use the GPU to draw pixels on the screen. Of course, *using the GPU involves some* complications. But I will not explain those here. I'll save that for another post :D

> And, though you may not finish reading this article thinking like that, it indeed is a FANCY way to draw with the GPU.
> 
> It is quite a high-level API, compared to other graphics APIs like Vulkan... (which I may write about in the future)

### The WebGL Context

You can think of WebGL as a *state machine*. You start with a reference to `gl`, which is of type `WebGLRenderingContext` or `WebGL2RenderingContext` (depending on which version of WebGL you are using).

Then you run a bunch of methods to "setup" the state of the WebGL context.

For example:

```typescript
...

gl.clearColor(1.0, 0.0, 0.0, 1.0) // RGBA values
gl.useProgram(shaderProgram) // some WebGL 'program' to be used
gl.clear(gl.COLOR_BUFFER_BIT) // clear the color buffer

let vertices = new Float32Array([ // vertices of a triangle
	0.0, 0.5,  -0.0, -0.5,   0.5, -0.5
])

// create a vertex buffer object to hold the vertices data
let vertexBuffer = gl.createBuffer();

// bind the ARRAY_BUFFER of webgl to the vertex buffer object 
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

// setup webgl to pass vertex data to the bound shaders in gl.program
let a_Position = gl.getAttibLocation(gl.program, "a_Position")
gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(a_Position)


gl.drawArrays(gl.POINTS, 0, 3) // actually draw something
```

Don't worry if nothing here makes sense. In this example, the only line that actually *does something* is `gl.drawArrays()`. It draws to the screen, as you may expect.

However, we should ask *what does it draw?* It draws whatever the *current* state of the buffer indicated by `gl.ARRAY_BUFFER` of the WebGL context is at the moment.

All those previous lines are setting up the state that should be rendered when `gl.drawArrays()` is called.

Shaders then...

### A Hand-wavy Introduction to the *Graphics Pipeline*

Once the `gl.drawArrays()` function is called, all the data on the current state is used to ask the GPU to draw. This process is called the *graphics pipeline* and roughly consists of several steps:

First, get all the vertex data and compute, per vertex, its position on the screen once projected from 3D World-Space to Screen-space.

Second, the GPU needs to compute which pixels on the screen correspond to each triangle of the mesh being drawn to the screen. We call those pixels *fragments*.

Third, the GPU needs to compute, per fragment, the final color for the fragment, depending on the lighting, material, and so.

Finally, the GPU needs to merge all the fragments for all the triangles for all the meshes being rendered, in a way that makes sense. And output a *framebuffer* which you can think of as an array of pixel colors to be passed to the HTML canvas.

The first and third stages of the process are user-defined (we decide how to process the vertices and the fragments). A *shader* is a program that will be run per vertex and fragment.

There are *vertex shaders* and *fragment shaders*, respectively. Together they form a *shader program*.

Ok enough theory. Let's write a WebGL program!

## A simple program

Let's first add a couple of new folders and files to our project.

```TypeScript
import "./style.css"

import * as SimpleProgram from "./webgl_programs/simple_program/simple.module"

function main () {

	// WebGL setup
	const canvas = document.querySelector<HTMLCanvasElement>("#webgl")
	const gl = canvas.getContext("webgl2")

	SimpleProgram.run(gl)
}

document.addEventListener("DOMContentLoaded", () => {
	main()
})
```

I made a `webgl_programs` folder for the applications we will write. Inside it I also created a `shaders` folder, which we will se later. Let's for now look at the "simple\_program":

```typescript
  
import vertexShaderSource from "./shaders/vert.glsl?raw";
import fragmentShaderSource from "./shaders/frag.glsl?raw";

export function run(gl: WebGL2RenderingContext) {

// load and init shader program

// set attributes

// render

}
```

So the run function above just executes whatever we put here. We can see that there are three parts for our program.

### Load and init shaders

Maybe you are curious about the weird lines:

```typescript
import vertexShaderSource from "./shaders/vert.glsl?raw";
import fragmentShaderSource from "./shaders/frag.glsl?raw";
```

if you had never seen those imports with the `"...?raw"` at the end, those are a way to let Vite know we want to keep whatever is on the file as a string on the named identifier. Our shader source code is just a string. We will let WebGL compile it later.

Look now at the part of our program that inits our shaders and creates our *shader program*.

```typescript
export function run (gl:WebGL2RenderingContext) {

	// init vertex shader
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	if (!vertexShader) {
		console.error("Failed to create vertex shader");
		return null;
	}
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error(`Failed to compile shader: ${gl.getShaderInfoLog(vertexShader)}`);
	}
	
	// init fragment shader
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	if (!fragmentShader) {
	    console.error("Failed to create fragment shader");
    	return null;
	}
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error(`Failed to compile shader: ${gl.getShaderInfoLog(fragmentShader)}`);
	}
	
	// create shader program
	let program = gl.createProgram()
	if (!program) {
	    console.error("Failed to create program")
    	return null
	}
	
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)
	
	if (!program) {
    console.error(`Failed to link program: ${gl.getProgramInfoLog(program)}`)
    	gl.deleteProgram(program)
    	gl.deleteShader(program)
    	gl.deleteProgram(program)
    	return null
	}
	
	gl.useProgram(program)

}
```

A few notes. No doubt you think that it is very verbose. At each step, we are telling the WebGL context to do something, imperatively.

For example, we need to create a `WebGLShader` object and then tell WebGL to set the source of *some* shader using `gl.shaderSource()`. You may have expected something like this:

```typescript
let vertexShader = gl.createShader(gl.VERTEX_SHADER)
vertexShader.setSource(vertexShaderSource)
```

However, we have to use this idiom instead:

```typescript
let vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, vertexShaderSource)
```

> The `gl.VERTEX_SHADER` parameter is just a number under the hood. However, the API expects a WebGL constant. All of which are of type `GLEnum`, which is a 32-bit number of type `unsigned long`. Whenever the API expects such constants, you should use the appropriate constant retrieved as `gl.<constant>` form the `gl` context.

Similarly with this part:

```typescript
let program = gl.createProgram()
...
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)
...
gl.useProgram(program)
```

You may have expected something like:

```typescript
let program = gl.createProgram()
...
program.attachShader(vertexShader)
program.attachShader(fragmentShader)
program.link()
...
gl.useProgram(program)
```

WebGL's API mirrors OpenGL's closely which is a C API. So, no object-oriented-style methods. The more you read WebGL programs the more used to them you get.

By now, you should be able to go back and understand the entire snippet above that creates a shader program to be used on the graphics pipeline. Make sure to browse the WebGL API docs.

> I have big expectations of you. So no hand-holding! :D

### GLSL

Remember that GLSL is a low level strictly typed language similar to C. It is intended to be compiled by WebGL and run on the GPU.

Before continuing with the rest of the program, here's the code for the vertex shader.

```c
attribute vec4 a_Position;

void main() {
	gl_Position = a_Position;
	gl_PointSize = 10.0;
}
```

And the fragment shader

```c
void main () {
	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0)
}
```

For now, the only relevant thing is that `attribute` keyword. It means that there is a piece of data that we will send from our javascript application to the GPU. So the shader will get as input some `a_Position` value of type `vec4`, which is just a list of four floating point numbers.

The vertex shader has some pre-defined outputs we can set. For instance `gl_Position` is the computed position of the vertex.

> Remember that the vertex shader is run once per vertex.

Similarly, the fragment shader has `gl_FragColor` as output. It is the color of the pixel for the fragment.

> Again, the fragment shader is run per fragment, or pixel, that forms part of each triangle projected on the screen.

### Passing attributes to the shader program

Let's go back to javascript. After initializing our shaders and creating our program we tell WebGL that we want to set the `a_Position` attribute of the vertex shader to some value we are going to calculate:

```typescript
export function run (gl:WebGL2RenderingContext)
    
    ...
    // create program
    ...

	// set attributes
	let a_Pos = gl.getAttribLocation(program, "a_Position");
	if (a_Pos < 0) {
	    console.log("Failed to get location of a_Position");
	}
	
	gl.vertexAttrib3f(a_Pos, 0.0, 0.0, 0.0);

	//render
	...
}
```

Read the snippet carefully and make sure you understand it. (Search on the docs if needed). We are getting the "location" of the `a_Position` attribute on the `program` we created before. Recall that this `program` has our vertex shader attached. Then WebGL returns a reference to that location.

Finally, we tell WebGL to send the value `(0.0, 0.0, 0.0)` to the gpu to be available on that attribute.

### Rendering a single point

Until now, everything we have done is BOILERPLATE. Necessary for our grand rendering code:

```typescript
// render
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```

Actually. it is only this line that renders a point:

```typescript
gl.drawArrays(gl.POINTS, 0, 1)
```

But as you may imagine, *what* is drawn to the screen depends on the current state of WebGL at the moment `gl.drawArrays()` is called. All of our hard work has been put into telling WebGL with minute detail *how to draw* what we want!

## So...

The result is nothing short of spectacular:

![Result of our hard work drawing a single point with WebGL](https://jrlgs.dev/blog/webgl-or-how-to-draw-a-single-point-the-hard-way/20f6f3ce-c936-445e-bbde-26365a079ae0.png)

While this may not *look to*o exciting, keep in mind that this red dot is being rendered on the GPU.

Unlike the HTML canvas, this is probably several orders of magnitude faster. All this complication is necessary when we want to do more computationally complicated stuff...

...Like a 3D rendering engine.

Once we have reached this point we have enough background knowledge to draw pretty much anything (that doesn't mean it will be easy though!)

> A combination of the basic techniques we saw here and throwing an obscene amount of math at the computer will indeed be enough to write our own 3D engine!

## Epilogue.

I want to write a series of short posts about what I learn. The idea is that I want to (hopefully) produce daily posts.

My job is somewhere in between Full-stack Web Development and 3D Graphics. I work with three.js and more recently WebGL.

> Shout out to Hashnode as I got my job thanks to my blog here! :D

---

Jorge Romero. Software engineer and tech lead. Now building a game in Godot and an engine in C++. Open to remote roles and contract work. Email: jorch.rl@gmail.com. LinkedIn: https://linkedin.com/in/jorchrl.
