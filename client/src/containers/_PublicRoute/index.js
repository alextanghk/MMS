import React, { Component } from 'react';
import { Route, Redirect  } from 'react-router-dom';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const PublicRoute = props => {
    return (<Route
        {...props}
    />);
}

export default PublicRoute;