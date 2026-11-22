---
title: "02. Watch me build stuff. Exhibit A: Chrome Extensions"
description: Let's figure stuff out. Last post, I suggested a method for figuring stuff out. So let's put it to use for a real project. I want to learn how to build a fully fledged SaaS (software as a service) product based around a Chrome Extension.
date: 2022-03-25T20:01:26.575Z
tags:
  - software architecture
  - software development
  - Programming Blogs
  - Blogging
  - JavaScript
cover: /blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/cover.webp
---

# Let's figure stuff out.

Last post, I suggested a [method for *figuring stuff out*](/blog/01-lygometry-figuring-out-what-i-dont-know-yet). So let's put it to use for a real project. 

I want to learn how to build a fully fledged SaaS (software as a service) product based around a Chrome Extension.

I will document the process as I go through. Starting from knowing nothing. Tumbling my way into a real-life useful extension. And eventually a complete fullstack SaaS project. Remember that the broad goal of this series is getting real-life experience!

In this post, I will provide an overview of chrome extensions. Then I will elaborate on the broad project and its design. Finally, I will hint at what will come next, in future posts!


# Let's get started

For completeness sake, let's quickly recap what the technique is about:

> - Asking *why* implies multiple *whats* and their relations.
> - The relations between things and between concepts are what matters most. 
> - Lygometry. Find out where the "edge" of your knowledge is and *always* go from there. Attempt to solve *open questions* you have.
> - Knowledge is effective action. Become able to explain or do *efficiently* and *on demand*. It doesn't count if "you think you could do it". Only if you can actually do it.

And a fair warning. This is not a *recipe*. If anything, it's a set of *thinking tools* or heuristics that I use. And that I took the effort to *showcase* to you, in a manner that *I think* you can find valuable.

The goal of this series is "learning in public". So expect to witness me making dumb mistakes. 

That is, don't expect to learn how to make a chrome extension. What I want is to show you *how I think*. 

>Thats the lawyer-required disclaimer anyways... I *will* try hard to make it worth your time.

-------

## Ask a pro

The very first thing I did was asking my friend @[Miki Szeles](@mszeles) because he is an absolute pro and recently made his own chrome extension. [Selenideium Element inspector](https://chrome.google.com/webstore/detail/selenideium-element-inspe/mgfhljklijclnfeglclagdeoiknnmnda). Check it out. For all your element-inspecting needs! 

He pointed me out to his series [How To Create Your Very Own Chrome Extension - Selenideium Element Inspector](https://mszeles.com/series/selenideium-inspector). 

I told him it was way too advanced for me to follow... Because silly me started reading from the last article in the series! (the one with the big, colorful "breaking news" cover image)

![841121FF-1024-4FBE-875C-14294CA4B6FB.jpeg](/blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/R8hLZCJVc.webp)

Sorry Miki. My mistake :D

Anyways. I eventually figured out where the first article in the series was. And learned more than the basics. I will try to mimic his approach with this post. 

Miki, being a seasoned developer doesn't spend too much time with the low-level details. And focuses on the higher-level rationale. I think that's a fantastic approach to learning for beginners. You are encouraged, nay *forced*, to think hard and fill-in some blanks. Just to be able to follow.

I also wanted to do my own research. So let's start with that.

> By the way. I made my very first open source contribution ever to this project!

## Doing research on my own

Good, high-quality research *demands* asking ambitious questions.

I typed "why did google build chrome" into... Bing. Obviously. Anyways. My eyes latched onto this four first-page results.

- [Google Chrome: Its history and rise to market domination](https://www.androidauthority.com/google-chrome-history-1025602/)

- [The real reason Google is making Chrome](https://www.computerworld.com/article/2480311/the-real-reason-google-is-making-chrome.html)

- [From 0 to 70% Market Share: How Google Chrome Ate the Internet](https://nira.com/chrome-history/)

- [How was Chrome browser Started? - History of Google Chrome](https://startuptalky.com/google-chrome-browser-case-study/)

> You know, research is tedious. But wretched are those that falter. Take heart! Near attrition, [the elders of the internet](https://www.youtube.com/watch?v=iDbyYGrswtg) shall acquiesce your grit. 

You won't wander too long before the wonderful [*chrome comic*](https://www.google.com/googlebooks/chrome/index.html) is bestowed unto you!

> Oh! how I love [The Internet](https://www.youtube.com/watch?v=Vywf48Dhyns).

# Learning about Chrome Extensions

## Chrome's architecture

The most important insight I got from that short incursion, and for the purposes of this post, was that the *thing* that chrome introduced, back in the day, was sandboxing.

- Chrome runs a browser-wise process
- And several tab-wise processes

Thus each tab's process is isolated. For two reasons. First, security. Which is pretty obvious. And second, performance. So that if any one tab's process hangs, the browser can keep working just fine. Chrome even has a task manager of its own!


![155B6A5F-AF50-433A-8EE9-91E9802AB684.jpeg](/blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/Ivp-SzVaD.jpeg)

A thing to note is that extensions are sandboxed, just as webpages. But they can send messages back and forth with the browser and with webpages.

If you have used extensions before. Some ideas may be popping into your mind at this point. 

## Why Extensions

Let's entertain some reasoning about extensions, based on these two principles.

- they are downloadable and installed
- they interact with pages and also the browser itself

They cannot just be"downloadable web apps for the browser". That is, it doesn't make much sense that they would be just tab-sandboxed applications. Otherwise they are just, well, web apps, but less convenient. Also, we already have "chrome apps".

But they also can interact or interfere with individual pages on tabs. And with multiple tabs on the same browser session. That is, they can run instructions both tab-wise and browser-wise. And any individual extension may incur in either one of those contexts, or in both, in order to provide its functionality.

Let's see a couple examples

### Metamask

If you are into crypto you already know what metamask is. If not. [Metamask is a crypto wallet](https://metamask.io). It holds your private and public keys so that you can interact with the Ethereum blockchain (and others based on Ethereum's standards, like Polygon and BSC).

[Metamask injects an `ethereum` object in the webpage and exposes it as a javascript API](https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents). So that developers can leverage metamask in their *dApps*. When a transaction is sent from the webpage via metamask, it goes through [metamask's infura endpoint](https://infura.io/faq/general) into the ethereum network. 

Your metamask account and ethereum keys are stored browser-wise. But it also injects an api that tab-wise pages can access.

### Ad Block

This one is pretty straight forward. It removes or hides parts of a webpage that it identifies as ads. But you can keep browser-wise configuration on the "strictness" of the blocking, for example.

# So what are extensions then?

Given what we have uncovered, here's a hypothesis. Architecturally, extensions behave somewhat like bridges. Between the a browser-wide context and the individual tab's context. 

And functionally, extensions act as a not-so-obvious application of [the decorator pattern](https://refactoring.guru/design-patterns/decorator). That you may know from software engineering. Or at the very least, something *functionally* similar. 

They "decorate" webpages with additional functionality. Mind you, this is a very lax use of the term "decorator pattern" as I am not claiming that their code is structured in any particular way. Just that the functionality expresses that behavior.


![7A892E65-3626-4D85-AB7F-CE291570D6F4.jpeg](/blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/kai5DZBh6.jpeg)

So that's what we uncovered about what extensions are. Given the way they relate to both the browser and individual web pages. 

But we haven't said anything about what extensions are *intrinsically* yet. Its easier to see the forest first. Then ask about the trees. Instead of prematurely jump into *hands-on* tutorials in the name of pragmatism.

> Alas, the time is now ripe for exploring the gory details. Fasten your seatbelt. I drive fast!

## Manifest v3

As of [January 17 2022](https://developer.chrome.com/docs/extensions/mv3/mv2-sunset/) Google has stopped accepting new extensions with manifest v2 in the Chrome Web Store. So you may still find tutorials that use it. 

With manifest v3 they introduced several changes. Three of them are of relevance for us right now.

First. They are revamping the chrome api to make it promise-based. You can still use callbacks. But [first-class support for promises](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/#promises) will now be the preferred way of doing things. This means that you can write more readable and declarative code with [the `async/await` syntax](https://javascript.info/async-await) and [promise-chaining](https://javascript.info/promise-chaining). Which is great news if you are *functionally inclined* like me!

Second. It now relies on [Service Workers](https://developer.chrome.com/docs/workbox/service-worker-overview/) instead of background scripts. You now listen to and react to browser events exposed by chrome's extension API. Instead of having a script run when the extension is loaded. Service workers are [intended to be spawned on demand and disposed of when no longer needed](https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#events).

Third, because they want you to take a declarative [event-driven style](https://developer.chrome.com/docs/extensions/mv3/service_workers/) to writing extensions. That means, letting chrome handle *how* things, [like network requests](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/), are done. And you focusing only on the *what* needs to be done and *when*.

Google says, it has several compelling reasons for this. [Security, Performance, and “Webbiness”, are among those](https://developer.chrome.com/docs/extensions/mv3/intro/platform-vision/#where-were-headed).


## Chrome API

You write extensions with javascript, html and css. Google designed it that way. So you have access to pretty much all web APIs you can use for normal webpages.

But you may also use [chrome extension-specific APIs](https://youtu.be/bmxr75CV36A). These all live comfortably inside the [`chrome` namespace](https://developer.chrome.com/docs/extensions/reference/). Take a look:

```javascript
chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.create( {
    url: chrome.runtime.getURL("helloWorld.html")
  })
})
```
This code register an `onClicked` event to an ["action"](https://developer.chrome.com/docs/extensions/reference/action/). Which means it adds a click event on the extension's browser toolbar icon. When triggered, it opens a new browser tab. Which loads an HTML file packed with the extension.

Take a look at this next example of [working with bookmarks](https://developer.chrome.com/docs/extensions/reference/bookmarks):

```javascript
chrome.bookmarks.update("bookmark_id", {title: "bookmark title"},
  function (bookmarkNode) {
  ... // Do stuff with the updated bookmark
  }
)
```

This example, as many other methods in the API, is asynchronous. This means that it returns immediately, regardless of whether they have finished running. If you want to get data back from them, you have to pass a callback. Or use promises, but [for those APIs that manifest v3 has Promise support as of now](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/).

Finally, you can persist data with chrome's own extension API, [`chrome.storage`](https://developer.chrome.com/docs/extensions/reference/storage/). Which behaves just the same as the [localStorage web API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). With the main difference being that you can sync data with Chrome sync.

But you can also use HTML storage. So, web storage is also an option. And you can even take advantage of fancy things like [indexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), which is an (JSON) [object-based NoSQL database](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology). If your extension needs to keep lots of data.

## But how even?

I would encourage you to check out this amazing chart of the [Architecture of Chrome Extensions](https://ylog.hashnode.dev/architecture-of-chrome-extension) that @[Yoshi](@yoshiz) made! It really helped me pull everything together inside my mind. Say hi to Yoshi for me! 

Here's the basic mental model for my chrome-extension-development workflow.

Everything is centered around the manifest file. Which sits at the root of the project. And serves as a nexus where you *declare* everything you extension does.

You start by declaring the name, description, version and manifest version in `manifest.json`

```json
{
  "name": "Super Awesome Extension",
  "description": "Turns the awesomeness up a notch... Or several!",
  "version" : "1.0",
  "manifest" : 3
}
```

If you want your extension to do anything, you will need to declare the thing on the manifest. You may also want to add permissions for things like storage.

```json
{
  ...
  "background" : {
    "service_worker" : "background.js"
  },
  "permissions" : ["storage"]
}
```

If you want to use some part of the API, you have to... you guessed it. Declare it in the manifest! You can check the documentation for the API to see how. But I'll still show you an example.

```json
{
  ...
  "action" : {
    "default_popup" : "makeAwesome.html"
  }
}

```

Check the `chrome.action` API to learn about the "action" object. Which refers to the browser toolbar icon. Here, we are *declaring* that the included "makeAwesome.html" file shall be rendered as a popup when you click on the extension's icon.

Suppose you want to have some logic. You will need to create and link a "makeAwesome.js" the usual way (eg. using the `<script>` tag). But will also need to tell chrome about it in the manifest... say it with me... you need to declare it.

```json
{
  ...
  "permissions" : [..., "activeTab", "scripting"],
  ...
}
```

Here, you ask for permissions needed to allow the extension to [interact with the active tab](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/) when the user uses the extension, and to use the [scripting API](https://developer.chrome.com/docs/extensions/reference/scripting/) if you want to inject JavaScript in a webpage.

> If you have used manifest v2, this kinda replaces `<all_urls>`. 

Finally, to [load an (unpacked) extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked), you will need to enter developer mode on chrome (from `chrome://extensions/`) and click the "load unpacked button".

## Is there more to learn about extensions?

There are other research directions I found from those first four articles I found. For example. Why would I want to learn to write *chrome* extensions? (other than market share) 

What about Firefox or Safari? What about the number one best web browser ever created... say it with me... edge?

It turns out that chrome's market share, and google's intentions with the chromium project (which you can read about in the comic) explain the current state of affairs. Both Firefox and edge used to have their own apis. But [Edge eventually gave up and just adopted chrome's](https://www.computerworld.com/article/3325333/web-browsers/with-move-to-rebuild-edge-atop-googles-chromium-microsoft-raises-white-flag-in-browser-war.html). And [Firefox kinda did as well](https://extensionworkshop.com/documentation/develop/about-the-webextensions-api/).

Not only that. There is now a [Browser Extensions API for Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) [(and Safari)](https://developer.apple.com/documentation/safariservices/safari_web_extensions) that is intended to work in whatever browser. And is pretty much just chrome's api.

The point is that Chrome's API is now the *de facto* standard.

--------

# Designing and (eventually) building an extension

I want to build a full project. Up to a SaaS offering centered around a chrome extension. So I have an excuse for learning. I will take several posts to achieve that. 

I don't really plan on selling anything. But I will consider costs and the business side of things. As software architecture requires taking business domain knowledge into account.

So it is worth it to take pause, before jumping into code. And consider adopting a lighter stride. Here I will detail my initial design goals and some of the architectural directions I am considering for this project.

If I were to guess. Everything is bound, and likely, to change. I am open for feedback. As I am just learning this stuff.

## Quick and dirty design goals

I want an extension that will help me write an "executive summary" from any article I read from the internet. As I am reading it. Let's write some user stories.

1. I want a shortcut that allows me to frictionlessly write a small atomic note.

2. I want to save those notes into a database. Along with the article reference.

3. I want to be able to export all the notes from an article into a format I can paste into markdown.

4. I want to have a frontend where I can browse my saved notes.

> Please note that I am [not using the “connextra” template. Nor are these requirements](http://antonymarcano.com/blog/2016/08/how-the-industry-broke-the-connextra-template/). Rather I want these to serve as prompts for when I have to figure how to implement whatever features I will need to fulfill such stories.

## The MVP

For story 1, I will have the extension open a modal with a very simple editor in which I can write. I will make it so that pressing a key combination like "shift+n" (or something like so) opens the modal. The same for closing.

For both 2 and 3 I want to represent each article as a javascript object like this (I’m using TypeScript for this explanation, but I will use plain JavaScript for development)

```typescript
interface article {
  title: string,
  url: string,
  notes: Array<string>
}
```

That will serve both as my data model and as the in-memory object that the extension will handle.

I will also have two main functions. The first one to format our object into either html or markdown

```typescript
type Format = "html" | "markdown"

const formatArticle = (article: Article, format: Format):string => {...} 
```

And the other so that the article object can save itself to a database.

```typescript
type Response = "success" | "failure"

interface article {
 ...
saveToDB () : Promise<Response>
}
```

Finally, for point 4 above. I will have a small frontend app where I can browse my notes.


![0EC0A99E-128A-4987-A8A1-F1E538B087C4.jpeg](/blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/s5qHt7eBE.jpeg)


## High-level architecture design

Take a look at the monolithic blob I started with, before realizing it was a complete mess. Also, before deciding on graduating this project into a fully fledged SaaS product.


![9D864461-2A2B-4E61-A65C-0F8856026957.jpeg](/blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/hzcHqF4rX.jpeg)

The main issue was that I wanted to use the IndexedDB Web API to save my notes. But I found it to be very *wonky* and obtuse when trying to fit it in the "service worker" approach of chrome extensions. Also, if I want to support syncing notes, it would require significant refactoring down the line. Chrome's storage API provides support for synching, but it is similar to the localStorage WebAPI. And I want document-based, like Mongo. I like MongoDB a lot.

So I thought. Why not Mongo?


![BCA0542D-6644-484B-9DAA-4DEC057F85B1.jpeg](/blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/Uzf2jU4FQ.jpeg)

One thing led to another and that was the moment I came up with the SaaS idea. So let's decouple some more. And think about leveraging node and express for dealing with users and a Mongo database. And lets throw in a React frontend. Why not!


![7157B3D3-4FAA-4F8E-9A12-23278A96B6BD.jpeg](/blog/02-watch-me-build-stuff-exhibit-a-chrome-extensions/XQ37lGOKT.jpeg)

Finally. You can see I have an *architectural decision* to make. I can either allow the extension to directly save to the database or I can route it through my server. There are some tradeoff with both alternatives:

- The first option will require a substantial refactoring and resubmission of the extension if I make any change to the database or my data model.
- The second option doesn't require any change in the extension code if I change how I do things on the database side. But will incur extra traffic on my server. Which to be honest is not really a problem for a small app that nobody will use. But, in the hypothetical that it has a lot of users, that will require careful consideration.

# Whats next?

Seemingly at random, I switched the conversation from software *design* into architecture. 

That is because I am learning about software architecture!

So I will continue this series by tackling just that! 


## The book section

I am reading this book [Fundamentals of Software Architecture](https://amzn.to/35cbagR) by Mark Richards and Neal Ford. I am really liking this book. It starts by attempting to offer a "4-fold" view of software architecture. Which goes beyond the *system structure* (i.e micro services, n-layered, etc). 

They propose that Architecture involves such system structure as well as *architecture characteristics* (i.e "-ilities" like reliability, scalability, and so). And *architectural decisions* like the one I exemplified about whether the extension should communicate directly with the database. Finally, it also involves *design principles* that guide the way developers will shape the system.

All of them guided primarily by business goals, as well as technological capabilities. For example, I am only familiar with the MERN stack. So If I am the "dev team", my decision will take into account both the business goal (including costs, goals, infrastructure options, etc) as well as the technologies I can use or can learn how to use.

> A disclaimer. I will start linking amazon affiliate links in my posts. But I will not spam books to you :D

# Epilogue.

\*heavy breathing\* well, that was quite the adventure! It took me like a week to research!

I learned A LOT by writing this post. And I'm starting to feel like I have some idea of what I'm doing XD

I am really liking the big-picture architectural approach. I am not that much of a coder to be honest. And the big-picture thing really meshes well with how I think. I will focus more on that! 

...

Anyways, see you next time!

%%[money-footer]
%%[crypto-footer]
