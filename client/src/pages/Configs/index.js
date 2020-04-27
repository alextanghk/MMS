import React, { useState, useEffect, Fragment } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardHeader,CardContent, IconButton, Button, ButtonGroup } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DataTable from '../../components/DataTable';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBox from '../../components/SearchBox';
import Loader from '../../components/Loader';
import moment from 'moment';
import { toast } from 'react-toastify';
import { withTranslation, Trans } from 'react-i18next';
const Configs = props => {

    const { t, i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [filter,setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState({
        current: 1,
        pageSize: 5,
        order: "asc",
        orderBy:"display_name",
        total: 0
    })
    
    const columns = [
        { key: "display_name", label: t('input_config_name') },
        { key: "updated_at", label: t('lb_last_updated'), render: (record, text)=>{ return moment(text).format("YYYY-MM-DD HH:mm");}}
    ];

    const GetData = () => {
        const { t, i18n } = props;
        console.log(props);
        let url = `configs?page=${paging.current}&size=${paging.pageSize}&order=${paging.orderBy}&sort=${paging.order}`;
        setLoading(true);
        if (filter != "") url = `${url}&keywords=${filter}`;
        global.Fetch(url)
            .then((result)=>{
                let newPaging = paging;
                newPaging.total = result.count;
                setLoading(false);
                setData(result.data);
                setPaging(newPaging);
            }).catch((err)=>{
                toast.error(t("system_error"), {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    onClose: () => {
                        setLoading(false);
                    }
                });
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
            <title>{ `${t("lb_configs")} - ${process.env.REACT_APP_TITLE}` }</title>
        </Helmet>
        <Grid>
            <Breadcrumbs
                items={[
                    { label:t("lb_home"), href:"/" },
                    { label:t("lb_configs") }
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
                                            <IconButton aria-label="settings" href={`/configs/edit/${row.id}`}>
                                            { global.Accessible("PUT_SYS_CONFIG") ? <EditIcon/> : <VisibilityIcon /> }
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
        { loading && <Loader />}
    </Fragment>);
}

export default withTranslation('translation')(Configs);