---
title: Type signatures in Haskell
description: If you are a dynamically typed programmer you probably are not super familiar with type signatures. (Perhaps even if you are an avid TypeScript user!)
date: 2022-12-04T22:15:44.115Z
tags:
  - Haskell
  - Functional Programming
  - Types
  - TypeScript
  - JavaScript
cover: /blog/type-signatures-in-haskell/cover.webp
---

If you are a *dynamically typed* programmer you probably are not super familiar with type signatures. (Perhaps even if you are an avid TypeScript user!)

In the following example, I will try to demonstrate with a practical example *why* we would like to use type signatures. The example is in Haskell, but the syntax is easy enough.

## Example: the motion of a particle

Suppose we have a particle moving over a straight line. Let's say its position at time \\(t\\) is given by the function \\(x(t)\\).

Consider now an interval of time \\(\Delta t = t_1 - t_0\\) for an initial time \\(t_0\\). Then the *average velocity* of the particle over the interval of time is given by the function:

$$v_{t_0}{(t_1)}=\frac{x(t_1)-x(t_0)}{t_1 - t_0}$$

Let's see how we can express this in Haskell.

```haskell
averageVelocity::Time->Time->PositionFunction->Velocity
averageVelocity t0 t1 x = (x t1 - x t0) / (t1 - t0)
```

Note that `x` is a function of some `PositionFunction` type. And is being given as an argument to `averageVelocity`.

But the type of `x` could also be:

```haskell
x::Time->Positon
```

Therefore, `averageVelocity` may have the type signature

```haskell
averageVelocity::Time->Time->(Time->Position)->Velocity
```

But note that "time", "position" and "velocity" are just numbers. Inside the computer, they are just `float` or `double`. So why would we not instead do this:

```haskell
averageVelocity::float->float->(float->float)->float
```

## Type synonyms

Furthermore, in Haskell we can define *type synonyms*:

```haskell
type R = float 

type Time = R
type Position = R
type Velocity = R

type PositionFunction = Time->Position

averageVelocity::Time->Time->PositionFunction->Velocity
```

This makes the code much clearer. And whenever there is an error, the compiler will tell us something about the *type* involved.

## The meaning of function signatures

Let's try something more interesting. Usually, when modeling the motion of a particle we are interested in its *instantaneous* velocity. Not the average over an interval. We need to model the derivative of the position function for this.

$$\frac{dx(t)}{dt}=v(t)= \lim_{\Delta t \rightarrow 0} \frac{x(t+\Delta t/2)-x(t-\Delta t/2)}{\Delta t}$$

Note that the left side of the equation takes as input for the derivative operator. Which is a function. We may write \\(D(x(t)) = v(t)\\) if we want to be more explicit.

> If you are keen-eyed you may have noticed that I treated *operators* as if they were *functions*. That is because they are! As an example, the "addition" operator \\(+\\) is just a function \\(+: \mathbb{R} \times \mathbb{R} \rightarrow \mathbb{R}\\). So for two numbers \\(a, b\\) their sum is given by \\(a+b=c\\) which is just syntactic sugar for \\(+(a,b) = c\\). Because \\(+\\) is just a function!

Let's attempt to write the type signature for a derivative in Haskell!

```haskell
type Derivative = (R->R)->R->R
```

We are expressing that the type `Derivative` is a *function type*, for a function that takes a function with signature `R->R` as input and a function with signature `R->R` as output.

However, look at the following:

```haskell
evaluateDerivative::R->Derivative
evaluateDerivative dt x t = (x (t+dt/2) - x (t+dt/2)) / dt
```

This may seem *wrong* to you. Isn't `evaluateDerivative` supposed to take a single value of type `R` and return a function of type `Derivative`?

Yes and No. We can rewrite the signature as:

```haskell
evaluateDerivative::R->R->R->R->R
```

This way, believe it or not, we are telling the compiler that *whatever fits that signature* is a valid parameter. Functions and values are the same *kind* of thing in Haskell.

So `evaluateDerivative` as we defined above takes a very small interval `dt` (in place for taking the limit), a *function* `x::R->R`, and a time value `t`. And returns the result of evaluating \\(\frac{dx(t)}{dt}\\).

Yet. If this is so, then we have at least *three* functions with quite different meanings:

*   `differential` One that takes a single interval \\(\Delta t\\) of type `R` as input and outputs a *function* \\(D\\) with signature `(R->R)->(R->R)` which takes a position function \\(x(t)\\) and outputs its derivative \\(v(t)\\). That is \\(D(x) = \frac{dx}{dt}\\). This is a "generic" differentiation function.
    
*   `evaluateDerivative` A function that takes three arguments \\(\Delta t\\),\\(x(t)\\), \\(t_i\\) and outputs the result of evaluating the derivative of \\(x\\) at time \\(t_i\\). That is, \\(v(t_i)\\), a single numeric value that has type `R`.
    
*   `getDerivative` A function that takes two arguments \\(\Delta t\\) and \\(x(t)\\) of type `R` and `R->R`, respectively. And returns the derivative of \\(x\\), with type `R->R`.
    

All three of them have the *exact same code*. The only difference is whether we use the type signature and name to remind *us* of what they do.

> You may now be wondering how on earth can three different functions have the exact same code? The Haskell compiler can by default curry a function when not all parameters are provided. That is, it does partial application whenever needed.

## So...?

They are all the same. We get all of that versatility just from the types (and partial application).

Keep in mind that code, functions, objects, variables and so are just *data* to the computer. The difference is only *how we think about it*.

Having a type system allows you to think about your programs in terms of higher abstractions.

That may (or may not) be what you want or need... As with anything in software, it depends. There are always tradeoffs!

:D
