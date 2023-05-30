const { Buffer } = require('node:buffer');

class Cache {
	/**
	 * The maximum size of the Cache in Bytes
	 * @type {number}
	 * @private
	 */
	#maxSize = 0;
	/**
	 * The current size of the Cache in Bytes
	 * @type {number}
	 * @private
	 */
	#size = 0;
	/**
	 * The Data in the Cache
	 * @type {Map<string, Buffer>}
	 * @private
	 */
	#data = new Map();
	/**
	 * The accessCount for the Data in the Cache
	 * @type {Map<string, number>}
	 * @private
	 */
	#accessCount = new Map();

	/**
	 * Check if the Cache has capacity for the new Value
	 * @param {number} value 
	 * @returns {boolean}
	 * @private
	 */
	#hasCapacity(value) {
		return this.#maxSize - this.#size >= value;
	}

	/**
	 * Delete the Least Frequently Used Elements until the new Value fits in the Cache
	 * @param {number} neededSize
	 * @returns {void}
	 * @private
	 */
	#free(neededSize) {
		// Return if the new Value fits in the Cache
		if (this.#hasCapacity(neededSize))
			return;

		// Sort the accessCount by the AccessCount so that the Least Frequently Used Elements are at the beginning
		const sortedAccessCounts = Array.from(this.#accessCount.entries())
			.sort((a, b) => a[1] - b[1]);

		// Delete the Least Frequently Used Elements until the new Value fits in the Cache
		while (!this.#hasCapacity(neededSize) && sortedAccessCounts.length !== 0) {
			this.delete(sortedAccessCounts.shift()[0]);
		}
	}

	/**
	 * Create a new Cache. If maxSize is 0 the Cache is disabled
	 * @param {number} maxSize
	 * @returns {Cache}
	 * @public
	 * @constructor
	 */
	constructor(maxSize = 0) {
		if (!Number.isSafeInteger(maxSize) || maxSize < 0)
			throw new TypeError('Expected maxSize to be a positive Integer');

		this.#maxSize = maxSize;
	}

	/**
	 * Get the current Size of the Cache in Bytes
	 * @returns {number}
	 * @public
	 */
	get size() {
		return this.#size;
	}

	/**
	 * Get the maximum Size of the Cache in Bytes
	 * @returns {number}
	 * @public
	 */
	get maxSize() {
		return this.#maxSize;
	}

	/**
	 * Get an Array of all Keys in the Cache
	 * @returns {Array<string>}
	 * @public
	 */
	keys() {
		return Array.from(this.#data.keys());
	}

	/**
	 * Get the corresponding value for the given key or undefined if the key does not exist
	 * @param {string} key 
	 * @returns {Buffer | undefined}
	 * @public
	 */
	get(key) {
		if (typeof key !== 'string')
			throw new TypeError('Expected key to be a String');

		// Return if the Key does not exist in the Cache
		if (!this.#data.has(key))
			return undefined;

		// Update the AccessCount for the Key and return the Value
		this.#accessCount.set(key, this.#accessCount.get(key) + 1);
		return this.#data.get(key);
	}

	/**
	 * Set the given value for the given key or replace the old value if the key already exists
	 * @param {string} key 
	 * @param {Buffer} value 
	 * @returns {Cache}
	 * @public
	 */
	set(key, value) {
		if (typeof key !== 'string')
			throw new TypeError('Expected key to be a String');

		if (!(value instanceof Buffer))
			throw new TypeError('Expected value to be an instance of Buffer');

		// Return if the new Value does not fit in the Cache
		if (this.#maxSize < value.length)
			return this;

		// Save the AccessCount for the Key or 0 if there is none
		const accessCount = this.#accessCount.has(key) ? this.#accessCount.get(key) : 0;

		// Delete the old Value from the Cache if it exists
		this.delete(key);

		// Delete Least Frequently Used Elements until the new Value fits in the Cache
		this.#free(value.length);

		// Add the new Value to the Cache
		this.#size = this.#size + value.length;
		this.#data.set(key, value);
		this.#accessCount.set(key, accessCount);

		return this;
	}

	/**
	 * Rename oldKey to newKey
	 * @param {string} oldKey 
	 * @param {string} newKey 
	 * @returns {boolean}
	 * @public
	 */
	rename(oldKey, newKey) {
		if (typeof oldKey !== 'string')
			throw new TypeError('Expected oldKey to be a String');

		if (typeof newKey !== 'string')
			throw new TypeError('Expected newKey to be a String');

		// Return if the old Key does not exist in the Cache
		if (!this.#data.has(oldKey))
			return false;

		// Return if the new Key already exists in the Cache
		if (this.#data.has(newKey))
			return false;

		// Move the Data to the new Key
		this.#accessCount.set(newKey, this.#accessCount.get(oldKey));
		this.#data.set(newKey, this.#data.get(oldKey));

		// Delete the old Key
		this.#data.delete(oldKey);

		return true;
	}

	/**
	 * Check if the Cache contains the given key
	 * @param {string} key 
	 * @returns {boolean}
	 * @public
	 */
	has(key) {
		if (typeof key !== 'string')
			throw new TypeError('Expected key to be a String');

		return this.#data.has(key);
	}

	/**
	 * Delete the given key from the Cache. Returns true if the key existed in the Cache, false otherwise
	 * @param {string} key 
	 * @returns {boolean}
	 * @public
	 */
	delete(key) {
		if (typeof key !== 'string')
			throw new TypeError('Expected key to be a String');

		// Return if the Key does not exist in the Cache
		if (!this.#data.has(key))
			return false;

		this.#size = this.#size - this.#data.get(key).length;
		this.#data.delete(key);
		this.#accessCount.delete(key);

		return true;
	}

	/**
	 * Clear the Cache
	 * @returns {void}
	 * @public
	 */
	clear() {
		this.#size = 0;
		this.#data.clear();
		this.#accessCount.clear();
	}
}

module.exports = Cache;