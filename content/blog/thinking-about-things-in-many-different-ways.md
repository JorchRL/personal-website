---
title: Thinking about things in many different ways
description: Im starting a new series. More than anything else, for my own curiosity. But by now you know that I will still make an effort to make it valuable for you, my reader! I will explore a single concept.
date: 2022-04-04T04:18:36.430Z
tags:
  - Mathematics
  - Functional Programming
  - Blogging
  - creativity
  - functions
cover: /blog/thinking-about-things-in-many-different-ways/cover.jpeg
---

Im starting a new series. More than anything else, for my own curiosity. But by now you know that I will still make an effort to make it valuable for you, my reader!

I will explore a single concept. Here:

> Thinking about things in many different ways. On purpose. And attempting to find the different contexts in which the same thing appears, often in non-obvious ways.

It may sound odd. But I do have a purpose. 

First, I really believe much of what we call *creativity* (at least *human creativity*) really homes in into our ability to think in such ways. 

If you have read my blog before, you probably know that I used to work on scientific and philosophical research about what creativity is. <- a surprisingly hard thing to answer!

I am no longer in academia, formally. But I still think of myself as someone that wants answers. So I figured I will continue my research on my own, here.

Second. You may not expect this, but my research was intended to be highly mathematical. But not the same kind of math that physicist usually use. Rather, the maths that can be used to talk coherently about how things relate to one another.

It does happen to be the same math that functional programmers love so much.

Category Theory. 

Let me tell you how I think about category theory. I am not an expert, mind you.

A *category* is a universe of (mathematical) discourse. Or a context in which *things* have a meaning. But you can only talk about particular things in as much as they relate to other things. You cannot ask *what is \\( X \\) intrinsically?* That question is not really something we are interested in answering. Instead you ask *what is \\(X\\) given the relationships it holds with the rest of the things*.

So you may think of the category of sets and functions between sets. Then there is some way to identify the empty set \\( \emptyset \\) as having the unique property that there exactly one function 

$$ \emptyset \rightarrow X_i $$

For every other set \\(X_i\\). In case you are wondering. It's the *impossible* function. The function that cannot be evaluated (as there are no input elements in the empty set), so it must be unique.

> In case that argument does not convince you, think what would happen if you say that there is no such function? I will comeback to this with a proof when we examine mathematical *functions* closely.

But there are no other sets that satisfy this condition. So we could ignore what we know about the intrinsic characteristics of the empty set and say that *it* is the object that relates in such a way to every other object in the category of sets. Keep this in mind while we go through the next example.

Let's see an analogous example. Consider the category of *types* in Haskell and Haskell functions.

In Haskell there is a `Void` type (which is different from the `void` from C++). Haskell's `Void` type has the characteristic that there is no variable that can be of type `void`. Sounds familiar? Also, there is just one function that takes a `Void` and returns an object of any other type `a`, the absurd function:

```haskell
absurd :: Void -> a
```

Hopefully you see the analogy. We can play the same card and say that we don't care about the intrinsic characteristics of `Void`. Only in the fact that it is unique in the way it relates to other things in its context. 

We have a generic term for that: *initial objects*. 

In *any category* any object that relates in such a way is an initial object. They may mean very different things, but they have the same relationship structure with the rest of the things in their context. 

So we are somewhat forced to say that they *are the same* in a sense. Even if it may not be completely obvious.

And then we are forced to figure out *how* they are the same. We may not have an intuition about it, but we know they are the same, because we have a mathematical proof of that.

Wait, what mathematical proof? 

Well... Functors.

Functors are mappings *between categories*. Which preserve the structure of whatever they map. 

But the *structure* is all we care about!

Consider a functor that maps \\(\emptyset \rightarrow \\)`Void`. And that maps the "impossible" function in the category of sets, to the `absurd` function in the category of Haskell types. 

I said that they were analogous. 

But I said that because there is a functor that shows so!

-------

The bottom line is this. There is a way that we can systematically ask for analogies. Regardless of whether they make sense to us. 

If we start there, and find a "mathematical" analogy, we can then make the effort of making sense of them! In terms that actually mean something to *us*.

Isn't that what *creativity* is? Or at least part of it? Making unexpected, almost-nonsensical connections. 

And then materializing them in such a way that others understand them?

-------

Well, I will be exploring such ideas in this series. Feel free to hop along for the ride. 

But fair warning, I *will* go deep into the maths.

:D
