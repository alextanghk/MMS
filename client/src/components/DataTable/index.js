import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@material-ui/core';
import { lighten, makeStyles } from '@material-ui/core/styles';
import { Checkbox } from '@material-ui/core';
import _ from 'lodash';
const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    container: {
    },
}));
const DataTableHead = props => {
    const { columns, dataId, order, orderBy, onSort, onSelectAll, numSelected, rowCount, rowAction } = props;
    const classes = useStyles();
    const createSortHandler = (property, sort) => event => {
        onSort(event, property, sort);
      };
    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAll}
                        inputProps={{ 'aria-label': 'select all desserts' }}
                    />
                </TableCell>
                {
                    columns.map((col)=>{
                        var columnOrder = orderBy === col.key ? order : "asc";
                        return(<TableCell
                            key={col.key}
                            align={col.align ? col.align: 'left'}
                            sortDirection={orderBy === col.key ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === col.key}
                                direction={columnOrder}
                                onClick={createSortHandler(col.key, columnOrder ==="desc" ? "asc":"desc")}
                                >
                                {col.label}
                                {orderBy === col.key ? (
                                    <span className={classes.visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </span>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>)
                    })
                }
                {
                    rowAction !== undefined && <TableCell align="right">Action</TableCell>
                }
            </TableRow>
        </TableHead>
    );
}

const DataTable = props => {
    const { columns, className, dataId, data, paging, rowAction, onChangePage, onChangeRowsPerPage, onChangeSort } = props;
    const [selected, setSelected] = useState([]);
    const classes = useStyles();
    const isSelected = name => selected.indexOf(name) !== -1;
    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];
    
        if (selectedIndex === -1) {
          newSelected = newSelected.concat(selected, name);
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
    
        setSelected(newSelected);
      };
    const handleChangePage = (event, newPage) => {
        // setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        // setRowsPerPage(parseInt(event.target.value, 10));
        // setPage(0);
    };
    
    return(<Fragment>
        <TableContainer className={classes.container}>
            <Table 
                className={`dataTable ${className === undefined ? '' : className}`}
                aria-labelledby="tableTitle"
                stickyHeader 
            >
                <DataTableHead
                    {...props}
                    order={ paging.order }
                    orderBy={ paging.orderBy }
                    numSelected={ selected.length }
                    rowCount={ data.length }
                    onSelectAll={(e)=>{

                    }}
                    onSort={onChangeSort}
                />
                <TableBody>
                {
                    data.map((row, index)=>{
                        const isItemSelected = isSelected(_.get(row,dataId,''));
                        const labelId = `enhanced-table-checkbox-${index}`;
                        return(
                            <TableRow
                                hover
                                onClick={event => handleClick(event, _.get(row,dataId,''))}
                                role="checkbox"
                                tabIndex={-1}
                                aria-checked={isItemSelected}
                                key={row.name}
                                selected={isItemSelected}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                    checked={isItemSelected}
                                    inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </TableCell>
                                {
                                    columns.map((col)=>{
                                        if (
                                            col.render === undefined
                                            || typeof col.render != "function"
                                        ) {
                                            return (
                                                <TableCell>{ _.get(row,col.key,'') }</TableCell>
                                            )
                                        } else {
                                            return(<TableCell>
                                                { col.render(row, _.get(row,col.key,null))}
                                            </TableCell>)
                                        }
                                        
                                    })
                                }
                                {
                                    rowAction !== undefined && <TableCell align="right">{ rowAction(row) }</TableCell>
                                }
                            </TableRow>
                        )
                    })
                }
                </TableBody>
            </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={paging.total}
          rowsPerPage={paging.pageSize}
        //   SelectProps={paging.pageSize}
          page={paging.current-1}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
    </Fragment>)
}
DataTable.prototype = {
    rowAction: PropTypes.func,
    columns: PropTypes.array.isRequired,
    paging: PropTypes.object.isRequired,
    dataId: PropTypes.string.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeRowsPerPage: PropTypes.func.isRequired,
    onChangeSort: PropTypes.func.isRequired,
    data: PropTypes.array
}
export default DataTable;