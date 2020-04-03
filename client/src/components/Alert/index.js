import React, { Component, useState, useEffect, Fragment } from 'react';
import { Alert as MUAlert, AlertTitle } from '@material-ui/lab';
import { Snackbar } from '@material-ui/core';

const Alert = (props)=>{
    
    const [severity, setSeverity] = useState('');
    const { message, title, children, onClose, status, timeOut } = props;
    let timeAction = null;
    useEffect(()=>{
        setSeverity(status);
    },[status])

    useEffect(()=>{

    },[severity])

    const handleClose = (event, reason) => {
        if (severity != "") {
            setSeverity("");
            typeof onClose === "function" && onClose();
        }
    };

    return(<Fragment>
        <Snackbar
            open={severity != ""}
            onClose={handleClose}
            autoHideDuration={timeOut}
        >
            { 
                severity != "" && <MUAlert
                    severity={severity}
                    onClose={typeof onClose === "function" ? handleClose : undefined}
                >
                    { title && <AlertTitle>{ title }</AlertTitle>}
                    { message }
                    { children }
                </MUAlert>
            }
        </Snackbar>
    </Fragment>)
}

export default Alert;