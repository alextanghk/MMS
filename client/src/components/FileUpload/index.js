import React, { useState, Fragment, useEffect, Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import CancelIcon from '@material-ui/icons/Cancel';
import { makeStyles } from '@material-ui/core/styles';
import { Modal , Paper, Backdrop, Fade } from '@material-ui/core'
import moment from 'moment';
import { FormHelperText } from '@material-ui/core';

const useStyle = makeStyles({
    hidden: {
        display: "none"
    },
    preview: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    uploadContainer: {
        height: "150px",
        width: "200px",
        position: "relative"
    },
    uploadButton: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)"
    },
    uploadPreviewContainer: {
        height: "150px",
        width: "200px",
        zIndex: 1,
        overflow: "hidden",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
    },
    modalPreview: {
        maxHeight: "80vh",
        maxWidth: "80vw"
    },
    uploadRemove: {
        position: "absolute",
        top: "0",
        right: "0",
        transform: "translate(50%, -50%)"
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
})
const FileUpload = props => {

    const [file, setFiles] = useState(null);
    const { name, onChange, icon, deletedField, value } = props;

    const [preview, setPreview] = useState(null);
    const [fileKey, setFileKey] = useState(moment().format("YYYYMMDDHHmmss"));
    const [open, setOpen] = useState(false);
    const classes = useStyle();
    useEffect(()=>{
        setPreview(value);
    },[value])
    const handleChange = (e) => {
        let value = e.target.files[0];
        var reader = new FileReader();
        var url = reader.readAsDataURL(value);
        reader.onloadend = function (e) {
            setPreview(reader.result)
        }.bind(this);
        console.log("on add")
        if (onChange !== undefined && typeof onChange == "function") 
        {
            onChange(name,value);
            if (deletedField !== undefined) setTimeout(()=>{onChange(deletedField,false);},100);
        }
    }

    const handleRemove = (e) => {
        setFiles(null);
        setFileKey(moment().format("YYYYMMDDHHmmss"));
        setPreview(null);
        console.log("on remove")
        if (onChange !== undefined && typeof onChange == "function") 
        {
            onChange(name, null);
            if (deletedField !== undefined) setTimeout(()=>{onChange(deletedField,true);},100);
        }
    }

    const handleClose = () => {
        setOpen(false)
    }
    
    return(<Fragment>
        <input
            accept="image/*"
            id="icon-button-photo"
            onChange={handleChange}
            type="file"
            key={fileKey}
            className={classes.hidden}
        />
        <Paper className={classes.uploadContainer}>
            {
                preview ? <IconButton color="secondary" className={classes.uploadRemove} component="span" onClick={handleRemove}>
                    <CancelIcon />
                </IconButton> : <label htmlFor="icon-button-photo" className={classes.uploadButton}>
                    <IconButton color="primary" component="span">
                        {icon === undefined ? <AddAPhotoIcon /> : <Component component={icon}/>}
                    </IconButton>
                </label>
            }
            {
                preview && <Paper className={classes.uploadPreviewContainer}
                    style={preview ? {
                        backgroundImage: `url(${preview})`
                    } : {}}
                    onClick={(e)=>{
                        setOpen(true);
                    }}
                >
                    
                </Paper>
            }
            <Modal
                open={open}
                onClose={handleClose}
                onBackdropClick={handleClose}
                closeAfterTransition
                className={classes.modal}
                BackdropComponent={Backdrop}
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
            >
                <Fade in={open}>
                    <img src={preview} className={classes.modalPreview}/>
                </Fade>
            </Modal>
        </Paper>
    </Fragment>);
}

export default FileUpload;