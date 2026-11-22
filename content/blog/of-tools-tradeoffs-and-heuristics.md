---
title: Of tools, tradeoffs and heuristics
description: Good programming often boils down to managing tradeoffs. You cannot sidestep that issue. Type checkers and compilers have become quite sophisticated. But they cannot solve such problems for you. Lets identify two kinds of tradeoffs.
date: 2022-02-17T22:15:28.950Z
tags:
  - problem solving skills
  - tools
  - creativity
  - Programming Blogs
cover: /blog/of-tools-tradeoffs-and-heuristics/cover.jpeg
---

Good programming often boils down to managing tradeoffs. You cannot sidestep that issue. Type checkers and compilers have become quite sophisticated. But they cannot solve such problems for you. 

Lets identify two kinds of tradeoffs. The first kind relates to the programming tools we have at our disposal. The second, to the somewhat ambiguous notion of the quality of our thinking. I'll try to illustrate them with a concrete example problem first. Then I'll discuss what I mean by quality of thinking. Finally, I'll leave you will some practical _thinking tools_

tldr; to be a good programmer invest in knowledge of your tools, and the _quality of your thinking_. There are such things as _thinking tools_. Which you can learn, the same as you learn how to use programming tools.

## A concrete example: fibonacci numbers

We define the nth Fibonacci number with the formula

`F(n) =  F(n-1) + F(n-2) if n >= 2; n if n < 2 `

Writing a program from that definition is pretty straigthforward:

```
def fib(n: int) -> int:
  if (n < 2) :
    return n
  return fib(n-1) + fib(n-2)
```

If you try running it with n = 50 or higher, it will  most likely hang or crash your computer. Thus, while the program is correct, it is not very useful.

Note that any call to fib() with n greater than 2 will result in two extra calls to fib(). That is, if the input to fib is n, the program will end up calling fib() in the neighborhood of 2^n times! That is _very_ slow.

## The tool-related trade off. Memory usage vs number of operations

We can draw a tree out of fib(). If a node represents fib(n), then its branches represent the recursive calls to fib(n-1) and fib(n-2).

![7CA6E4AA-842F-46C6-A68F-F118537854E4.jpeg](/blog/of-tools-tradeoffs-and-heuristics/jfQZ6O02K.webp)

Lets try with fib(4). Take a look at the right branch from the root and then at the left branch from the left node on the first level. We are wasting computing power by calculating the fib(2) subtree several times!

You may be asking yourself at this point, can we _reuse_ some of the results so that we compute any subtree only once?

The answer is yes. Yes we can. Using _memoization_, a technique for storing partial results of a computation. So we can look them up when needed again. Instead of computing them once again.

In Python we can change achieve this using a dictionary:

```
from typing import Dict
memo: Dict[int, int] = {0: 0, 1: 1}

def fib_memo(n: int) -> int:
  if n not in memo:
    memo[n] = fib_memo(n-1) + fib_memo(n-2)
  return memo[n]
```

Try running this program with n = 1000. Quite the dramatic difference!

Note that in choosing to use memoization we are making a tradeoff. We choose to use more memory in exchange of reducing the number of computations needed. The use of a tool like memoization is, of course, dependent on the context. Some cases may need you to optimize every bit of available memory.

Take for example, serving content via http. You may choose to use a tool like _compression_ to reduce the amount of data you need to transfer. At the cost of processing power on your servers.

## The thinking-realted tradeoff: high cognitive effort vs number of computations

Lets look at an alternative implementation. An _iterative_ solution:

```
def fib_iter(n: int) -> int :
  if n == 0: 
    return n
  last : int = 0
  next : int = 1
  for _ in range (1,n):
    last, next = next, last + next
  return next
```

Try running *that* with n = 100000. 

If you find it more difficult to understand, you are facing the second tradeoff right on. The number of operations in this implementation is linear with n. Surprising as it may be. That's a _big_ improvement over our first _recursive_ solution. Coming up with this solution is not trivial, though .

So, let me be explicit about this tradeoff. Naive solutions are simple to understand and  put in place. But often come at a significant performance cost. Here, we traded significant cognitive effort. And got a big performance improvement. 

## Quality of thinking

At the end of the day you rely on the quality of your own thinking when choosing a tool or a tradeoff. Or when coming up with a clever solution.

_"What does quality of thinking even mean?"_ you may be wondering. To me, it means investing on the quality of the _heuristics_ we use for solving problems. 

Heuristics are "rules of thumb" that generally solve a class of problems. Contrast that to algorithms. Heuristics do not guarantee a correct solution, but they are often good enough, and fast.

Our thinking and reasoning is heuristic in nature. Yet people often still believe that it is [either perfectly rational or not rational at all.](https://plato.stanford.edu/entries/bounded-rationality/) 

We _approach_ solutions by zig-zagging our way through hunches and intuitions. This is what mathematician George Polya called _plausible thinking_. Which is heuristic in nature. And he knew his stuff. He wrote _the_ [book on problem solving!](https://en.wikipedia.org/wiki/How_to_Solve_It)

The good news is that we have some idea about what kind of processes intervene in such thinking. Processes like analogy, generalization, specialization, induction or divide and conquer. You may even recognize some of them if you have taken an algorithms class. I will be writing about some of them in the future, so stay tuned!

## A quick and dirty _thinking toolbox_

Lets list some heuristics I find most useful.

- **The law of the hammer.**
This is a cognitive bias. You will see only nails, if your only tool is a hammer. Try asking yourself, are there more tools available?

- **Creativity as search.**
Stop thinking of creative problem solving as one big Eureka moment. Instead envision an enormous, searchable solution space. Which you can comb through. Biological evolution and genetic algorithms work in a similar manner. Generate a lot of variations, then dispose of those that are not good enough. Iterate until satisfied. Now we have a general heuristic for solving problems.

- **Plausible reasoning.**
Does your current problem somewhat resembles this other problem you have solved before? Try and see if the previous solution works. The goal is coming up with plausible solutions. It's easier than trying to coming up with a correct solution on one go. The product of your actual thinking is not final solutions but potential ones. Combine with the previous heuristic for big profit.

- **Sturgeon's Law.**
90% of everything is worthless. So don't get too attached. Any potential solution is disposable. The large majority of the potential solutions you will come up with will be useless. Make it so that you can iterate fast. Develop an eye for stuff that is actually valuable. 

You can start to see a common thread. Problem solving involves a lot of iteration. And a way to sort through the heaps of ideas you generate. That sounds like hard, tedious and messy work doesn't it? Thinking often benefits from external scaffolding. Using a piece of paper to sketch the solution is not a record of your thinking; it is _your thinking_. As [Feynmann said](https://www.aip.org/history-programs/niels-bohr-library/oral-histories/5020-5). Systems like the [ZettelKasten](https://en.wikipedia.org/wiki/Zettelkasten) empower you to offload some of the cognitive burden into external scaffolds.

There is a lot more to say about each of these topics. Specially about the [external scaffolding part](https://en.wikipedia.org/wiki/Extended_mind_thesis). Way too much for a single blog post. I enjoy writing about this stuff a lot, so do expect more in the future.

I hope you found this helpful. I really appreciate any feedback you may want to share with me :)
