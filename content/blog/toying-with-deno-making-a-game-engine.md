---
title: Toying with Deno. Making a ... Game Engine?
description: Let's build a desktop app with Deno. Yes. A desktop app. No Electron. Actually, let's make it harder on ourselves! Let's make a 3D desktop app! Will it be a GOOD desktop app? Of course not! Whose blog do you think you are reading!
date: 2022-06-12T17:56:13.897Z
tags:
  - Deno
  - Game Development
  - JavaScript
  - TypeScript
  - Programming Blogs
cover: /blog/toying-with-deno-making-a-game-engine/cover.webp
---

Let's build a desktop app with Deno. Yes. A desktop app. No Electron.

Actually, let's make it harder on ourselves! Let's make a 3D desktop app!

Will it be a GOOD desktop app? 

**Of course not! Whose blog do you think you are reading! **

But hopefully, it is fun! That's what really matters.

> This post may also serve as a brief introduction to Deno!

## Wait. Deno? Why? Just use Node bro!
> If you are not interested in this part, feel free to skip ahead to the "What are we building?" section! :D

The simplest and most convenient aspect of Deno for me is that you can *just use* typescript. Which is really nice. I would rather use typescript for the sole reason that it provides better autocomplete. That's a big deal for me. Otherwise, JavaScript would do just fine.

> TypeScript has its ugly aspects. But nice autocomplete is a BIG deal for me. I just want to make it clear. That's my main argument in favor of TypeScript :D

But there are other reasons why I want to use Deno. 

The most straightforward is that "reinventing the wheel" is often an extremely rewarding learning experience. Well worth it if you are up to it. So I'll recreate as much as I can. 

Finally, there are some very particular features of Deno I want to play around with. In the future!

---------

But... in case you are not convinced. I'll include the comparison between Deno and Node offered by the Deno official Manual.

> Actually, I am not trying to convince you to ditch Node. I'm just explaining why I want to try Deno.

:D 

### Packages

Deno does not use `npm`. Instead, you reference modules by their URL. From anywhere on the internet!  As in the following: 

``` typescript
import * as log from "https://deno.land/std@0.142.0/log/mod.ts";
```

> One of the ways I'm using this is that I forked one of the libraries I am relying on. To enable a critical feature. Then I am just importing from my own GitHub repo. How neat is that!

Note also that it uses ES Modules by default. No support for `require()`

It doesn't use package.json for module resolution. But you can "lock" dependencies in other ways, so don't worry! There is also no `node_modules`. Instead, modules are downloaded the first time they are imported. And cached for subsequent uses, across projects! 

And they are intended to be immutable. And cacheable. So you only need internet access the first time they run. Unless you explicitly tell Deno to `--reload`

### Runtime
All async actions return a promise. Which you know, duh! 

So its APIs may be a bit different from Node's, which can be a mixed bag (mainly because Node is older). There is also top-level await by default. 

There are also some security considerations. Deno will require explicit permissions for accessing files, network, and env. It is "secure by default". Deno will always die on uncaught errors.

It aims to be browser-compatible. Any program which does not use the `Deno` namespace should run just fine in the browser!

> Take that with a healthy dose of skepticism, though. You will break things. Ask me how I know!

Deno also implements some WebAPIs when it makes sense. Like `fetch`, `DOM`, `WebStorage`, etc. To avoid proprietary APIs if possible.

> Again, you will run into problems if you just assume everything will just work. Deno is not perfectly "isomorphic". 

It supports browser-compatible lifycycle `load` and `unload` events: 

``` typescript
const loadHandler = (e: Event): void => {
	// ... do stuff
}

const unLoadHandler = (e: Event): void => {
	// ... do stuff
}

globalThis.addEventListener("load", loadHandler);
globalThis.addEventListener("unload", unLoadHandler)
```

Deno also has a built-in test runner at `Deno.test` and an assertions module on the standard library. You can also use Chai. 

### Node compatibility

This is one of the coolest things about Deno. You can run 
Node packages on it using the `--compat` flag to activate compatibility mode. With some caveats though, don't expect everything to work just fine. Also, you can't use TypeScript.

Here's an example.

``` bash
$ npm install eslint
...

$ ls
.eslintrc.json
node_modules
package.json
test.js
test.ts

$ cat test.js
function foo() {}

$ cat test.ts
function bar(): any {}

$ deno run \
  --compat --unstable \
  --allow-read --allow-write=./ --allow-env \
  node_modules/eslint/bin/eslint.js test.js test.ts
```

> Btw, Deno has a built-in linter as well: `deno lint ./<file>.ts`

This solution won't quite work for what we will be doing. But we can also just import an `npm` module and [in many cases it *may just work*](https://deno.land/manual/node). So that's also really nice.

> Spoilers: I'm gonna be importing Three.js from npm, and making it play nice with Deno.

### Running Deno

You can [install it](https://github.com/denoland/deno_install) and run the `deno` command. 

You can also use the official Docker image. As in this example:

``` bash
$ docker run -it -p 1993:1993 -v $PWD:/app denoland/deno:1.22.2 run --allow-net /app/main.ts 
```

> Just in case you are not familiar with Docker. `-p 1993:1993` will map the port 1993 of the container to that same port on the host. `-v $PWD:/app` will mount the working directory of the host to `/app` in the container (where the app should be). Finally, the `--allow-net` is a deno flag for setting permissions when running `/app/main.ts`.

Finally, VSCode has a nice [official extension for Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

Once you have a folder for a project, you just run `deno run ./app.ts`  or something simliar, depending on how you name your files.

If you are using network access on `app.ts`, you will need to allow it explicitly:

``` bash
$ deno run --allow-net ./app.ts 
```

Check the docs for other [permissions available in deno](https://deno.land/manual/getting_started/permissions)

Btw, did I mention that you can compile your deno projects into a single executable!?

> Foreshadowing ;)

## What are we building?

The rest of this post will be about building a desktop app that displays some 3D scene. The barebones necessary for a desktop game written in Deno. 

You may be wondering why or how? 

I found an interesting package while browsing the deno third-party modules library at [deno.land/x](https://deno.land/x) that will allow me to run a window with a page loaded on [webkit](https://webkit.org/). In case you don't know, WebKit is the engine powering Apple's Safari. There is a GTK port from Gnome, which is the one we will be using.

### Webview_deno
[webview_deno](https://deno.land/x/webview@0.7.0-pre.1) provides deno bindings for [webview](https://github.com/webview/webview), "a tiny cross-platform library to render web-based GUIs for desktop applications" which uses C++. 

The goal of Webview is to create an HTML5 UI abstraction layer for desktop apps. So you can use whatever language you want as a "backend". In this case, Deno with TypeScript.

It uses Cocoa/Webkit on MacOS, gtk-webkit2 on Linux and Edge on Windows(10). [Check the docs](https://webview.dev/) On Mac or Windows it should work with no further work. 

As I am using Ubuntu, the docs say I need to install a dependency: 

``` bash
$ sudo apt install webkit2gtk-4.0
```

>However, if you are using Ubuntu jammy as I do, (or maybe another Linux distro) you can no longer install that dependency. Instead try `libwebkit2gtk-4.0`  or `libwebkit2gtk-4.0-dev`. [Here's the reference](https://launchpad.net/ubuntu/+source/webkit2gtk). But you may already have it if you are using Gnome as your desktop environment.

> Or look up another version of webkitgtk for your distro...

> Or just cry in a corner.... :(

---

Please note, that this way of doing things may not be the best. (I mean, you can just use Electron). But I want to use Deno specifically. I have some things in mind for which Deno is good but Node isn't!

Also, I will mention it again. I am purposefully "reinventing the wheel", in order to learn.

>However, if you are looking to make desktop apps with HTML5 UIs, but don't want to use Electron, give [Lorca a try!](https://github.com/zserge/lorca) if you want to use Go. Instead of bundling Chrome, as Electron does, Lorca will use the one that is already installed! Another alternative may be [Tauri](https://tauri.studio/about/architecture). Another more Electron-like alternative could be [Neutralino](https://neutralino.js.org/). Or just use Electron. I think that is also a valid alternative!

Ok. Now that you know what are we trying to achieve. There is a second package I want to use...

### Three.js !!! 

Yup. I'm gonna use Three.js. Well, I'm gonna attempt to :D

It may be somewhat of a bold claim, but webkitgtk (the dependency the Linux version of webview uses) claims to [fully support 3D HTML canvas (ie. WebGL)](https://webkitgtk.org/). And I see no reason why either apple's WebKit or Edge would not support that.

So it seems *plausible* that it may work! Just making it run would make for a nice little portfolio project right?

> Spoilers, it does! ;)

### Running a Webview window on the desktop with Deno.

Here is where we get hands-on. But before we begin, a disclaimer: 

**Please keep in mind that this is not a step-by-step tutorial. I spent an obscene amount of time debugging and researching online. It would be a disservice on my part to make you think it is as straightforward as it seems on this post.**

**Please look at [the GitHub repo to see the full source code](https://github.com/JorchRL/Desktop3D-with-Deno). The following are mainly snippets to help you build a mental model of what I did. And maybe encourage you to try something like this!!! **

----
Ok now, we can start! Let's run a Webview window from deno.

Doing this is pretty straightforward. First, create a new folder. I called mine `deno_gui`.

And import the `webview` dependency with the ["deps.ts" pattern](https://deno.land/manual/linking_to_external_code#it-seems-unwieldy-to-import-urls-everywhere):

```typescript
// ./deps.ts

export {Webview} from "https://deno.land/x/webview@0.7.0-pre.1/mod.ts"
```

In Deno, it is a clean practice to put all your dependencies in a file like `deps.ts`. But you can just add them to any file that needs it. It will become a mess, though. So I'll use this `deps.ts` file for dependencies.

Then in a `main.ts` file we will write our program:

``` typescript
// main.ts
import { Webview } from "./deps.ts"

const html = 

`
<html>
    <body>
        <h1>Hello world! I'm using Deno version: ${Deno.version.deno}</h1>
    </body>
</html>
`

const webview = new Webview()

webview.navigate(`data:text/html,${encodeURIComponent(html)}`)
webview.run()
```

As you can see it's not that complicated. The `Webview` instance is the kernel of our program. We initialize it first. Then we "navigate" to the page defined inside the `html` variable. Finally, `webview.run()` opens the window when we run our program.

Go ahead and run it with:

```bash
$ deno run -A --unstable ./main.ts
```

Note that the `-A` flag is for "allow all" permissions. You may want to be careful with this on your own projects. And the `--unstable` flag will allow Deno's still unstable features. Again, you will want to be careful with this on your own projects. But for this one, we need those.

-----

#### Reference for working with the Webview library

Before going any further, a quick detour! :D

Once we managed to run the window with an HTML page rendering correctly, we need to figure out how to update it from Deno. 

The webview library has documentation available for its C++ bindings only at [webview.dev](https://webview.dev/bindings/cpp/)as the rest are currently incomplete.

So we will have to use that. As well as [the source for the `webview_deno` bindings we are using](https://deno.land/x/webview@0.7.0-pre.1). Luckily the library itself is quite small and not too complicated! 

So let's get into it! We already saw a bit of it. The entry point is the `Webview` class along with several instance methods.

You create a `Webview` instance. And use both `setSize()` and `setTitle()` to set the size and title of the window, respectively. Or use the class constructor to set those.

To open a window, you call the instance's `run()` method. You can use the `navigate()` method to navigate to a URL.

You can use the `bind()` method to attach a native callback that will appear as a global JavaScript function available to the page. And remove it with `unbind()`. You can use `resolve()` to get values back from the native binding. 

The `init()` method injects JavaScript code to be used at the initialization of every page. It takes a string with the js code. It will run before the [`window.onload` event.](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)

`Webview.window()` will return a reference to the window. And `terminate()` will close it.

And that's pretty much it!

As you can see it wouldn't take much to build a barebones Electron for Deno! 

> And I mean barebones! Don't get your hopes too high just yet :D

-----

### Running Three.js on the desktop with Deno
Now we need to achieve two things. First, manage to get Three.js playing nicely with this environment. And second, import it into the webkitgtk view and build a 3D scene inside it!

There seem to be two ways of achieving this. The first is to just import the three.js javascript library inside the HTML page and build our app inside the `<script>` tags. 

Or the second is to build the app in Deno and export a js bundle. Which we could in turn import into the HTML page.

The second option would be ideal if we wanted to write a game engine in Deno for example. And I will end up doing that!  

But for now, the first option will suffice to show a running Three.js app on the desktop!

Lets refactor `main.ts` a bit to extract the HTML page into a `./dist` directory:

``` typescript
// main.ts

import { Webview, dirname, join} from "./deps.ts"

const pageURL = join(dirname(import.meta.url), "/dist/index.html" )

const webview = new Webview()

webview.navigate(pageURL)

webview.run()
```

and add the new dependencies to `deps.ts`

```typescript
//deps.ts
export {Webview} from "https://deno.land/x/webview@0.7.0-pre.1/mod.ts"

export {dirname, join} from "https://deno.land/x/std/path/mod.ts"
```

Then we just need to build a web page and import the three.js library as well as our app:

```
./dist
|
|----/js
	|
	|---- three.js
|
|----index.html
|----app.js
```

The only relevant part is that inside the `<body>` tag of the page we need to import both `js/three.js` and `app.js`, in that order.

```html
...
<body>
    <script src="js/three.js"></script>
    <script src="app.js"></script>
</body>
...
```

> You may also want to add a bit of CSS to remove borders and margins...

That three.js version is the "src" version. And I saved it locally inside `./dist/js`

The rest of the app will go inside  `app.js`  where we can write a three.js app. Here's the cube example from the [Three.js website's "Creating a scene guide"](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene).

``` javascript

// All the Three.js app should go here for now

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.BoxGeometry(1,1,1)
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00})
const cube = new THREE.Mesh(geometry, material)

scene.add(cube)

camera.position.z = 5


function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera)
}

animate()
```

After this, you can run the whole thing, by running the `./main.ts` at the root of the project.

```
$ deno run -A --unstable ./main.ts
```

This file will always be our entry point! You should see a new window popup with your Three.js app running!

![deno-threejs-desktop.png](/blog/toying-with-deno-making-a-game-engine/E9qHxEd7A.png align="left")

It works! As you can see, it's not that complicated :D

If you wanted to make the thing work you could stop now as we have achieved that. But I have some other things in mind. Therefore I will need to put in some more work. Read on!

--------

## Making our app more robust

So it's running, that's a start! But we have two problems now

- We have to build the entire app in `./dist/app.js`. I didn't show this, but `Webview` has some issues with `import` statements inside HTML `<script type="module">` tags. Therefore any reasonably sized app would become a nightmare to code in a single file.
- We are not really using any desktop-specific feature. We may as well run this on a browser. We also do not have type support.

So that makes for a very bad and limited developer experience. Which makes it impossible to achieve my actual goal of...

**Making a game engine!**

Yup. I'm intending to make a game engine with Deno, using WebKit with Three.js as a rendering engine.

Deno already has a "browser compatible" approach to its runtime, which means that most of Deno code is intended to be able to run both on "the server" or on the browser. Which is the ideal scenario for making a game engine using this approach. 

Webview already allows us to bind callbacks into the javascript code running on the "browser". So we can use Deno as the "backend" of our game.

I could, for example, have Deno "server-side render" pages with scenes built from different Three.js scripts and have Webview `navigate()` to them based on an in-game event, which triggers a Deno callback.

I would be able to do all of that in Node, with Electron, of course. But 3D rendering is already resource-intensive as it is. So bundling Chromium (as Electron does) kinda defeats the purpose. 

`Webview` aims to be lightweight, and is intended as an "HTML5" UI abstraction layer for desktop applications. Webview is, as far as I understand, just WebKit. A full browser, or even chromium, is much more than that.

And finally, the last reason I have is that I want to learn. Again, sometimes "reinventing the wheel" is a great idea. If you have the time and patience!

So that's the justification. Let's continue our project!

### Bundling Three.js inside our project

The first thing we need to solve is to figure out a way to be able to write Three.js apps inside Deno itself. So that we can bundle them into the `app.js` file that the HTML page expects. 

For this, I choose to include Three.js itself in the project files. Along with its type definitions. The first step is to install it from npm!

```
$ npm init
...
$ npm install three @types/three
```

Then we can create a `./lib` folder at the root of the project and move some files from `node_modules`. I took the "build" version of Three.js, as well as the Examples folder which contains a bunch of useful extra stuff, like orbitControls for the camera. As well as the type definitions for Three.js.

```
./lib
|
|----/three
	|
	|----/examples
		|
		|---/jsm
	|----/types
		|
		|----/examples
		|----/src
		|----index.d.ts
	|
	|----three.module.js
|
|----/utils
	|----denoify.ts
```

> We will see what `denoify.ts` does in a bit ;)

Three.js itself is the  `three.module.js` file. So if you want to use Three.js with plain JavaScript, you would be done after exporting it from `./deps.ts`

``` typescript
// deps.ts

...

export * as THREE from "./lib/three/three.module.js"
```

You can then build a Three.js app and use `deno bundle` to bundle it into a single javascript `app.js` file inside `./dist`.  Which, if you remember, is where the HTML page that runs our app resides!

But I want to use TypeScript. So I will have to figure out a way to make the type definitions work on Deno, as they will not work out of the box. Let's see why, and what we can do about it.

### Denoifying Type definitions

Deno will not work with "magic module resolution", as Node does. So all `import` and `export` statements must be well-formatted URLs or relative paths with file extensions.

Given that the type definitions are written with Node in mind, they will not work on Deno, if they assume magic resolution. Unfortunately, that is the case with Three.js's types.

In order to illustrate. Take a look at a sample of how the type definitions are formatted by default:

``` typescript
// Three.d.ts - default exports

/**
 * SRC
 */
export * from './constants';
export * from './Three.Legacy';
export * from './utils';
/**

```

Deno will not work with this. Ideally, they should look like this:

``` typescript
// Three.d.ts - denoified exports 

/**
 * SRC
 */
export * from './constants.d.ts';
export * from './Three.Legacy.d.ts';
export * from './utils.d.ts';
/**

```

We could of course go to each file and manually fix it. But... come on... we are programmers! Let's spend an ungodly amount of time coding a solution that would save us a moderate amount of time!

Actually, no. I'm gonna cheat a little bit. As someone has already done this. There is an [old-ish package on deno.land called `threejs_4_deno`](https://deno.land/x/threejs_4_deno@v121), which does pretty much the same as I am doing, putting Three.js into Deno. It is no longer updated though.

It's not the exact solution I need, but one of its scripts performs almost the same thing I need here. So I'm gonna take parts of it. With proper credit of course. The author of `threejs_4_deno` is "DefenitelyMaybe" on GitHub. Go check their stuff out!

The script in question will fix some issues with the original Three.js files. My adaptation is the `denoify.ts` script. The original will not do as it was made for a previous version of Three.js and I found that some things changed, so it needs a bit of work. 

Thus, let's see what the `./lib/utils/denoify.ts` script does. Roughly, it crawls some given folders looking for files that match some regular expression `/\.d\.ts/g`. Then it looks for lines that match either `/import .+?;/gms` or `/export (\*|{.+}) .+?/gms`.  And changes them to include  `.d.ts` for the file extension. Turning them into Deno-friendly URLs.

``` typescript
// denoify.ts

const examplesPath = "./lib/three/types/examples/jsm"
const srcPath = "./lib/three/types/src"

// Crawl folder and find files matching a RegExp. Call a function for matches.
function loopDirAndMatch(path:string, pattern:RegExp, callback:Function) {
    for (const dirEntry of Deno.readDirSync(path)) {
        if (dirEntry.isDirectory) {
            loopDirAndMatch(`${path}/${dirEntry.name}`, pattern, callback)
        } else {
            const match = dirEntry.name.match(pattern);
            if (match) {
                callback(dirEntry.name, path)
            }
        }
    }
}

// We just want to rewrite all urls into Deno-friendly urls!
function updateTypeDefs (fileName: string, path: string) {
    let data = Deno.readTextFileSync(`${path}/${fileName}`)

    data = data.replaceAll(/import .+?;/gms, (m) => {
        if(!m.includes(".d.ts")) {
            m = `${m.slice(0, m.length - 2)}.d.ts${m.slice(m.length - 2)}`
        }
        return m
    })

    data = data.replaceAll(/export (\*|{.+}) from .+?;/gms, (m) => {
        if (!m.includes(".d.ts")) {
           m = `${m.slice(0, m.length - 2)}.d.ts${m.slice(m.length - 2)}` 
        }
        return m
    })

	// Let TypeScript know there are definitions for the browser's window object, 
    data = data.replace(/^/, `/// <reference lib="DOM" /> \n`);

    // Overwrite the same file! Be careful.
    Deno.writeTextFileSync(`${path}/${fileName}`, data)
}


loopDirAndMatch(examplesPath, /\.d\.ts/g, updateTypeDefs);
loopDirAndMatch(srcPath, /\.d\.ts/g, updateTypeDefs);


```

> In case you are wondering why I don't use Deno's compatibility mode. The reason is that it doesn't work with TypeScript yet. Hence this workaround :D

Note that we are adding a TS "triple-slash" directive to tell the compiler that we want those files to be type-checked against TypeScript's dom lib. This will cause type conflicts in Deno as Deno's compiler uses `deno.window` by default, which contains **some but not all** of the types these files need. 

To solve this new problem we need to override how Deno's compiler should type check our program. We can do this by using the `--config <config file>` flag for `deno run`. So let's create a `deno.json` config file on the root of the project with the following:

``` json
// ./deno.json

{
    "compilerOptions": {
	    "allowJS": true,
        "lib": [
            "dom",
            "dom.iterable",
            "dom.asynciterable",
            "es2016",
            "deno.ns",
            "deno.unstable"
        ]
    }
}
```

The only thing to mention here is that Deno would by default include `"deno.window"` on the `"lib"` array. We are just removing it. And replacing it with the DOM libs from TypeScript. We are also using `"deno.unstable"` because we are using the `--unstable` flag anyways.

The only change you need to take care of is to make sure you run the app like this:

```
$ deno run -A --unstable --config ./deno.json ./main.ts
```

:D 

> As of this writing there is still one issue remaining with this part. If you want to use the objects from Three/examples, you will have to fix the imports manually. It's not that complicated. And has lower priority because you only need to fix a couple of files you use, not the hundreds of the entire library! 

-------


Once the type definitions are linked with correct URLs, thus no magic module resolution is implied, we can use [Deno compiler hints](https://deno.land/manual/typescript/types#providing-types-when-importing) to tell the TypeScript compiler where are our type definitions. Inside the dependency file.

``` typescript

// @deno-types="./lib/three/types/index.d.ts"
export * as THREE from "./lib/three/three.module.js"
```

A similar schema can be used to use the objects on the `Examples` folder.

### Writing a more complex Three.js demo with Deno

I also made a `./src` folder where I will write the actual Three.js app. So, If you want to use this project, all of the previous work is done for you!

All in all, the only thing there is to do to start working in a Three.js app is to create a `./src/index.ts` and a `./src/appDeps.ts`. 

```
./src
|
|----appDeps.ts
|----index.ts
```

Let's for now try to replicate a more complex example from the Three.js examples page.

First, we will be using some objects from Three.js's examples, so we will export them from `./src/appDeps.ts`

``` typescript
// ./src/appDeps.ts


// @deno-types="./lib/three/types/index.d.ts"
export * as THREE from "./lib/three/three.module.js"

// Objects from the examples folders

// @deno-types="./lib/three/types/examples/jsm/controls/OrbitControls.d.ts"
export {OrbitControls} from "./lib/three/examples/jsm/controls/OrbitControls.js"

// @deno-types="./lib/three/types/examples/jsm/loaders/GLTFLoader.d.ts"
export {GLTFLoader} from "./lib/three/examples/jsm/loaders/GLTFLoader.js"

// @deno-types="./lib/three/types/examples/jsm/loaders/RGBELoader.d.ts"
export {RGBELoader} from "./lib/three/examples/jsm/loaders/RGBELoader.js"
```

As you can see, the type definitions work the same as the main three.js module.

Then we can build our app on `./src/index.ts`. Here I adapted the ["loader/gltf" demo from three.js examples](https://threejs.org/examples/#webgl_loader_gltf)

``` typescript
// ./src/index.ts

// This should be the entry point of the Three.js application

import { GLTFLoader, OrbitControls, RGBELoader, THREE } from "./appDeps.ts";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.25,
  20,
);
camera.position.set(-1.8, 0.6, 2.7);

const renderer = new THREE.WebGL1Renderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize);

init();

render();

function init() {
  new RGBELoader()
    .setPath("assets/textures/equirectangular/")
    .load("royal_esplanade_1k.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      render();
    });

  const loader = new GLTFLoader().setPath("assets/models/DamagedHelmet/glTF/")
    .load("DamagedHelmet.gltf", function (gltf) {
      scene.add(gltf.scene);

      render();
    });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.target.set(0, 0, -0.2);
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}


```

Please note that this is being written and type-checked on Deno. We need to bundle it into a single `app.js` file. Which we will do next.

### Bundling with esbuild

Deno has a built-in bundler, but it will not work for our case. As its output allows top-level await. Which currently won't work for browsers (or at least webview). 

So I'm using [esbuild](https://esbuild.github.io/). Which is extremely fast. And works great with Deno. It even has [a deno-specific package](https://deno.land/x/esbuild@v0.14.43). Although it is made for Node.

I made a single`./build.js` script: 

``` javascript
import * as esbuild from "https://deno.land/x/esbuild@v0.14.43/mod.js"

const result = await esbuild.build({
		entryPoints: ["./src/index.ts"],
		bundle: true,
		outfile: "./dist/app.js",
		write: true,
		target: ["safari11"]
	})

console.log(result)

// you need to stop it explicitly on Deno.
esbuild.stop()
```

So, once you write your Three.js app on `./src/index.ts`, you just run:

```
$ deno run -A ./build.js
```

Which will create the bundled `app.js` on the `./dist` folder.

### One current problem

There is still one final problem I have not quite solved. But the app can be run. It's just inconvenient for now.

Three.js uses the FetchAPI for loading assets. So this will not load on webview if we just include relative paths, as I did in the example. As the FetchAPI will fail for local files. (I think it is for security reasons). Even [the Three.js docs suggest running a local server to serve the assets.](https://threejs.org/docs/index.html?q=local#manual/en/introduction/How-to-run-things-locally)

The ideal solution will use the `webview` library to bind a callback into Deno. To stream the assets in string format. So they can be loaded as `data:...`. That can be made to work.

But it has been complicated to achieve for me right now. If you want to suggest some ideas, check [issue #8 on the GitHub repo!](https://github.com/JorchRL/Desktop3D-with-Deno/issues/8)

----

So the current workaround is quite straightforward. Serve `index.html` with a local server. And then navigate the `webview` instance to localhost :D

Let's see how to do it.

I am using the live server VSCode extension to quickly spin a local server to serve `./dist/index.html`. Just make sure you move your assets to `./dist/assets`.

Then on `./main.ts` navigate to the localhost:

```typescript
// ./main.ts - simple workaround

import { dirname, join, Webview } from "./deps.ts";

// we dont need this for now
// const pageURL = join(dirname(import.meta.url), "/dist/index.html");

const webview = new Webview();

// just use webview as if it was a normal browser hahaha
webview.navigate("http://localhost:5500/dist");
webview.run();

```

Doing that, the loading of assets should work just fine!

## Final result

Let's see the more complex example running with our app: 

First, serve `index.html`

![ED1229AC-8A7D-48E8-B81C-601BFAF158A2.png](/blog/toying-with-deno-making-a-game-engine/tUhJ6e4hj.png align="left")

Then run the app:

```
$ deno run -A --unstable --config ./deno.json ./main.ts
```

![3D17DDE3-E6D1-4C59-A849-763DD194C201.png](/blog/toying-with-deno-making-a-game-engine/i_Ek_EGXE.webp align="left")


Here is a video of the app running:

%[https://youtu.be/89OJ-Mzm9Es]



## Further improvements

As I said, the current issue is having to use a local server. The ideal solution is to just run the app.

Another improvement is to use Deno to "server side render" HTML pages with different combinations of scripts, to build scenes. And have webview navigate to them in response to in-game events. I think this can be achieved given that webview exposes callbacks to pages.

Finally, you can compile a Deno app to a single executable. So it would be nice to be able to make a game and distribute it as a single file!

Achieving that would make for a nice foundation for a simple game engine I think :D

## Check the GitHub Repo!

Here's the repo for this project on my GitHub:

[Desktop3D-with-Deno](https://github.com/JorchRL/Desktop3D-with-Deno)

:D

## Epilogue

Thanks for reaching this far! I hope it was interesting! I would appreciate it a lot if you leave some feedback!

----------

I'm currently looking for a job. If you know of someone looking for a person that can do this kind of stuff would you mind letting them know about me? 

I don't really tag myself as a "front-end" or "full-stack" developer. As I just try to learn whatever I need to work on a project. Just like I did in this one! I spent an unhealthy amount of time reading the Deno documentation! 

All in all, I spent around three days working on this project, researching and coding, as well as writing this post. I don't think that's a bad timeframe :D

I did learn a lot though. And I am starting to really like both Three.js and Deno. So maybe I could look for a job involving those technologies. 

I already have a portfolio project ;)

--------

Next, I will keep working on my portfolio website with a shiny new project to showcase that I can be super proud of! 

:D

I'm mostly active on Twitter, so maybe follow me there?

%%[twitter-follow]
