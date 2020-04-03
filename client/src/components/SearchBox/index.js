import React, { useState, Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';

const SearchBox = props => {

    const [search, setSearch] = useState("");

    const { onSearch, placeholder = "Search..." } = props;

    const onSearchClick = (e) => {
        onSearch(search);
    }
    return(<TextField
        type='text'
        onChange={(e)=>{ setSearch(e.target.value) }}
        value={search}
        variant="outlined"
        className="search-box"
        onKeyPress={(e)=>{
          if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(search);
          }
        }}
        InputProps={{
            className: "form-input",
            startAdornment: (
              <InputAdornment
                onClick={onSearchClick}
                position="start">
                    <SearchIcon/>
              </InputAdornment>
            ),
          }}
        placeholder={placeholder}
    />);
}
SearchBox.propTypes = {
    onSearch: PropTypes.func.isRequired
};

export default SearchBox;