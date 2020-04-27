import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import PrivateRoute from '../_PrivateRoute';
import PublicRoute from '../_PublicRoute';

// Pages
import Accounts from '../../pages/Accounts';
import EditAccount from '../../pages/Accounts/Edit';
import Home from '../../pages/Home';
import Login from '../../pages/Login';
import Members from '../../pages/Members';
import EditMember from '../../pages/Members/Edit';

import Claims from '../../pages/Claims';
import EditClaims from '../../pages/Claims/Edit';

import Registrations from '../../pages/Registrations';
import EditRegistration from '../../pages/Registrations/Edit';

import Transactions from '../../pages/Transactions';
import EditTransition from '../../pages/Transactions/Edit';

import UserGroups from '../../pages/UserGroups';
import EditUserGroup from '../../pages/UserGroups/Edit';

import Users from '../../pages/Users';
import EditUser from '../../pages/Users/Edit';
import Profile from '../../pages/Users/Profile';

import Configs from '../../pages/Configs';
import EditConfigs from '../../pages/Configs/Edit';

const Routes = props => {
    return (<BrowserRouter>
        <Route>
            <Switch>
                <PublicRoute exact path="/login" component={Login} />

                <PrivateRoute exact path="/" component={Home} />
                <PrivateRoute exact path="/accounts" component={Accounts} />
                <PrivateRoute exact path="/accounts/create" component={EditAccount} />
                <PrivateRoute exact path="/accounts/edit/:id" component={EditAccount} />

                <PrivateRoute exact path="/members" component={Members} />
                <PrivateRoute exact path="/members/create" component={EditMember} />
                <PrivateRoute exact path="/members/edit/:id" component={EditMember} />

                <PrivateRoute exact path="/profile" component={Profile} />

                <PrivateRoute exact path="/registrations" component={Registrations} />
                <PrivateRoute exact path="/registrations/create" component={EditRegistration} />
                <PrivateRoute exact path="/registrations/edit/:id" component={EditRegistration} />

                <PrivateRoute exact path="/claims" component={Claims} />
                <PrivateRoute exact path="/claims/create" component={EditClaims} />
                <PrivateRoute exact path="/claims/edit/:id" component={EditClaims} />

                <PrivateRoute exact path="/transactions" component={Transactions} />
                <PrivateRoute exact path="/transactions/create" component={EditTransition} />
                <PrivateRoute exact path="/transactions/edit/:id" component={EditTransition} />

                <PrivateRoute exact path="/usergroups" component={UserGroups} />
                <PrivateRoute exact path="/usergroups/create" component={EditUserGroup} />
                <PrivateRoute exact path="/usergroups/edit/:id" component={EditUserGroup} />

                <PrivateRoute exact path="/users" component={Users} />
                <PrivateRoute exact path="/users/create" component={EditUser} />
                <PrivateRoute exact path="/users/edit/:id" component={EditUser} />
                <PrivateRoute exact path="/profile" component={Profile} />

                <PrivateRoute exact path="/configs" component={Configs} />
                <PrivateRoute exact path="/configs/edit/:id" component={EditConfigs} />

            </Switch>
        </Route>   
    </BrowserRouter>);
}

export default Routes;