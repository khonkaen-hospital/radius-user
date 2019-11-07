import "./stylesheets/main.css";
import "./stylesheets/animate.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import { remote, net } from "electron";
import * as jwt from 'jsonwebtoken';
import jetpack from "fs-jetpack";
import { greet } from "./hello_world/hello_world";
import env from "env";
import * as xmlToJSON from "xmlToJSON";
import * as nhso from "./nhso";
import * as radius from "./radius";



const Store = require('electron-store');
const _generatePassword = require('password-generator');
const axios = require('axios').default;
const moment = require('moment');
const escpos = require('escpos');
const generator = require('generate-password');
const { Reader } = require('@dogrocker/thaismartcardreader')
const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const myReader = new Reader()

const apiUrl = 'http://127.0.0.1:3008';

const store = new Store({
  user: '',
  token: '',
  setting: {
    secretKey: '',
    usernameFormat: 'idcard',
    userType: 'in',
    period: '1days',
    role: 'Visitor-Users',
    remark: '',
    print: true,
    printerIp: ''
  }
});

let IDENTITY = {};
let IDCARD = '';
let USERNAME = '';
let PASSWORD = '';
let EXPRIED = '';
let PRINTER_IP = '10.3.42.77';

var forms = document.getElementById('settingForm');
var txtName = document.getElementById('firstName');
var txtSurname = document.getElementById('lastName');
var txtIdcard = document.getElementById('idcard');

var txtUsername = document.getElementById('txtUsername');
var txtPassword = document.getElementById('txtPassword');
var txtExpired = document.getElementById('txtExpired');
var txtRemark = document.getElementById('txtRemark');

var txtExpiretime = document.getElementById('txtExpiretime');
var txtUsernameFormat = document.getElementsByName('usernameFormat');
var txtInOut = document.getElementsByName('inout');
var txtPrintSlip = document.getElementById('txtPrintSlip');
var txtRole = document.getElementById('txtRole');
var txtSecretKey = document.getElementById('txtSecretKey');
var printerIp = document.getElementById('printerIp');

var loginUsername = document.getElementById('loginUsername');
var loginPassword = document.getElementById('loginPassword');

var btnSave = document.getElementById('btnsave');
var btnSetting = document.getElementById('btnSetting');
var btnLogin = document.getElementById('btnLogin');
var btnLogout = document.getElementById('btnLogout');

var loginPage = document.getElementById('login-page');
var indexPage = document.getElementById('index-page');
var mainPage = document.getElementById('main-page');
var settingPage = document.getElementById('setting-page');
var btnsaveSetting = document.getElementById('btnsaveSetting');

function initSmartCard() {

  myReader.on('device-activated', async (event) => {
    console.log('Device-Activated')
    console.log(event.name)
  })

  myReader.on('error', async (err) => {
    console.log(err)
  })

  myReader.on('image-reading', (percent) => {
    console.log(percent)
  })

  myReader.on('card-removed', (err) => {
    reset();
    console.log('== card remove ==')
  })

  myReader.on('card-inserted', async (person) => {
    let createdByUser = store.get('user');
    const cid = await person.getCid()
    const thName = await person.getNameTH()
    const dob = await person.getDoB()
    console.log(`CitizenID: ${cid}`)
    console.log(`THName: ${thName.prefix} ${thName.firstname} ${thName.lastname}`)
    console.log(`DOB: ${dob.day}/${dob.month}/${dob.year}`);
    txtName.value = thName.prefix + thName.firstname;
    txtSurname.value = thName.lastname;
    txtIdcard.value = cid.substring(0, 10) + '***';
    IDCARD = cid;
    btnSave.disabled = false;
    IDENTITY = {
      fullname: `${thName.prefix}${thName.firstname} ${thName.lastname}`,
      idcard: cid,
      dob: `${dob.day}/${dob.month}/${dob.year}`
    }
    if(isNaN(createdByUser)){
      IDENTITY.createdById = createdByUser.employeeCode;
      IDENTITY.createdByName = `${createdByUser.prename}${createdByUser.fname} ${createdByUser.lname}`;
    }
  })

  myReader.on('device-deactivated', () => { console.log('device-deactivated') })
}

function setRadioChecked(name,value){
  let query = `input[name=${name}][value=${value}]`;
  document.querySelector(query).checked=true;
}

function getRadioVal(radios) {
  var val;
  for (var i = 0, len = radios.length; i < len; i++) {
    if (radios[i].checked) {
      val = radios[i].value;
      break;
    }
  }
  return val;
}

async function login(){
  if(loginUsername.value && loginPassword.value) {
    let data = {
      username: loginUsername.value,
      password: loginPassword.value
    };

    let result = await axios({
      method: 'POST',
      url: `${apiUrl}/login`,
      headers: {
        'Content-Type': 'application/json'
      },
      data:data
    });

    if(result.data.ok == true) {
      store.set('token',result.data.token);
      store.set('user',result.data.data);
      loginPage.style.display = 'none';
      indexPage.style.display = 'block';
    }
  }
}

function logot() {
  store.set('token',null);
  store.set('user',null);
  initApp();
}

function reset() {
  IDENTITY = {};
  IDCARD = '';
  USERNAME = '';
  PASSWORD = '';
  EXPRIED = '';
  txtIdcard.value = '';
  txtName.value = '';
  txtSurname.value = '';
  txtUsername.innerText = '';
  txtPassword.innerText = '';
  txtExpired.innerText = '';
  btnSave.disabled = true;
}

async function createUser() {
  let settingData = store.get('setting');
  let result = '';
  USERNAME = settingData.usernameFormat == 'idcard'
             ? IDCARD
             : 'U' + radius.generateUsername(6, false);
  IDENTITY.remark = settingData.remark || '';

  try {
    result = await radius.createUser(
      USERNAME,
      settingData.role,
      JSON.stringify(IDENTITY),
      settingData.period,
      settingData.userType,
      settingData.print
    );
    txtUsername.innerText = result.username;
    txtPassword.innerText = result.password;
    txtExpired.innerText = result.expired
  } catch (error) {
    alert(error.message);
    console.log(error.message);
  }
}

function initSetting(){
  let data = store.get('setting');
  let token = store.get('token');

  if(data === undefined) {
    store.set('setting', {
      secretKey: '',
      usernameFormat: 'idcard',
      userType: 'in',
      period: '1days',
      role: 'Visitor-Users',
      remark: '',
      print: true,
      printerIp: ''
    });
    data = store.get('setting');
  }

  setRadioChecked('usernameFormat', data.usernameFormat);
  setRadioChecked('inout', data.userType);
  txtExpiretime.value = data.period;
  txtRole.value = data.role;
  txtRemark.value = data.remark;
  txtSecretKey.value = data.secretKey;
  txtPrintSlip.checked = data.print;
  printerIp.value = data.printerIp
}

function saveSetting() {
  let data = {
    secretKey: txtSecretKey.value,
    usernameFormat: getRadioVal(txtUsernameFormat),
    userType: getRadioVal(txtInOut),
    period: txtExpiretime.value,
    role: txtRole.value,
    remark: txtRemark.value,
    print: txtPrintSlip.checked,
    printerIp: printerIp.value
  };
  store.set('setting', data);
}

function verify() {
  let data = store.get('setting');
  let token = store.get('token');
  console.log(token,'=',data.secretKey);
  return new Promise((resolve, reject) => {
    if(token && data.secretKey){
      jwt.verify(token, data.secretKey, (err, decoded) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded)
        }
      });
    } else {
      resolve(false)
    }
  });
}

async function initApp(){
  try {
    let data = await verify();
    initSetting();
    if(data !== false) {
      loginPage.style.display = 'none';
      indexPage.style.display = 'block';
      let token = store.get('token');
      let settingData = store.get('setting');
      radius.setToken(apiUrl,token, settingData.printerIp);
    } else {
      loginPage.style.display = 'block';
      indexPage.style.display = 'none';
    }
    console.log(data);
  } catch (error) {
    loginPage.style.display = 'block';
    indexPage.style.display = 'none';
    console.log(error);
  }


}

btnSave.addEventListener('click', () => {
  createUser();
})
btnsaveSetting.addEventListener('click', () => {
  saveSetting();
  mainPage.style.display = 'block';
  settingPage.style.display = 'none';
})

btnSetting.addEventListener('dblclick', () => {
  mainPage.style.display = 'none';
  settingPage.style.display = 'block';
  initSetting();
})

btnLogin.addEventListener('click', () => {
  login();
});
btnLogout.addEventListener('click', () => {
  logot();
});

initApp();
initSmartCard();


