import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlusSquare,
  faMinusSquare,
  faSearch,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

export function TreeSelectCustom({ onChange, data, dataAlphabetical, value, singleSelect }) {
  const [searchInput, setSearchInput] = useState('');
  const [listType, setListType] = useState('categorical');
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

  const toggleHideChildren = name => {
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
      // textContent = <FontAwesomeIcon icon={faMinusSquare} size="lg"/>;
    } else {
      document.getElementsByClassName(className)[0].style.display = 'none';
      const collapseButton = document.getElementsByClassName(
        'collapse-button-text-' + name
      )[0];
      // .textContent = <FontAwesomeIcon icon={faPlusSquare} size="lg"/>;
      ReactDOM.render(
        <FontAwesomeIcon icon={faPlusSquare} size="1x" />,
        collapseButton
      );
    }
  };

  const checkParents = () => {
    //    console.log(data);
    // 1 uncheck all sub parents and children when touched parent is unchecked
    // 2 check parent when all sibling leafs are also checked
    // 3 uncheck parent when if any of children are unchecked
  };

  const handleSelect = item => {
    if (singleSelect) {
      console.log('SINGLE SELECT ITEM', item);
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
      checkParents();

      onChange(values);
    }
  };

  // const isChecked = (e) => {
  //     console.log("isChecked", e);
  // };

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
                  className={'ml-2 parent-checkbox-' + item.value}
                  name={'parent-checkbox-' + item.value}
                  type="checkbox"
                  // type={singleSelect ? "radio" : "checkbox"}
                  // checked={true}
                  onChange={e => handleSelect(item)}
                  disabled={singleSelect ? true : false}
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
                  {item.title}
                </button>
              </div>

              <ul
                className={'pl-4 children-of-' + item.value}
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
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}>
            <input
              title="Select phenotype"
              style={{ cursor: 'pointer' }}
              className={'ml-4 leaf-checkbox-' + item.value}
              name={'leaf-checkbox-' + item.value}
              type="checkbox"
              // type={singleSelect ? 'radio' : 'checkbox'}
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
      let re = new RegExp(searchInput, 'gi');
      return item.title.match(re);
    };
    const dataAlphabeticalFiltered = dataAlphabetical.filter(stringMatch);
    if (dataAlphabeticalFiltered && dataAlphabeticalFiltered.length > 0) {
      return dataAlphabeticalFiltered.map((item) => (
        <div
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
            {item.title}
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
                  className="ml-1 collapse-button text-secondary">
                  <FontAwesomeIcon icon={faPlusSquare} size="1x" />
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
            // type={singleSelect ? 'radio' : 'checkbox'}
            disabled={singleSelect ? true : false}
            // checked={e => isChecked(e)}
            // onChange={e => handleSelect(item)}
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
          {
            listType === 'categorical' ? selectTreeCategorical(data) : selectTreeAlphabetical(dataAlphabetical)
          }
        </ul>
      </div>
    </>
  );
}
