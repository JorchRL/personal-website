---
title: Functions?
description: This is a post about the basic mathematics needed to follow through category theory. When I say basic math I don't mean elementary math, mind you.
date: 2022-04-06T21:57:00.348Z
tags:
  - Mathematics
  - Functional Programming
  - Programming Blogs
  - Blogging
  - creativity
cover: /blog/functions/cover.jpeg
---

This is a post about the basic mathematics needed to follow through category theory. When I say *basic* math I don't mean *elementary* math, mind you.

Rather, think about it as *fundamental* mathematical concepts that we will need as building blocks for our further discussions. 

I also have a secondary goal with this introduction. To ask you to try out *mathematical thinking*. Hopefully, by following the examples you'll get a taste of that!

Here's the first bit: try to approach each concept isolated by itself, in the abstract. It is very tempting to try to understand a concept by recurring to an analogy of what you already know. And while that's helpful, it also makes you run the risk of *defaulting* to just one singular mental model of the abstract idea.

But mathematical thinking needs you to force yourself to try and see the same abstract concept in many different places. So anchoring a concept to a particular example is counterproductive.

I know that considering things in the abstract is uncomfortable, at first. But it gets easier. And is a really good habit. It helps you be more creative overall. Even outside of math.

In this essay I will approach two common mathematical ideas, you probably are familiar with from computer science. But I will offer an *abstract treatment* of them. So I will ask you to avoid *defaulting* too much to familiar analogies.

I honestly believe that going through the effort is worth it. 

# Sets
You probably think of a set as a "box" or a collection of elements. But if you ask a Set Theorist what is a set? The most mathematically sound answer they may give you is just to scream in horror. 

Mathematicians kinda avoid the question of answering *what* is a set. Instead, saying that a set is *a thing* to which some axioms we all agree should be true enough apply. That is, in as much as they want to do rigorous math with sets. 

The word "set" is a primitive. It means nothing at all, other than the thing the axioms of set theory apply to.

## So how can we talk about sets?

Let's instead give a *description* of a set. Consider a proposition that consists of a predicate \\(P\\) which could apply to some object \\(x\\). For example, \\(P\\) could be the predicate "is round". 

Thus \\(P(x)\\) is the *claim* that "x is round". Which may be true or false. A proposition may be proven true or proven false.

The *set* \\(S\\) of all round objects could be built like this:
$$
S = \\{ \; x \; | \; P(x) \; \\}
$$
Which can be read as "S is the set that contains x, such that x is round"

That way of "building" a set is called *set-builder* notation.

So we could say that sets have the particular characteristic of being completely defined by their elements. But if we accept such a claim as is, we get into problems. 

> **Russel's paradox:** Think of the set \\(R\\) that contains all sets that don't contain themselves. If it does not contain itself, we are forced to accept that it contains itself. But if that is the case, we are forced to accept that it cannot contain itself!

We can put the same paradox in natural language.

> The Barber's paradox. There's just one barber in town, which shaves everyone that doesn't shave themselves. Who shaves the barber? If he shaves himself, then he couldn't be shaved by the barber. But if that's the case, then the barber should shave himself!

So let's add another descriptor. Sets are *distinct* from their elements. If anything, just to avoid Russel's paradox. We could also say that the "set of all sets" cannot exist.

There is not much else we can say about sets without getting into the muddy waters of meta-mathematics.

# Functions

## How can we talk about functions?

Let's continue the trend of "describing", by saying that a function is a *mathematical entity* which has certain properties.

1. It has a *domain* and a *codomain*. Each of which is a set.
2. For every element \\(x\\) of the domain, there is an element \\(f(x)\\) of the codomain.
3. The function \\(f\\) *determines completely* the domain, codomain and all values \\(f(x)\\) for every \\(x\\) in the domain.
4. The converse of (3) is true. The collection of the domain, codomain and values of \\(f(x)\\) for all \\(x\\) in the domain completely determine the function \\(f\\)

If you have taken either a math or computer science class, this way of describing functions may seem odd. Even archaic. But it is a *categorially-flavored* way of talking about functions.

In computer science, functions are usually thought of as "machines" that do stuff. They take an input and produce an output. Mathematically, they are usually described as a mapping between sets (ie. the set of inputs and the set of outputs). So functions are rules that relate one set to another.

Let me present a taste of the category theory approach. In a "context" or category, there can be two kinds of things. Let's just call them *objects* and *morphisms*. If \\(A\\) and \\(B\\) are objects in a category \\(C\\), then a morphism \\(A \rightarrow B\\) is just a directed arrow that relates the two objects.

Consider the category **Set** that has sets as objects and *functions between sets* as morphisms. Then if \\(A\\) and \\(B\\) are *sets*, the function \\(f: A \rightarrow B\\) is one such *morphism*.

But now consider the category **Vec** of vector spaces and *linear transformations* between vector spaces. So if \\(A\\) and \\(B\\) are vector spaces, \\(f: A \rightarrow B\\) is a morphism between vector spaces, which in this case is a particular kind of function called a linear transformation.

Let's get more abstract. Consider the category of *persons* and *A has a positive degree of separation to B* relations between persons. Then \\(A\\) and \\(B\\) being persons, \\(f: A \rightarrow B\\) means that they know each other, or they have a chain of acquaintances that link them. But that's hardly a function between sets!

So we can identify the same structure \\(f: A \rightarrow B\\) in three different contexts. And each one of them has a different meaning. But we are kinda forced to accept that there's some analogy between them!

Therefore (and this is the really special thing about category theory) we are kinda inclined to complain that the abstract "description" we gave of functions above is way too concrete!

I will not go further into that for now. As we will come back to it when we formally introduce categories. But let this serve as a provision for the kind of perspective we will have to adopt about functions.

Let's say that to talk coherently about a function, we **must** specify the rule, along with the domain and codomain. 

Consider a *rule* that maps \\(x \rightarrow x^2\\). Coming form computer science one may be inclined to say that that rule is the function \\(f(x)=x^2\\).

But from this more abstract point of view we have to recognize that such rule could represent *at least* four different functions:

1.  \\(x \rightarrow x^2 : \mathbb{R} \rightarrow \mathbb{R}^{+}\\)
2. \\(x \rightarrow x^2 : \mathbb{R} \rightarrow \mathbb{R}\\)
3. \\(x \rightarrow x^2 : \mathbb{R}^{+} \rightarrow \mathbb{R}^{+}\\)
4. \\(x \rightarrow x^2 : \mathbb{R}^{+} \rightarrow \mathbb{R}\\)

In fact, we can build an infinite number of functions!

> Please note that even some mathematicians would probably say that this requirement is way too abstract. But we are interested in category theory here, where we need this point of view.

## Anonymous functions

By the way, the notation for the rule \\(x \rightarrow x^2\\) is an anonymous function. The same kind that functional programmers use. Here it is in javascript:

```typescript
(x) => x*x
```

Logicians also have a different notation. In lambda calculus:
$$
\lambda x.x^2
$$
Which is a mathematical model of computation. When you write that beautiful functional TypeScript you are *expressing* a computation like that.

Here's an interesting question. When you use `(x)=>x*x`, *which* function are you using?

## Typed Functions

Consider the *function* \\(f: \mathbb{R} \rightarrow \mathbb{R}\\) given by the rule \\(x \rightarrow x^2\\). By now we agree that this particular function is completely described by both the rule and the **type signature**, which denotes its domain and codomain.

```typescript
type sqr = (x: number) => number
```

Suppose that javascript had `int` and `float` types (which it doesn't), in such case we could make the distinction:

```typescript
type f = (x:int) => int
type g = (x:float) => int
type h = (x:int) => float
type i = (x: float) => float
```

It does make sense right?

# What's next
In the follow up I'll go back to mathematical functions and elaborate on the concept of *injective*, *surjective* and *bijective* functions. Which is the first step towards the first really important result: isomorphisms.

We will see it first from the point of view of the category **Set**. Where isomorphisms have a very particular meaning. And then we shall discuss the *general* case of isomorphisms in any category!

# Epilogue.

One of the end goals I have for this series is exploring and understanding a kind of mathematical objects known as *toposes* (or *topoi* ). 

> What I mean by that is that I want to understand those things. Because I don't. I am not an expert. Not even close. I am not even a mathematician (sadly). So don't take anything I say as true. I may (and probably will) make some very dumb mistakes!

You can think of toposes as generalized set theories. Or you may say that the category **Set** is a topos. A way to think about them is as a "nice place to build mathematics". Mathematicians in the early 1900's "built" mathematics from a rigorous set theoretical foundation. Because the found way of expressing logic with sets and functions.

But the logic that emerges in toposes is *intuitionistic* rather than the classical logic you can build in set theory. 

[Intuicionism in the philosophy of mathematics](https://plato.stanford.edu/entries/intuitionism/) holds that mathematics is a creation of the mind. And not so much an "ontological constant" that uncovers the true nature of the universe. 

Mathematical communication serves as a means of making other people acquire the same mental state. [Intuitionism](https://plato.stanford.edu/entries/logic-intuitionistic/) also holds that math is the foundation of logic and not the other way around. The intuitionistic approach to logic may serve as a way for formalizing *other ways of reasoning* which *we* humans use. Which I think are important for creativity. Here's [another of my blog posts where I talk about that](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai).

On the Computer Science aspect, toposes may be the adequate terrain to talk about [programming language *semantics*](https://en.wikipedia.org/wiki/Semantics_%28computer_science%29).
