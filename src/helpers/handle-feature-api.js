class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const excludedField = ['page', 'limit','sort'];
        let queryObj = { ...this.queryString };
        excludedField.forEach((field) => delete queryObj[field]); //remove page limit
        this.query = this.query.find(queryObj);
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            let sortStr = this.queryString.sort;
            sortStr = sortStr.split(',').join(' ');
            this.query = this.query.sort(sortStr);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    pagination() {
        const page = this.queryString.page * 1 || 1  //convert to number
        const limit = this.queryString.limit * 1 || 10
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
module.exports = APIFeatures  