# Thinking with types: building a Finite State Machine with TypeScript to drive an app's UI

- Author: Jorge Romero
- Published: 2022-04-13
- Tags: TypeScript, JavaScript, Web Development, Tutorial, Programming Blogs
- Web page: https://jrlgs.dev/blog/thinking-with-types-building-a-fsm-for-my-pokedexs-ui

---

In my previous post I mentioned that I wanted to model my pokedex's interface interaction as a state machine.

I wanted implement a state machine with TypeScript to handle that for me. So I figured that I would share what I learned!

# First, why?
The functionality of my interface is completely determined at any point in time by the state the interface is in. Or rather, both the interface and the functionality are determined by the state.

So the obvious solution is to use a state machine to drive the functionality with some assurances towards correctness. <- This is important.

One of my desigin goals is to make it a *seamless* experience. So having correctness assurances helps with that. 

First lets describe what is a state machine.

> Warning, maths ahead.

--------
### A mathematical tangent (skippable)

A finite state machine, also called a *finite automata*. Has a finite set \\(S\\) of possible internal states along with a finite set of allowed inputs from some alphabet \\(A\\) of symbols.

We can represent the behaviour of the automata as a function:
$$
\delta : A \times S \rightarrow S
$$
Which just means that the machine will take an input \\(a_i \in A\\) and given an internal state \\(s_i \in S\\) will return a new state:
$$
\delta(a_i, s_i) = s_n
$$
Thats it. Does it seem familiar? This is just a reducer! 

------
### End of tangent (ok, you can stop skipping now)

Let's reword what I said so that y'all skippers get the gist of it. A state machine is a mathematical entity that can "have" some defined state at some point in time. And can receive an input. 

The next state of the machine is deterministically given by both the current state and the input:

$$
S_2 = input+S_1
$$

Again. That's just a reducer.

You may be wondering. Why go through the trouble? Why not just use redux or something like that?

The answer is that if we implement *just the machine we need*, we can *prove* (as in a mathematical proof) that it will behave correctly. No testing necessary. (even though writing unit tests for it is still recommended)

And if we are careful with how we implement it, using types, we can also make it so the we cannot break it. 

Even if we tried!

> The obligatory disclaimer: While the world of maths is crisp and perfect, the world of computers is anything but. We can make assurances about the *model*. But there is always the possibility that, given the internal workings of TypeScript, the JavaScript interpreter, or my own silliness, the whole thing can just break.
>
> If anything, this can be a very good excuse for learning about programming with types!

## So what's the plan?

We can take two broad approaches to modeling a state machine with code.

1. Check the value of the input variable and use it to differentially choose one preexisting function for the behaviour (represented as the state). With a `switch` statement, for example.
2. Hold a reference to the behaviour. And let other behaviour change the reference.

With option 2 we cannot run behaviour that is not allowed for the current state. As the behaviour reference is the state. While that is possible with option 1. 

We can implement option 2 either the OOP way, using the strategy pattern with objects encapsulating behaviour. Or the FP way, using that same pattern, but with typed functions. I would choose typed functions, of course :D

However. There is a third way of modeling the state machine. Using algebraic data types (ADTs) to constrain the behaviour of an object to a fininte set of possible behaviors. And *then* using a `switch` statement.

Unfortunately you cannot do this with TypeScript out of the box. So we are gonna be implementing a tagged union ADT to achieve this.

Then, I will share an implementation in TypeScript. 

# The *Tagged Union* type
I will need to implement a type that is not quite supported by default in typescript. The sum type, also known as tagged union and discriminated union. Or just *union* type. I will use those interchangeably.

You may be wondering that there is already a sum type in TypeScript! 

Well, yes. But also not quite.

## A ramble about TypeScript
In TypeScript, you have both *union* and *intersection* types. But these don't work as one may expect (from type theory). 

The first thing to note is that TypeScript uses *structural typing*. Which means that ultimately, the only thing that matters is the *shape* of the object which you are typing (for non-primitive types)

> In contrast to \*nominal\* typing in class-based object oriented languages, like C++

So in the following example, both types are interchangeable.

```typescript
type Dog = {name:string, breed: string}
type PedigreePet = {name:string, breed:string}
// Dog === PedigreePet
```

> Those two types would not be equivalent in C++, because of nominal typing.

How the union type works in typescript is constrained by this requirement. Let's see some examples. Consider the following union type `Pet`.

```typescript
type Dog = { name: string, breed: string}
type Cat = { name: string, favoriteFood: string}

type Pet = Dog | Cat
```

You may think of the type `Pet` as "either a `Dog` or a `Cat`". But, do you think `pet.breed` is a valid property? 

A function that takes a `Pet` cannot know if the argument is a cat or a dog:

```typescript
const rename = (pet: Pet) => {
	// This will make TypeScript complain!!!
	pet.breed = "expensive breed you can't afford"
	// But this is ok
	pet.name = "bob"
}
```

So a more accurate way of thinking would be. "`Pet` is something that could pass as either a `Dog` or a `Cat`, but must be general enough to be both".  So the union type is the type of values that are valid enough as any of either types.

But if we take the *intersection* type of `cat` and `dog` we get a different behaviour.

```typescript
type PetInt = Dog & Cat 
// which is the same as
type PetInt = {name: string, breed: string, favoriteFood:string}
```

Which is quite uncomfortable to process right? It seems like the names "union" and "intersection" should be flipped! But the good people at microsoft have very good reasons to have them behave like this.

The *union* type as it works on TypeScript means that if you take the set of all possible values for all the types you are considering (that is, the set theoretical union), then you can only *talk* about the common properties. 

This is because if you have a function with the signature
```typescript
type namePet = (pet: Pet) => Pet
```

As in the example above, that would mean the same as 
```typescript
type namePet = (pet: {name:string}) => {name:string}
```

That is, you have to be able to pass any object that *could be* either a `Dog` or a `Cat`. So you have to keep only the common elements. You loose some information about the original type when you use `Pet`. The function `namePet` cannot know whether the pet you pass is a cat or a dog.

But all that is just a JavaScript quirk! Because of how its object system works. And an artifact of TypeScript using structural typing.

## Understanding Union types (warning, Haskell ahead!)
But the *type theoretical* union types are a bit different in how they behave. Although the concept is the same. 

In order to explore the union type, we will need to switch to Haskell. Don't worry, the syntax is quite easy, so you can follow.

In Haskell, a *discriminated (tagged) union* type looks like this.

```haskell
data MyBool = Yes | No
```

Here we are defining a new type `MyBool`. And we are saying that any value of type `MyBool` must be either a `Yes` or a `No`. Those two are types, not values. (Although the way they are expressed in Haskell here means that they are single-value types...)

But nothing stops us from doing this:

```haskell
data MyBoolZ = Yes | No | Z
```

And any value of type `MyBoolZ` must be either a `Yes`, a `No` , or a `Z`. And any function that accepts a `MyBoolZ` must handle all possible cases.

```haskell
checkIfBool :: MyBoolZ -> Bool
checkIfBool x = case x of
 	Yes -> True
	No -> True
	Z -> False
```

> A note: this kind of check is kind of pointless in Haskell. And seems iffy to me. You really shouldn't need checking types in Haskell. 

Here, the function `checkIfBool` takes a value `x` of type `BoolZ` and returns true if it is either `Yes` or `No`. But returns false otherwise.

So, for the pet example, we can do something like this:

```haskell
data Pet = Cat | Dog

checkIfCat :: Pet -> Bool
checkIfCat pet = case pet of
	Cat -> True
	Dog -> False
```

Which in haskell means that any value of type `Pet` must be *either* a `dog` or a `cat`. But if it is a `Dog`, then it is a fully fledged `Dog`. And so for `Cat`. That is, after receiving `Pet`, a function can *know* if it is a `Dog` or a `Cat`. 

You cannot do this in TypeScript. As `Pet` looses information. But in Haskell, the union is *tagged*, in the sense that any `Pet` carries information about whether it is a `Dog` or a `Cat`.

Let's fix that!

## Implementing a Tagged Union in TypeScript

The good news is that we can, without much effort, implement the union type from Haskell in TypeScript. 

What we are implementing is an *algebraic data type* which means that our type should behave accordingly to some particular algebraic rules or properties. Right now the only property we care about is that each type is tagged. So the sum type doesn't loose information when passing into a function.

> If you are curious, we are implementing something called the \*coproduct\* in the category of types. But it is not super important to understand that. As not even Haskell is mathematically rigorous enough for that. The only thing you probably should know is that it means more or less the same as the set theoretical discriminated union. If two sets \\(A\\) and \\(B\\) both have the element \\(x\\), then the discriminated union \\(A \coprod B\\) has the elements \\((x,a)\\) and \\((x,b)\\).

We just need to make sure that we can always ask `Pet` for its underlying type. That means, we tag a `Pet` as either a `Dog` or a `Cat`.

```typescript
type Dog = {type: "dog", name: string, breed: string}
type Cat = {type: "cat", name: string, favoriteFood: string}
```

Now `Pet` would look like this:

```typescript
type Pet = Dog | Cat
// means the same as
type Pet = {type: "dog"|"cat", name: string}
```

> Really, it's that simple...

The words `"dog"` and `"cat"` are not strings. They are just the names for two singleton types (which can only have one single value). 

Please take a moment to think about what this means. A union type in type theory is just a type that can have multiple representations. Not one that can pass as either one of them, as is the default in TypeScript. Haskell by default uses this type theoretical union type.

Hence, the equivalence with the natural language "or" (and the logical or).  A pet is a cat *or* a dog.

> If you are curious again, I can make this claim thanks to an important result in logic called the Curry-Howard correspondence. 

### Example: A recursive binary tree.

Let's see an example on how to use tagged unions in Haskell. Consider the following `MyTree` type

```haskell
data MyTree a = MyEmptyNode
              | MyTree a (MyTree a) (MyTree a)
```

Which is a (recursive) binary tree data structure! And here may be the same implementation in "pseudo-typescript"

```typescript
// NOT REAL TYPESCRIPT!
type MyEmptyNode = {}
type MyFilledNode<T> = {value: T, left?: Tree<T>, right?: Tree<T> }

type MyTree<T> = MyEmptyNode | MyFilledNode
```

But note that the "|" i am using in this hypothetical example is the tagged union from Haskell which TypeScript doesn't have. If you code this in your app, you would have a very empty binary tree.

So lets implement the binary tree in real TypeScript now

```typescript
type TaggedNode<T extends string> = {tag: T}

type MyEmptyNode = TaggedNode<"Empty"> & {}
type MyFilledNode<V> = TaggedNode<"Filled"> & {
	value: V, 
	left: MyTree<V> | MyEmptyNode, 
	right: MyTree<V> | MyEmptyNode
}


type MyTree<V> = MyEmptyNode | MyFilledNode<V>
```

Now the "|" will behave as in Haskell. Here's an example:

```typescript
const jsonifiableTree : MyTree<number> = {
	tag: "Filled",
	value: 10,
	left: {
		tag: "Empty"
	},
	right : {
		tag: "Filled",
		value: 5,
		left: {
			tag:"Empty"
		},
		right: {
			tag: "Empty"
		}
	}
}
```

Now you can send fully typed binary trees over HTTP! XD

## Representing states with types
Let's use tagged unions to represent the type of states, Actions and build a simple finite state machine. Let's consider an example. The AI for an enemy NPC in a game like Zelda.

### State Types
It has several possible states: 
- Wander
- Attack
- RunAway

And we would like to have it so that each state can carry some info that we can use to program the NPC's behaviour. I'll use intersection types for that.

```typescript
type TaggedState<T extends string> = {tag:T}

type Wander = TaggedState<"Wander"> & {
	isAsleep: boolean
}
type Attack = TaggedState<"Attack"> & {
	enraged: boolean, 
	attackPoints: number
}
type RunAway = TaggedState<"RunAway"> & {
	isTired: boolean,
}
// We can attack information to each state to drive the behaviour in the NPC's script

type NPCState = Wander | Attack | RunAway

```

### Action Types

And several "actions":
- SeePlayer:  Wander -> Attack
- GetHit: Attack -> RunAway, Wander -> RunAway
- LoosePlayer: RunAway -> Wander


```TypeScript
type TaggedAction<A extends string> = {tag:A}

type SeePlayer = TaggedAction<"SeePlayer"> & {
	distance: "far" | "mid" | "near"
}
type GetHit = TaggedAction<"GetHit"> & {
	dmgAmount: number, 
	canBeBlocked: boolean
}
type LoosePlayer = TaggedAction<"LoosePlayer">


type Action = SeePlayer | GetHit | LoosePlayer
```

### Transition function
Each action is a rule that takes you from one state to another, if you are in a valid state:

- SeePlayer:  Wander -> Attack
- GetHit: Attack -> RunAway, Wander -> RunAway
- LoosePlayer: RunAway -> Wander

For example. Sending the action "LoosePlayer" when the NPC is in the "Wander" state doesn't make sense and should be ignored. The time and effort we spent thinking about Types will pay off when we make it so that it is impossible to get any weird runtime error because of some invalid action!

We can create a function with this signature:

```typescript
type Reducer = (a: Action, s: State) => State
```

```typescript
const reducer:Reducer = (action, state) => {
	switch (state.tag) {
		case "Wander":
			return reduceWander(action, state)
		case "Attack":
			return reduceAttack(action, state)
		case "RunAway":
			return reduceRunAway(action, state)
		default:
			throw new TypeError ("Nope, you can't do that!")
	}
}
```

We cannot have an invalid state. We can then handle the actions state-wise:

```typescript
import {Wander, Attack, RunAway} from "./states.ts"


const reduceWander = (action, state) => {
	switch(action.tag) {
		case "SeePlayer" :
			... // Logic for handling the resulting state
			return <Attack>{...} // Whatever extra info we want to add
		case "GetHit" :
			...
			return <RunAway>{...}
		default: 
			return state // Ignore invalid actions
	}
}

const reduceAttack = (action, state) => {
	switch (action.tag) {
		case "GetHit" :
			...
			return <RunAway>{...}
		default :
			return state
	}
}

const reduceRunAway = (action, state) => {
	switch (action.tag) {
		case "LoosePlayer" :
			...
			return <Wander>{...}
		default:
			return state
	}
}

```

Now the behaviour of the state machine cannot recieve invalid actions, nor can it have invalid transitions. 

In other parts of the code we can "dispatch" actions to the reducer, to change the state of the NPC. There may be some issues that arise then, but not because of the state machine.

The reducer gives us guarantees that invalid transitions cannot happen.

To use the machine, you just need to initialize a `State` and have whatever function will send inputs dispatch an `Action` to the reducer, along with the current state.

--------

Does it seem familiar? Of course! Because it is just our good friend, the finite automata's transition function:

$$
\delta: A\times S \rightarrow S 
$$

The input set \\(A\\) and state set \\(S\\) sets are the `Action` and `State` types we were careful to define with tagged union types.

Then the `reducer` function is the state transition function \\(\delta\\). Which internally just asks about the input `s` and checks if given `s`, the action `a` does anything. If not, it does nothing. 

If you pass an invalid state, it won't break. It just won't compile. An invalid action will do nothing.

So, we ended up coding the mathematical definition of the finite automata! 

There's your proof of correctness! 

# Building the PokeDex transition FSM in a Next.js app

If you are still thinking that this is just an overcomplicated way to use the redux pattern... Yes, yes it is. But I am learning a lot by writing this. And I hope you can share some of the learniness with me!

But also, no. I am using Next.js so I don't need redux for handling state while data fetching. I will make use of Next's own means of fetching. So that leaves me with the question of how to handle states.

One of my priorities with this app is having a seamless experience. I want to minimize the chances of weird or unintended behaviour. And having a purpose built state machine will allow me to provide some assurances of correctness. 

The way we will implement it will make sure that we cannot break it. Even if we try. And going through the effort of using types will make sure that only the intended behaviour can happen. Because any non-intended behaviour will yield a compiler error!

## Defining types for States and Actions
First, lets code the types for the states of the FSM diagram we had in the previous post:

```TypeScript
type TaggedState<S extends string> = { tag: S } & StateInfo;

type StateInfo = {
	mapId: number | null,
	pkmId: number | null,
	sectionId: number | null,
}

// States
export type Search = TaggedState<"Search">
export type MapToSearch = TaggedState<"MapToSearch">
export type MapScreen = TaggedState<"MapScreen"> 
export type PkmInfoScreen = TaggedState<"PkmInfoScreen">
export type PkmInfoToSearch = TaggedState<"PkmInfoToSearch">
export type MapSectionScreen = TaggedState<"MapSectionScreen">

// State type
export type State =
	| Search
	| MapToSearch
	| MapScreen
	| PkmInfoScreen
	| PkmInfoToSearch
	| MapSectionScreen;
```

I also attached some extra information to each state. This way, a component that needs to know about the `PkmInfoScreen` state knows which pokemon to fetch from the API.

We will do the same for the actions.

```typescript
type TaggedAction<A extends string> = { tag: A };

// Actions
export type InputSearch = TaggedAction<"InputSearch">;
export type ClickPkm = TaggedAction<"ClickPkm"> & { pkmId: number };
export type ClickMap = TaggedAction<"ClickMap"> & { mapId: number };
export type ClickSearch = TaggedAction<"ClickSearch">;
export type ClickSection = TaggedAction<"ClickSection"> & {
	mapId: number;
	sectionId: number;
};

// Action type
export type Action =
| InputSearch
| ClickPkm
| ClickMap
| ClickSearch
| ClickSection;
```

## Using a Test Driven Development approach to code the transition logic

Before we start with the reducers, lets write some test to capture the intended behaviour of the FSM. I'm using Jest. Here I'll just share the test for one of the reducers, so you can appreciate that I am using the tests to codify the intended behaviour of the FSM. In a TDD approach of sorts.

> If you want to see how I coded the rest of the tests, check the github repo :D

```typescript
describe("Search State Transitions", () => {
	const initialState: Search = {
		type: "Search",
		pkmId: null,
		mapId: null,
		sectionId: null,
	};

	it("action 'ClickPkm' should transition to PkmInfoScreen with pkmId", () => {
		const expectedState: PkmInfoScreen = {
			type: "PkmInfoScreen",
			pkmId: 1,
			mapId: null,
			sectionId: null,
		};

		const action: Action = {
			type: "ClickPkm",
			pkmId: 1,
		};
		
		expect(fsmReducer(action, initialState)).toEqual(expectedState);
});

	it("action 'ClickMap' should transition to MapScreen with mapId", () => {
		const expectedState: MapScreen = {
			type: "MapScreen",
			pkmId: null,
			mapId: 3,
			sectionId: null,
		};

		const action: ClickMap = {
			type: "ClickMap",
			mapId: 3,
		};
		expect(fsmReducer(action, initialState)).toEqual(expectedState);

	});

	it("should do nothing when given an invalid action", () => {
		const invalidAction = {
			type: "IamInvalid",
			pkmId: "nope",
			nonExistentId: 5,
		};

		// This test will run in JavaScript. But TypeScript will complain,
		// which is exatly what I want. I shouldn't be able to run this in the app
		expect(fsmReducer(invalidAction, initialState))
		.toEqual(initialState);

	});

});

```

Once we fill out the tests, and write the reducers the result of running the tests should be a pass:

```terminal
jorchrl@Jorges-MacBook-Pro pokedex-next % npm run test                                                        

> pokedex-next@0.1.0 test
> jest

 PASS  modules/pokeFSM/Reducers.test.ts
  Search State Transitions
    ✓ action 'ClickPkm' should transition to PkmInfoScreen with pkmId (2 ms)
    ✓ action 'ClickMap' should transition to MapScreen with mapId (1 ms)
    ✓ should do nothing when given an invalid action (1 ms)
  MapScreen State Transitions
    ✓ action 'ClickSearch' should transition to MapToSearch (1 ms)
    ✓ action 'ClickSection' should transition to MapSectionScreen with mapId and sectionId (1 ms)
    ✓ should do nothing when given an invalid action (1 ms)
  MapToSearch State Transitions
    ✓ action 'InputSearch' should transition to Search (1 ms)
    ✓ action 'ClickMap' should transition to MapScreen with mapId (1 ms)
    ✓ should do nothing when given an invalid action (1 ms)
  PkmInfoScreen State Transitions
    ✓ action 'ClickSearch' should transition to PkmInfoToSearch (1 ms)
    ✓ action 'ClickMap' should transition to MapScreen with mapId  (2 ms)
    ✓ action 'ClickSection' should transition to MapSectionScreen with mapId and sectionId (1 ms)
    ✓ should do nothing when given an invalid action (1 ms)
  PkmInfoToSearch State Transitions
    ✓ action 'InputSearch' should transition to Search (1 ms)
    ✓ action 'ClickPkm' should transitio to PkmInfoScreen with pkmId (1 ms)
    ✓ action 'ClickMap' should transition to MapScreen with mapId
    ✓ action 'ClickSection' should transition to MapSectionScreen with mapId and sectionId (1 ms)
    ✓ should do nothing when given an invalid action (1 ms)
  MapSectionScreen State Transitions
    ✓ action 'ClickSection' should transition to MapSectionScreen with mapId and sectionId (1 ms)
    ✓ action 'ClickPkm' should transition to PkmInfoScreen with pkmId (1 ms)
    ✓ action 'ClickSearch' should transition to MapToSearch (2 ms)
    ✓ should do nothing when given an invalid action (1 ms)
  Invalid States
    ✓ the reducer should throw a TypeError when an invalid state is passed (31 ms)

Test Suites: 1 passed, 1 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        1.59 s
Ran all test suites.
```

## Writing the Reducers
The reducer function will first filter through the input state's type. And pass the input to the adequate state reducer.

```typescript
export type Reducer = (a: Action, s: State) => State;

export const fsmReducer: Reducer = (action, currentState) => {
	switch (currentState.type) {
		// First, filter by state. So you cannot send actions to an invalid state.
		// But note that this is a pure function. So currentState is extenal.
		case "Search":
			return reduceSearch(action, currentState);
		case "MapToSearch":
			return reduceMapToSearch(action, currentState);
		case "MapScreen":
			return reduceMapScreen(action, currentState);
		case "PkmInfoScreen":
			return reducePkmInfoScreen(action, currentState);
		case "PkmInfoToSearch":
			return reducePkmInfoToSearch(action, currentState);
		case "MapSectionScreen":
			return reduceMapSectionScreen(action, currentState);
		default:
			throw new TypeError("You cannot pass an invalid state!");
	}
};
```

Here's how one of those looks like:

```typescript
// Each reducer handles the valid actions per state. So you cannot send an
// invalid action, ever. These are also pure functions.
export const reduceSearch: Reducer = (action, state) => {
	// Filter by action type
	switch (action.type) {
		case "ClickMap":
			// The action carries info about the map
			return { ...state, type: "MapScreen", mapId: action.mapId };
		case "ClickPkm":
			// The action carries info about the pokemon
			return { ...state, type: "PkmInfoScreen", pkmId: action.pkmId };
		default:
			return state;
	}
};
```

> Check the GitHub repo to see all of them.

Note that we are handling invalid input states by throwing a TypeError. And handling invalid action inputs, per state, by ignoring them. So we cannot trigger unexpected behaviour. TypeScript will not compile if we try. 

Thus we cannot break this machine. <- this was the whole point of this exercise.

> We can still break the app in other ways, but not the machine.

### No bussines logic here
I just want to also point out that what we have done here is intended to be detached from the actual logic that dictates *how* to decide when to change states. That logic will be implemented inside our components.

The whole point of doing things this way is that I can put some constrains in the business logic in a decoupled manner. We could use different apps that use the same state machine. 

For example, I mentioned that I was considering doing a mobile version. In that case, the interaction may be different, from the point of view of the user, but I could use the same FSM. Or make some slight modifications. 

That's no problem because I wrote it as a separate module. I coded *just* the barebones machine. Nothing else!

> In the next post I will start building the actual interface!

## Wiring it up to the app
I will try out [Zustand](https://github.com/pmndrs/zustand), a unidirectional state management solution for React. It's smaller and simpler than Redux, and way less 'boilerplatey' than React's Context API.

The way it works is, in my opinion, extremely elegant. Your store is a hook:

```typescript
import create from 'zustand'
import State from "./States.ts"
import Action from "./Actions.ts"
import {fsmReducer} from "./Reducer.ts"

// Let's type our store to help avoid unexpected behavior
type FSMStore = State & {
	// syntax from Zustand's documentation
	dispatch: (a: Action) => void;
};

// We define the store as a hook
const useStore = create<FSMStore>((set) => ({
	type: "Search",
	pkmId: null,
	mapId: null,
	sectionId: null,
	dispatch: (action: Action) => set((state) => fsmReducer(action, state)),
}));
```

And then you just throw them into your components. No need to wrap your app in a provider:

```typescript
const MyComponent = () => {
	const fsmType = useStore((state) => state.type);
	const dispatch = useStore((state) => state.dispatch);
	// then use those values in the component's JSX
	return (...)
}
```

You could also create an utility action creator :

```typescript
// possible action creator, 
const createAction = (
	type: ActionTypes,
	pkmId: number = 1, 
	mapId: number = 1,
	sectionId: number = 1,
):Action => {
	return { type: type, pkmId, mapId, sectionId };
};
```

Thats it! 

> But you can wrap it up in a provider if you really want. And it may be the case that you need to do so. But I don't for this use case.

## Trying out the FSM

Let's code a separate page to play around with the behaviour of the FSM. As I mentioned, doing things this way allows me to swap the business logic of the transitions, from the machine handling the transitions.

Here's how it looks. 

%[https://giphy.com/gifs/SRv0LiJHd8sTMa4330]

You can play with it by cloning the GitHub repo and running 
```npm run dev```

and visiting `localhost:3000/fsm-playground`

# Check the GitHub repo!
Here it is, [pokedex-next](https://github.com/JorchRL/pokedex-next)

# So what?

One of the goals is learning. And not necessarily achieving the most simple solution. There are libraries, like [coproduct](https://github.com/Lucifier129/coproduct) that would have made using union types much simpler. 

I could have also implemented the state machine just with Zustand, but here I am using it as a quick way to wire my state machine to the app.

TypeScript not behaving as "proper" Haskell may seem like a disadvantage. But it doesn't take much effort to make it do (to some reasonable extent). 

That makes me like TypeScript even more. In my opinion, JavaScript's idiosyncratic object-orientedness is much more elegant than pretty much any other language.

It's a tradeoff, in exchange for the flexibility of structural typing. Which is one of the really nice characteristics of both JavaScript and TypeScript. And I think it is well worth it.

The only thing in my wishlist is to make TypeScript much less verbose and a little bit more consistent.

# Epilogue.
Hopefully this was interesting!

I did learn a TON. Like, an obscene amount. I hope you get to share my learniness :D

If you made it all the way here, consider leaving a comment or feedback. I appreciate it a lot! I am learning this stuff. So any feedback will be greatly appreciated!

Next post will be about using this state machine to build the interface. With TailwindCSS! So, hopefully will not be as heavy as this one :D

I will also be updating on Twitter with the hashtag #BuildInPublic

So maybe follow me on Twitter?

<a href="https://twitter.com/jrlgs?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @jrlgs</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

---

Jorge Romero. Software engineer and watercolour artist. Now building a game in Godot and an engine in C++. Open to remote roles and contract work. Email: jorch.rl@gmail.com. LinkedIn: https://linkedin.com/in/jorchrl.
