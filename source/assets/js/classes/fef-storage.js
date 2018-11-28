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

    static saveToList(storageKey, key, value, limit = DEFAULT_LIST_LIMIT) {
        if (!FefStorage.isLocalStorageAvailable()) {
            return;
        }

        let list = FefStorage.getItemJsonParsed(storageKey, []);
        list = list.filter(item => item.key === key);
        list.push({
            key: key,
            value: value,
            date: new Date()
        });

        if (list.length > limit) {
            list = list.sort((a, b) => a.date <= b.date);
            list = list.slice(0, limit - 1);
        }

        return FefStorage.setItemJsonStringified(storageKey, list);
    }
}
