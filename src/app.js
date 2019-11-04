import "./stylesheets/main.css";
import "./stylesheets/animate.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import { greet } from "./hello_world/hello_world";
import env from "env";
console.log(env);

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const Store = require('electron-store');
const schema = {
	nhso: {
		cardNo: '',
		token: ''
	}
};
const store = new Store({schema});

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const osMap = {
  win32: "Windows",
  darwin: "macOS",
  linux: "Linux"
};

var forms = document.getElementById('settingForm');

function animateCSS(element, animationName, callback) {
  const node = document.querySelector(element)
  node.classList.add('animated', 'faster')
  node.classList.add('animated', animationName)

  function handleAnimationEnd() {
      node.classList.remove('animated', animationName)
      node.removeEventListener('animationend', handleAnimationEnd)

      if (typeof callback === 'function') callback()
  }

  node.addEventListener('animationend', handleAnimationEnd)
}

let page0 = document.getElementById('page0');
let page1 = document.getElementById('page1');
let page2 = document.getElementById('page2');
let page3 = document.getElementById('page3');

function goToPage(pageId){
  let page = document.getElementById(pageId);
  animateCSS('#page0','slideOutUp',()=>{
    page0.classList.remove('pageActive');
    page.classList.add('pageActive');
    animateCSS('#'+pageId,'slideInUp');
  });
}

function back(src){
  let page = src.srcElement.dataset.page;
  animateCSS('#'+page,'slideOutDown', () => {
    document.querySelector('#'+page).classList.remove('pageActive');
    page0.classList.add('pageActive');
    animateCSS('#page0','slideInDown');
  });
}

document.getElementById('linkPage1').addEventListener('click', (src)=>{
  goToPage('page1');
});
document.getElementById('linkPage2').addEventListener('click', (src)=>{
  goToPage('page2');
});
document.getElementById('linkPage3').addEventListener('click', (src)=>{
  goToPage('page3');
});

document.getElementById('linkPage4').addEventListener('click', (src)=>{
  animateCSS('#page0','slideOutUp',()=>{
    page0.classList.remove('pageActive');
    page4.classList.add('pageActive');
    animateCSS('#page4','slideInUp');
  });
});

document.getElementById('back1').addEventListener('click', (src)=>{
  back(src);
});
document.getElementById('back2').addEventListener('click', (src)=>{
  back(src);
});
document.getElementById('back3').addEventListener('click', (src)=>{
  back(src);
});



function initForm() {
  let data = store.get('nhso');
  console.log(data);
  if(data === undefined){
    store.set('nhso', {
      cardNo: '',
      token: ''
    });
  } else {
    document.getElementById('txtCardNo').value = data.cardNo;
    document.getElementById('txtToken').value = data.token;
  }
}

forms.addEventListener('submit', event => {
  let cardNo = document.getElementById('txtCardNo').value;
  let token = document.getElementById('txtToken').value;
  store.set('nhso', {
    cardNo: cardNo,
		token: token
  });
  // back to home page
  animateCSS('#page4','slideOutDown', () => {
    document.querySelector('#page4').classList.remove('pageActive');
    page0.classList.add('pageActive');
    animateCSS('#page0','slideInDown');
  });
  event.preventDefault()
})

initForm();


