import React, { Component, useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { withTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import { Grid, Card, CardHeader,CardContent, CardActions, Button } from '@material-ui/core';
import { TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Select, MenuItem } from '@material-ui/core';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

const AccessRights = (props) => {
    const { value, name, onChange } = props;
    const [options, setOptions] = useState({});
    const [selected, setSelected] = useState(value);

    const isSelected = id => selected.indexOf(id) !== -1;

    const GetData = () => {
        let url = `accesses`;
        global.Fetch(url)
            .then((result)=>{
                setOptions(result.data);
            }).catch((err)=>{
                console.log(err);
            })
    }
    const handleOnChecked = (e) => {
        let checked = e.target.checked;
        let value = parseInt(e.target.value);
        const selectedIndex = selected.indexOf(value);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, value);
          } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
          } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
          } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
              selected.slice(0, selectedIndex),
              selected.slice(selectedIndex + 1),
            );
          }
          
          onChange(name,newSelected);
    }
    useEffect(()=>{
        GetData();
    },[])

    useEffect(()=>{
        setSelected(value);
    },[value])

    return(<Fragment>
        {
            _.reduce(options,(result,value,key)=>{
                result.push(<Fragment>
                        {
                            _.reduce(value,(r,v,k)=>{
                                r.push(<FormControl className="form-item" component="fieldset" 
                                        style={{
                                            width: "100%",
                                            marginBottom: "15px",
                                            borderBottom: "1px solid #efefef"
                                        }}
                                    >
                                        <label>{ key }</label>
                                        <Grid container style={{
                                            paddingLeft: "15px"
                                        }}>
                                            <Grid item sm={1} xs={1}>
                                                <label style={{
                                                    lineHeight: "42px"
                                                }}>{ k }</label>
                                            </Grid>
                                            <Grid item sm={11} xs={11}>
                                                <Grid container>
                                                {
                                                    v.map((row)=>{
                                                        const isItemSelected = isSelected(row.id);
                                                        return(<Grid item sm={3} xs={3}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox 
                                                                        checked={isItemSelected} 
                                                                        onChange={handleOnChecked} 
                                                                        value={row.id} 
                                                                    />
                                                                }
                                                                label={ row.displayname }
                                                            />
                                                        </Grid>)
                                                    })
                                                }
                                                </Grid>
                                            </Grid>    
                                        </Grid>
                                </FormControl>);
                                return r;
                            },[])
                        }
                   </Fragment>)
                return result;
            },[])
        }
    </Fragment>);
}
export default withTranslation('translation')(AccessRights);