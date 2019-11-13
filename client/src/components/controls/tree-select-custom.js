import React, { useState } from 'react';
// import { Button } from 'react-bootstrap';


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
            document.getElementsByClassName("collapse-button-text-" + name)[0].textContent = "hide";
        } else {
            document.getElementsByClassName(className)[0].style.display = "none";
            document.getElementsByClassName("collapse-button-text-" + name)[0].textContent = "show";
        }
    };

    const checkParents = () => {
       console.log(data);
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
                console.log(document.getElementsByClassName(parentCheckboxClassName));
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
                        console.log(document.getElementsByClassName(parentCheckboxClassName));
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
                <>
                    <li className="my-1">
                        <input
                            className={"parent-checkbox-" + item.value}
                            name={"parent-checkbox-" + item.value}
                            type="checkbox"
                            // checked={true}
                            onChange={e => handleSelect(item)} 
                        />

                        <span className="text-info ml-1"><i>(<u>parent</u>)</i></span> 

                        <button 
                            className="ml-1"
                            style={{all: 'unset', cursor: 'pointer'}}
                            onClick={e => handleSelect(item)}>
                            {item.title} 
                        </button>

                        <button 
                            style={{all: 'unset'}}
                            className="collapse-button text-secondary ml-1" 
                            onClick={e => toggleHideChildren(item.value)}>
                            <i>(<span className={"collapse-button-text-" + item.value}>show</span>)</i>
                        </button>

                        <ul className={"pl-3 children-of-" + item.value} style={{listStyleType: 'none', display: 'none'}}>
                            {selectTree(item.children)}
                        </ul>
                    </li>
                </>
            );
        } else {
            return(
                <li>
                    <input
                        className={"leaf-checkbox-" + item.value}
                        name={"leaf-checkbox-" + item.value}
                        type="checkbox"
                        // checked={e => isChecked(e)}
                        onChange={e => handleSelect(item)} 
                    />

                    <span className="text-danger ml-1"><i>(<u>leaf</u>)</i></span> 

                    <button 
                        className="ml-1"
                        style={{all: 'unset', cursor: 'pointer'}}
                        onClick={e => handleSelect(item)}>
                        {item.title} 
                    </button>
                </li>
            );
        }
        
    });

    // const selectedTree = data => data.map((item) => {
    //     console.log(item);
    //     if (item) {
    //         return(
    //             <>
    //                 <li>
    //                     0 {item.title}
    //                 </li>
    //             </>
    //         );
    //     } 
    // });

    return(
        <>
            <div 
                className="border border-dark" 
                style={{
                    overflow: 'auto', 
                    whiteSpace: 'nowrap',
                    // maxHeight: '250px'
                }}>
                <ul className="pl-0 mx-2 my-0" style={{listStyleType: 'none'}}>
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