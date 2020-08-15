import React, { Component, useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, TextField, FormHelperText } from '@material-ui/core';
import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

const MemberSelector = (props) => {
    const { name, value, onChange, required, className="", filter="", error="", disabled=false } = props;
    const [options, setOptions] = useState([]);

    const [paging, setPaging] = useState({
        current: 1,
        pageSize: 50
    }); 

    const GetData = () => {
        let url = `members?page=${paging.current}&size=${paging.pageSize}&order=member_ref&sort=asc`;
        if (filter != "") url = `${url}&keywords=${filter}`;
        global.Fetch(url)
            .then((result)=>{
                setOptions(result.data);
            }).catch((err)=>{
                console.log(err);
            })
    }
    const loadMoreItems = (e) => {
        console.log(e);
    }
    useEffect(()=>{
        GetData();
        console.log("here");
    },[filter])

    return(<Fragment>
        {
            options.length > 0 ? <Fragment><Select
                    variant="outlined"
                    fullWidth
                    className={className}
                    name={name}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                    MenuProps={{
                        onScroll:loadMoreItems
                    }}
                >
                    <MenuItem value={null}></MenuItem>
                    {
                        options.map((option)=>{
                        return (<MenuItem value={option.member_ref}>{`${option.member_ref} ${option.email}`}</MenuItem>)
                        })
                    }
                </Select><FormHelperText className="error">{ error }</FormHelperText></Fragment> : <TextField
                            name={name}
                            variant="outlined"
                            fullWidth
                            disabled={disabled}
                            error={error}
                            value={value}
                            onChange={onChange}
                            type="text"
                            helperText={error}
                            
                            inputProps={{
                                className:className
                            }}
                    />
        }
        
    </Fragment>);
}
export default withTranslation('translation')(MemberSelector);