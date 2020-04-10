import React, { useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, IconButton, Button, ButtonGroup } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DataTable from '../../components/DataTable';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBox from '../../components/SearchBox';
import Loader from '../../components/Loader';
import moment from 'moment';
const Users = props => {

    const { t, i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [filter,setFilter] = useState("");
    const [paging, setPaging] = useState({
        current: 1,
        pageSize: 5,
        order: "asc",
        orderBy:"user_name",
        total: 0
    })
    
    const columns = [
        { key: "user_group.name", label: t('input_user_group') },
        { key: "zh_name", label: t('input_zh_name') },
        { key: "en_name", label: t('input_en_name') },
        { key: "user_name", label: t('input_user_name') },
        { key: "updated_at", label: t('lb_last_updated'), render: (record, text)=>{ return moment(text).format("YYYY-MM-DD HH:mm");}}
    ];

    const GetData = () => {
        let url = `users?page=${paging.current}&size=${paging.pageSize}&order=${paging.orderBy}&sort=${paging.order}`;
        if (filter != "") url = `${url}&keywords=${filter}`;
        global.Fetch(url)
            .then((result)=>{
                let newPaging = paging;
                newPaging.total = result.count;

                setData(result.data);
                setPaging(newPaging);
            }).catch((err)=>{
                console.log(err);
            })
    }
    useEffect(()=>{
        GetData();
    },[])
    useEffect(()=>{
        GetData();
    },[filter,paging])

    return (<Fragment>
        <Helmet>
            <title>{ `${t("lb_users")} - ${process.env.REACT_APP_TITLE}` }</title>
        </Helmet>
        <Grid>
            <Breadcrumbs
                items={[
                    { label:t("lb_home"), href:"/" },
                    { label:t("lb_users") }
                ]}
            />
            <Card className="content-wrapper">
                <CardContent className="content-body">
                    <Grid container>
                        <Grid item xs={6}>
                            <SearchBox 
                                placeholder={ t('ph_search') }
                                variant="outlined"
                                onSearch={(value)=>{
                                    setFilter(value);
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                startIcon={<AddIcon />}
                                color="primary"
                                variant="contained"
                                className="float-right"
                                href="/users/create"
                            >
                                {t('btn_new')}
                            </Button>
                        </Grid>
                        <Grid xs={12} className="list-table-container">
                            <DataTable
                                dataId="id"
                                columns={ columns }
                                data={ data }
                                paging={ paging }
                                onChangePage={(event, newPage) => {
                                    setPaging({
                                        ...paging,
                                        current: newPage+1
                                    })
                                }}
                                onChangeRowsPerPage={(e) => {
                                    let newSize = e.target.value;
                                    setPaging({
                                        ...paging,
                                        pageSize: newSize
                                    })
                                }}
                                onChangeSort={ (e, property, sort) => {
                                    setPaging({
                                        ...paging,
                                        order: sort,
                                        orderBy: property
                                    })
                                }}
                                rowAction={
                                    (row) => {
                                        return(<Fragment>
                                            <IconButton aria-label="settings" href={`/users/edit/${row.id}`}>
                                                <EditIcon />
                                            </IconButton>
                                        </Fragment>)
                                    }
                                }
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    </Fragment>);
}

export default Users;