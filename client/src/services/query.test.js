import {
    asQueryString
} from './query';

describe('Query Module', function () {
    test('asQueryString() generates expected query string', () => {
        const data = {testInt: 1, testString: 'a', testIntArray: '1,2,3', testStringArray: 'a,b,c'};
        const expectedQueryString = '?testInt=1&testString=a&testIntArray=1%2C2%2C3&testStringArray=a%2Cb%2Cc'
        expect(asQueryString(data)).toEqual(expectedQueryString)
    });
})