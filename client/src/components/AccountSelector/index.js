import React, { Component, useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem } from '@material-ui/core';
import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

const AccountSelector = (props) => {
    const { name, value, onChange, required, className="" } = props;
    const [options, setOptions] = useState([]);

    const [paging, setPaging] = useState({
        current: 1,
        pageSize: 50
    }); 

    const GetData = () => {
        let url = `accounts?page=${paging.current}&size=${paging.pageSize}&order=bank&sort=asc`;
        // if (filter != "") url = `${url}&keywords=${filter}`;
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
    },[])

    return(<Fragment>
        <Select
            variant="outlined"
            fullWidth
            className={className}
            name={name}
            value={value}
            onChange={onChange}
            MenuProps={{
                onScroll:loadMoreItems
            }}
        >
            <MenuItem value={null}></MenuItem>
            {
                options.map((option)=>{
                    return (<MenuItem value={option.id}>{option.bank}</MenuItem>)
                })
            }
        </Select>
    </Fragment>);
}
export default withTranslation('translation')(AccountSelector);