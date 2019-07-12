const should = require('chai').should();

describe('Unit Tests', function() {
    it('sample test', function() {
        const value = 'todo: implement unit tests';
        should.exist(value);
        value.should.be.a('string');
        value.should.not.be.empty;
    });
});