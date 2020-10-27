import React, {
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import { LoadingOverlay } from '../../controls/loading-overlay/loading-overlay';
import { Spinner } from 'react-bootstrap';
import {
  containsVal,
  containsAllVals,
  removeVal,
  removeAllVals
} from './tree-select-utils';

export const TreeSelect = forwardRef(
  (
    {
      onChange,
      data,
      value,
      limit = 0,
      singleSelect,
      enabled = node => true,
      placeholder = 'Search',
      titleKey = 'display_name',
    },
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      resetSearchFilter() {
        setSearchFilter('');
        setExpandedNodes([]);
      },
      expandSelectedPhenotype(displayTreeParent) {
        setExpanded(displayTreeParent.data, true);
      }
    }));

    const root = useRef({ children: data || [] });
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    useEffect(_ => {
        if (!value) value = [];
        if (!Array.isArray(value)) value = [value];
        
        // ensure that any items passed in are references to internal nodes
        const leaves = getLeaves(root.current);
        const nodes = value
          .map(item => leaves.includes(item)
            ? item
            : leaves.find(node => node.id == item.id))
          .filter(Boolean);

        setSelectedNodes(nodes);
    }, [value]);

    useEffect(_ => {
        root.current.children = data || [];
    }, [data]);

    const arrayWithElements = (elements, shouldInclude, array) =>
      shouldInclude
        ? array.concat(elements.filter(e => !array.includes(e)))
        : array.filter(e => !elements.includes(e));

    const compareTitles = (a, b) => a[titleKey].localeCompare(b[titleKey]);

    const reduceChildren = (node, fn, initialValue) => {
      let accumulator = fn(initialValue || node, node);
      for (let child of node.children || [])
        accumulator = reduceChildren(child, fn, accumulator);
      return accumulator;
    };

    const getIntermediateNodes = node =>
      reduceChildren(
        node,
        (acc, curr) =>
          acc.concat(curr.children && curr.children.length ? [curr] : []),
        []
      );

    const getLeaves = node =>
      reduceChildren(
        node,
        (acc, curr) =>
          acc.concat(!curr.children || !curr.children.length ? [curr] : []),
        []
      );

    const getSelectedLeaves = node =>
      getLeaves(node).filter(node => selectedNodes.includes(node));

    const isSelected = node => {
      const selectedLeaves = getSelectedLeaves(node);
      return (
        selectedNodes.includes(node) ||
        (selectedLeaves.length &&
          selectedLeaves.length === getLeaves(node).length)
      );
    };

    const setSelected = (node, isSelected) => {
      const selection = singleSelect
        ? [node]
        : arrayWithElements(
            getLeaves(node)
              .filter(enabled)
              .filter((_, i) => limit === 0 || i < limit),
            isSelected,
            selectedNodes
          );
      setSelectedNodes(selection);
      onChange(selection);
    };

    const isDisabled = node => !getLeaves(node).some(enabled);

    const isIndeterminate = node => {
      const selectedLeaves = getSelectedLeaves(node);
      return (
        selectedLeaves.length &&
        selectedLeaves.length !== getLeaves(node).length
      );
    };

    const isExpanded = node => expandedNodes.includes(node);

    const setExpanded = (node, isExpanded, recursive = false) =>
      setExpandedNodes(
        arrayWithElements(
          recursive ? getIntermediateNodes(node) : [node],
          isExpanded,
          expandedNodes
        )
      );

    const toggleExpanded = (node, recursive = false) =>
      setExpanded(node, !isExpanded(node), recursive);

    const HighlightText = ({ text, highlighted }) => {
      const index = text.toLowerCase().indexOf(highlighted.toLowerCase());
      return index === -1 ? (
        text
      ) : (
        <span>
          {text.substr(0, index)}
          <strong>{text.substr(index, highlighted.length)}</strong>
          {text.substr(index + highlighted.length)}
        </span>
      );
    };

    const Node = ({ keyPrefix, node }) => (
      <div
        style={{
          marginLeft: '10px',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
        {!searchFilter && (
          <i
            role="button"
            onClick={_ => toggleExpanded(node)}
            className={`
          text-secondary
          fa 
          fa-${isExpanded(node) ? 'minus' : 'plus'}-square 
          ${node.children && node.children.length ? 'visible' : 'invisible'}`}
          />
        )}
        <label
          className={`d-inline-flex align-items-center font-weight-normal ml-1 small ${
            isDisabled(node) ? 'text-muted c-not-allowed' : ''
          }`}
          style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
          title={node[titleKey]}>
          <input
            className={`mr-1`}
            type="checkbox"
            checked={isSelected(node)}
            ref={current =>
              current && (current.indeterminate = isIndeterminate(node))
            }
            disabled={isDisabled(node)}
            onChange={e => setSelected(node, e.target.checked)}
          />
          <HighlightText text={node[titleKey]} highlighted={searchFilter} />
        </label>
        {isExpanded(node) &&
          (node.children || [])
            .sort(compareTitles)
            .map((node, i) => (
              <Node key={`tree-node-${keyPrefix}-${i}`} node={node} />
            ))}
      </div>
    );

    return !data || !data.length ? null : (
      <div className="border">
        <div className="d-flex">
          <div className="border d-flex align-items-center p-1">
            <i
              role="button"
              onClick={_ => toggleExpanded(root.current, true)}
              className={`
              text-secondary  
              fa 
              fa-${isExpanded(root.current) ? 'minus' : 'plus'}-square`}
            />
          </div>
          <div className="border d-flex align-items-center p-1">
            <input
              type="checkbox"
              checked={isSelected(root.current)}
              ref={current =>
                current && (current.indeterminate = isIndeterminate(root))
              }
              onChange={e => setSelected(root.current, e.target.checked)}
            />
          </div>
          <div className="input-group">
            <input
              className="form-control form-control-sm"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder={placeholder}
            />
            <div className="input-group-append">
              <button
                className="btn btn-sm btn-silver"
                onClick={e => setSearchFilter('')}>
                <i
                  className={`fa fa-${
                    searchFilter.length ? 'times' : 'search'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            minHeight: '250px',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
          {
            <LoadingOverlay active={!data}>
              <Spinner animation="border" variant="primary" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </LoadingOverlay>
          }
          {searchFilter.length
            ? getLeaves(root.current)
                .filter(node =>
                  node[titleKey].toLowerCase().includes(searchFilter.toLowerCase())
                )
                .sort(compareTitles)
                .map((node, i) => (
                  <Node key={`flat-tree-node-${i}`} keyPrefix={i} node={node} />
                ))
            : data
                .sort(compareTitles)
                .map((node, i) => (
                  <Node key={`tree-node-${i}`} keyPrefix={i} node={node} />
                ))}
        </div>
      </div>
    );
  }
);


export const TreeSelect2 = forwardRef(({
    onChange,
    data,
    value,
    singleSelect,
    alwaysEnabled
  }, ref) => {

  useImperativeHandle(ref, () => ({
    resetSearchFilter() {
      clearSearchFilter();
      collapseAllParents();
    },
    expandSelectedPhenotype(displayTreeParent) {
      collapseAllParents();
      expandParents(displayTreeParent);
    }
  }));

  // check parent checked/indeterminate state when tree is loaded/reloaded
  useEffect(() => {
    if (!data || !value || value.length < 1) return;
    let parents = [];
    if (singleSelect) {
      parents = getParents(value);
    } else {
      value.forEach((val) => parents.push(getParents(val)));
      parents = parents.flat();
    }
    parents.map((parent) => checkParents(parent));
    if (singleSelect) {
      expandParents({data: value});
    } else {
      value.forEach((val) => expandParents({data: val}));
    }
  }, [data]);

  const [expandAll, setExpandAll] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [listType, setListType] = useState('categorical');

  // clear any search input text, set tree select to categorical/tree view
  const clearSearchFilter = () => {
    setSearchInput('');
    setListType('categorical');
  };

  // given child, expand all parent tree nodes leading to child in tree
  const expandParents = (displayTreeParent) => {
    var parents = getParents(displayTreeParent.data);
    parents.push(displayTreeParent.data);
    parents.map((item) => {
      if (document.getElementsByClassName('collapse-button-text-' + item.id)[0]) {
        if (document.getElementsByClassName('collapse-button-text-' + item.id)[0].classList.contains("fa-plus-square")) {
          document.getElementsByClassName('collapse-button-text-' + item.id)[0].click();
        }
      }
    });
  }

  // find all parents of a node
  const getParents = (node, parents = []) => {
    data.map((item) => {
      item.children.map((child) => {
        if (child.title === node.title && child.id === node.id) {
          parents.push(item)
          getParents(item, parents);
        }
      })
    });
    return parents;
  }

  // helper func to find all leafs of a node
  const getLeafs = (item, node, allLeafs = []) => {
    if (!node.children || node.children.length === 0) {
      allLeafs.push(node);
    } else {
      if (document.getElementsByClassName('parent-checkbox-' + node.id)[0]) {
        document.getElementsByClassName(
          'parent-checkbox-' + node.id
        )[0].checked = true;
      }
      for (var i = 0; i < node.children.length; i++) {
        allLeafs = getLeafs(item, node.children[i], allLeafs);
      }
    }
    return allLeafs;
  };

  // find all leafs of a node
  const getAllLeafs = item => {
    let allLeafs = [];
    if (item.children && item.children.length > 0) {
      // check if item is parent
      for (var i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        allLeafs = allLeafs.concat(getLeafs(item, child));
      }
    } else {
      // if (!item.parent) {
      // check if item is not parent
      allLeafs.push(item);
      // }
    }
    return allLeafs;
  };

  // expand all parent nodes in tree
  const toggleExpandAllParents = () => {
    if (!expandAll) {
      for (let i = 0; i < data.categories.length; i++) {
        const className = 'children-of-' + data.categories[i].id;
        if (
          document.getElementsByClassName(className)[0].style.display &&
          document.getElementsByClassName(className)[0].style.display === 'none'
        ) {
          document.getElementsByClassName(className)[0].style.display = 'block';
          const collapseButton = document.getElementsByClassName(
            'collapse-button-text-' + data.categories[i].id
          )[0];
          collapseButton.classList.toggle('fa-plus-square', false);
          collapseButton.classList.toggle('fa-minus-square', true);
        }
      }
      setExpandAll(true);
    } else {
      for (let i = 0; i < data.categories.length; i++) {
        const className = 'children-of-' + data.categories[i].id;
        if (
          document.getElementsByClassName(className)[0].style.display &&
          document.getElementsByClassName(className)[0].style.display ===
            'block'
        ) {
          document.getElementsByClassName(className)[0].style.display = 'none';
          const collapseButton = document.getElementsByClassName(
            'collapse-button-text-' + data.categories[i].id
          )[0];
          collapseButton.classList.toggle('fa-plus-square', true);
          collapseButton.classList.toggle('fa-minus-square', false);
        }
      }
      setExpandAll(false);
    }
  };

  // collapse all parent nodes in tree
  const collapseAllParents = () => {
    if (!data) return;
    for (let i = 0; i < data.categories.length; i++) {
      const className = 'children-of-' + data.categories[i].id;
      if (
        document.getElementsByClassName(className)[0].style.display &&
        document.getElementsByClassName(className)[0].style.display ===
          'block'
      ) {
        document.getElementsByClassName(className)[0].style.display = 'none';
        const collapseButton = document.getElementsByClassName(
          'collapse-button-text-' + data.categories[i].id
        )[0];
        collapseButton.classList.toggle('fa-plus-square', true);
        collapseButton.classList.toggle('fa-minus-square', false);
      }
    }
    setExpandAll(false);
  };

  // hide children of specified node in tree
  const toggleHideChildren = name => {
    const className = 'children-of-' + name;
    let node =  document.getElementsByClassName(className)[0];
    if (!node) return true;
    if (
      document.getElementsByClassName(className)[0].style.display &&
      document.getElementsByClassName(className)[0].style.display === 'none'
    ) {
      document.getElementsByClassName(className)[0].style.display = 'block';
      const collapseButton = document.getElementsByClassName(
        'collapse-button-text-' + name
      )[0];
      collapseButton.classList.toggle('fa-plus-square', false);
      collapseButton.classList.toggle('fa-minus-square', true);
    } else {
      document.getElementsByClassName(className)[0].style.display = 'none';
      // return true;
      const collapseButton = document.getElementsByClassName(
        'collapse-button-text-' + name
      )[0];
      collapseButton.classList.toggle('fa-plus-square', true);
      collapseButton.classList.toggle('fa-minus-square', false);
    }
  };

  // return true only if all children of a parent node is selected in tree
  const checkAllChildrenLeafsSelected = (leafs, selectedValues) => {
    if (leafs.length === 0) return false;
    for (var i = 0; i < leafs.length; i++) {
      if (selectedValues.indexOf(leafs[i]) === -1) return false;
    }
    return true;
  };

  // return true if at least 1 child of a parent node is selected in tree 
  const checkSomeChildrenLeafsSelected = (leafs, selectedValues) => {
    return leafs.some(r => selectedValues.indexOf(r) >= 0);
  };

  // given parent, determine if all its childern are disabled or not
  const checkAllChildrenDisabled = item => {
    if (alwaysEnabled) return false;
    if (!item) return false;
    // console.log("checkAllChildrenDisabled", item);
    const itemAllLeafs = getAllLeafs(item);
    // if (!singleSelect) {
    // console.log("itemAllLeafs", itemAllLeafs);
    const itemImportDates = itemAllLeafs.map(obj => obj.import_date);
    // console.log("itemImportDates", itemImportDates);
    return itemImportDates.every(element => element === null);
    // }
  }

  // given parent, determine its checkbox state in tree
  const checkParents = item => {
    if (!item) return false;
    const itemAllLeafs = getAllLeafs(item);
    if (!singleSelect) {
      // multi-select
      const checkAllLeafsSelectedResult = checkAllChildrenLeafsSelected(
        itemAllLeafs.filter(obj => alwaysEnabled ? obj : obj.import_date).map(obj => obj.id),
        value.map(obj => obj.id)
      );
      if (checkAllLeafsSelectedResult) {
        let checkbox = document.getElementsByClassName(
          'parent-checkbox-' + item.id
        )[0];
        if (checkbox) {
          // checkbox.checked = true;
          checkbox.indeterminate = false;
        }
        return true;
      } else {
        const checkSomeLeafsSelectedResult = checkSomeChildrenLeafsSelected(
          itemAllLeafs.map(obj => obj.id),
          value.map(obj => obj.id)
        );
        if (checkSomeLeafsSelectedResult) {
          // show indeterminate checkbox if some (at least one) leaf is selected
          let checkbox = document.getElementsByClassName(
            'parent-checkbox-' + item.id
          )[0];
          if (checkbox) {
            // checkbox.checked = false;
            checkbox.indeterminate = true;
          }
          return false;
        } else {
          let checkbox = document.getElementsByClassName(
            'parent-checkbox-' + item.id
          )[0];
          if (checkbox) {
            // checkbox.checked = false;
            checkbox.indeterminate = false;
          }
          return false;
        }
        // return false;
      }
    } else {
      // single-select
      if (itemAllLeafs && value) {
        const checkSomeLeafsSelectedResult = checkSomeChildrenLeafsSelected(
          itemAllLeafs.map(obj => obj.id),
          [value].map(obj => obj.id)
        );
        if (checkSomeLeafsSelectedResult) {
          // show indeterminate checkbox if some (at least one) leaf is selected
          let checkbox = document.getElementsByClassName(
            'parent-checkbox-' + item.id
          )[0];
          if (checkbox) {
            // checkbox.checked = false;
            checkbox.indeterminate = true;
          }
          return false;
        } else {
          let checkbox = document.getElementsByClassName(
            'parent-checkbox-' + item.id
          )[0];
          if (checkbox) {
            // checkbox.checked = false;
            checkbox.indeterminate = false;
          }
          return false;
        }
        // return false;
      } else {
        let checkbox = document.getElementsByClassName(
          'parent-checkbox-' + item.id
        )[0];
        if (checkbox) {
          // checkbox.checked = false;
          checkbox.indeterminate = false;
        }
        return false;
      }
    }
  };

  // handle checkbox behaviors for single and multi-select tree
  const handleSelect = item => {
    if (singleSelect) {
      // if single select
      onChange([item]);
    } else {
      // if multi-select
      const parentCheckboxClassName = 'parent-checkbox-' + item.id;
      let values = [...value];
      let newValues = getAllLeafs(item).filter(obj => alwaysEnabled ? obj : obj.import_date);
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
              'leaf-checkbox-' + newValues[i].id
            )[0]
          ) {
            document.getElementsByClassName(
              'leaf-checkbox-' + newValues[i].id
            )[0].checked = false;
          }
        }
      } else {
        if (
          document.getElementsByClassName('children-of-' + item.id) &&
          document.getElementsByClassName('children-of-' + item.id)[0] &&
          document.getElementsByClassName('children-of-' + item.id)[0].style.display &&
          document.getElementsByClassName('children-of-' + item.id)[0].style.display === 'none'
        ) {
          toggleHideChildren(item.id);
        }
        for (let i = 0; i < newValues.length; i++) {
          if (!containsVal(values, newValues[i].id)) {
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
                'leaf-checkbox-' + newValues[i].id
              )[0]
            ) {
              document.getElementsByClassName(
                'leaf-checkbox-' + newValues[i].id
              )[0].checked = true;
            }
          } else {
            // remove if new selected leaf was already selected
            if (newValues.length === 1) {
              values = removeVal(values, newValues[i].id);
            }
          }
        }
      }
      onChange(values);
    }
  };

  // construct tree
  const selectTreeCategorical = data =>
    data.sort((a, b) => a.title.localeCompare(b.title)).map(item => {
      if (item.children && item.children.length > 0) {
        return (
          // PARENT
          <li 
            key={'categorical-' + item.id}
            className="my-1" 
            style={{ display: 'block' }}
          >
            <div className="d-flex align-items-center">
              <button
                title={"Show/hide " + item.title + " phenotypes"}
                style={{ all: 'unset' }}
                className="collapse-button text-secondary"
                onClick={e => toggleHideChildren(item.id)}>
                <i className={"fa fa-plus-square collapse-button-text-" + item.id}></i>
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
                    ? 'Unable to select all ' + item.title + ' phenotypes\nOnly one phenotype can be selected'
                    : 'Select/deselect all ' + item.title + ' phenotypes'
                }
                style={{
                  verticalAlign: 'middle',
                  alignSelf: 'center',
                  cursor: singleSelect || (!singleSelect && checkAllChildrenDisabled(item)) ? 'not-allowed' : 'pointer'
                }}
                className={'parent-checkbox-' + item.id}
                // name={'parent-checkbox-' + item.id}
                type="checkbox"
                aria-label="Checkbox"
                // checked={ !singleSelect && value && value.length > 0 && containsAllVals(getAllLeafs(item), value)}
                checked={checkParents(item)}
                onChange={e => handleSelect(item)}
                disabled={singleSelect || (!singleSelect && checkAllChildrenDisabled(item)) ? true : false}
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
                title={singleSelect? "Show/hide " + item.title + " phenotypes" : 'Select/deselect all ' + item.title + ' phenotypes'}
                className="ml-1"
                style={{
                  all: 'unset',
                  cursor: !singleSelect && checkAllChildrenDisabled(item) ? 'not-allowed' : 'pointer',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  color: checkAllChildrenDisabled(item) ? '#D3D3D3' : 'unset'
                }}
                disabled={!singleSelect && checkAllChildrenDisabled(item) ? true : false}
                onClick={e => singleSelect ? toggleHideChildren(item.id) : handleSelect(item)}
                >
                {item.title}
              </button>
            </div>

            <ul
              className={'ml-3 pl-1 children-of-' + item.id}
              style={{ listStyleType: 'none', display: 'none' }}>
              {selectTreeCategorical(item.children)}
            </ul>
          </li>
        );
      } else {
        return (
          // LEAF
          <li
            key={'categorical-leaf-' + item.id}
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
              title={singleSelect ? "Select " + item.title + " phenotype" : "Select/deselect " + item.title + " phenotype"}
              style={{ 
                cursor: alwaysEnabled || item.import_date ? 'pointer' : 'not-allowed' 
              }}
              className={'ml-1 leaf-checkbox-' + item.id}
              // name={'leaf-checkbox-' + item.id}
              type="checkbox"
              aria-label="Checkbox"
              // type={singleSelect ? 'radio' : 'checkbox'}
              checked={
                (singleSelect && value && value.id === item.id) ||
                (!singleSelect &&
                  value.map(item => item.id).includes(item.id))
              }
              disabled={alwaysEnabled || item.import_date ? false : true}
              onChange={e => handleSelect(item)}
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
                cursor: alwaysEnabled || item.import_date ? 'pointer' : 'not-allowed',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                width: '65%',
                color: alwaysEnabled || item.import_date ? 'unset' : '#D3D3D3'
              }}
              disabled={alwaysEnabled || item.import_date ? false : true}
              onClick={e => handleSelect(item)}
              >
              {item.title}
            </button>
          </li>
        );
      }
    });

  // construct flat list of phenotypes (only show for search filter)
  const selectTreeAlphabetical = () => {
    const stringMatch = item => {
      // console.log("searchInput", searchInput);
      let re1 = new RegExp(/[()~`!#$%\^&*+=\[\]\\;,/{}|\\":<>\?]/, 'gi');
      if (!re1.test(searchInput)) {
        let re2 = new RegExp(searchInput, 'gi');
        return item.title.match(re2);
      }
    };
    const dataAlphabeticalFiltered = data.flat.filter(stringMatch);
    if (dataAlphabeticalFiltered && dataAlphabeticalFiltered.length > 0) {
      return dataAlphabeticalFiltered.map(item => (
        <div
          key={'alpha-' + item.id}
          className="my-1"
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
          <input
            title={"Select " + item.title + " phenotype"}
            style={{ cursor: alwaysEnabled || item.import_date ? 'pointer' : 'not-allowed' }}
            className={'ml-0 leaf-checkbox-' + item.id}
            // name={'leaf-checkbox-' + item.id}
            type="checkbox"
            aria-label="Checkbox"
            checked={
              (singleSelect && value && value.id === item.id) ||
              (!singleSelect &&
                value.map(item => item.id).includes(item.id))
            }
            disabled={alwaysEnabled || item.import_date ? false : true}
            onChange={e => handleSelect(item)}
          />

          <button
            title={item.title}
            className="ml-2"
            style={{
              all: 'unset',
              cursor: alwaysEnabled || item.import_date ? 'pointer' : 'not-allowed',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              width: '90%',
              color: alwaysEnabled || item.import_date ? 'unset' : '#D3D3D3'
            }}
            disabled={alwaysEnabled || item.import_date ? false : true}
            onClick={e => handleSelect(item)}>
            {/* {item.title.replace(searchInput, '[' + searchInput + ']')} */}
            {item.title.slice(
              0,
              item.title.toLowerCase().indexOf(searchInput.toLowerCase())
            )}
            <b>
              {item.title.slice(
                item.title.toLowerCase().indexOf(searchInput.toLowerCase()),
                item.title.toLowerCase().indexOf(searchInput.toLowerCase()) +
                  searchInput.length
              )}
            </b>
            {item.title.slice(
              item.title.toLowerCase().indexOf(searchInput.toLowerCase()) +
                searchInput.length,
              item.title.length
            )}
          </button>
        </div>
      ));
    } else {
      return <div className="p-2">No phenotypes found.</div>;
    }
  };

  // select all phenotypes when checkbox is toggled
  const selectAll = () => {
    if (!data) return;
    if (checkAllLeafsSelected()) {
      onChange([]);
    } else {
      const allLeafs = [];
      data.tree.map(item => allLeafs.push(getAllLeafs(item).filter(obj => alwaysEnabled ? obj : obj.import_date)));
      onChange(allLeafs.flat());
    }
  };

  // return true if all leafs are selected
  const checkAllLeafsSelected = () => {
    if (!data) return;
    let allLeafs = [];
    data.tree.map(item => allLeafs.push(getAllLeafs(item).filter(obj => alwaysEnabled ? obj : obj.import_date)));
    allLeafs = allLeafs.flat().map(item => item.id);
    for (var i = 0; i < allLeafs.length; i++) {
      if (value.map(item => item.id).indexOf(allLeafs[i]) === -1)
        return false;
    }
    return true;
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
          {listType === 'categorical' && (
            <>
              <button
                title={expandAll ? "Hide all phenotypes" : "Show all phenotypes"}
                style={{ all: 'unset' }}
                className="ml-1 collapse-button-all text-secondary"
                onClick={e => toggleExpandAllParents()}
                disabled={!data}>
                {expandAll && (
                  <i className="fa fa-minus-square" style={{cursor: !data ? 'not-allowed' : 'pointer'}}></i>
                )}
                {!expandAll && (
                  <i className="fa fa-plus-square" style={{cursor: !data ? 'not-allowed' : 'pointer'}}></i>
                )}
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
          )}

          <input
            title={singleSelect ? 'Only one phenotype can be selected' : 'Select/deselect all'}
            style={{ cursor: singleSelect || !data ? 'not-allowed' : 'pointer' }}
            className={listType === 'alphabetical' ? 'ml-1' : ''}
            // name=""
            type="checkbox"
            aria-label="Checkbox"
            disabled={singleSelect || !data ? true : false}
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
              title="Search Phenotype"
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
              disabled={!data}
            />
            <div className="input-group-append">
              {searchInput.length > 0 ? (
                <button
                  className="input-group-text bg-white"
                  title="Clear to go back to categorical view"
                  onClick={e => {
                    clearSearchFilter();
                  }}>
                  <i className="fa fa-times" style={{fontSize: '14px'}}></i>
                </button>
              ) : (
                <button 
                  className="input-group-text bg-white" 
                  title="Filter tree input icon"
                  disabled>
                  <i className="fa fa-search" style={{fontSize: '14px'}}></i>
                </button>
              )}
            </div>
          </div>
        </div>
        {
          !data &&
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ 
              // display: !data ? 'block' : 'none',
              minHeight: '250px',
              maxHeight: '500px'
            }}>
            {!data && 
              <Spinner animation="border" variant="primary" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            }
          </div>
        }
        { data &&
          <>
            <ul
              className="pl-0 ml-1 mr-0 my-0"
              style={{
                display: data && listType === 'categorical' ? 'block' : 'none',
                listStyleType: 'none',
                textOverflow: 'ellipsis',
                overflowY: 'auto',
                overflowX: 'hidden',
                whiteSpace: 'nowrap',
                minHeight: '250px',
                maxHeight: '500px',
                fontSize: '10pt'
              }}>
                {selectTreeCategorical(data.tree)}
            </ul>
            <ul
              className="pl-0 ml-1 mr-0 my-0"
              style={{
                display: data && listType === 'alphabetical' ? 'block' : 'none',
                listStyleType: 'none',
                textOverflow: 'ellipsis',
                overflowY: 'auto',
                overflowX: 'hidden',
                whiteSpace: 'nowrap',
                minHeight: '250px',
                maxHeight: '500px',
                fontSize: '10pt'
              }}>
                {selectTreeAlphabetical()}
            </ul>
          </>
        }
        
      </div>
    </>
  );
});