import React, { Component, useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, CardActions, Button } from '@material-ui/core';
import { TextField, Radio, RadioGroup, FormControlLabel, FormControl, Switch, Select, MenuItem, FormHelperText } from '@material-ui/core';

import { withTranslation, Trans } from 'react-i18next';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
    DatePicker
} from '@material-ui/pickers';
import _ from 'lodash';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormButtonGroup from '../../components/FormButtonGroup';
import Loader from '../../components/Loader';
import MomentUtils from "@date-io/moment";
import moment from 'moment';
import FileUpload from '../../components/FileUpload';

import { toast } from 'react-toastify';
import FormItemContainer  from '../../components/FormItemContainer';

class EditMember extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                zh_surname:"",
                en_surname:"",
                zh_first_name:"",
                en_first_name:"",
                member_ref: "",
                hkid:"",
                yob:"",
                dob: null,
                email:"",
                home_address:"",
                department: "",
                mobile:"",
                gender:"",
                comnpany:"",
                job_title:"",
                office_address:"",
                office_phone: "",
                employment_terms:"",
                emergency_contact: "",
                emergency_relation: "",
                emergency_number: "",
                profile: "",
                profile_file: null,
                subscription:true,
                sent_group_invite: false,
                password: null,
                password_confirmation: null,
                remark: "",
                delete_profile: false,
                is_actived:true
            },
            errors: {},
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
            global.Fetch(`members/${id}`)
                .then((result)=>{
                    this.setState(prevState => ({
                        ...prevState,
                        content: {
                            ...prevState.content,
                            ..._.reduce(result.data,(r,v,k)=>{
                                switch(k) {
                                    case "profile": r[k] = _.get(v,"original",""); break;
                                    case "dob": r[k] = moment(v); break;
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
        console.log(content);
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
        if (!values.zh_surname) errors.zh_surname = t("field_error_required");
        if (!values.zh_first_name) errors.zh_first_name = t("field_error_required");
        if (!values.en_surname) errors.en_surname = t("field_error_required");
        if (!values.en_first_name) errors.en_first_name = t("field_error_required");
        if (!values.email) errors.email = t("field_error_required");
        if (!values.hkid) errors.hkid = t("field_error_required");
        if (!values.dob) 
            errors.dob = t("field_error_required");
        else if(!moment(values.paid_at).isValid())
            errors.dob = t("field_error_invalid");

        if (!values.home_address) errors.home_address = t("field_error_required");
        if (!values.mobile) errors.mobile = t("field_error_required");
        if (!values.gender) errors.gender = t("field_error_required");
        if (!values.comnpany) errors.comnpany = t("field_error_required");
        if (!values.job_title) errors.job_title = t("field_error_required");
        if (!values.office_address) errors.office_address = t("field_error_required");
        if (!values.employment_terms) errors.employment_terms = t("field_error_required");

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
                        case "dob":
                            var d = moment.isMoment(v) ? v : moment(v);
                            data.append(k,d.format("YYYY-MM-DD"));
                            data.append("yob",d.format("YYYY"));
                            break;
                        case "profile_file":
                            data.append("profile",v);
                            break;
                        case "profile":
                            break;
                        default:
                            data.append(k,v);
                            break;
                    }
                }
            },{});
            return global.Fetch(`members${id !== undefined ? '/update/'+id:"/create"}`,{
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
                    window.location.href = `/members/edit/${id}`;
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
            allowSave = global.Accessible("POST_MEMBER");
        } else {
            allowSave = global.Accessible("PUT_MEMBER");
        }
        
        return (<Fragment>
            <Helmet>
                <title>{ `${t("lb_members")} - ${process.env.REACT_APP_TITLE}` }</title>
            </Helmet>
            <Grid>
                <Breadcrumbs
                    items={[
                        { label:t("lb_home"), href:"/" },
                        { label:t("lb_members"), href:"/members" },
                        { label: id === undefined ? t("lb_new_members") : t("lb_edit_members") }
                    ]}
                />
                <form onSubmit={this.handleOnSubmit}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Card>
                            <CardContent>
                                <Grid container style={{
                                    marginTop: "20px"
                                }}>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_zh_surname')}:` }
                                        >
                                            <TextField
                                                name="zh_surname"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.zh_surname}
                                                value={ _.get(content,"zh_surname","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "zh_surname","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_zh_first_name')}:` }
                                        >
                                            <TextField
                                                name="zh_first_name"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.zh_first_name}
                                                value={ _.get(content,"zh_first_name","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "zh_first_name","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_en_surname')}:` }
                                        >
                                            <TextField
                                                name="en_surname"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.en_surname}
                                                value={ _.get(content,"en_surname","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "en_surname","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_en_first_name')}:` }
                                        >
                                            <TextField
                                                name="en_first_name"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.en_first_name}
                                                value={ _.get(content,"en_first_name","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "en_first_name","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
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
                                    <Grid item md={5} xs={11} spacing={1}>
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
                                                type="phone"
                                                helperText={_.get(errors, "mobile","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_home_address')}:` }
                                        >
                                            <TextField
                                                name="home_address"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.home_address}
                                                value={ _.get(content,"home_address","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "home_address","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_gender')}:` }
                                        >
                                            <RadioGroup aria-label="gender" name="gender" 
                                                value={_.get(content,"gender", null)}
                                                onChange={this.handleOnChange}
                                                error={errors.gender}
                                                row
                                            >
                                                <FormControlLabel
                                                    value="F"
                                                    control={<Radio color="primary" />}
                                                    label={ t('radio_female') }
                                                    labelPlacement="end"
                                                    error={errors.gender}
                                                />
                                                <FormControlLabel
                                                    value="M"
                                                    control={<Radio color="primary" />}
                                                    label={ t('radio_male') }
                                                    labelPlacement="end"
                                                    error={errors.gender}
                                                />
                                                <FormControlLabel
                                                    value="O"
                                                    control={<Radio color="primary" />}
                                                    label={ t('radio_other') }
                                                    labelPlacement="end"
                                                    error={errors.gender}
                                                />
                                            </RadioGroup>
                                            <FormHelperText className="error">{_.get(errors, "gender","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_dob')}:` }
                                        >
                                            <DatePicker
                                                fullWidth
                                                value={_.get(content,"dob", null)}
                                                placeholder=""
                                                required
                                                openTo="year"
                                                views={["year", "month"]}
                                                inputVariant="outlined"
                                                onChange={ this.handleOnDateChange('dob') }
                                                maxDate={new Date()}
                                                format="YYYY-MM-DD"
                                                error={errors.dob}
                                                InputAdornmentProps={{position: "end"}}
                                                className="datePicker"
                                                inputProps={{
                                                    className:"form-input date-input"
                                                }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "dob","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_hkid')}:` }
                                        >
                                            <TextField
                                                name="hkid"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.hkid}
                                                value={ _.get(content,"hkid","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "hkid","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_emergency_contact')}:` }
                                        >
                                            <TextField
                                                name="emergency_contact"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.emergency_contact}
                                                value={ _.get(content,"emergency_contact","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "emergency_contact","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_emergency_relation')}:` }
                                        >
                                            <TextField
                                                name="emergency_relation"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.emergency_relation}
                                                value={ _.get(content,"emergency_relation","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "emergency_relation","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_emergency_number')}:` }
                                        >
                                            <TextField
                                                name="emergency_number"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.emergency_number}
                                                value={ _.get(content,"emergency_number","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "emergency_number","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_comnpany')}:` }
                                        >
                                            <TextField
                                                name="comnpany"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.comnpany}
                                                value={ _.get(content,"comnpany","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "comnpany","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_office_address')}:` }
                                        >
                                            <TextField
                                                name="office_address"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.office_address}
                                                value={ _.get(content,"office_address","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "office_address","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_job_title')}:` }
                                        >
                                            <TextField
                                                name="job_title"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"job_title","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                error={errors.job_title}
                                                helperText={_.get(errors, "job_title","")}
                                                required
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_employment_terms')}:` }
                                        >
                                            <Select
                                                value={ _.get(content,"employment_terms","")}
                                                name="employment_terms"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.employment_terms}
                                                onChange={this.handleOnChange}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            >
                                                <MenuItem value="Permanent">長工 Permanent</MenuItem>
                                                <MenuItem value="General Contract">一般合約  General Contract</MenuItem>
                                                <MenuItem value="Self-Employed">自僱 Self-Employed</MenuItem>
                                                <MenuItem value="Non-Civil Service Contract">非公務員合約制 Non-Civil Service Contract</MenuItem>
                                                <MenuItem value="Gov T-Contract">Gov T-Contract</MenuItem>
                                                <MenuItem value="Civil Servant">公務員 Civil Servant</MenuItem>
                                                <MenuItem value="Part-time">兼職 Part-time</MenuItem>
                                            </Select>
                                            <FormHelperText className="error">{_.get(errors, "office_address","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_office_phone')}:` }
                                        >
                                            <TextField
                                                name="office_phone"
                                                variant="outlined"
                                                fullWidth
                                                error={errors.office_phone}
                                                value={ _.get(content,"office_phone","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "office_phone","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_department')}:` }
                                        >
                                            <TextField
                                                name="department"
                                                variant="outlined"
                                                fullWidth
                                                error={ errors.office_phone }
                                                value={ _.get(content,"department","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                error={errors.department}
                                                helperText={_.get(errors, "department","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}></Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            
                                            label={ `${t('input_profile')}:` }
                                        >
                                            <FileUpload 
                                                value={ _.get(content,"profile","")}
                                                onChange={this.handleOnUpload} 
                                                name="profile_file"
                                                error={errors.profile_file}
                                                deletedField="delete_profile"
                                            />
                                            <FormHelperText className="error">{_.get(errors, "profile_file","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_remark')}:` }
                                        >
                                            <TextField
                                                name="remark"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"remark","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                error={errors.remark}
                                                helperText={_.get(errors, "remark","")}
                                                multiline
                                                inputProps={{
                                                    className:"form-input",
                                                    rows: "4"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={12} xs={12}><hr /></Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_member_ref')}:` }
                                        >
                                            <TextField
                                                name="member_ref"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"member_ref","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                error={errors.member_ref}
                                                helperText={_.get(errors, "member_ref","")}
                                                inputProps={{
                                                    className:"form-input",
                                                    readOnly: true
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_is_actived')}:` }
                                        >
                                            <Switch
                                                checked={content.is_actived} 
                                                onChange={this.handleOnChecked("is_actived")} 
                                                name="is_actived"
                                                error={errors.is_actived}
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "is_actived","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_password')}:` }
                                        >
                                            <TextField
                                                name="password"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"password","")}
                                                onChange={this.handleOnChange}
                                                type="password"
                                                error={errors.password}
                                                helperText={_.get(errors, "password","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required={content.password}
                                            label={ `${t('input_password_confirmation')}:` }
                                        >
                                            <TextField
                                                name="password_confirmation"
                                                variant="outlined"
                                                fullWidth
                                                required={content.password}
                                                value={ _.get(content,"password_confirmation","")}
                                                onChange={this.handleOnChange}
                                                type="password"
                                                error={errors.password_confirmation}
                                                helperText={_.get(errors, "password_confirmation","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_subscription')}:` }
                                        >
                                            <Switch
                                                checked={content.sent_confirmation} 
                                                onChange={this.handleOnChecked("subscription")} 
                                                name="subscription"
                                                error={errors.subscription}
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "subscription","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_sent_group_invite')}:` }
                                        >
                                            <Switch
                                                checked={content.sent_confirmation} 
                                                onChange={this.handleOnChecked("sent_group_invite")} 
                                                name="sent_group_invite"
                                                error={errors.sent_group_invite}
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "sent_group_invite","")}</FormHelperText>
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
                                                window.location.href="/members"
                                            }}
                                        >
                                            
                                        </FormButtonGroup>
                                    </Grid>
                                </Grid>
                                
                            </CardActions>
                        </Card>
                    </MuiPickersUtilsProvider>
                </form>
            </Grid>
            {
                this.state.loading && <Loader />
            }
        </Fragment>);
    }
}
export default withTranslation('translation')(EditMember);