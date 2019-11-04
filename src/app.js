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

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const osMap = {
  win32: "Windows",
  darwin: "macOS",
  linux: "Linux"
};

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

document.getElementById('linkPage1').addEventListener('click', (src)=>{
    animateCSS('#page0','slideOutUp',()=>{
      page0.classList.remove('pageActive');
      page1.classList.add('pageActive');
      animateCSS('#page1','slideInUp');
    });
});
document.getElementById('linkPage2').addEventListener('click', (src)=>{
  animateCSS('#page0','slideOutUp',()=>{
    page0.classList.remove('pageActive');
    page2.classList.add('pageActive');
    animateCSS('#page2','slideInUp');
  });
});
document.getElementById('linkPage3').addEventListener('click', (src)=>{
  animateCSS('#page0','slideOutUp',()=>{
    page0.classList.remove('pageActive');
    page3.classList.add('pageActive');
    animateCSS('#page3','slideInUp');
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

function back(src){
  let page = src.srcElement.dataset.page;
  animateCSS('#'+page,'slideOutDown', () => {
    document.querySelector('#'+page).classList.remove('pageActive');
    page0.classList.add('pageActive');
    animateCSS('#page0','slideInDown');
  });
}
