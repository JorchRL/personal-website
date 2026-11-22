---
title: Reasoning with Numbers
description: I want to offer a course about algorithms. Somewhat rigorous, but at the same time accessible. But we need to start with some basics first. We will start by getting a taste of the kind of work we are going to be doing.
date: 2022-07-16T15:08:25.711Z
tags:
  - algorithms
  - data structures
  - Programming Blogs
  - Mathematics
  - JavaScript
cover: /blog/reasoning-with-numbers/cover.png
---

I want to offer a course about algorithms. Somewhat rigorous, but at the same
time accessible.

But we need to start with some basics first. We will start by getting a taste of
the kind of _work_ we are going to be doing. We are going to be doing _proofs_
about the behavior of algorithms.

In this post I will show you a mathematical proof about numbers.

> As with every other post in my blog, I am learning this. So I am writing a course for myself. But I always try to make it accessible to others :D

## Reasoning with numbers

Lets start with an interesting observation:

**Observation:** the sum of any three digits is at most two digits long.

In base 10 we can check this easily by noting that \\(9+9+9 = 27\\). Yet we would
like to make a more general claim.

**Lemma 1:** For any integer base \\(b \geq 2\\), the sum of any three digits is at
most two digits long.

> A lemma is a claim that we need to prove using mathematical reasoning alone. No
> "empirical evidence" allowed!

Before offering the proof, lets take a moment to reason through what we are even
asking!

The way to proceed can be to find out what is the biggest number we can
represent with a single base \\(b\\) digit. Think for example, base 10, where \\(9 =
10^1 - 1\\). In base 2, we have that \\(1 = 2^1-1\\). In base 16 (hexadecimal), \\(15 =
\text{F} = 16^1 - 1\\). And so on. Can you see it?

> Indeed we should prove this second claim. But it is straightforward enough
> that we can convince ourselves that it is valid.
>
> - Hint: can you provide an argument to claim that if this is true for \\(b=n\\)
  > then it must also true for \\(b=n+1\\). Can you then show that it must be true
  > for \\(b = 2\\)? What would that argument imply?

Then consider the number \\(b^1-1\\) which must be the biggest one-digit base \\(b\\)
number. Thus we need to ask, how many digits does \\(3(b^1-1)\\) has? Now we have
enough to attempt a proof.

**Proof:** First note that as \\(b^1-1 > 0\\), then \\(3(b^1-1)\\) must be bigger than
\\(b^1-1\\). If that is the case, then it must also be at least two-digits long,
because \\(b^1-1\\) is the biggest one-digit base \\(b\\) number!

Second, consider the biggest two-digit base \\(b\\) number. It must be
\\((b^2-b^1)+(b^1-1)=b^2-1\\).

To help see it, consider the concrete example for base 10.

$$99 = (10^2 - 10) + (10 - 1) =(100-1)=90 + 9 $$

But we can show that:

$$ 3(b-1) \leq b^2-1 $$

If you are not convinced, try checking the inequality for \\(b = 2, 3, 4, ...\\)

> Before continuing, can you offer a resoning why this should be true?
>
> - Hint 1: \\(b-1\geq1\\)
> - Hint 2: what is \\(\frac{b^2-1}{b-1}\\) ?

We can reason as follows:

$$
\frac{b^2-1}{b-1} = \frac{(b+1)(b-1)}{b-1} = b + 1 
$$

But if \\(b\geq2\\), then  \\(3 \leq b+1\\) and we can reverse the previous reasoning to end up with:

$$
\begin{align}
3 &\leq b+1 \\\\
3(b-1) &\leq (b+1)(b-1) \\\\
3(b-1) &\leq b^2-1 \\\\
\end{align}
$$

Therefore, by our first statement above \\(3(b^1-1)\\) must be at least two-digits
long. As it is larger than the largest one-digit base \\(b\\) number. But by the
second statement, it cannot be three or more digits long. As it is smaller or equal than
the biggest possible two-digit base \\(b\\) number.

But \\(3(b^1-a)\\) is the biggest possible number we can have by adding three
one-digit number. And it must be two-digits long at most. So there is no other
such number that could be more than two digits long.

We must conclude that _any_ sum of three one-digit numbers base \\(b \geq 2\\) must
be _at most_ two digits long. This completes our proof.

> Can you see why I said \\(b \geq 2\\)?
>
> - Hint: Check the second exercise problem above :D

### Wow. That was dense.

We can be a little bit more terse when writing proofs, without loosing rigor. As
long as we are confident the reader (i.e you from the future) will be able to fill in the blanks.

**Terse proof**: Let \\(A = 3(b-1)\\) where \\(b-1\\) is the biggest one-digit base \\(b\\)
number. And \\(B = b^2-1\\), with \\(B\\) being the largest
two-digit base \\(b\\) number. Then, \\(A \leq B\\). But as \\(B\\) is two-digits long,
\\(A\\) can only have at most two digits. This completes the proof.

The point is that, you can (and perhaps should) write a reasoning as detailed as
you need, to understand it completely. Some proofs are simple enough that we can
skip them. Some will need a more elaborate reasoning.

I will take this approach on this posts :D

**Try it yourself!:** Show that the sum of any two base \\(b \geq 2\\) one digit
numbers has at most two digits. Is that true? Why?

> Hint: the reasoning is almost exactly the same. Think, for example that 9 + 9
> = 18? Can you generalize this?

> Try writing a proof in the comments :D

## About this posts

This series is about algorithms and, to a lesser extent, data structures. If you
want to follow along, however, please note that I am not aiming this at complete
beginners.

I will foolishly assume you are at least familiar with:

- Basic data structures like arrays, lists, trees and hash tables.
- Big O notation. You know what "linear time" means.
- You are at least willing to follow through some mathematical proofs.

That being said. I always try to keep my writing as accessible as possible :D

This are basically my notes from taking the ["Intro to graduate algorithms" class
from Georgia tech](https://omscs.gatech.edu/cs-6515-intro-graduate-algorithms). Which is freely available online (I am not enrolled).

> As you can probably imagine from the name, it is a graduate-level course. I
> will be following closely the book used. "Algorithms" by Dasgupta,
> Papadimitriou & Vazirani (2006).

---

\* Please note that "we can convince ourselves", "as you should verify" and other
such comments are code for "you should write the proof yourself in a piece of
paper. I'm too lazy to do it myself!""

## Epilogue

Hopefully that was interesting and my writing was simple enough. If you want to
follow along, I encourage you to go through the reasoning with pen and paper :D

I am uploading these on a GitHub repo that you can check here: [Algorithms-series](https://github.com/JorchRL/Algorithms-series). 

I would appreciate any feedback (specially if I am wrong!!!). I am not an
expert. I am learning, just like you!

If you wanna talk with me you should follow me on twitter:
[@jrlgs](https://twitter.com/jrlgs)
