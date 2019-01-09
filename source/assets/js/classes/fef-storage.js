const DEFAULT_LIST_LIMIT = 100;

export class FefStorage {

    /**
     * Returns a value if local storage is available and item is set.
     * If optionalDefaultValue is given, this is returned if local storage is not available or no item is set
     *
     * @param key
     * @param optionalDefaultValue
     * @returns {*}
     */
    static getItem(key, optionalDefaultValue) {
        if (!this.isLocalStorageAvailable() && optionalDefaultValue) {
            return optionalDefaultValue;
        }

        const item = localStorage.getItem(key);

        if (!item && optionalDefaultValue) {
            return optionalDefaultValue;
        }

        return item;
    }

    /**
     * Returns (safely) a JS object
     *
     * @param key
     * @param optionalDefaultValue
     * @returns {*}
     */
    static getItemJsonParsed(key, optionalDefaultValue = {}) {
        if (!this.hasItem(key)) {
            return optionalDefaultValue;
        }

        try {
            return JSON.parse(this.getItem(key, JSON.stringify(optionalDefaultValue)));
        } catch (e) {
            return optionalDefaultValue;
        }
    }

    /**
     * Helper method, since it's used very frequently in our code
     *
     * @param key
     * @param item
     * @returns {boolean}
     */
    static setItemJsonStringified(key, item) {
        return this.setItem(key, JSON.stringify(item));
    }

    /**
     * Sets an item in localStorage.
     * Returns false if item could not be added, true if successfully added.
     *
     * @param key
     * @param value
     * @returns {boolean}
     */
    static setItem(key, value) {
        if (!this.isLocalStorageAvailable()) {
            return false;
        }

        localStorage.setItem(key, value);
        return true;
    }

    /**
     * Safe method to check for a set item in local storage
     *
     * @param key
     * @returns {boolean}
     */
    static hasItem(key) {
        if (!this.isLocalStorageAvailable()) {
            return false;
        }

        return !!localStorage.getItem(key);
    }

    /**
     * Removes an item from localStorage.
     * Returns false if item could not be removed, true if successfully removed.
     *
     * @param key
     * @returns {boolean}
     */
    static removeItem(key) {
        if (!this.isLocalStorageAvailable() || !this.hasItem(key)) {
            return false;
        }

        localStorage.removeItem(key);
        return true;
    }

    /**
     * Most possible secure (and dumb) way to check for local storage
     * (At least Modernizr is using this method too)
     *
     * @returns {boolean}
     */
    static isLocalStorageAvailable() {
        const check = 'fefLocalStorage';
        try {
            localStorage.setItem(check, check);
            localStorage.removeItem(check);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * A list, in this context, is an array in an object with multiple key/value pairs and dates, e.g.:
     *   [
     *     {
     *       key: "srf:urn:collection:1",
     *       value: "srf:urn:landingpage:1000",
     *       date: "2018-11-23T11:42:00.000Z"
     *     }, {
     *       key: "srf:urn:collection:2",
     *       value: "srf:urn:landingpage:1001",
     *       date: "2018-11-23T11:45:00.000Z"
     *     },
     *     ...
     *   ]
     * This is used for components like selectable collections to keep a list of
     * which "region" was selected in which collection.
     * To prevent huge localstorage entries, a limit is set and older entries are removed.
     *
     * @param {string} storageKey Key for the localstorage entry
     * @param {string} key Key to get the value from the list
     * @param {any} optionalDefaultValue Default value to return if the entry doesn't exist (default: false)
     * @return {boolean|any} defaultValue if not exists (in localstorage or in list), value otherwise
     */
    static getFromList(storageKey, key, optionalDefaultValue = false) {
        if (!FefStorage.isLocalStorageAvailable() || !FefStorage.getItem(storageKey, false)) {
            return optionalDefaultValue;
        }

        let list = FefStorage.getItemJsonParsed(storageKey, []);
        let entry = list.find(item => item.key === key);

        return entry ? entry.value : optionalDefaultValue;
    }

    /**
     * Sorts the list by date (newest first) and returns the n newest items,
     * n being the passed number or 1 by default. If no items are found, an
     * empty array is returned. It's not guaranteed to be n items; if the
     * list is smaller than n, the returned array will contain all existing
     * values.
     *
     * @param {string} storageKey Key for the localstorage entry
     * @param {number} numberOfItems Optional (default=1) number of how many items should be returned
     * @returns {Array}
     */
    static getNewestFromList(storageKey, numberOfItems = 1) {
        if (!FefStorage.isLocalStorageAvailable() || !FefStorage.getItem(storageKey, false)) {
            return [];
        }

        let list = FefStorage.getItemJsonParsed(storageKey, []);
        list = FefStorage.sortByDateAndLimitList(list, numberOfItems);

        return list.map(item => item.value);
    }

    /**
     * Saves an object in the form
     * {
     *   key: XXX,
     *   value: YYY,
     *   date: ZZZ
     * }
     * to the list at the specified key in the localstorage,
     * where XXX is the supplied key, YYY the supplied value
     * and ZZZ is the current date&time.
     *
     * The list will finally be sorted (newest entry first) and the oldest element removed.
     *
     * @param {string} storageKey Key for the localstorage entry
     * @param {string} key Key for the object in the list
     * @param {any} value Value for the object in the list
     * @param {number} limit Optional (default=100) number of how many elements can be in the list
     */
    static saveToList(storageKey, key, value, limit = DEFAULT_LIST_LIMIT) {
        if (!FefStorage.isLocalStorageAvailable()) {
            return;
        }

        let list = FefStorage.getItemJsonParsed(storageKey, []);
        list = list.filter(item => item.key !== key);
        list.push({
            key: key,
            value: value,
            date: new Date()
        });

        if (list.length > limit) {
            list = FefStorage.sortByDateAndLimitList(list, limit);
        }

        return FefStorage.setItemJsonStringified(storageKey, list);
    }

    /**
     * Removes a specific element from the list.
     * This is achieved by getting the all items from the list where the key is
     * is different from the provided key and writing this filtered list back
     * to the localstorage.
     *
     * @param {string} storageKey
     * @param {string} key
     */
    static removeFromList(storageKey, key) {
        if (!FefStorage.isLocalStorageAvailable()) {
            return;
        }

        let list = FefStorage.getItemJsonParsed(storageKey, []);
        list = list.filter(item => item.key !== key);

        return FefStorage.setItemJsonStringified(storageKey, list);
    }

    static sortByDateAndLimitList(list, limit) {
        list = list.sort((a, b) => new Date(b.date) - new Date(a.date));
        return list.slice(0, limit);
    }
}
