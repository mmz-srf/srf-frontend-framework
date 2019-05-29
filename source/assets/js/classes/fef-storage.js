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
     * Returns (safely) json parsed content of a given key.
     * If the key is not set, the optional default value is returned. When no default value is provided the
     * default value is set to a simple JavaScript object.
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
     */
    static setItemJsonStringified(key, item) {
        this.setItem(key, JSON.stringify(item));
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
}
