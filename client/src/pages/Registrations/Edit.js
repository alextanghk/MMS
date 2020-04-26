import React, { Component, Fragment } from 'react';
import Helmet from 'react-helmet';
import { Grid, Card,CardContent, CardActions, Button } from '@material-ui/core';
import { 
    Radio, FormControlLabel, FormControl, MenuItem,
    TextField, Select, RadioGroup, Switch, Checkbox, FormHelperText 
} from '@material-ui/core';

import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
    DatePicker
} from '@material-ui/pickers';
import { toast } from 'react-toastify';
import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormButtonGroup from '../../components/FormButtonGroup';
import Loader from '../../components/Loader';
import MomentUtils from "@date-io/moment";
import moment from 'moment';
import FileUpload from '../../components/FileUpload';
import FormItemContainer  from '../../components/FormItemContainer';

class EditRegistration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                zh_surname:"",
                en_surname:"",
                zh_first_name:"",
                en_first_name:"",
                hkid:"",
                yob:"",
                dob: null,
                email:"",
                home_address:"",
                mobile:"",
                gender:"",
                comnpany:"",
                department:"",
                job_title:"",
                office_address:"",
                office_phone:"",
                employment_terms:"",
                proof: "",
                proof_file: null,
                delete_proof: false,
                declare:true,
                agreement:true,
                remark: "",
                receipt_no: "",
                status: "New",
                payment_method: null,
                paid: false,
                paid_at: null,
                sent_confirmation: false,
                sent_payment_note: false,
                sent_receipt: false
            },
            errors: {

            },
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
    
    componentWillMount(){
        const { match: { params } } = this.props;
        const { id } = params;
        if (id !== undefined) {
            this.setState({
                loading: true
            })
            global.Fetch(`registrations/${id}`)
                .then((result)=>{
                    this.setState(prevState => ({
                        ...prevState,
                        content: {
                            ...prevState.content,
                            ..._.reduce(result.data,(r,v,k)=>{
                                switch(k) {
                                    case "dob": r[k] = moment(v); break;
                                    case "proof": r[k] = _.get(v,"original",""); break;
                                    case "audit":
                                        r = {
                                            ...r,
                                            ...v
                                        }
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
        else if(!moment(values.dob).isValid())
            errors.dob = t("field_error_invalid");

        if (!values.home_address) errors.home_address = t("field_error_required");
        if (!values.mobile) errors.mobile = t("field_error_required");
        if (!values.gender) errors.gender = t("field_error_required");
        if (!values.comnpany) errors.comnpany = t("field_error_required");
        if (!values.job_title) errors.job_title = t("field_error_required");
        if (!values.office_address) errors.office_address = t("field_error_required");
        
        if (!values.office_phone && (!values.proof && !values.proof_file)) 
        {
            errors.office_phone = t("field_phone_or_proof");
            errors.proof_file = t("field_phone_or_proof");
        }
        if (!values.employment_terms) errors.employment_terms = t("field_error_required");
        if (!values.declare) errors.declare = t("field_error_required");
        if (!values.agreement) errors.agreement = t("field_error_required");

        // Audit use
        if (values.paid) {
            if (!values.paid_at) {
                errors.paid_at = t("field_error_required");
            } else if (!moment(values.paid_at).isValid()) {
                errors.paid_at = t("field_error_invalid");
            }
            if (!values.payment_method) errors.payment_method = t("field_error_required");
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
                        case "dob":
                            var d = moment.isMoment(v) ? v : moment(v);
                            data.append(k,d.format("YYYY-MM-DD"));
                            data.append("yob",d.format("YYYY"));
                            break;
                        case "proof_file":
                            data.append("proof",v);
                            break;
                        case "paid_at":
                            var d = moment.isMoment(v) ? v : moment(v);
                            data.append(k,d.format("YYYY-MM-DD"));
                            break;
                        case "proof":
                        case "auth":
                            break;
                        default:
                            data.append(k,v);
                            break;
                    }
                }
            },{});
            return global.Fetch(`registrations${id !== undefined ? '/update/'+id:"/create"}`,{
                method: id === undefined ? 'POST': 'PUT',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json'
                }),
                body: data
            })
        }
    }

    handleOnCancel = (e) => {
        e.preventDefault();
        const { match: { params } } = this.props;
        const { id } = params;
        const { t, i18n } = this.props;
        const _this = this;
        this.setState({
            loading: true,
            message: "",
            status:"",
        })
        this.OnSave()
        .then((result)=>{
            return global.Fetch(`registrations/cancel/${id }`,{
                method: 'PUT',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json'
                }),
                body: {}
            })
        }).then((result)=>{
            toast.success(t("success_cancelled"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => {
                    window.location.href = `/registrations/edit/${id}`;
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

    handleOnWithdraw = (e) => {
        e.preventDefault();
        const { match: { params } } = this.props;
        const { id } = params;
        const { t, i18n } = this.props;
        const _this = this;
        this.setState({
            loading: true,
            message: "",
            status:"",
        })
        this.OnSave()
        .then((result)=>{
            return global.Fetch(`registrations/withdraw/${id }`,{
                method: 'PUT',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json'
                }),
                body: {}
            })
        }).then((result)=>{
            toast.success(t("success_withdraw"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => {
                    window.location.href = `/registrations/edit/${id}`;
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

    handleOnApprove = (e) => {
        e.preventDefault();
        const { match: { params } } = this.props;
        const { id } = params;
        const { t, i18n } = this.props;
        const _this = this;
        this.setState({
            loading: true,
        })
        this.OnSave()
        .then((result)=>{
            return global.Fetch(`registrations/approve/${id }`,{
                method: 'PUT',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json'
                }),
                body: {}
            })
        }).then((result)=>{
            toast.success(t("success_approved"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => {
                    window.location.href = `/registrations/edit/${id}`;
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
                    window.location.href = `/registrations/edit/${id}`;
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
        let allowWithdraw = true;
        let allowCancel = true;
        let allowApprove = true;
        if (id === undefined) {
            allowSave = global.Accessible("POST_REGISTRATION");
        } else {
            allowSave = global.Accessible("PUT_REGISTRATION");
        }
        switch(content.status) {
            case "New":
                allowWithdraw = false;
                break;
            case "Cancelled":
                allowWithdraw = false;
                allowApprove = false;
                allowCancel = false;
                break;
            case "Completed":
                allowApprove = false;
                allowCancel = false;
                allowSave = global.Accessible("UPDATE_REGISTRATION_AFTER_APPROVED");
                break;
            default:
                allowCancel = false;
                allowApprove = false;
                break;
        }

        return (<Fragment>
            <Helmet>
                <title>{ `${t("lb_registrations")} - ${process.env.REACT_APP_TITLE}` }</title>
            </Helmet>
            <Grid>
                <Breadcrumbs
                    items={[
                        { label:t("lb_home"), href:"/" },
                        { label:t("lb_registrations"), href:"/registrations" },
                        { label: id === undefined ? t("lb_new_registrations") : t("lb_edit_registrations") }
                    ]}
                />
                <form
                    onSubmit={this.handleOnSubmit}
                >
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
                                                error={ errors.zh_surname }
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
                                                error={ errors.zh_first_name }
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
                                                error={ errors.en_surname }
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
                                                error={ errors.en_first_name }
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
                                                error={ errors.email }
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
                                                error={ errors.mobile }
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
                                                error={ errors.home_address }
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
                                                row
                                                error={ errors.gender }
                                            >
                                                <FormControlLabel
                                                    value="F"
                                                    control={<Radio color="primary" />}
                                                    label={ t('radio_female') }
                                                    labelPlacement="end"
                                                    error={ errors.gender }
                                                />
                                                <FormControlLabel
                                                    value="M"
                                                    control={<Radio color="primary" />}
                                                    label={ t('radio_male') }
                                                    labelPlacement="end"
                                                    error={ errors.gender }
                                                />
                                                <FormControlLabel
                                                    value="O"
                                                    control={<Radio color="primary" />}
                                                    label={ t('radio_other') }
                                                    labelPlacement="end"
                                                    error={ errors.gender }
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
                                                views={["year","month"]}
                                                error={ errors.dob }
                                                inputVariant="outlined"
                                                onChange={ this.handleOnDateChange('dob') }
                                                maxDate={new Date()}
                                                format="MM/YYYY"
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
                                                error={ errors.hkid }
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
                                            required
                                            label={ `${t('input_comnpany')}:` }
                                        >
                                            <TextField
                                                name="comnpany"
                                                variant="outlined"
                                                fullWidth
                                                error={ errors.comnpany }
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
                                                error={ errors.office_address }
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
                                                error={ errors.job_title }
                                                value={ _.get(content,"job_title","")}
                                                onChange={this.handleOnChange}
                                                type="text"
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
                                                error={ errors.employment_terms }
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
                                            <FormHelperText className="error">{_.get(errors, "employment_terms","")}</FormHelperText>
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
                                                error={ errors.office_phone }
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
                                                error={ errors.department }
                                                value={ _.get(content,"department","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "department","")}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_status')}:` }
                                        >
                                            <TextField
                                                name="status"
                                                variant="outlined"
                                                fullWidth
                                                error={ errors.status }
                                                value={ _.get(content,"status","")}
                                                type="text"
                                                helperText={_.get(errors, "status","")}
                                                inputProps={{
                                                    className:"form-input",
                                                    readOnly: true
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}></Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            
                                            label={ `${t('input_proof')}:` }
                                        >
                                            <FileUpload 
                                                value={ _.get(content,"proof","")}
                                                onChange={this.handleOnUpload} 
                                                name="proof_file"
                                                deletedField="delete_proof"
                                            />
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
                                                error={ errors.remark }
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
                                    <Grid item md={11} xs={11} spacing={1}>
                                        <FormItemContainer large>
                                            <FormControl className="form-item" component="fieldset">
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox 
                                                            checked={content.declare} 
                                                            onChange={this.handleOnChecked("declare")} 
                                                        />
                                                    }
                                                    label={ t("input_declare") }
                                                />
                                            </FormControl>
                                            <FormHelperText className="error">{_.get(errors, "declare","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={11} xs={11} spacing={1}>
                                        <FormItemContainer large>
                                            <FormControl className="form-item" component="fieldset">
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox 
                                                            checked={content.agreement} 
                                                            onChange={this.handleOnChecked("agreement")} 
                                                        />
                                                    }
                                                    label={ t("input_agreement") }
                                                />
                                            </FormControl>
                                            <FormHelperText className="error">{_.get(errors, "agreement","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={12} xs={12}><hr /></Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_sent_confirmation')}:` }
                                        >
                                            <Switch
                                                checked={content.sent_confirmation} 
                                                onChange={this.handleOnChecked("sent_confirmation")} 
                                                name="sent_confirmation"
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "sent_confirmation","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_paid')}:` }
                                        >
                                            <Switch
                                                checked={content.paid} 
                                                onChange={this.handleOnChecked("paid")} 
                                                name="paid"
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "paid","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_sent_payment_note')}:` }
                                        >
                                            <Switch
                                                checked={content.sent_payment_note} 
                                                onChange={this.handleOnChecked("sent_payment_note")} 
                                                name="sent_payment_note"
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "sent_payment_note","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required={content.paid}
                                            label={ `${t('input_paid_at')}:` }
                                        >
                                            <KeyboardDatePicker
                                                fullWidth
                                                value={_.get(content,"paid_at", null)}
                                                placeholder=""
                                                error={ errors.paid_at }
                                                required={content.paid}
                                                inputVariant="outlined"
                                                onChange={ this.handleOnDateChange('paid_at') }
                                                maxDate={new Date()}
                                                format="YYYY-MM-DD"
                                                InputAdornmentProps={{position: "end"}}
                                                className="datePicker"
                                                inputProps={{
                                                    className:"form-input date-input"
                                                }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "paid_at","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    
                                    <Grid item md={5} xs={11} spacing={1}></Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            required={content.paid}
                                            label={ `${t('input_payment_method')}:` }
                                        >
                                            <Select
                                                value={ _.get(content,"payment_method","")}
                                                name="payment_method"
                                                variant="outlined"
                                                fullWidth
                                                error={ errors.payment_method }
                                                required={content.paid}
                                                onChange={this.handleOnChange}
                                                inputProps={{
                                                    className:"form-input"
                                                }}
                                            >
                                                <MenuItem value={null}></MenuItem>
                                                {
                                                    global.payment_methods.map((p)=>{
                                                        return (<MenuItem value={p.value}>{p.label}</MenuItem>);
                                                    })
                                                }
                                            </Select>
                                            <FormHelperText className="error">{_.get(errors, "payment_method","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}></Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_sent_receipt')}:` }
                                        >
                                            <Switch
                                                checked={content.sent_receipt} 
                                                onChange={this.handleOnChecked("sent_receipt")} 
                                                name="sent_receipt"
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "sent_receipt","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} xs={11} spacing={1}></Grid>
                                    <Grid item md={5} xs={11} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_receipt_no')}:` }
                                            required={content.sent_receipt}
                                        >
                                            <TextField
                                                name="receipt_no"
                                                variant="outlined"
                                                fullWidth
                                                error={ errors.receipt_no }
                                                value={ _.get(content,"receipt_no","")}
                                                required={content.sent_receipt}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "receipt_no","")}
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
                                    <Grid item sm={6} xs={6}>
                                    {
                                        id !== undefined && <Fragment>
                                            {
                                                (content.status != "Completed" && global.Accessible("APPROVE_REGISTRATION") && allowApprove) && <Button 
                                                        onClick={this.handleOnApprove}
                                                        color="primary"
                                                        size="middle"
                                                        variant="contained"
                                                        style={{
                                                            marginRight: "15px"
                                                        }}
                                                    >
                                                    Approve
                                                </Button>
                                            }
                                            {
                                                (content.status != "Cancelled" && global.Accessible("CANCEL_REGISTRATION") && allowCancel) && <Button 
                                                        onClick={this.handleOnCancel}
                                                        color="secondary"
                                                        size="middle"
                                                        variant="contained"
                                                        style={{
                                                            marginRight: "15px"
                                                        }}
                                                    >
                                                    Cancelled
                                                </Button>
                                            }
                                            {
                                                (content.status != "Withdraw" && global.Accessible("WITHDRAW_REGISTRATION") && allowWithdraw) && <Button 
                                                        onClick={this.handleOnWithdraw}
                                                        color="inherit"
                                                        size="middle"
                                                        variant="contained"
                                                    >
                                                    Withdraw
                                                </Button>
                                            }
                                        </Fragment>
                                    }
                                    </Grid>
                                    <Grid item sm={6} xs={6} style={{textAlign:"right"}}>
                                        <FormButtonGroup
                                            allowSave={allowSave}
                                            onCancel={(e) => {
                                                e.preventDefault()
                                                window.location.href="/registrations"
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
export default withTranslation('translation')(EditRegistration);