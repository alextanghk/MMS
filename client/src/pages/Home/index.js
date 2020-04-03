import React, { useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';

const Home = props => {

    const { t, i18n } = useTranslation();
    
    useEffect(()=>{

    },[])

    return (<Fragment>
        <Helmet>
            <title>{ `${t("lb_home")} - ${process.env.REACT_APP_TITLE}` }</title>
        </Helmet>
        <Grid>
            
        </Grid>
    </Fragment>);
}

export default Home;