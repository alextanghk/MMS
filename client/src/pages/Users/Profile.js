import React, { Component, useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, CardActions, Button } from '@material-ui/core';
import { TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Select, MenuItem } from '@material-ui/core';

import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormButtonGroup from '../../components/FormButtonGroup';
import Loader from '../../components/Loader';
import FileUpload from '../../components/FileUpload';
import UserGroupSelector from '../../components/UserGroupSelector';
import { toast } from 'react-toastify';
import FormItemContainer  from '../../components/FormItemContainer';

class Profile extends Component {
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
        this.setState({
            loading: true
        })
        global.Fetch(`users/profile`)
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
        this.setState({
            errors: {}
        })
        let errors = {};
        if (!values.zh_name) errors.zh_name = t("field_error_required");
        if (!values.en_name) errors.en_name = t("field_error_required");
        if (!values.email) errors.email = t("field_error_required");

        if (values.password) {
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
        const {content} = this.state;
        const errors = this.validations(content);
        
        if (!_.isEmpty(errors)) {
            return Promise.reject({ message: "form_invalid" });
        } else {
            const data = new FormData();
            _.reduce(content, (r,v,k)=>{
                if (v != null) {
                    switch(k) {
                        default:
                            data.append(k,v);
                            break;
                    }
                }
            },{});
            return global.Fetch(`users/profile`,{
                method: 'PUT',
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
                    window.location.href = `/profile`;
                }
            });
        }).catch((err)=>{
            const message = _.get(err,'message',err);

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

        return (<Fragment>
            <Helmet>
                <title>{ `${t("lb_profile")} - ${process.env.REACT_APP_TITLE}` }</title>
            </Helmet>
            <Grid>
                <Breadcrumbs
                    items={[
                        { label:t("lb_home"), href:"/" },
                        { label: t("lb_profile") }
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
                                        required
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
                                        label={ `${t('input_user_name')}:` }
                                    >
                                        <TextField
                                            name="user_name"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.user_name}
                                            value={ _.get(content,"user_name","")}
                                            // onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "user_name","")}
                                            required
                                            inputProps={{
                                                className:"form-input",
                                                readOnly:true
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} spacing={1}>
                                    
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
                            </Grid>
                        </CardContent>
                        <CardActions>
                            <Grid container>
                                <Grid item sm={12} xs={12} style={{textAlign: "right"}}>
                                    <FormButtonGroup />
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
export default withTranslation('translation')(Profile);