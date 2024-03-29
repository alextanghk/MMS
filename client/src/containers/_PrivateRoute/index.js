import React, { useState, Component, Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Redirect  } from 'react-router-dom';
import {
    List, ListItem, ListItemText, Collapse, Grid, IconButton, Avatar 
} from '@material-ui/core';
import Cookies from 'universal-cookie';
import Loader from '../../components/Loader';
import {NavLink, Link} from 'react-router-dom';
import { 
    ViewComfy, ExpandMore, ExpandLess, BorderColor, AccountBalance, SwapHoriz, GroupWork,
    PeopleAlt, LocalAtm, Settings, MeetingRoom, Receipt, AccountCircle
} from '@material-ui/icons';
import HomeIcon from '@material-ui/icons/Home';
import _ from 'lodash';
import moment from 'moment';
const cookies = new Cookies();

const SubSidbarNav = (props) => {
    const [open, setOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const { name, child, id, icon } = props;
    
    
    const onClick = (e) => {
        setOpen(!open);
    }
    useEffect(()=>{
        const { pathname } = window.location;
        if (child.find(x => (x.link == pathname )))
            setOpen(true);
    },[])
    return (<Fragment>
        <ListItem className="menu-item link" key={id} button onClick={onClick}>
            <NavLink className="nav-item" key={id} exact to="#">
                <span className="nav-icon">{ icon }</span>
                <span className="nav-label">{ name }</span>
            </NavLink>
            <div className="expand-icon">
                {open ? <ExpandLess /> : <ExpandMore />}
            </div>
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
                {
                    child.map((nav)=>{
                        return(
                            <ListItem className="menu-item link" key={nav.id} button>
                                <NavLink className="nav-item" exact to={nav.link}>
                                    <span className="nav-icon">{ nav.icon }</span>
                                    <span className="nav-label">{ nav.name }</span>
                                </NavLink>
                            </ListItem>
                        );
                    })
                }
            </List>
        </Collapse>
    </Fragment>)
}
const PrivateRoute = ({ component: Component, ...rest }) => {
    
    const [collapse, setCollapse] = useState(true);
    const [loggedOut, setLoggedOut] = useState(false);
    const [loading, setLoading] = useState(false);

    const user = cookies.get('mms_user');
    const { t, i18n } = useTranslation();

    const navigations = [
        { id: 1001, name: `${t("lb_home")}`, link: "/", icon: (<HomeIcon />) },
        { id: 1002, name: `${t("lb_registrations")}`, link: "/registrations", icon: (<BorderColor />) },
        { id: 1003, name: `${t("lb_members")}`, link: "/members", icon: (<PeopleAlt />) },
        { id: 1004, name: `${t("lb_finance")}`, child: [
            { id: 10041, name: `${t("lb_accounts")}`, link: "/accounts", icon:(<AccountBalance />) },
            { id: 10042, name: `${t("lb_transactions")}`, link: "/transactions", icon:(<SwapHoriz />) },
            { id: 10043, name: `${t("lb_claims")}`, link: "/claims", icon:(<Receipt />) }
        ], icon: (<LocalAtm />)}, 
        { id: 1005, name: `${t("lb_system")}`,child:[
            { id: 10051, name: `${t("lb_usergroups")}`, link: "/usergroups", icon:(<GroupWork />) },
            { id: 10052, name: `${t("lb_users")}`, link: "/users", icon:(<AccountCircle />) }
        ], icon: (<Settings />)}
    ];

    useEffect(()=>{
        global.Fetch("auth").then((result)=>{
            
        }).catch((err)=>{
            cookies.remove("mms_user");
            setTimeout(()=>{setLoggedOut(true);},300)
        })
    },[])

    const handleLogout = (e) =>{
        e.preventDefault();
        setLoading(true);
        global.Fetch("auth/logout",{
            method: "POST"
        }).then((result)=>{
            cookies.remove("mms_user");
            setTimeout(()=>{setLoggedOut(true);},300)
        }).catch((err)=>{
            cookies.remove("mms_user");
            setTimeout(()=>{setLoggedOut(true);},300)
            setLoading(false);
        })
    }
    
    return (loggedOut ? 
        <Fragment>
            <Redirect to={{pathname: "/login"}}/>
            { loading && <Loader />}
        </Fragment> : <Fragment>
        <Grid className="main-container">
            <List 
                className={`main-menu ${collapse ? 'collapsed':''}`}
                component="nav"
            >
                <ListItem className="menu-item logo">
                    <IconButton
                        className={ `menu-collapse` }
                        onClick={(e)=>{
                            setCollapse(!collapse);
                        }}
                    >
                        <ViewComfy />
                    </IconButton>
                </ListItem>
                <ListItem className="menu-item profile">
                    <NavLink className="nav-item" exact to={`/profile`}>
                        <Avatar className={`profile-pic`} alt={ `${ _.get(user,"en_name","")}` } />
                    </NavLink>
                    <NavLink className="nav-item nav-label" exact to={`/profile`}>
                        <span>{ `${ _.get(user,"en_name","")}` }</span>
                    </NavLink>
                </ListItem>
            {
                navigations.map((nav)=>{
                    if (nav.child !== undefined) {
                        return(<SubSidbarNav
                            name={nav.name}
                            id={nav.id}
                            key={nav.id}
                            icon={nav.icon}
                            child={nav.child}
                            collapse
                        />)
                    } else {
                        return(
                            <ListItem className="menu-item link" key={nav.id} button>
                                <NavLink className="nav-item" exact to={nav.link}>
                                    <span className="nav-icon">{ nav.icon }</span>
                                    <span className="nav-label">{ nav.name }</span>
                                </NavLink>
                            </ListItem>
                        );
                    }
                    
                })
            }
                <ListItem className="menu-item link" key="2000" button>
                    <NavLink className="nav-item" exact to="#" onClick={ handleLogout }>
                        <span className="nav-icon"><MeetingRoom /></span>
                        <span className="nav-label">{ t('lb_logout') }</span>
                    </NavLink>
                </ListItem>
            </List>
            <Grid className="main-content">
                <Route
                    {...rest}
                    render={ props => 
                        (user && !loggedOut) ? (<Component {...props} />) : (<Redirect to={{pathname: "/login"}}/>)
                    }
                />
            </Grid>
            <footer className="main-footer">
                <p className={`copy-right`}>© {moment().format("Y")} Hervest InTeach All rights reserved</p>
            </footer>
        </Grid>
        { loading && <Loader />}
    </Fragment>);
}

export default PrivateRoute;