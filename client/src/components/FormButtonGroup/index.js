import React, { useState, useEffect, Fragment } from 'react';
import { Button, ButtonGroup } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/core/styles';
const useStyle = makeStyles({

});
const FormButtonGroup = (props) => {
    const { onCancel, children } = props;

    useEffect(()=>{

    },[])

    return(
        <Fragment>
            { children }
            <Button
                variant="contained"
                color="primary"
                size="middle"
                type="submit"
                startIcon={<SaveIcon />}
                style={{
                    marginRight: "15px"
                }}
            >
                Save
            </Button>
            { 
                onCancel !== undefined && <Button
                    variant="contained"
                    color="default"
                    size="middle"
                    startIcon={<ArrowBackIcon />}
                    onClick={ onCancel }
                >
                    Back
                </Button>
            }
        </Fragment>
    );
}

export default FormButtonGroup;