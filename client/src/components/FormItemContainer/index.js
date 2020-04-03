import React, { Component, useState, useEffect, Fragment } from 'react';
import { Grid, FormLabel } from '@material-ui/core';


const FormItemContainer = (props) => {
    const { children, label="", required = false, large=false, fullWidth=false } = props;

    return(<Grid container className={`form-item-container`}>
        {
            !fullWidth && <Grid item xs={large ? 3: 6}>
                <FormLabel className={`form-label ${required ? 'required' : ""}`}>{ label }</FormLabel>
            </Grid>
        }
        <Grid item xs={large ? 9 : 6}>
            { children }
        </Grid>
    </Grid>);
}

export default FormItemContainer;