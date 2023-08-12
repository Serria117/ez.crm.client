const commonFunc = {
    trim(str) {
        return str.replace(/\s+/g, ' ').trim();
    },
    trimObject(obj) {
        Object.keys(obj).forEach((i) => {
            if (obj[i] !== null && typeof obj[i] === 'string') {
                obj[i] = this.trim(obj[i]);
            }
        });
    }
};

export default commonFunc;
