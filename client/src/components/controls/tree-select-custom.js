import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlusSquare,
  faMinusSquare,
  faSearch,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

export function TreeSelectCustom({ onChange, data, dataAlphabetical, dataCategories, value, singleSelect }) {
  const [searchInput, setSearchInput] = useState('');
  const [listType, setListType] = useState('categorical');
  const [expandAll, setExpandAll] = useState(false);
  const containsVal = (arr, val) => {
    let result = false;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].value === val) {
        result = true;
      }
    }
    return result;
  };

  const containsAllVals = (arr, vals) => {
    let result = true;
    for (var i = 0; i < vals.length; i++) {
      if (!containsVal(arr, vals[i].value)) {
        result = false;
      }
    }
    return result;
  };

  const removeVal = (arr, val) => {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].value === val) {
        arr.splice(i, 1);
      }
    }
    return arr;
  };

  const removeAllVals = (arr, vals) => {
    for (var i = 0; i < vals.length; i++) {
      removeVal(arr, vals[i].value);
    }
    return arr;
  };

  const getLeafs = (item, node, allLeafs = []) => {
    if (!node.children || node.children.length === 0) {
      // ignore disabled attribute for now
      // if (!node.disabled) {
      allLeafs.push(node);
      // }
    } else {
      if (document.getElementsByClassName('parent-checkbox-' + node.value)[0]) {
        document.getElementsByClassName(
          'parent-checkbox-' + node.value
        )[0].checked = true;
      }
      for (var i = 0; i < node.children.length; i++) {
        allLeafs = getLeafs(item, node.children[i], allLeafs);
      }
    }
    return allLeafs;
  };

  const getAllLeafs = item => {
    let allLeafs = [];
    if (item.children && item.children.length > 0) {
      for (var i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        allLeafs = allLeafs.concat(getLeafs(item, child));
      }
    } else {
      if (!item.parent) {
        allLeafs.push(item);
      }
    }
    return allLeafs;
  };

  const toggleExpandAllParents = () => {
    if (!expandAll) {
      for (let i = 0; i < dataCategories.length; i++) {
        const className = 'children-of-' + dataCategories[i].value;
        if (
          document.getElementsByClassName(className)[0].style.display &&
          document.getElementsByClassName(className)[0].style.display === 'none'
        ) {
          document.getElementsByClassName(className)[0].style.display = 'block';
          const collapseButton = document.getElementsByClassName(
            'collapse-button-text-' + dataCategories[i].value
          )[0];
          ReactDOM.render(
            <FontAwesomeIcon icon={faMinusSquare} size="1x" />,
            collapseButton
          );
        }
      }
      setExpandAll(true);
    } else {
      for (let i = 0; i < dataCategories.length; i++) {
        const className = 'children-of-' + dataCategories[i].value;
        if (
          document.getElementsByClassName(className)[0].style.display &&
          document.getElementsByClassName(className)[0].style.display === 'block'
        ) {
          document.getElementsByClassName(className)[0].style.display = 'none';
          const collapseButton = document.getElementsByClassName(
            'collapse-button-text-' + dataCategories[i].value
          )[0];
          ReactDOM.render(
            <FontAwesomeIcon icon={faPlusSquare} size="1x" />,
            collapseButton
          );
        }
      }
      setExpandAll(false);
    }
  };

  const toggleHideChildren = (name) => {
    const className = 'children-of-' + name;
    if (
      document.getElementsByClassName(className)[0].style.display &&
      document.getElementsByClassName(className)[0].style.display === 'none'
    ) {
      document.getElementsByClassName(className)[0].style.display = 'block';
      const collapseButton = document.getElementsByClassName(
        'collapse-button-text-' + name
      )[0];
      ReactDOM.render(
        <FontAwesomeIcon icon={faMinusSquare} size="1x" />,
        collapseButton
      );
    } else {
      document.getElementsByClassName(className)[0].style.display = 'none';
      const collapseButton = document.getElementsByClassName(
        'collapse-button-text-' + name
      )[0];
      ReactDOM.render(
        <FontAwesomeIcon icon={faPlusSquare} size="1x" />,
        collapseButton
      );
    }
  };

  const checkAllChildrenLeafsSelected = (leafs, selectedValues) => {
    for(var i = 0; i < leafs.length; i++){
      if(selectedValues.indexOf(leafs[i]) === -1)
         return false;
    }
    return true;
  }

  const checkSomeChildrenLeafsSelected = (leafs, selectedValues) => {
    return leafs.some(r => selectedValues.indexOf(r) >= 0)
  }

  const checkParents = (item) => {
    const itemAllLeafs = getAllLeafs(item);
    if (!singleSelect) {
      // multi-select
      const checkAllLeafsSelectedResult = checkAllChildrenLeafsSelected(itemAllLeafs.map((obj) => obj.value), value.map((obj) => obj.value));
      if (checkAllLeafsSelectedResult) {
        let checkbox = document.getElementsByClassName('parent-checkbox-' + item.value)[0];
          if (checkbox) {
            checkbox.indeterminate = false;
          } 
        return true;
      } else {
        const checkSomeLeafsSelectedResult = checkSomeChildrenLeafsSelected(itemAllLeafs.map((obj) => obj.value), value.map((obj) => obj.value));
        if (checkSomeLeafsSelectedResult) {
          // show indeterminate checkbox if some (at least one) leaf is selected
          let checkbox = document.getElementsByClassName('parent-checkbox-' + item.value)[0];
          if (checkbox) {
            checkbox.indeterminate = true;
          } 
          return true;
        } else {
          let checkbox = document.getElementsByClassName('parent-checkbox-' + item.value)[0];
          if (checkbox) {
            checkbox.indeterminate = false;
          } 
          return false;
        }
      }
    } 
    else {
      // single-select
      if (itemAllLeafs && value) {
        const checkSomeLeafsSelectedResult = checkSomeChildrenLeafsSelected(itemAllLeafs.map((obj) => obj.value), [value].map((obj) => obj.value));
        if (checkSomeLeafsSelectedResult) {
          // show indeterminate checkbox if some (at least one) leaf is selected
          let checkbox = document.getElementsByClassName('parent-checkbox-' + item.value)[0];
          if (checkbox) {
            checkbox.indeterminate = true;
          } 
          return false;
        } else {
          let checkbox = document.getElementsByClassName('parent-checkbox-' + item.value)[0];
          if (checkbox) {
            checkbox.indeterminate = false;
          } 
          return false;
        }
      } else {
        let checkbox = document.getElementsByClassName('parent-checkbox-' + item.value)[0];
        if (checkbox) {
          checkbox.indeterminate = false;
        } 
        return false;
      }
    }
  };

  const handleSelect = item => {
    if (singleSelect) {
      onChange([item]);
    } else {
      const parentCheckboxClassName = 'parent-checkbox-' + item.value;
      // const leafCheckboxClassName = "leaf-checkbox-" + item.value;
      let values = [...value];
      let newValues = getAllLeafs(item);
      if (containsAllVals(values, newValues)) {
        // remove all leafs if parent is clicked and all leafs were already selected
        values = removeAllVals(values, newValues);
        if (document.getElementsByClassName(parentCheckboxClassName)[0]) {
          // console.log(document.getElementsByClassName(parentCheckboxClassName));
          document.getElementsByClassName(
            parentCheckboxClassName
          )[0].checked = false;
        }
        for (let i = 0; i < newValues.length; i++) {
          if (
            document.getElementsByClassName(
              'leaf-checkbox-' + newValues[i].value
            )[0]
          ) {
            document.getElementsByClassName(
              'leaf-checkbox-' + newValues[i].value
            )[0].checked = false;
          }
        }
      } else {
        for (let i = 0; i < newValues.length; i++) {
          if (!containsVal(values, newValues[i].value)) {
            // only add if value did not exist before
            values.push(newValues[i]);
            if (document.getElementsByClassName(parentCheckboxClassName)[0]) {
              // console.log(document.getElementsByClassName(parentCheckboxClassName));
              document.getElementsByClassName(
                parentCheckboxClassName
              )[0].checked = true;
            }
            if (
              document.getElementsByClassName(
                'leaf-checkbox-' + newValues[i].value
              )[0]
            ) {
              document.getElementsByClassName(
                'leaf-checkbox-' + newValues[i].value
              )[0].checked = true;
            }
          } else {
            // remove if new selected leaf was already selected
            if (newValues.length === 1) {
              values = removeVal(values, newValues[i].value);
            }
          }
        }
      }

      onChange(values);
    }
  };

  const selectTreeCategorical = data =>
    data.map(item => {
      if (item.children && item.children.length > 0) {
        return (
          // PARENT
          <>
            <li className="my-1" style={{ display: 'block' }}>
              <div className="d-flex align-items-center">
                <button
                  title="Show/hide children"
                  style={{ all: 'unset' }}
                  className="collapse-button text-secondary"
                  onClick={e => toggleHideChildren(item.value)}>
                  <span className={'collapse-button-text-' + item.value}>
                    <FontAwesomeIcon icon={faPlusSquare} size="1x" />
                  </span>
                </button>

                <div
                  className="mx-1"
                  style={{
                    display: 'inline-block',
                    borderLeft: '1px solid white',
                    height: '10px'
                  }}
                />

                <input
                  title={
                    singleSelect
                      ? 'Cannot select all children'
                      : 'Select all children'
                  }
                  style={{
                    verticalAlign: 'middle',
                    alignSelf: 'center',
                    cursor: singleSelect ? 'not-allowed' : 'pointer'
                  }}
                  className={'parent-checkbox-' + item.value}
                  name={'parent-checkbox-' + item.value}
                  type="checkbox"
                  // indeterminate={true}
                  // checked={ !singleSelect && value && value.length > 0 && containsAllVals(getAllLeafs(item), value)}
                  checked={checkParents(item)}
                  onChange={e => handleSelect(item)}
                  disabled={singleSelect ? true : false}
                />

                <div
                  className="ml-1"
                  style={{
                    display: 'inline-block',
                    borderLeft: '1px solid white',
                    height: '10px'
                  }}
                />

                <button
                  title={item.title}
                  className="ml-1"
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}
                  onClick={e => handleSelect(item)}>
                  {item.title}
                </button>
              </div>

              <ul
                className={'ml-3 pl-1 children-of-' + item.value}
                style={{ listStyleType: 'none', display: 'none' }}>
                {selectTreeCategorical(item.children)}
              </ul>
            </li>
          </>
        );
      } else {
        return (
          // LEAF
          <li
            key={"categorical-" + item.value}
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}>
            <div
              className="ml-3"
              style={{
                display: 'inline-block',
                borderLeft: '1px solid white',
                height: '10px'
              }}
            />
            <input
              title="Select phenotype"
              style={{ cursor: 'pointer' }}
              className={'ml-1 leaf-checkbox-' + item.value}
              name={'leaf-checkbox-' + item.value}
              type="checkbox"
              // type={singleSelect ? 'radio' : 'checkbox'}
              checked={
                (singleSelect && value && value.value === item.value) ||
                (!singleSelect && value.map((item) => item.value).includes(item.value))
              }
              onChange={e => {
                handleSelect(item);
                // checkParents(item);
              }}
            />

            <div
              className="ml-1"
              style={{
                display: 'inline-block',
                borderLeft: '1px solid white',
                height: '10px'
              }}
            />

            <button
              title={item.title}
              className="ml-1"
              style={{
                all: 'unset',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                width: '65%'
              }}
              onClick={e => handleSelect(item)}>
              {item.title}
            </button>
          </li>
        );
      }
  });

  const selectTreeAlphabetical = dataAlphabetical => {
    const stringMatch = (item) => {
      // console.log("searchInput", searchInput);
      let re1 = new RegExp(/[()~`!#$%\^&*+=\[\]\\;,/{}|\\":<>\?]/, 'gi');
      if (!re1.test(searchInput)) {
        let re2 = new RegExp(searchInput, 'gi');
        return item.title.match(re2);
      }
    };
    const dataAlphabeticalFiltered = dataAlphabetical.filter(stringMatch);
    if (dataAlphabeticalFiltered && dataAlphabeticalFiltered.length > 0) {
      return dataAlphabeticalFiltered.map((item) => (
        <div
          key={"alpha-" + item.value}
          className="my-1"
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
          <input
            title="Select phenotype"
            style={{ cursor: 'pointer' }}
            className={'ml-0 leaf-checkbox-' + item.value}
            name={'leaf-checkbox-' + item.value}
            type="checkbox"
            checked={
              (singleSelect && value && value.value === item.value) ||
              (!singleSelect && value.map((item) => item.value).includes(item.value))
            }
            onChange={e => handleSelect(item)}
          />

          <button
            title={item.title}
            className="ml-2"
            style={{
              all: 'unset',
              cursor: 'pointer',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
            onClick={e => handleSelect(item)}>
            {/* {item.title.replace(searchInput, '[' + searchInput + ']')} */}
            {item.title.slice(0, item.title.toLowerCase().indexOf(searchInput.toLowerCase()))}
            <b>
              {item.title.slice(item.title.toLowerCase().indexOf(searchInput.toLowerCase()), item.title.toLowerCase().indexOf(searchInput.toLowerCase()) + searchInput.length)}
            </b>
            {item.title.slice(item.title.toLowerCase().indexOf(searchInput.toLowerCase()) + searchInput.length, item.title.length)}
          </button>
        </div>
      ));
    } else {
      return(
        <div className="p-2">
          No phenotypes found.
        </div>
      );
    }
  };

  const selectAll = () => {
    if (checkAllLeafsSelected()) {
      onChange([]);
    } else {
      const allLeafs = [];
      data.map((item) => allLeafs.push(getAllLeafs(item)));
      onChange(allLeafs.flat());
    }
  };

  const checkAllLeafsSelected = () => {
    let allLeafs = [];
    data.map((item) => allLeafs.push(getAllLeafs(item)));
    allLeafs = allLeafs.flat().map((item) => item.value);
    for(var i = 0; i < allLeafs.length; i++){
      if(value.map((item) => item.value).indexOf(allLeafs[i]) === -1)
         return false;
    }
    return true;
  }

  return (
    <>
      <div
        className="border"
        style={{
          // textOverflow: 'ellipsis',
          // overflowY: 'auto',
          // overflowX: 'hidden',
          // whiteSpace: 'nowrap',
          // maxHeight: '250px',
          borderColor: '#dee2e6',
          fontSize: '10pt'
        }}>
        <div className="bg-secondary border-bottom d-flex align-items-center py-1">

          {
              listType === 'categorical' && (
              <>
                <button
                  title="Show/hide all children"
                  style={{ all: 'unset' }}
                  className="ml-1 collapse-button-all text-secondary"
                  onClick={e => toggleExpandAllParents()}>
                    {
                      expandAll && (
                        <FontAwesomeIcon icon={faMinusSquare} size="1x" />
                      )
                    }
                    {
                      !expandAll && (
                        <FontAwesomeIcon icon={faPlusSquare} size="1x" />
                      )
                    }
                </button>

                <div
                  className="mx-1"
                  style={{
                    display: 'inline-block',
                    borderLeft: '1px solid #c7cbcf',
                    height: '25px'
                  }}
                />
              </>
            )
          }

          <input
            title={singleSelect ? 'Cannot select all phenotypes' : 'Select all'}
            style={{ cursor: singleSelect ? 'not-allowed' : 'pointer' }}
            className={listType === 'alphabetical' ? "ml-1" : ""}
            name=""
            type="checkbox"
            disabled={singleSelect ? true : false}
            checked={!singleSelect && checkAllLeafsSelected()}
            onChange={e => !singleSelect && selectAll()}
          />

          <div
            className="ml-1"
            style={{
              display: 'inline-block',
              borderLeft: '1px solid #c7cbcf',
              height: '25px'
            }}
          />

          <div className="px-2 input-group" style={{ width: '100%' }}>
            <input
              className="form-control py-1 h-100 border-right-0"
              style={{ display: 'block' }}
              placeholder="Search Phenotype"
              aria-label="Search Phenotype"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                if (e.target.value && e.target.value.length > 0) {
                  setListType('alphabetical');
                } else {
                  setListType('categorical');
                }
              }}
              type="text"
            />
            <div className="input-group-append">
              {searchInput.length > 0 ? (
                <button 
                  className="input-group-text bg-white" 
                  onClick={e => {
                    setSearchInput("");
                    setListType('categorical');
                  }}>
                  <FontAwesomeIcon icon={faTimes} size="xs" />
                </button>
              ) : (
                <button className="input-group-text bg-white" disabled>
                  <FontAwesomeIcon icon={faSearch} size="xs" />
                </button>
              )}
            </div>
          </div>
        </div>

        <ul
          className="pl-0 ml-1 mr-0 my-0"
          style={{
            listStyleType: 'none',
            textOverflow: 'ellipsis',
            overflowY: 'auto',
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
            maxHeight: '450px',
            fontSize: '10pt'
          }}>
          <span style={{display: listType === 'categorical' ? 'block' : 'none'}}>
            {selectTreeCategorical(data)}
          </span>
          <span style={{display: listType === 'categorical' ? 'none' : 'block'}}>
            {selectTreeAlphabetical(dataAlphabetical)}
          </span>
        </ul>
      </div>
    </>
  );
}
