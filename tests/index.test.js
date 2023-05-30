const { Buffer } = require('buffer');
const Cache = require('../src/index');

describe('Testing Cache', () => {
	test('constructor', () => {
		expect(() => new Cache(null)).toThrow(new TypeError('Expected maxSize to be a positive Integer'));
		expect(() => new Cache(-1)).toThrow(new TypeError('Expected maxSize to be a positive Integer'));
		expect(() => new Cache(0.5)).toThrow(new TypeError('Expected maxSize to be a positive Integer'));
		expect(() => new Cache(0)).not.toThrow();
		expect(() => new Cache()).not.toThrow();
		expect(new Cache(1024)).toBeInstanceOf(Cache);
	});

	const cache = new Cache(1024);
	const buffer1 = Buffer.from('Hello World');
	const buffer2 = Buffer.from('Hallo Welt');
	const buffer3 = Buffer.from('Bonjour le monde');
	const buffer4 = Buffer.alloc(1000);					// Buffer 4 together with Buffer 1, 2 and 3 should exceed the maxSize of the Cache
	const buffer5 = Buffer.alloc(2048);					// Buffer 5 should exceed the maxSize of the Cache

	test('maxSize', () => {
		expect(cache.maxSize).toBe(1024);
	});

	test('set (add)', () => {
		expect(() => cache.set(null, buffer1)).toThrow(new TypeError('Expected key to be a String'));
		expect(() => cache.set('buffer1', 'Hello World')).toThrow(new TypeError('Expected value to be an instance of Buffer'));

		// Buffer 1 and 2 fit in the Cache
		expect(() => cache.set('buffer1', buffer1)).not.toThrow();
		expect(() => cache.set('buffer2', buffer2)).not.toThrow();
		// Buffer 5 does not fit in the Cache, but should silently fail
		expect(() => cache.set('buffer5', buffer5)).not.toThrow();
	});

	test('has', () => {
		expect(() => cache.has(null)).toThrow(new TypeError('Expected key to be a String'));

		// Buffer 1 and 2 are in the Cache
		expect(cache.has('buffer1')).toBe(true);
		expect(cache.has('buffer2')).toBe(true);
		// Buffer 5 is not in the Cache
		expect(cache.has('buffer5')).toBe(false);
	});

	test('size', () => {
		// Data Size in the Cache should be equal to the size of Buffer 1 and 2
		expect(cache.size).toBe(buffer1.length + buffer2.length);
	});

	test('get', () => {
		expect(() => cache.get(null)).toThrow(new TypeError('Expected key to be a String'));

		// Buffer 1 and 2 can normally be read from the Cache
		expect(cache.get('buffer1')).toBe(buffer1);
		expect(cache.get('buffer2')).toBe(buffer2);
		// Buffer 5 was too large and is not in the Cache
		expect(cache.get('buffer5')).toBeUndefined();
	});

	test('keys', () => {
		// Keys should be the ones of Buffer 1 and 2
		expect(cache.keys()).toEqual(['buffer1', 'buffer2']);
	});

	test('set (replace)', () => {
		// Replacing Buffer 1 with Buffer 3 does work normally
		expect(() => cache.set('buffer1', buffer3)).not.toThrow();

		// Buffer 3 is now in the Cache and Buffer 1 is not
		expect(cache.get('buffer1')).toBe(buffer3);
	});

	test('rename', () => {
		expect(() => cache.rename(null, 'buffer3')).toThrow(new TypeError('Expected oldKey to be a String'));
		expect(() => cache.rename('buffer1', null)).toThrow(new TypeError('Expected newKey to be a String'));

		// Renaming buffer1 to buffer3 does work normally (it is actually Buffer 3 but still named buffer1)
		expect(cache.rename('buffer1', 'buffer3')).toBe(true);
		// Renaming buffer1 to buffer3 a second time does not work because buffer1 does not exist
		expect(cache.rename('buffer1', 'buffer3')).toBe(false);
		// Renaming buffer3 to buffer2 does not work because buffer2 already exists
		expect(cache.rename('buffer3', 'buffer2')).toBe(false);
	});

	test('set (free)', () => {
		// Buffer 4 together with Buffer 1 and 3 exceeds the maxSize of the Cache, so Buffer 2 should be removed because it was the least frequently used
		expect(() => cache.set('buffer4', buffer4)).not.toThrow();

		// Buffer 2 is not in the Cache anymore
		expect(cache.get('buffer2')).toBeUndefined();
	});

	test('delete', () => {
		expect(() => cache.delete(null)).toThrow(new TypeError('Expected key to be a String'));

		// buffer3 is in the Cache and gets deleted
		expect(cache.delete('buffer3')).toBe(true);
		// buffer2 is not in the Cache anymore and therefore cannot be deleted
		expect(cache.delete('buffer2')).toBe(false);
	});

	test('clear', () => {
		expect(cache.clear()).toBeUndefined();
		expect(cache.size).toBe(0);
		expect(cache.keys()).toEqual([]);
	});
});
