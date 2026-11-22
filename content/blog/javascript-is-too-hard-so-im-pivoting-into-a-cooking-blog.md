---
title: JavaScript is too hard. So I'm pivoting... into a cooking blog!
description: Ok, here's the thing. I suck at coding. And I don't really like frontend. I have no industry experience. And let's not kid ourselves, the only job title I actually will accept is that of Senior Fullstack Cloud Serverless Architect, or something.
date: 2022-04-01T16:21:34.272Z
tags:
  - TypeScript
  - Programming Blogs
  - Blogging
  - JavaScript
  - business
cover: /blog/javascript-is-too-hard-so-im-pivoting-into-a-cooking-blog/cover.jpeg
---

Ok, here's the thing. I suck at coding. And I don't really like frontend. I have no industry experience. 

And let's not kid ourselves, the only job title I actually will accept is that of *Senior Fullstack Cloud Serverless Architect, or something*.

So, after *minutes* of soul searching, I clinched a new goal. I flailed my arms up in the air, and with a dry gulp I sighed "F*ck it! I'm starting a cooking blog"

## The obligatory tedious life story nobody cares about. In Every. Single. Cooking. Blog.

... Let's just agree that neither you want to read this, nor I want to write it. Moving on...

## A recipe for fried eggs. (Because that's the only thing I can cook) 

Let's start by importing and initializing our eggs

```TypeScript
import {CreateEgg, Egg} from "./modules/Egg.js"

const eggs : Array<Egg> = CreateEgg(2)
```
You may note that I hard coded the number of eggs, which is not really a good idea. But this is a cooking blog! Quit expecting me to adopt good engineering practices! >:(

Moving on, we will also need some utility methods. The `kitchen.js` library is really simple to use, and very powerful if you take the time to dive into the docs.

To install it just run `npm install kitchen.js`. As we will use TypeScript for this tutorial, we will also need to grab the types with `npm install @types/kitchen.js`

```TypeScript
import {Pan} from "kitchen.js"

const pan = new Pan(eggs.map(e => e.break()))

```

The constructor for the `Pan` object takes an array of `cookable` objects. Luckily it can cast our Egg object as a `cookable` with no extra work on our part. Given that it implements the `cookable` interface. One of the really nice things about TypeScript :D

The Egg class has a really convenient `break()` method that returns the egg already broken, saving you hours of tedious manual work. Also, we want to pass the already broken eggs into the pan constructor. Obviously.

Before we cook the eggs, note that the `cook()` method of `Pan` gives us the option to pass a callback to taste for salt. (There is a Promise version of this, but for simplicity we will stick to callbacks)

```TypeScript

import {Taste, AddSalt} from "Kitchen.js"

pan.cook((t) => {
  if (t < Taste.good) {
    AddSalt(1)
  }
})
```

Note that `AddSalt()` takes the amount of salt in grams. Be careful! Also, Kitchen.js will take care of checking for salt at appropriate times, so you don't need to worry about it.

Finally, we can think of a way of serving and eating our eggs.

```TypeScript

import {Plate} from "Kitchen.js"

const plate = new Plate(pan.serve())

plate.eat()

```

Again, kitchen.js is really nice because the pan object works seamlessly with `Plate`. Thats because `Pan.serve()` returns the pan’s contents wrapped in a `cooked` monad, which `Plate` expects.

# Epilogue.

That was fun!

:D
