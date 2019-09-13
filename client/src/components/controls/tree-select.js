/*
        <TreeSelect
          className="form-control flex-shrink-auto h-100 p-0"
          style={{ width: '100%', maxHeight: 76, overflow: 'auto' }}
          dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
          treeData={
            selectedListType === 'alphabetic'
              ? alphabetizedPhenotypes
              : phenotypesTree
          }
          value={selectedPhenotypes}
          onChange={handleChange}
          treeNodeFilterProp="label"
          dropdownMatchSelectWidth
          autoClearSearchValue
          // treeCheckable={selectedListType === 'categorical' ? true : false}
          // treeCheckStrictly
          treeDefaultExpandAll
          treeLine
          multiple
          allowClear
          labelInValue
          placeholder="(Select Phenotypes)"
        />
*/

export function containsVal(arr, val) {
  let result = false;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].value === val) {
      result = true;
    }
  }

  return result;
}

export function containsAllVals(arr, vals) {
  let result = true;
  for (var i = 0; i < vals.length; i++) {
    if (!containsVal(arr, vals[i].value)) {
      result = false;
    } 
  }
  return result;
}

export function removeVal(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].value === val) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

export function removeAllVals(arr, vals) {
  for (var i = 0; i < vals.length; i++) {
    removeVal(arr, vals[i].value);
  }
  return arr;
}

export function getLeafs(extra, node, allLeafs = []) {
  if(node.children.length === 0){
    allLeafs.push(node);
  }else{
    for (var i = 0; i < node.children.length; i++) {
      allLeafs = getLeafs(extra, node.children[i].props, allLeafs);
    }
  }
  return allLeafs;
}

export function getAllLeafs(extra) {
  let allLeafs = [];
  let children = extra.triggerNode.props.children.map(child => child.props);
  if (children.length > 0) {
    for (var i = 0; i < children.length; i++) {
      let child = children[i];
      allLeafs = allLeafs.concat(getLeafs(extra, child));
    }
  } else {
    allLeafs.push(extra.triggerNode.props);
  }

  return allLeafs;
}