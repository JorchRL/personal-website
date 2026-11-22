---
title: "100 post of code #2: One-time pad encryption"
description: One-time pad encryption What is a one-time pad? A one-time pad is a way to encrypt data by combining it with some random dummy data. When you encrypt data this way you end up with two keys, the product, and the dummy.
date: 2022-03-04T01:43:21.999Z
tags:
  - Python
  - encryption
  - 100DaysOfCode
  - Programming Blogs
  - Computer Science
cover: /blog/100-post-of-code-2-one-time-pad-encryption/cover.png
---

# One-time pad encryption

## What is a one-time pad?

A one-time pad is a way to encrypt data by combining it with some random dummy data. When you encrypt data this way you end up with two keys, the product, and the dummy. 

The resulting encryption is unbreakable. On their own, each key is completely useless. You need both if you want to get the original back.

Before jumping into the implementation in Python, let's consider the underlying mathematics. Feel free to skip that part if you only want to see the Python implementation!

## The \\(XOR\\) operation

Being a bitwise operation, \\(XOR\\) takes two elements of the set \\( \\{1,0\\}\\) and returns one element of the same set. For any \\(XOR(a,b)\\), we can fully define \\(XOR\\) with the following truth table:

| \\(a\\) | \\(b\\) | \\(XOR\\) |
| --- | --- | ----- |
| 1 | 1 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 0 | 0 | 0 |

Return true if \\(a\neq b\\), and false otherwise. That is, it asks the question: "is \\(a\\) different from \\(b\\)?"

Let's consider a concrete example. And see how we can implement a one-time pad using this operation.

Consider the original message, represented as a bitstring: \\(o = 111000\\) and some dummy data \\(d=101011\\). Then the product \\(p=XOR(o,d)\\) evaluates as follows:

$$
\begin{matrix}
1 & 1 & 1 & 0 & 0 & 0 \\\
1 & 0 & 1 & 0 & 1 & 1\\\
\\hline
0 & 1 & 0 & 0 & 1 & 1
\end{matrix}
$$

But note that \\(XOR(p,d) = o\\). That is, applying XOR to the product and the dummy yields the original message:

$$ \begin{matrix} 0 & 1 & 0 & 0 & 1 & 1 \\\ 1 & 0 & 1 & 0 & 1 & 1 \\\ \\hline  1 & 1 & 1 & 0 & 0 & 0 \\\ \end{matrix}
$$

We have that for any three bitstrings of the same length \\(o,d,p\\) the following equations are true:

$$
XOR(o,d) = p
$$
$$
XOR(d,p) = o
$$
$$
XOR(o,p) = d
$$

Which is the mathematical basis for our one-time pad encryption.

By the way, note that it is not possible to "get out" of the set \\( \\{o,p,d\\} \\) by using the \\(XOR\\) operation alone. This is a property called _closure_. We say that the set \\(\\{o,p,d\\}\\) is _closed_ under \\(XOR\\). With this, we can guarantee that we can both encrypt and unencrypt the original message.

I mentioned at the beginning of this post that this encryption is unbreakable. This follows from the closure.  We can guarantee it! If the set \\( \\{ o_i,d_i,p_i \\} \\) is closed under \\(XOR\\), then there is no way to reach \\(o_i\\), if we don't have both \\(d_i\\) and \\(p_i\\).

Let's now see how to write it in Python.

## Generating pseudo-random data

The dummy data must meet three criteria. First, it must be of the same length as the original data. Second, it must be random. And third, it must be kept secret.

There is no such thing as true randomness in computer programs. But the next best thing we can do is to use a pseudo-random generator. The `secrets` module from Python contains a function for generating pseudo-random data, `token_bytes()`.

We will generate a sequence of pseudo-random bytes of a given length. Then we will _cast_ it as a Python int. We don't have to worry about the size of the sequence as Python will adjust the size of `int` as needed.

```Python
from secrets import token_bytes

def random_key(length: int) -> int:
 tb: bytes = token_bytes(length) # length random bytes
 return int.from_bytes(tb, "big")
```

We are using an `int` as a generic bit string. The `int.form_bytes()` part will take a \\(n\\)-bytes string and turn it into an \\(8n\\)-bit number (because there are 8 bits in one byte). For example, if we have 10 bytes we end up with an 80-bit integer. The `int` type on Python can be of any arbitrary size, as needed. If you want to see another example, I used the same trick in my [previous post](/blog/100-days-of-code-1-a-simple-compression-example)

## Encrypting the original data and generating keys

We can think of an `str` as a sequence of bytes. A UTF-8 encoded character takes a byte each. We can convert from `str` to `bytes` using the `encode()` of `str`. And back with the `decode()` method of the `bytes` type.

To encrypt we must first convert an input string into bytes. Then we can use the `random_key()` function we wrote to generate a dummy byte sequence of the same length.

```Python
from typing import Tuple

def encrypt (original: str) -> Tuple[int, int] :
 original_bytes: bytes = original.encode()

 dummy: int = random_key(len(original_bytes))
 original_key: int = int.from_bytes(original_bytes, "big")

 encrypted: int = original_key ^ dummy # XOR on bit strings
 return dummy, encrypted
```

Note the function signature. `encrypt()` returns a tuple of two `int`. Those are the two keys that result from the encryption. We need both to decrypt our original message.

The actual encryption takes place on the line with the `original_key ^ dummy` operation. Note that both of those are of type `int` and are being used as bit strings.

The `^` symbol is the operator for the bitwise \\(XOR\\) operation. It is pretty straightforward.

## Decrypting and recovering the original data

The decryption function is pretty straightforward. We first apply the \\( XOR \\) operation. Then convert the bit-carrying `int` into `bytes` that we can interpret as a `string`.

```python
def decrypt (dummy, encrypted) -> str:
 decrypted: int = dummy ^ encrypted
 temp: bytes = decrypted.to_bytes((decrypted.bit_length() + 7) // 8, "big")
 return temp.decode()
```

Finally, let's write a simple test to see if our one-time pad works as expected:

```python
def test_encryption() :
 original: str = "Subscribe to my blog!"
 key1, key2 = encrypt(original)
 result: str = decrypt(key1, key2)

 if (result == original) :
  print ("test successful")
  print (f"original: {original}")
  print (f"result:{result}")
 else :
  print ("test failed")
  print (f"original: {original}")
  print (f"result:{result}")
```

And let's have it run the test when running the file:

``` python
if __name__ == "__main__":
  test_encryption()
```

And the result:

![Screen Shot 2022-03-03 at 18.50.19.png](/blog/100-post-of-code-2-one-time-pad-encryption/Msv_WuV-z.png)

## Recap

We learned what a one-type pad is and why it is a kind of unbreakable encryption (although it is not very safe)

We saw how the XOR bitwise operation works. And how it forms the underlying mathematical basis for this type of encryption. I also hinted at an important property: closure. I'm sure I will come back to it in the future!

We briefly saw how to generate (pseudo) random data. And how to use a Python `int` as an arbitrary-sized bit string.

Finally, we used the tools we learned to write a one-time pad in Python.

Help me grow by leaving me some feedback. See you in my next post!

<a href="https://www.buymeacoffee.com/jorchRL"><img src="/blog/100-post-of-code-2-one-time-pad-encryption/image-3.svg" /></a>
