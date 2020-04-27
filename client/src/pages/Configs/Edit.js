import React, { Component, useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, CardActions, Button } from '@material-ui/core';
import { TextField, FormControlLabel, FormControl, FormHelperText, Checkbox } from '@material-ui/core';

import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormButtonGroup from '../../components/FormButtonGroup';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import FormItemContainer  from '../../components/FormItemContainer';

class EditConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                display_name:"",
                content:""
            },
            errors:{},
            loading: false,
            status: "",
            message: ""
        };
        this.handleOnChecked = this.handleOnChecked.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    componentDidMount(){
        const { match: { params } } = this.props;
        const { id } = params;
        if (id !== undefined) {
            this.setState({
                loading: true
            })
            global.Fetch(`configs/${id}`)
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
    
    handleOnChecked = (name) => (e) => {
        let value = e.target.checked ;
        this.onChange(name,value);
    }

    handleOnChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        
        this.onChange(name,value);
    }
    validations = (values) => {
        const { t, i18n } = this.props;
        this.setState({
            errors: {}
        })
        let errors = {};
        if (!values.display_name) errors.display_name = t("field_error_required");

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
            console.log(content);
            _.reduce(content, (r,v,k)=>{
                if (v != null) {
                    switch(k) {
                        default:
                            data.append(k,v);
                            break;
                    }
                }
            },{});
            return global.Fetch(`configs${id !== undefined ? '/update/'+id:"/create"}`,{
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
                    window.location.href = `/configs/edit/${id}`;
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
            allowSave = false;
        } else {
            allowSave = global.Accessible("PUT_SYS_CONFIG");
        }

        return (<Fragment>
            <Helmet>
                <title>{ `${t("lb_configs")} - ${process.env.REACT_APP_TITLE}` }</title>
            </Helmet>
            <Grid>
                <Breadcrumbs
                    items={[
                        { label:t("lb_home"), href:"/" },
                        { label:t("lb_configs"), href:"/configs" },
                        { label: id === undefined ? t("lb_new_configs") : t("lb_edit_configs") }
                    ]}
                />
                <form onSubmit={this.handleOnSubmit}>
                    <Card>
                        <CardContent>
                            <Grid container style={{
                                marginTop: "20px"
                            }}>
                                <Grid item md={5} xs={11} spacing={1}>
                                    <FormItemContainer
                                        required
                                        label={ `${t('input_config_name')}:` }
                                    >
                                        <TextField
                                            name="display_name"
                                            variant="outlined"
                                            fullWidth
                                            value={ _.get(content,"display_name","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "display_name","")}
                                            required
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={5} xs={11} spacing={1}>
                                    <FormItemContainer
                                        label={ `${t('input_config_content')}:` }
                                    >
                                        <TextField
                                            name="content"
                                            variant="outlined"
                                            fullWidth
                                            value={ _.get(content,"content","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "content","")}
                                            multiline
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
                                <Grid item sm={12} xs={12} style={{textAlign:"right"}}>
                                    <FormButtonGroup
                                        allowSave={ allowSave }
                                        onCancel={(e) => {
                                            e.preventDefault()
                                            window.location.href="/configs"
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
export default withTranslation('translation')(EditConfig);