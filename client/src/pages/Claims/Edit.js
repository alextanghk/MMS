import React, { Component, useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, CardActions, Button, Select, MenuItem } from '@material-ui/core';
import { TextField, FormControl, FormHelperText } from '@material-ui/core';

import { withTranslation, Trans } from 'react-i18next';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
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

class EditClaims extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                invoice_number: "",
                item_name: "",
                item_type: "",
                provider: "",
                payment_method: "",
                description: "",
                paid_by: "",
                paid_at: moment(),
                approved_by: "",
                approved_at: null,
                handled_by: "",
                handled_at: null,
                receipt: null,
                transaction_date: null,
                receipt_file: null,
                delete_receipt: false,
                amount: 0,
                status: "New",
                is_approved: false,
                is_handled: false
            },
            errors:{},
            loading: false,
            status: "",
            message: ""
        };
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleOnChecked = this.handleOnChecked.bind(this);
        this.handleOnDateChange = this.handleOnDateChange.bind(this);
        this.handleOnApprove = this.handleOnApprove.bind(this);
        this.handleOnHandle = this.handleOnHandle.bind(this);
        this.handleOnReject = this.handleOnReject.bind(this);
        this.handleOnCancel = this.handleOnCancel.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
    }

    componentDidMount(){
        const { match: { params } } = this.props;
        const { id } = params;
        if (id !== undefined) {
            this.setState({
                loading: true
            })
            global.Fetch(`claims/${id}`)
                .then((result)=>{
                    this.setState(prevState => ({
                        ...prevState,
                        content: {
                            ...prevState.content,
                            ..._.reduce(result.data,(r,v,k)=>{
                                switch(k) {
                                    case "paid_at": r[k] = moment(v); break;
                                    case "receipt": r[k] = _.get(v,"original",""); break;
                                    case "amount": r[k] = parseFloat(v); break;
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
        if (!values.invoice_number) errors.invoice_number = t("field_error_required");
        if (!values.item_name) errors.item_name = t("field_error_required");

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
                        case "paid_at":
                            var d = moment.isMoment(v) ? v : moment(v);
                            data.append(k,d.format("YYYY-MM-DD"));
                            break;
                        case "receipt_file":
                            data.append("receipt",v);
                            break;
                        case "receipt":
                            break;
                        default:
                            data.append(k,v);
                            break;
                    }
                }
            },{});
            return global.Fetch(`claims${id !== undefined ? '/update/'+id:"/create"}`,{
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
            return global.Fetch(`claims/cancel/${id }`,{
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
                    window.location.href = `/claims/edit/${id}`;
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

    handleOnReject = (e) => {
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
            return global.Fetch(`claims/reject/${id }`,{
                method: 'PUT',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json'
                }),
                body: {}
            })
        }).then((result)=>{
            toast.success(t("success_rejected"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => {
                    window.location.href = `/claims/edit/${id}`;
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

    handleOnApprove = (e) => {
        e.preventDefault();
        const { match: { params } } = this.props;
        const { id } = params;
        const { t, i18n } = this.props;
        const _this = this;

        // Check Approved data
        const {content} = this.state;
        this.setState({
            errors: {}
        })
        let errors = {};

        if (!content.approved_at) errors.approved_at = t("field_error_required");
        if (!content.approved_by) errors.approved_by = t("field_error_required");

        this.setState(prevState => ({
            ...prevState,
            ["errors"]: errors
        }))
        if (Object.keys(errors).length > 0) {
            toast.error(t("form_invalid"), {
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
            return false;
        }

        this.setState({
            loading: true,
            message: "",
            status:"",
        })
        
        
        this.OnSave()
        .then((result)=>{
            return global.Fetch(`claims/approve/${id }`,{
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
                    window.location.href = `/claims/edit/${id}`;
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
    handleOnHandle = (e) => {
        e.preventDefault();
        const { match: { params } } = this.props;
        const { id } = params;
        const { t, i18n } = this.props;
        const _this = this;

        // Check data
        const {content} = this.state;
        this.setState({
            errors: {}
        })
        let errors = {};

        if (!content.handled_at) errors.handled_at = t("field_error_required");
        if (!content.handled_by) errors.handled_by = t("field_error_required");
        if (!content.transaction_date) errors.transaction_date = t("field_error_required");
        
        this.setState(prevState => ({
            ...prevState,
            ["errors"]: errors
        }))
        if (Object.keys(errors).length > 0) {
            toast.error(t("form_invalid"), {
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
            return false;
        }

        this.setState({
            loading: true,
            message: "",
            status:"",
        })
        
        
        this.OnSave()
        .then((result)=>{
            return global.Fetch(`claims/handle/${id }`,{
                method: 'PUT',
                credentials: 'include',
                headers: new Headers({
                    'Accept': 'application/json'
                }),
                body: {}
            })
        }).then((result)=>{
            toast.success(t("success_handled"), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                onClose: () => {
                    window.location.href = `/claims/edit/${id}`;
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
                    window.location.href = `/claims/edit/${id}`;
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
                <title>{ `${t("lb_claims")} - ${process.env.REACT_APP_TITLE}` }</title>
            </Helmet>
            <Grid>
                <Breadcrumbs
                    items={[
                        { label:t("lb_home"), href:"/" },
                        { label:t("lb_claims"), href:"/claims" },
                        { label: id === undefined ? t("lb_new_claims") : t("lb_edit_claims") }
                    ]}
                />
                <form onSubmit={this.handleOnSubmit}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Card>
                            <CardContent>
                                <Grid container style={{
                                    marginTop: "20px"
                                }}>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_invoice_number')}:` }
                                        >
                                            <TextField
                                                name="invoice_number"
                                                variant="outlined"
                                                fullWidth
                                                
                                                value={ _.get(content,"invoice_number","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "invoice_number","")}
                                                required
                                                inputProps={{
                                                    className:"form-input",
                                                    readOnly: content.is_approved
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_provider')}:` }
                                        >
                                            <TextField
                                                name="provider"
                                                variant="outlined"
                                                fullWidth
                                                
                                                value={ _.get(content,"provider","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "provider","")}
                                                required
                                                inputProps={{
                                                    className:"form-input",
                                                    readOnly: content.is_approved
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_item_name')}:` }
                                        >
                                            <TextField
                                                name="item_name"
                                                variant="outlined"
                                                fullWidth
                                                multiline
                                                value={ _.get(content,"item_name","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "item_name","")}
                                                required
                                                inputProps={{
                                                    className:"form-input",
                                                    readOnly: content.is_approved
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_item_type')}:` }
                                        >
                                            <TextField
                                                name="item_type"
                                                variant="outlined"
                                                fullWidth
                                                
                                                value={ _.get(content,"item_type","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "item_type","")}
                                                required
                                                inputProps={{
                                                    className:"form-input",
                                                    readOnly: content.is_approved
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_payment_method')}:` }
                                        >
                                            <Select
                                                value={ _.get(content,"payment_method","")}
                                                name="payment_method"
                                                variant="outlined"
                                                fullWidth
                                                error={ errors.payment_method }
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
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_amount')}:` }
                                        >
                                            <TextField
                                                name="amount"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"amount","")}
                                                onChange={this.handleOnChange}
                                                type="number"
                                                helperText={_.get(errors, "amount","")}
                                                required
                                                inputProps={{
                                                    className:"form-input",
                                                    readOnly: content.is_approved,
                                                    step:0.01,
                                                    min:0
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_paid_by')}:` }
                                        >
                                            <TextField
                                                name="paid_by"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"paid_by","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "paid_by","")}
                                                required
                                                inputProps={{
                                                    readOnly: content.is_approved,
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            required
                                            label={ `${t('input_paid_at')}:` }
                                        >
                                            <KeyboardDatePicker
                                                fullWidth
                                                value={_.get(content,"paid_at", null)}
                                                placeholder=""
                                                required
                                                inputVariant="outlined"
                                                onChange={ this.handleOnDateChange('paid_at') }
                                                maxDate={new Date()}
                                                format="YYYY-MM-DD"
                                                InputAdornmentProps={{position: "end"}}
                                                className="datePicker"
                                                inputProps={{
                                                    disabled: content.is_approved,
                                                    className:"form-input date-input"
                                                }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "paid_at","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_approved_by')}:` }
                                        >
                                            <TextField
                                                name="approved_by"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"approved_by","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "approved_by","")}
                                                inputProps={{
                                                    readOnly: content.is_approved,
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_approved_at')}:` }
                                        >
                                            <KeyboardDatePicker
                                                fullWidth
                                                value={_.get(content,"approved_at", null)}
                                                placeholder=""
                                                inputVariant="outlined"
                                                onChange={ this.handleOnDateChange('approved_at') }
                                                maxDate={new Date()}
                                                format="YYYY-MM-DD"
                                                InputAdornmentProps={{position: "end"}}
                                                className="datePicker"
                                                inputProps={{
                                                    disabled: content.is_approved,
                                                    className:"form-input date-input"
                                                }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "approved_at","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_handled_by')}:` }
                                        >
                                            <TextField
                                                name="handled_by"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"handled_by","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "handled_by","")}
                                                inputProps={{
                                                    readOnly: content.is_handled,
                                                    className:"form-input"
                                                }}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_handled_at')}:` }
                                        >
                                            <KeyboardDatePicker
                                                fullWidth
                                                value={_.get(content,"handled_at", null)}
                                                placeholder=""
                                                inputVariant="outlined"
                                                onChange={ this.handleOnDateChange('handled_at') }
                                                maxDate={new Date()}
                                                format="YYYY-MM-DD"
                                                InputAdornmentProps={{position: "end"}}
                                                className="datePicker"
                                                inputProps={{
                                                    disabled: content.is_handled,
                                                    className:"form-input date-input"
                                                }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "handled_at","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_transaction_date')}:` }
                                        >
                                            <KeyboardDatePicker
                                                fullWidth
                                                value={_.get(content,"transaction_date", null)}
                                                placeholder=""
                                                inputVariant="outlined"
                                                onChange={ this.handleOnDateChange('transaction_date') }
                                                maxDate={new Date()}
                                                format="YYYY-MM-DD"
                                                InputAdornmentProps={{position: "end"}}
                                                className="datePicker"
                                                inputProps={{
                                                    disabled: content.is_handled,
                                                    className:"form-input date-input"
                                                }}
                                            />
                                            <FormHelperText className="error">{_.get(errors, "transaction_date","")}</FormHelperText>
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}></Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            
                                            label={ `${t('input_receipt')}:` }
                                        >
                                            <FileUpload 
                                                value={ _.get(content,"receipt","")}
                                                onChange={this.handleOnUpload} 
                                                name="receipt_file"
                                                deletedField="delete_receipt"
                                                disabled={content.is_approved}
                                            />
                                        </FormItemContainer>
                                    </Grid>
                                    <Grid item md={5} spacing={1}>
                                        <FormItemContainer
                                            label={ `${t('input_description')}:` }
                                        >
                                            <TextField
                                                name="description"
                                                variant="outlined"
                                                fullWidth
                                                value={ _.get(content,"description","")}
                                                onChange={this.handleOnChange}
                                                type="text"
                                                helperText={_.get(errors, "description","")}
                                                multiline
                                                inputProps={{
                                                    className:"form-input",
                                                    rows: "4"
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
                                        (id !== undefined && content.is_approved && !content.is_handled) && <Button 
                                            onClick={this.handleOnHandle}
                                            color="primary"
                                            size="middle"
                                            variant="contained"
                                            style={{
                                                marginRight: "15px"
                                            }}
                                        >
                                            Handle
                                        </Button>
                                    }
                                    {
                                        (id !== undefined && !content.is_approved) && <Button 
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
                                        (id !== undefined && content.status == "New") && <Button 
                                            onClick={this.handleOnReject}
                                            color="secondary"
                                            size="middle"
                                            variant="contained"
                                            style={{
                                                marginRight: "15px"
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    }
                                    {
                                        (id !== undefined && content.status == "New") && <Button 
                                            onClick={this.handleOnCancel}
                                            color="inherit"
                                            size="middle"
                                            variant="contained"
                                        >
                                            Cancelled
                                        </Button>
                                    }
                                    
                                    </Grid>
                                    <Grid item sm={6} xs={6} style={{textAlign:"right"}}>
                                        <FormButtonGroup
                                            onCancel={(e) => {
                                                e.preventDefault()
                                                window.location.href="/claims"
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
export default withTranslation('translation')(EditClaims);