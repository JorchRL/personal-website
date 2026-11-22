---
title: I attended CraftConf and learned about software architecture!
description: "Preface: a noobs guide to learning from the pros I was invited to attend the Craft Conference 2022 by my friend Miki Szeles. There's a small problem though, I'm a noob. How am I supposed to learn from talks where they use words I'm scared about?"
date: 2022-07-06T20:40:21.228Z
tags:
  - conference
  - JavaScript
  - learning
  - Blogging
  - Programming Blogs
cover: /blog/i-attended-craftconf-and-learned-about-software-architecture/cover.webp
---

## Preface: a noobs guide to learning from the pros

I was invited to attend the Craft Conference 2022 by my friend Miki Szeles. 

There's a small problem though, I'm a noob. How am I supposed to learn from talks where they use words I'm scared about?

Well, I did learn, a lot. Let me share a bit of how I approached the different talks.  So if you are a noob, you can feel encouraged and less intimidated to attend.

**The secret is approaching the talks with a slightly different mindset!**

You know, these talks can be seen as "pro tips for the pro", which is fine... for the pros. 

However, my fellow noob. You have a different goal. 

**Your goal is to get the big picture. Not the details-oriented pro tips**

You are being exposed to advanced topics that probably mean nothing to you. So making an effort of understanding and elaborate on this big-picture can make wonders for your own understanding!

So this post is an example of just that. Hopefully, it also helps show the value of attending these conferences.

## The *next level of architectural design*

As one of my current interests is software architecture. And it is a topic I am trying to make sense of in my mind, the talk "Squaring the circle: Mastering the next level of architectural design" by [Uwe Friedsrichsen](https://twitter.com/ufried) immediately caught my eye when I first looked at the program schedule. 

That sounded like the kind of talk a beginner like me could learn a lot about. It seems general enough and "advanced" at the same time. 

Let me share a small summary of the main points. But I will not write a detailed "recap" of the talk.

Instead, I will direct you to [the author's blog](https://www.ufried.com/blog/) and a to [the slides he used in his presentation](https://speakerdeck.com/ufried/squaring-the-circle-mastering-the-next-level-of-architectural-design-4c302cdd-ef95-4dba-999f-1717beaba028?slide=3). Which he kindly made available. 

> Btw, in his blog there is a small series of posts titled "why we need resilient software" which is an absolutely fantastic read!

## A quick history lesson
The talk contrasts how software architecture has changed over the past 3 decades or so. And how the requirements of modern distributed systems affect the way we can (or maybe should) think about software architecture.

> Yes, even if you are agile!

The talk starts by summarizing architectural work until around 2008. The "good ol' times" as he calls it. Mostly monolithic systems with server-side rendered webpages. On-premises data centers. Few external systems. You get the idea.

> Contrast that with the whole microservices *ethos*.

With this approach, architecture is at the beginning and center of software creation. It is a design solution to satisfy explicit pre-defined project needs. There's also a focus on *layered* architecture. 

The problem is that some things like integration, security, scaling and even performance are left as "2nd class citizens" and for others to deal with.

> Well... Think about that. How would massive websites like Twitter keep from imploding if they were created like that!

## The age of confusion
This encompasses between 2008 and 2015. When the software world went *Agile*. A very important aspect of this movement was a cultural countermovement against the "architecture-centric" approaches of the past. 

> And if you are a beginner, most of the "MERN" tutorials you may watch are probably still encroached somewhere around here. Keep reading!

The basic idea is: to start building and figure out the architecture along the way. As you gain an understanding of the system you are building. Iterate a lot. Architecture *emerges*; developers are *the* architects.

## The present

That is not to say that neither "waterfall" nor "agile" approaches are dead, nor that they are now worthless. But as the needs of modern software change and the software itself becomes more complex, they have become tools for a broader approach.

> At least that's how I understand them.

Tools that whoever takes the role of "the one in charge of the architectural decisions" should choose to use or not, depending on the particular problem at hand. That is, even in agile teams there must be some architectural concerns and decision-making. 

Software now needs to run fast, run everywhere, and on a variety of network and hardware conditions. And it should be able to scale on-demand to handle usage spikes and be gracefully resilient to the failure of some of its components. 

It may also need to deal with massive amounts of data. For example, with applications that involve AI/ML. So you may also need a system that can interoperate between multiple data sources and different environments which consume and process that data.

You also need to consider mobile apps. They involve new interaction patterns, new kinds of devices, less reliable connectivity, and unpredictable load patterns. You may even need to deal with IoT devices. Whose performance may be safety-critical, like autonomous vehicles and medical instruments.

All of that is on top of these systems being distributed and often expected to work near-realtime, 24/7.

## Some thoughts on *why*

Here are some of the ideas I gather from the whole talk. 

While it is probably true architecture "emerges", it has become way too critical to be left implicit. 

Finally, it should be mentioned that the "Digital transformation" of business entails that IT and business are "blending" together. IT is now an integral part of almost any business, or the business itself. IT is an integral part of customer interactions. Many business models consist entirely of IT systems (just think about the website you are reading this on. Or the platform where I watched this online talk). 

And people trust these systems with their private data. And sometimes with their life!

For example, cloud services can be very costly if mismanaged. Personal data can leak if not secured adequately. People can even die if autonomous vehicles misbehave. Dangerous ideas and misinformation can spread on social media. Or vulnerable groups can be affected by AI fed with biased data sets.

> Thus, the way software is built cannot be trivialized. Or rather it should not.


And there are still other considerations. 

Like the emergence of "post-industrial" markets, where the main products are services or 'knowledge work'. Supply often exceeds demand, yielding *customer-driven* markets. Thus fast adoption and adaptability to very fast-changing markets are critical for a business's success. An IT business simply cannot afford to have a system that may eventually become too complicated to change. A full rewrite may as well be a death sentence.

Along this, there is the problem of exploding complexity. 

Yet another concern is ecological sustainability. Which every year is becoming more and more of a concern. It is a counterforce to every other concern. And should become a '1st class citizen' of system design and architecture.

## Epilogue

That covers about half of the talk! So make sure you go and check it out! Either the talk on YouTube or the slides I linked above. 

The rest of the talk and slides cover the speaker's own ideas, about still open problems and some discussion about how we should see "architecture" today. 

In this post, I had three goals

- Give back a little to both Miki and Craft Conf for their generosity in inviting me to attend the conference online!
- Show you how, as a beginner, you can benefit greatly from attending.
- Elaborate on my own knowledge of the "big picture" of software architecture.

Hopefully, you found this insightful on at least one of those three aspects :D

...

Just as a shameless plug. I am mostly active on Twitter [@jrlgs](https://twitter.com/jrlgs), so you may want to talk to me there! I'm always happy to talk to new people. And I would appreciate you sharing these posts and giving a shoutout to both [@mszeles](https://twitter.com/mszeles) and [CraftConf](https://twitter.com/CraftConf), as well as the speaker, [@ufried](https://twitter.com/ufried).
