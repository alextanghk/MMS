import React, { useState, Fragment, useEffect } from 'react';
import Helmet from 'react-helmet';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, TextField, Button, InputAdornment, FormControlLabel, Icon } from '@material-ui/core'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import moment from 'moment';
import Cookies from 'universal-cookie';
import Loader from '../../components/Loader';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';

const cookies = new Cookies();
const useStyle = makeStyles({
    title: {
        textAlign: "center"
    },
    formInput: {
        marginBottom: "49px"
    },
    loginBtn: {
        width: "100%"
    },
    loginArea: {
        backgroundImage: "url('/assets/img/bg.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight:"100vh",
        width: "100%",
        overflow:"hidden",
        display:"flex",
        alignItems:"center"
    },
    loginWrapper: {
        background: "#FFF",
        width: "400px",
        margin: "auto",
        display: "block",
        padding: "50px",
        borderRadius: "5px",
        minHeight: "300px"
    }
})
const Login = props => {

    const [loading, setLoading] = useState(false);
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [errMsg, setErrMsg] = useState("");
    const [errUserName, setErrUserName] = useState("");
    const [errPass, setErrPass] = useState("");

    const [showpass, setShowPass] = useState(false);

    const [logged,setLogged] = useState(false);

    const { t, i18n } = useTranslation();

    const classes = useStyle();

    const onSubmit = (e) => {
        e.preventDefault();
        setErrMsg("");
        setErrUserName("");
        setErrPass("");
        cookies.remove("mms_login",{path:"/",domain:window.location.hostname});
        if (username == "") setErrUserName(t("msg_username_empty")); 
        if (password == "") setErrPass(t("msg_password_empty")); 
        
        if (username != "" && password != "") {
            setLoading(true);
            global.Fetch('auth/login',{
                method: 'POST',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body:  JSON.stringify({
                    username: username,
                    password: password
                })
            }).then((result)=>{
                let exp_date = _.get(result,'data.exp_date','');
                cookies.set("mms_login", result.data,{path:"/",domain:window.location.hostname})
                setLogged(true);
            }).catch((err)=>{
                setLoading(false);
                setErrMsg(t(_.get(err,'message',_.get(err,'error','system_error'))));
            })
        }
    }

    return (logged ? <Redirect to={{pathname: "/"}}/> : <Fragment>
        <Helmet>
            <title>{ `${t("lb_login")} - ${process.env.REACT_APP_TITLE}` }</title>
        </Helmet>
        <Grid className={classes.loginArea}>
            <form className={classes.loginWrapper} onSubmit={onSubmit}>
                <Grid item xs={12} className="loginForm">
                        <div className={classes.title}>
                            <h2>{ t("lb_login") }</h2>
                        </div>
                        <TextField
                            label={ t('lb_username') }
                            placeholder=""
                            fullWidth
                            variant="outlined"
                            name="username"
                            onChange={(e)=>{ setUsername(e.target.value) }}
                            value={username}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            helperText={ errUserName }
                            error={ errMsg.length > 0 || errUserName.length > 0 }
                            className={classes.formInput}
                        />
                        <TextField
                            label={ t('lb_password') }
                            placeholder=""
                            type={ showpass ? 'text' : 'password'}
                            fullWidth
                            variant="outlined"
                            name="password"
                            onChange={(e)=>{ setPassword(e.target.value) }}
                            value={password}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={ errMsg.length > 0 || errPass.length > 0 }
                            helperText={ errPass ? errPass : errMsg }
                            className={classes.formInput}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment
                                    onClick={(e) => { setShowPass(!showpass); }}
                                    className="showPassword"
                                    position="end">
                                        {
                                            showpass ? <VisibilityIcon/> : <VisibilityOffIcon/>
                                        }
                                  </InputAdornment>
                                ),
                              }}
                        />
                        
                        <Button 
                            type="submit" variant="contained" color="primary" 
                            className={classes.loginBtn}
                        >login</Button>
                </Grid>
            </form>
        </Grid>
        { loading && <Loader />}
    </Fragment>);
}

export default Login;