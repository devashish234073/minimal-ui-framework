function navigateTo(event,path,pageName) {
    event.preventDefault();
    fetchPage(pageName);
    history.pushState({ page: path }, null, `/${path}`);
  }

  window.onpopstate = function(event) {
    if (event.state && event.state.page) {
      fetchPage(event.state.page);
    }
  };

  async function fetchPage(pageName) {
    try {
      const response = await fetch(`${pageName}`);
      const content = await response.text();
      document.querySelector('router-outlet').innerHTML = content;
    } catch (error) {
      console.error('Error loading page:', error);
    }
  }

  function processRoutes() {
    let routerOutlets = document.querySelectorAll("router-outlet");
    if(routerOutlets && routerOutlets.length>0) {
        for(let roIndex in routerOutlets) {
            let routerOutlet = routerOutlets[roIndex];
            processRouterOutlet(routerOutlet);
        }
    }
  }

  function processRouterOutlet(routerOutlet) {
    if(typeof routerOutlet != 'object') {
        return;
    }
    let routes = routerOutlet.getAttribute("routes");
    if(routes) {
        routes = routes.split("\r").join("").split("\n").join("");
        log("routes",routes);
        routes = JSON.parse(routes);
        for(let route in routes) {
            let template = routes[route];
            if(route && template && template.indexOf(".html")>-1) {
                let aTags = document.querySelectorAll("a[routerLink='"+route+"']");
                for(let aIndx in aTags) {
                    let aTag = aTags[aIndx];
                    if(aTag && typeof aTag == 'object') {
                        log("aTag",typeof aTag);
                        aTag.addEventListener("click",(event)=>{
                            navigateTo(event,route,template);
                        });
                    }
                }
            }
        }
    }
  }

  let frameworkLogsEnabled = true;
  function log(a,b) {
    if(frameworkLogsEnabled) {
        console.log(a,b);
    }
  }

  function startProcessingIfs() {
    setInterval(()=>{
      processIfs();
    },100);
  }

  function processIfs() {
    let ifs = document.querySelectorAll("[if]");
    if(ifs && ifs.length>0) {
      //log("ifs",ifs);
      for(let ifsIndx in ifs) {
        let ifsIns = ifs[ifsIndx];
        if(ifsIns && typeof ifsIns == 'object') {
          let jsStr = ifsIns.getAttribute("if");
          try {
            if(eval(jsStr)) {
              ifsIns.style.display = "block";
            } else {
              ifsIns.style.display = "none";
            }
          } catch(e) {

          }
        }
      }
    }
  }

  function startProcessingScriptTags() {
    setInterval(()=>{
      processScriptTags();
    },100);
  }

  let pushedScriptContents = [];

  function processScriptTags() {
    let routerOutlets = document.querySelectorAll('router-outlet');
    //log("processScriptTags routerOutlets",routerOutlets);
    if(routerOutlets && routerOutlets.length>0)
    for(let roIndx in routerOutlets) {
      let routerOutlet = routerOutlets[roIndx];
      //log("processScriptTags routerOutlet",routerOutlet);
      if(routerOutlet && typeof routerOutlet == 'object') {
        let scriptTags = routerOutlet.querySelectorAll("script");
        if(scriptTags && scriptTags.length>0) {
          for(let scriptTagIndx in scriptTags) {
            let scriptTag = scriptTags[scriptTagIndx];
            if(scriptTag && typeof scriptTag =='object') {
              let scriptContent = scriptTag.innerText;
              //log("scriptContent",scriptContent);
              if(scriptContent) {
                if(pushedScriptContents.indexOf(scriptContent)==-1) {
                  let script = document.createElement("script");
                  script.innerHTML = scriptContent;
                  document.body.appendChild(script);
                  routerOutlet.removeChild(scriptTag);
                  pushedScriptContents.push(scriptContent);
                  log("added script",scriptContent);
                } else {
                  routerOutlet.removeChild(scriptTag);
                  log("skipped script as it already there in body",scriptContent);
                }
              }
            }
          }
        }
      }
    }
  }

  function main() {
    processRoutes();
    startProcessingIfs();
    startProcessingScriptTags();
  }

  main();