class Framework {
  frameworkLogsEnabled = true;
  pushedScriptContents = [];
  selectors = {};

  navigateTo(event, path, pageName) {
    event.preventDefault();
    this.fetchPage(pageName);
    history.pushState({ page: path }, null, `/${path}`);
  }
  async fetchPage(pageName) {
    try {
      const response = await fetch(`${pageName}`);
      const content = await response.text();
      document.querySelector('router-outlet').innerHTML = content;
    } catch (error) {
      console.error('Error loading page:', error);
    }
  }
  processRoutes() {
    let routerOutlets = document.querySelectorAll("router-outlet");
    if (routerOutlets && routerOutlets.length > 0) {
      for (let roIndex in routerOutlets) {
        let routerOutlet = routerOutlets[roIndex];
        this.processRouterOutlet(routerOutlet);
      }
    }
  }

  addSelector(selector,classRef) {
    this.selectors[selector] = classRef;
    this.log(this.selectors);
    console.log(new this.selectors[selector]);
  }

  processRouterOutlet(routerOutlet) {
    if (typeof routerOutlet != 'object') {
      return;
    }
    let routes = routerOutlet.getAttribute("routes");
    if (routes) {
      routes = routes.split("\r").join("").split("\n").join("");
      this.log("routes", routes);
      routes = JSON.parse(routes);
      for (let route in routes) {
        let template = routes[route];
        if (route && template && template.indexOf(".html") > -1) {
          let aTags = document.querySelectorAll("a[routerLink='" + route + "']");
          for (let aIndx in aTags) {
            let aTag = aTags[aIndx];
            if (aTag && typeof aTag == 'object') {
              this.log("aTag", typeof aTag);
              aTag.addEventListener("click", (event) => {
                this.navigateTo(event, route, template);
              });
            }
          }
        }
      }
    }
  }

  log(a, b) {
    if (this.frameworkLogsEnabled) {
      console.log(a, b);
    }
  }

  startProcessingIfs() {
    setInterval(() => {
      this.processIfs();
    }, 100);
  }

  processIfs() {
    let ifs = document.querySelectorAll("[if]");
    if (ifs && ifs.length > 0) {
      //log("ifs",ifs);
      for (let ifsIndx in ifs) {
        let ifsIns = ifs[ifsIndx];
        if (ifsIns && typeof ifsIns == 'object') {
          let jsStr = ifsIns.getAttribute("if");
          try {
            if (eval(jsStr)) {
              ifsIns.style.display = "block";
            } else {
              ifsIns.style.display = "none";
            }
          } catch (e) {
  
          }
        }
      }
    }
  }

  startProcessingScriptTags() {
    setInterval(() => {
      this.processScriptTags();
    }, 100);
  }

  processScriptTags() {
    let routerOutlets = document.querySelectorAll('router-outlet');
    //this.log("processScriptTags routerOutlets",routerOutlets);
    if (routerOutlets && routerOutlets.length > 0)
      for (let roIndx in routerOutlets) {
        let routerOutlet = routerOutlets[roIndx];
        //this.log("processScriptTags routerOutlet",routerOutlet);
        if (routerOutlet && typeof routerOutlet == 'object') {
          let scriptTags = routerOutlet.querySelectorAll("script");
          if (scriptTags && scriptTags.length > 0) {
            for (let scriptTagIndx in scriptTags) {
              let scriptTag = scriptTags[scriptTagIndx];
              if (scriptTag && typeof scriptTag == 'object') {
                let scriptContent = scriptTag.innerText;
                //this.log("scriptContent",scriptContent);
                if (scriptContent) {
                  if (this.pushedScriptContents.indexOf(scriptContent) == -1) {
                    routerOutlet.removeChild(scriptTag);
                    this.pushedScriptContents.push(scriptContent);
                    let ADD_SEL_TOKEN = "framework.addSelector(";
                    if(scriptContent.indexOf(ADD_SEL_TOKEN)>-1) {
                      let selectorInfo = scriptContent.substring(scriptContent.indexOf(ADD_SEL_TOKEN)+ADD_SEL_TOKEN.length);
                      selectorInfo = selectorInfo.substring(0,selectorInfo.indexOf(")"));
                      selectorInfo = selectorInfo.split(",");
                      if(selectorInfo.length==2) {
                        scriptContent+="let "+selectorInfo[0].split("'").join("").split("\"").join("").trim()+" = new " + selectorInfo[1]+"();//injected";
                      }
                    }
                    this.log("added script", scriptContent);
                    let script = document.createElement("script");
                    script.innerHTML = scriptContent;
                    document.body.appendChild(script);
                  } else {
                    routerOutlet.removeChild(scriptTag);
                    this.log("skipped script as it already there in body", scriptContent);
                  }
                }
              }
            }
          }
        }
      }
  }

  main() {
    this.processRoutes();
    this.startProcessingIfs();
    this.startProcessingScriptTags();
  }
}

let framework = new Framework();
framework.main();

window.onpopstate = function (event) {
  if (event.state && event.state.page) {
    framework.fetchPage(event.state.page);
  }
};