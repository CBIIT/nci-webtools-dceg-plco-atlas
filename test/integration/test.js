const should = require('chai').should();

describe('Integration Tests', function() {
    it('sample test', function() {
        const value = 'todo: implement integration tests';
        should.exist(value);
        value.should.be.a('string');
        value.should.not.be.empty;
    });
});