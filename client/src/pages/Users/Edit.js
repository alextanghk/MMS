import React, { Component, useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, CardActions, Button } from '@material-ui/core';
import { TextField, FormControlLabel, FormControl, FormLabel, Checkbox, FormHelperText } from '@material-ui/core';

import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormButtonGroup from '../../components/FormButtonGroup';
import Loader from '../../components/Loader';
import UserGroupSelector from '../../components/UserGroupSelector';
import FormItemContainer  from '../../components/FormItemContainer';
import { toast } from 'react-toastify';
class EditUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                zh_name:"",
                en_name:"",
                user_name: "",
                email:"",
                mobile:"",
                password: "",
                password_confirmation:"",
                user_group_id: null,
                is_actived:true
            },
            errors:{},
            loading: false,
            status: "",
            message: ""
        };
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnChecked = this.handleOnChecked.bind(this);
        this.handleOnDateChange = this.handleOnDateChange.bind(this);
        this.handleOnDateChange = this.handleOnDateChange.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    componentDidMount(){
        const { match: { params } } = this.props;
        const { id } = params;
        if (id !== undefined) {
            this.setState({
                loading: true
            })
            global.Fetch(`users/${id}`)
                .then((result)=>{
                    this.setState(prevState => ({
                        ...prevState,
                        content: {
                            ...prevState.content,
                            ..._.reduce(result.data,(r,v,k)=>{
                                switch(k) {
                                    default: r[k]=v;break;
                                }
                                return r;
                            },{})
                        },
                        loading:false
                    }))
                }).catch((err)=>{
                    this.setState({
                        loading: true
                    })
                })
        }
    }

    onChange = (name,value) => {
        const { onChange } = this.props;
        let content = {
            ...this.state.content,
            [name]:value
        }
        this.setState(prevState => ({
            ...prevState,
            content: {
                ...content
            }
        }))

        if (typeof onChange === "function") {
            onChange(content);
        }
    }
    
    handleOnChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        
        this.onChange(name,value);
    }

    handleOnChecked = (name) => (e) => {
        let value = e.target.checked ;
        this.onChange(name,value);
    }

    handleOnDateChange = (name) => (value) => {
        this.onChange(name,value);
    }

    handleOnUpload = (name,value) => {
        this.onChange(name,value);
    }
    validations = (values) => {
        const { t, i18n } = this.props;
        const { match: { params } } = this.props;
        const { id } = params;

        this.setState({
            errors: {}
        })
        let errors = {};
        if (!values.zh_name) errors.zh_name = t("field_error_required");
        if (!values.en_name) errors.en_name = t("field_error_required");
        if (!values.user_group_id) errors.user_group_id = t("field_error_required");
        if (!values.email) errors.email = t("field_error_required");
        if (!values.user_name) errors.user_name = t("field_error_required");
       
        if (!values.password) {
            if (id === undefined) {
                errors.password = t("field_error_required");
            }
        } else {
            if (!values.password_confirmation) {
                errors.password_confirmation = t("field_error_required");
            } else if (values.password != values.password_confirmation) {
                errors.password_confirmation = t("field_password_confirmation_not_match");
            }
        }

        this.setState(prevState => ({
            ...prevState,
            ["errors"]: errors
        }))
        return errors;
    }

    OnSave = () => {
        const { match: { params } } = this.props;
        const { id } = params;
        const {content} = this.state;
        const errors = this.validations(content);
        if (!_.isEmpty(errors)) {
            return Promise.reject({ message: "form_invalid" });
        } else {
            const data = new FormData();
            _.reduce(content, (r,v,k)=>{
                if (v != null) {
                    switch(k) {
                        case "user_group":
                            break;
                        default:
                            data.append(k,v);
                            break;
                    }
                }
            },{});
            return global.Fetch(`users${id !== undefined ? '/update/'+id:"/create"}`,{
                method: id === undefined ? 'POST': 'PUT',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json'
                }),
                body: data
            })
        }
    }
    handleOnSubmit = (e) => {
        e.preventDefault();
        this.setState({
            loading: true
        })
        const { t, i18n } = this.props;
        const _this = this;

        this.OnSave().then((result)=>{
            const { data: { id } } = result;
            toast.success(t("success_save"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => {
                    window.location.href = `/users/edit/${id}`;
                }
            });
        }).catch((err)=>{
            const { message = "", error = null } = err;
            if (error != null) {
                this.setState({
                    errors: _.reduce(error,(r,v,k) =>{
                        r[k] = t(_.get(v,"0",""));
                        return r;
                    },{})
                })
            }
            toast.error(message ? t(message) : t("system_error"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => {
                    _this.setState({
                        loading: false
                    })
                }
            });
        })
    }

    render() {
        const { content, errors } = this.state;
        const { t, i18n } = this.props;
        const { match: { params } } = this.props;
        const { id } = params;

        let allowSave = true;
        if (id === undefined) {
            allowSave = global.Accessible("POST_USER");
        } else {
            allowSave = global.Accessible("PUT_USER");
        }

        return (<Fragment>
            <Helmet>
                <title>{ `${t("lb_users")} - ${process.env.REACT_APP_TITLE}` }</title>
            </Helmet>
            <Grid>
                <Breadcrumbs
                    items={[
                        { label:t("lb_home"), href:"/" },
                        { label:t("lb_users"), href:"/users" },
                        { label: id === undefined ? t("lb_new_users") : t("lb_edit_users") }
                    ]}
                />
                <form onSubmit={this.handleOnSubmit}>
                    <Card>
                        <CardContent>
                            <Grid container style={{
                                marginTop: "20px"
                            }}>
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        required
                                        label={ `${t('input_zh_name')}:` }
                                    >
                                        <TextField
                                            name="zh_name"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.zh_name}
                                            value={ _.get(content,"zh_name","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "zh_name","")}
                                            required
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        required
                                        label={ `${t('input_en_name')}:` }
                                    >
                                        <TextField
                                            name="en_name"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.en_name}
                                            value={ _.get(content,"en_name","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "en_name","")}
                                            required
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        required
                                        label={ `${t('input_email')}:` }
                                    >
                                        <TextField
                                            name="email"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.email}
                                            value={ _.get(content,"email","")}
                                            onChange={this.handleOnChange}
                                            type="email"
                                            helperText={_.get(errors, "email","")}
                                            required
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        label={ `${t('input_mobile')}:` }
                                    >
                                        <TextField
                                            name="mobile"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.mobile}
                                            value={ _.get(content,"mobile","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "mobile","")}
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        required
                                        label={ `${t('input_user_name')}:` }
                                    >
                                        <TextField
                                            name="user_name"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.user_name}
                                            value={ _.get(content,"user_name","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "user_name","")}
                                            required
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        required
                                        label={ `${t('input_user_group')}:` }
                                    >
                                        <UserGroupSelector
                                            name="user_group_id"
                                            value={ content.user_group_id }
                                            required
                                            error={errors.user_group_id}
                                            onChange={this.handleOnChange}
                                            className="form-input"
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        label={ `${t('input_password')}:` }
                                    >
                                        <TextField
                                            name="password"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.password}
                                            value={ _.get(content,"password","")}
                                            onChange={this.handleOnChange}
                                            type="password"
                                            helperText={_.get(errors, "password","")}
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        required={content.password}
                                        label={ `${t('input_password_confirmation')}:` }
                                    >
                                        <TextField
                                            name="password_confirmation"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.password_confirmation}
                                            required={content.password}
                                            value={ _.get(content,"password_confirmation","")}
                                            onChange={this.handleOnChange}
                                            type="password"
                                            helperText={_.get(errors, "password_confirmation","")}
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                
                                <Grid item md={5} spacing={1}>
                                    <FormItemContainer
                                        label={ `${t('input_is_actived')}:` }
                                    >
                                        <FormControl className="form-item" component="fieldset">
                                            <FormControlLabel
                                                control={
                                                    <Checkbox 
                                                        checked={content.is_actived} 
                                                        error={errors.is_actived}
                                                        onChange={this.handleOnChecked("is_actived")} 
                                                    />
                                                }
                                            />
                                        </FormControl>
                                        <FormHelperText className="error">{_.get(errors, "is_actived","")}</FormHelperText>
                                    </FormItemContainer>
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardActions>
                            <Grid container>
                                <Grid item sm={12} xs={12} style={{textAlign:"right"}}>
                                    <FormButtonGroup
                                        allowSave={allowSave}
                                        onCancel={(e) => {
                                            e.preventDefault()
                                            window.location.href="/users"
                                        }}
                                    >
                                        
                                    </FormButtonGroup>
                                </Grid>
                            </Grid>
                            
                        </CardActions>
                    </Card>
                </form>
            </Grid>
            {
                this.state.loading && <Loader />
            }
        </Fragment>);
    }
}
export default withTranslation('translation')(EditUser);