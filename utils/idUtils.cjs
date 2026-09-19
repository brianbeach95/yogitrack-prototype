function generateNextId(lastDocument, idField, prefix) {
    let maxNumber = 0;

    if (lastDocument.length > 0) {
        const match = lastDocument[0][idField].match(/\d+$/);

        if (match) {
            maxNumber = parseInt(match[0]);
        }
    }

    return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
}

module.exports = {
    generateNextId
};