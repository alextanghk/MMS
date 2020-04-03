import React, { useState, useEffect, Fragment } from 'react';
import { Breadcrumbs as MIBreadcrumbs } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { makeStyles } from '@material-ui/core/styles';

const useStyle = makeStyles({
    crumbsBody: {
        padding: "20px 0"
    }
})

const Breadcrumbs = (props) => {
    const { items } = props;
    const classes = useStyle();
    return(
        <MIBreadcrumbs 
            className={ `${classes.crumbsBody} breadcrumbs` }
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb">
            {
                items.map((item,index)=>{
                    return(<Link color="inherit" key={index} href={item.href === undefined ? "#" : item.href}>
                    {item.label}
                  </Link>);
                })
            }
        </MIBreadcrumbs>
    );
}

export default Breadcrumbs;