import {
  containsVal,
  containsAllVals,
  removeVal,
  removeAllVals
} from './tree-select-utils';

describe('Tree Select Utilities Module', function() {
  test('containsVal() => [1, 2, 3] contains value 3', () => {
    expect(containsVal([1, 2, 3], 3)).toBe(true);
  });

  test('containsVal() => [1, 2, 3] does not contain value 4', () => {
    expect(containsVal([1, 2, 3], 4)).toBe(false);
  });

  test('containsAllVals() => [1, 2, 3] contains value [1, 2]', () => {
    expect(containsAllVals([1, 2, 3], [2, 3])).toBe(true);
  });

  test('containsAllVals() => [1, 2, 3] contains value [3, 5]', () => {
    expect(containsAllVals([1, 2, 3], [3, 5])).toBe(false);
  });

  test('removeVal() => remove value 3 from [1, 2, 3]', () => {
    expect(removeVal([1, 2, 3], 3)).toStrictEqual([1, 2]);
  });

  test('removeVal() => remove value 4 from [1, 2, 3]', () => {
    expect(removeVal([1, 2, 3], 4)).toStrictEqual([1, 2, 3]);
  });

  test('removeAllVals() => remove values [2, 3] from [1, 2, 3]', () => {
    expect(removeAllVals([1, 2, 3], [2, 3])).toStrictEqual([1]);
  });

  test('removeAllVals() => remove values [3, 4] from [1, 2, 3]', () => {
    expect(removeAllVals([1, 2, 3], [3, 4])).toStrictEqual([1, 2]);
  });

  // // fail on purpose
  // test('containsVal() => [1, 2, 3] contains value 3', () => {
  //   expect(containsVal([1, 2, 3], 3)).toBe(false);
  // })
});
