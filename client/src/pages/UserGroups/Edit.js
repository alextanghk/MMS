import React, { Component, useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, CardActions, Button } from '@material-ui/core';
import { TextField, FormControl, FormLabel, FormHelperText } from '@material-ui/core';

import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormButtonGroup from '../../components/FormButtonGroup';
import Loader from '../../components/Loader';

import AccessRights from '../../components/AccessRights';
import { toast } from 'react-toastify';
import FormItemContainer  from '../../components/FormItemContainer';

class EditUserGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                name:"",
                remark: "",
                access_rights: []
            },
            errors:{},
            loading: false,
            status: "",
            message: ""
        };
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnChecked = this.handleOnChecked.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    componentDidMount(){
        const { match: { params } } = this.props;
        const { id } = params;
        if (id !== undefined) {
            this.setState({
                loading: true
            })
            global.Fetch(`user_groups/${id}`)
                .then((result)=>{
                    this.setState(prevState => ({
                        ...prevState,
                        content: {
                            ...prevState.content,
                            ..._.reduce(result.data,(r,v,k)=>{
                                switch(k) {
                                    case "access_rights":
                                        r[k] = v.map((row) => {
                                            return parseInt(row.id);
                                        })
                                        break;
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

    handleOnChecked = (name, value) => {
        this.onChange(name,value);
    }
    validations = (values) => {
        const { t, i18n } = this.props;
        this.setState({
            errors: {}
        })
        let errors = {};
        if (!values.name) errors.name = t("field_error_required");
        if (values.access_rights.length == 0) errors.access_rights = t("field_error_required");
        
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
                        default:
                            data.append(k,v);
                            break;
                    }
                }
            },{});
            return global.Fetch(`user_groups${id !== undefined ? '/update/'+id:"/create"}`,{
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
                    window.location.href = `/usergroups/edit/${id}`;
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
        let allowSave = true;
        if (id === undefined) {
            allowSave = global.Accessible("POST_USER_GROUP");
        } else {
            allowSave = global.Accessible("PUT_USER_GROUP");
        }
        return (<Fragment>
            <Helmet>
                <title>{ `${t("lb_usergroups")} - ${process.env.REACT_APP_TITLE}` }</title>
            </Helmet>
            <Grid>
                <Breadcrumbs
                    items={[
                        { label:t("lb_home"), href:"/" },
                        { label:t("lb_usergroups"), href:"/usergroups" },
                        { label: id === undefined ? t("lb_new_usergroups") : t("lb_edit_usergroups") }
                    ]}
                />
                <form onSubmit={this.handleOnSubmit}>
                    <Card>
                        <CardContent>
                            <Grid container style={{
                                marginTop: "20px"
                            }}>
                                <Grid item md={11} spacing={1}>
                                    <FormItemContainer
                                        required
                                        large
                                        label={ `${t('input_group_name')}:` }
                                    >
                                        <TextField
                                            name="name"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.name}
                                            value={ _.get(content,"name","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "name","")}
                                            required
                                            inputProps={{
                                                className:"form-input"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={11} spacing={1}>
                                    <FormItemContainer
                                        large
                                        label={ `${t('input_remark')}:` }
                                    >
                                        <TextField
                                            name="remark"
                                            variant="outlined"
                                            fullWidth
                                            error={errors.remark}
                                            value={ _.get(content,"remark","")}
                                            onChange={this.handleOnChange}
                                            type="text"
                                            helperText={_.get(errors, "remark","")}
                                            multiline
                                            inputProps={{
                                                className:"form-input",
                                                rows: "4"
                                            }}
                                        />
                                    </FormItemContainer>
                                </Grid>
                                <Grid item md={11} spacing={1}>
                                    <FormItemContainer
                                        large
                                        label={ `${t('input_access_rights')}:` }
                                    >
                                        <AccessRights
                                            name="access_rights"
                                            value={ content.access_rights }
                                            onChange={this.handleOnChecked}
                                        />
                                        <FormHelperText className="error">{_.get(errors, "access_rights","")}</FormHelperText>
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
                                            window.location.href="/usergroups"
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
export default withTranslation('translation')(EditUserGroup);