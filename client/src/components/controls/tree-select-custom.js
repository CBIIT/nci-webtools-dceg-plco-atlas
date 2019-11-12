import React, { useState } from 'react';
// import { Button } from 'react-bootstrap';


export function TreeSelectCustom(props) {

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
    }

    const handleSelectParent = item => {
        console.log("PARENT SELECTED:", item);
    }

    const handleSelectLeaf = item => {
        console.log("LEAF SELECTED:", item);
    }

    const selectTree = data => data.map((item) => {
        if (item.children && item.children.length > 0) {
            return(
                <>
                    <li>
                    <span className="text-info"><i>(<u>parent</u>)</i></span> 
                        <button 
                            style={{all: 'unset', cursor: 'pointer'}}
                            onClick={e => handleSelectParent(item)}>
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
                    <span className="text-danger"><i>(<u>leaf</u>)</i></span> 
                    <button 
                        style={{all: 'unset', cursor: 'pointer'}}
                        onClick={e => handleSelectLeaf(item)}>
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
                <ul className="pl-0" style={{listStyleType: 'none'}}>
                    {
                        selectTree(props.data)
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