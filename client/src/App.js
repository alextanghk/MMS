import React from 'react';
import './App.css';
import { withTranslation, Trans } from 'react-i18next';
import Routes from './containers/__Routes';
import './Global';
import Moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import './styles/theme.css';
import { ToastContainer, toast } from 'react-toastify';
Moment.locale('en');

function App() {
  return (
    <div className="App">
      <Routes />
      <ToastContainer />
    </div>
  );
}

export default withTranslation('translation')(App);
