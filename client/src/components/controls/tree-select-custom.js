import React, { useState } from 'react';
import ReactDOM from 'react-dom';
// import { FormControl } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusSquare, faMinusSquare, faSearch } from '@fortawesome/free-solid-svg-icons'


export function TreeSelectCustom({onChange, data, value}) {

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
        if(!node.children || node.children.length === 0) {
            // ignore disabled attribute for now
            // if (!node.disabled) {
                allLeafs.push(node);
            // }
        } else {
            if (document.getElementsByClassName("parent-checkbox-" + node.value)[0]) {
                document.getElementsByClassName("parent-checkbox-" + node.value)[0].checked = true;
            }
            for (var i = 0; i < node.children.length; i++) {
                allLeafs = getLeafs(item, node.children[i], allLeafs);
            }
        }
        return allLeafs;
    };
    
    const getAllLeafs = (item) => {
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
        const className = "children-of-" + name;
        if (document.getElementsByClassName(className)[0].style.display &&
            document.getElementsByClassName(className)[0].style.display === "none") {
            document.getElementsByClassName(className)[0].style.display = "block";
            const collapseButton = document.getElementsByClassName("collapse-button-text-" + name)[0];
            ReactDOM.render(
                <FontAwesomeIcon icon={faMinusSquare} size="md"/>,
                collapseButton);
            // textContent = <FontAwesomeIcon icon={faMinusSquare} size="lg"/>;
        } else {
            document.getElementsByClassName(className)[0].style.display = "none";
            const collapseButton = document.getElementsByClassName("collapse-button-text-" + name)[0];
            // .textContent = <FontAwesomeIcon icon={faPlusSquare} size="lg"/>;
            ReactDOM.render(
                <FontAwesomeIcon icon={faPlusSquare} size="md"/>,
                collapseButton);
        }
    };

    const checkParents = () => {
    //    console.log(data);
       // 1 uncheck all sub parents and children when touched parent is unchecked
       // 2 check parent when all sibling leafs are also checked
       // 3 uncheck parent when if any of children are unchecked
    };

    const handleSelect = item => {
        const parentCheckboxClassName = "parent-checkbox-" + item.value;
        // const leafCheckboxClassName = "leaf-checkbox-" + item.value;
        let values = [...value];
        let newValues = getAllLeafs(item);
        if (containsAllVals(values, newValues)) {
            // remove all leafs if parent is clicked and all leafs were already selected
            values = removeAllVals(values, newValues);
            if (document.getElementsByClassName(parentCheckboxClassName)[0]) {
                // console.log(document.getElementsByClassName(parentCheckboxClassName));
                document.getElementsByClassName(parentCheckboxClassName)[0].checked = false;
            }
            for (var i = 0; i < newValues.length; i++) {
                if (document.getElementsByClassName("leaf-checkbox-" + newValues[i].value)[0]) {
                    document.getElementsByClassName("leaf-checkbox-" + newValues[i].value)[0].checked = false;
                }
            }
        } else {
            for (var i = 0; i < newValues.length; i++) {
                if (!containsVal(values, newValues[i].value)) {
                    // only add if value did not exist before
                    values.push(newValues[i]);
                    if (document.getElementsByClassName(parentCheckboxClassName)[0]) {
                        // console.log(document.getElementsByClassName(parentCheckboxClassName));
                        document.getElementsByClassName(parentCheckboxClassName)[0].checked = true;
                    }
                    if (document.getElementsByClassName("leaf-checkbox-" + newValues[i].value)[0]) {
                        document.getElementsByClassName("leaf-checkbox-" + newValues[i].value)[0].checked = true;
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
    };

    // const isChecked = (e) => {
    //     console.log("isChecked", e);
    // };

    const selectTree = data => data.map((item) => {
        if (item.children && item.children.length > 0) {
            return(
                // PARENT
                <>
                    <li className="my-1" style={{display: 'block'}}>
                        <div className="d-flex align-items-center">
                            <button 
                                style={{all: 'unset'}}
                                className="collapse-button text-secondary" 
                                onClick={e => toggleHideChildren(item.value)}>
                                <span className={"collapse-button-text-" + item.value}>
                                    <FontAwesomeIcon icon={faPlusSquare} size="md"/>
                                </span>
                            </button>
                            
                            <input
                                style={{verticalAlign: 'middle', alignSelf: 'center'}}
                                className={"ml-2 parent-checkbox-" + item.value}
                                name={"parent-checkbox-" + item.value}
                                type="checkbox"
                                // checked={true}
                                onChange={e => handleSelect(item)} 
                            />

                            {/* <span className="text-info ml-1"><i>(<u>parent</u>)</i></span>  */}

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

                        

                        <ul className={"pl-4 children-of-" + item.value} style={{listStyleType: 'none', display: 'none'}}>
                            {selectTree(item.children)}
                        </ul>
                    </li>
                </>
            );
        } else {
            return(
                // LEAF
                <li style={{textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                overflow: 'hidden'}}>
                    <input
                        className={"ml-4 leaf-checkbox-" + item.value}
                        name={"leaf-checkbox-" + item.value}
                        type="checkbox"
                        // checked={e => isChecked(e)}
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

    return(
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
                    
                    <button 
                        style={{all: 'unset'}}
                        className="ml-1 collapse-button text-secondary" 
                        // onClick={e => toggleHideChildren(item.value)}
                        >
                        <FontAwesomeIcon icon={faPlusSquare} size="md"/>
                    </button>

                    <div 
                        className="mx-1"
                        style={{
                            display: 'inline-block', 
                            borderLeft: '1px solid #c7cbcf', 
                            height: '25px',
                        }}
                    />

                    <input
                        className=""
                        name=""
                        type="checkbox"
                        // checked={e => isChecked(e)}
                        // onChange={e => handleSelect(item)} 
                    />

                    <div 
                        className="ml-1"
                        style={{
                            display: 'inline-block', 
                            borderLeft: '1px solid #c7cbcf', 
                            height: '25px',
                        }}
                    />

                    <div className="px-2 input-group" style={{ width: '100%' }}>
                        <input
                            className="form-control py-1 h-100"
                            style={{ display: 'block' }}
                            placeholder="Search Phenotype"
                            aria-label="Search Phenotype"
                            // value={selectedVariant}
                            onChange={e => {
                                console.log(e.target.value);
                            }}
                            type="text"
                        />
                        <div class="input-group-append">
                            <button 
                                class="input-group-text">
                                <FontAwesomeIcon icon={faSearch} size="sm"/>
                            </button>
                        </div>
                    </div>


                </div>

                <ul className="pl-0 ml-1 mr-0 my-0" 
                    style={{
                        listStyleType: 'none',
                        textOverflow: 'ellipsis', 
                        overflowY: 'auto', 
                        overflowX: 'hidden',
                        whiteSpace: 'nowrap',
                        maxHeight: '450px',
                        fontSize: '10pt'}}>
                    {
                        selectTree(data)
                    }  
                </ul>
            </div>
            {/* <br></br>
            <div className="border border-dark">
                SHOW LIST OF SELECTED PHENOTYPES HERE
                <ul className="pl-0" style={{listStyleType: 'none'}}>
                    {
                        selectedTree(props.value)
                    }  
                </ul>
            </div> */}
        </>
    );
  }