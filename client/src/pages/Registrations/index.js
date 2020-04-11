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
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
const useStyles = makeStyles(theme => ({
    tableContainer: {
      paddingTop: "10px"
    }
}));
const Registrations = props => {

    const { t, i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [filter,setFilter] = useState("");
    const [paging, setPaging] = useState({
        current: 1,
        pageSize: 5,
        order: "asc",
        orderBy:"id",
        total: 0
    })
    
    const columns = [
        { key: "zh_surname", label: t('input_zh_surname') },
        { key: "zh_first_name", label: t('input_zh_first_name') },
        { key: "en_surname", label: t('input_en_surname') },
        { key: "en_first_name", label: t('input_en_first_name') },
        { key: "email", label: t('input_email')  },
        { key: "status", label: t('input_status') },
        { key: "updated_at", label: t('lb_last_updated'), render: (record, text)=>{
            return moment(text).format("YYYY-MM-DD HH:mm");
        } }
    ];

    const GetData = () => {
        let url = `registrations?page=${paging.current}&size=${paging.pageSize}&order=${paging.orderBy}&sort=${paging.order}`;
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
            <title>{ `${t("lb_registrations")} - ${process.env.REACT_APP_TITLE}` }</title>
        </Helmet>
        <Grid>
            <Breadcrumbs
                items={[
                    { label:t("lb_home"), href:"/" },
                    { label:t("lb_registrations") }
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
                                href="/registrations/create"
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
                                            <IconButton aria-label="settings" href={`/registrations/edit/${row.id}`}>
                                            { global.Accessible("PUT_REGISTRATION") ? <EditIcon/> : <VisibilityIcon /> }
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

export default Registrations;