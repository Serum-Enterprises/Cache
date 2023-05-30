# Cache
This Node.js module, `Cache`, is a simple yet efficient in-memory cache implementation using Node's Buffers for Data. This cache follows a Least Frequently Used (LFU) policy, ensuring that the memory limit specified is never exceeded.

## Features
- LFU policy: least frequently used items get removed first when the cache reaches its size limit.
- The cache size is measured in bytes.
- Can only store Node.js Buffers as Data.
- Methods to get, set, rename, delete and check existence of keys in the cache.
- A convenient method to clear the cache.

## Installation
Install the module in your project using npm:

```bash
npm install --save @serum-enterprises/cache
```

## Usage

Import the `Cache` class into your file:

```javascript
const Cache = require('@serum-enterprises/cache');
```

### Create a new cache

```javascript
// Create a new cache with a maximum size of 1MB
let cache = new Cache(1024 * 1024);
```
You can specify the maximum cache size in bytes while creating the `Cache` object. If no size is provided or size is `0`, the cache will be effectively disabled.

### Get and Set values

```javascript
let bufferValue = Buffer.from('Hello, World!');
cache.set('greeting', bufferValue);

let retrievedBuffer = cache.get('greeting');
console.log(retrievedBuffer.toString()); // Prints: 'Hello, World!'
```
The `set` method is used to store a buffer in the cache, while the `get` method retrieves the stored buffer. The `set` method also ensures that the new value fits into the cache by removing the least frequently used items if necessary. If the buffer value is larger than the maximum cache size, it won't be added to the cache (no error will be thrown in this case). The `get` method returns `undefined` if the key is not found in the cache. If the key already exists in the cache, the `set` method will overwrite the existing value.

### Other operations

```javascript
console.log(cache.has('greeting')); // Check if key exists

cache.rename('greeting', 'hello'); // Rename a key

console.log(cache.keys()); // Get all keys

cache.delete('hello'); // Delete a key

cache.clear(); // Clear the cache
```
The cache provides methods for checking if a key exists (`has`), renaming a key (`rename`), getting all keys (`keys`), deleting a key (`delete`), and clearing the entire cache (`clear`).

### Error Handling

Methods will throw a `TypeError` if the wrong type of arguments is provided.

## Tests

Tests for this module are written using Jest and have 100% code coverage.

To run the tests, use the following command:
```bash
npm run test
```

## License

MIT License

Copyright (c) 2023 Serum Enterprises

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.