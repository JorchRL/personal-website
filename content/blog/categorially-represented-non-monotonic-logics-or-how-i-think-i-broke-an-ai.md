---
title: Categorially-represented non-monotonic logics. Or how I think I broke an AI
description: A recent post by Dominic Griesel called "Eight mice and a giant" features an image that really catches my eye. He told me in a comment that he used pixray to generate it. So of course I went to play with it for hours.
date: 2022-03-16T20:57:32.763Z
tags:
  - Programming Blogs
  - Blogging
  - creativity
  - Artificial Intelligence
  - Art
cover: /blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/cover.jpeg
---

A recent post by @[Dominic Griesel](@AlCalzone) called ["Eight mice and a giant"](https://blog.zwave-js.io/eight-mice-and-a-giant#cl0ocr94d016gtwnvavq9eq51) features an image that really catches my eye.

He told me in a comment that he used pixray to generate it. 

So of course I went to play with it for hours. Instead of... you know... [working in my hackathon project](/blog/im-participating-in-a-hackathon)

Anyways.

# What did I do?

[Here's the link so you can play with the AI.](https://pixray.gob.io/text2image/) You begin by writing something that the AI will attempt to draw. In the case of Dominic, he entered "eight mice and a gigant" given the topic of his post. [Here it is again.](https://blog.zwave-js.io/eight-mice-and-a-giant#cl0ocr94d016gtwnvavq9eq51) Say hi to Dominic for me!!

So I started with something simple.

## Graphics tablets reading academic journals

Thats what I literally had in front of me at the time. My Wacom Intuos and an anthology book of academic papers.

So I tried that out

![Screen Shot 2022-03-14 at 8.02.41.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/xmejSizXx.webp)

After a short wait you get this

![Screen Shot 2022-03-14 at 8.09.24.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/86F43uyT3.webp)

I mean... Yeah. I kinda see it.

Ok now. Let's try to break it!

## Categorially-represented non-monotonic logics

Here. Let's try something fun.

![Screen Shot 2022-03-14 at 8.10.08.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/A6D41yt_W.webp)

It just gave up!

![Screen Shot 2022-03-14 at 8.19.12.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/G_nFesOSM.webp)

Then. After a while. It started sharpening the image.

![Screen Shot 2022-03-14 at 8.20.33.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/DtcDN5Db9.webp)

And its starting to converge into something.

![Screen Shot 2022-03-14 at 8.21.38.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/TMG5Lr9df.webp)

Hmmm... 

![Screen Shot 2022-03-14 at 8.22.13.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/DKMVGJuw_.webp)

Are those books? I wonder *how* it came up with that! 

A ***hunch*** perhaps...

...

>**In case you are wondering about that gibberish I used as input. Check the Epilogue below!**

...

# Before you accuse me of cherry-picking. Lets try again

This time something with the same linguistic structure. 

"Well-dressed non-pedantic cats"


![Screen Shot 2022-03-16 at 13.55.21.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/SS65uKD3D.png)


This time. The very first iteration yields something that definitely shows that the AI gets the "well-dressed" and the "cats" part.


![Screen Shot 2022-03-16 at 14.34.29.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/vq7A--Tgg.png)


![Screen Shot 2022-03-16 at 14.34.40.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/dA_ttd2Ro.png)

Finally. You can clearly see. Well-dressedness given the fabric texture. And the Catness given, well, the cats.


![Screen Shot 2022-03-16 at 14.35.33.png](/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/MjZVAlaM4.png)

# A very rambly Epilogue.

Ok, so you did wonder about the phrase "categorially-represented non-monotonic-logics". Perhaps you ***had a hunch*** that it is a little more than gibberish ;)

Consider a situations where you have the following two premises

- if it rains, the grass gets wet
- the grass is wet

So, you may *reasonably* think that it *is possible* that it just rained. And yeah. At this point it is reasonable to think that.

But if I add an additional premise

- someone turned on the garden hose to water the grass

Then it is no longer reasonable to think that the reason that the grass is wet is rain.

The thing is. There is *reasoning* involved in every step. But hardly the kind of reasoning most psychologists try to explain. This is a kind of *soft* reasoning. Which is currently in a "scientific limbo" of sorts. In fact. Many psychologists would throw their hands up in the air and confidently declare that *that* is no reasoning at all. Ask me how I know!

But it is not the alternative to reason. Random irrational behavior. It is *reasonable* behavior.

This is the kind of reasoning you use when making hunches. When you creatively explore possibilities with a goal in mind. When you consider *possible* solutions to problems. It is called *abduction* and was greatly developed by the great American pragmatist philosopher and mathematician Charles Peirce.

Philosophers. Particularly those working in logic, have tried to make this kind of reasoning into formal logic. But you can see how different it is from the usual "deductive" logic we know from math and computer science. 

You would be sorely mistaken to think there is just one kind of logic! 

This kind of soft-er logics have a property called *non-monotonicity*. Which makes them able to change or even invalidate conclusions if we add new premises. Something that cannot happen in usual mathematical logic!

>So you can *change* your mind based on new information. That's just like science...

So there is a brief explanation of the "non-monotonic logics" part. But what about the "categorially-represented" part? 

Well that comes from a branch of math called Category Theory. I'm sure you have heard of it. The dreaded *thing* Haskell programmers cannot stop blabbering about. 

But it is just a (very) abstract way of talking about how things relate to one another. A mathematical theory of (abstract) structure, if you will. 

Going a little bit deeper into it, there is this thing called *topos theory* which studies a very particular type of categories which have interesting properties that can be used to mathematically formalize... 

...logics.

# Why is this important?

But that softer "non-monotonic" reasoning is precisely how *we* think. When being creative.

This is precisely the kind of reasoning scientists use to *formulate hypothesis*. The most creative aspect of science. The same kind of reasoning that children make in order to discover their world. ***hunch by hunch***.

And... I'm willing to bet. 

The kind of reasoning *you programmers* use in order to turn code, into *software*.

...

Mind you. This is a very naive way to put it. 

This is, as far as my knowledge goes, the very far end of science related to the topic. If you go into academia, with a passion for a subject, you strive to really find that far edge of what-we-know. 

You despise the idea of being satisfied with what we already know. You want to grasp at what we don't know yet. And you will have nothing else.

And your work but an attempt to scratch at that far-edge's surface, hoping to shed the faintest sliver of light.

Well. I want to know what creativity *actually is*. 

I just want to know.

--------

Hopefully that wasn't *that* heavy. I tried to put it in simple terms. Because I consciously try to write for you. 

But, I guess. I'm writing for myself this time.

so.

## Give me a break! I have a bad flu and feel awful. This kind of crap cheers me up!

---------

## Do you even have to ask. Here. Some books.

Well. This is awkward. Most books that I would put here are just full of gibberish (even for me). 

Except for just this one. [Human reasoning and cognitive science.](https://mitpress.mit.edu/books/human-reasoning-and-cognitive-science) By Keith Stenning and Michiel van Lambalgen

It is a very beautiful and readable book which introduces the "divorce" between psychology and logic. And tries to "couples-therapy" its way into a theoretically sound research program.

In case you've got the functional programming itch. Believe it or not. The only thing you need to know for category theory is high-school maths.

There is a very readable book called [Category Theory for Programmers](https://bartoszmilewski.com/2014/10/28/category-theory-for-programmers-the-preface/) by the one and only Bartosz Milewski.

# The Actual Epilogue :D

I'm just here to sell you books!

See you tomorrow If I'm feeling better!

-------------------------

Do you like my stuff? Do you want to help me keep doing it?

<a href="https://www.buymeacoffee.com/jorchRL"><img src="/blog/categorially-represented-non-monotonic-logics-or-how-i-think-i-broke-an-ai/image-13.svg" /></a>
