var data = "Loading ...";
var test = "test_data";
var latest_rid = false;
var open_tabs = true;
var open_apply = false;
var paused = false;
var windowId = false;
var create_window = true;

chrome.contextMenus.removeAll();
chrome.storage.sync.get({
  open_tabs : true,
  open_apply : false,
  create_window: true,
  url1: "https://www.upwork.com/o/jobs/browse/?sort=relevance%2Bdesc",
}, function(items) {
  open_tabs = items.open_tabs;
  open_apply = items.open_apply;
  create_window = items.create_window;
  chrome.browserAction.onClicked.addListener(function(){
      chrome.tabs.create({ url: items.url1 });
  });
  if (open_tabs)
    itemTitle = "Disable tabs";
  else
    itemTitle = "Enable tabs";
    /*
  var menu2 = chrome.contextMenus.create({
    title: itemTitle,
    contexts: ["browser_action"],
    onclick: function(clickdata, tab) {
        open_tabs = !open_tabs;
        if (open_tabs)
          newTitle = "Disable tabs";
        else
          newTitle = "Enable tabs";
        chrome.contextMenus.update(menu2,{
          title : newTitle
        });
        chrome.storage.sync.set({
          open_tabs : open_tabs
        });
     }
  });
  */
});




function open_tabs_func(url_job,url_apply){
  if (open_apply && url_apply!=undefined){
      if (windowId != false)
        chrome.tabs.create({ windowId:windowId, url: url_apply});
      else
        chrome.tabs.create({ url: url_apply});
  }
  if (windowId != false)
    chrome.tabs.create({ windowId:windowId, url: url_job });
  else
    chrome.tabs.create({ url: url_job });
}


function create_window_func(url_job,url_apply,callback){
  if (open_apply){
    chrome.windows.create({url:url_apply},function(window){
      windowId = window.id;
      open_tabs_func(url_job);
      callback();
    });
  } else {
    chrome.windows.create({url:url_job},function(window){
      windowId = window.id;
      callback();
    });
  }
}

function work_data_func(array,index){

  if (array.length<=index){
    latest_rid = $(array).first().data('rid');
    return false;
  }
  entry = array[index];
  if (latest_rid == false && index>5){
    latest_rid = $(array).first().data('rid');
    return false;
  }
  if (paused)
    return false;
  rid = $(entry).data('rid');
  id =  $(entry).data('key')
  url_job = 'https://upwork.com/jobs/'+id;
  url_apply = 'https://upwork.com/job/'+id+'/apply';
  if (rid>latest_rid){
    if (create_window && windowId != false ){
        chrome.windows.get(windowId, function(window){
           if (chrome.runtime.lastError) {
            create_window_func(url_job,url_apply,function(){ work_data_func(array,index+1) });
           } else {
            open_tabs_func(url_job,url_apply);
            work_data_func(array,index+1);
          }
        });
    } else
        if (create_window && windowId == false ){
          create_window_func(url_job,url_apply,function(){ work_data_func(array,index+1) });
        } else{
          open_tabs_func(url_job,url_apply);
          work_data_func(array,index+1);
        }
  } else {
    latest_rid = $(array).first().data('rid');
    return false;
  }
}



function updateData(link){
      //console.log("Request");
      //console.log(data);
      $.ajax(link)
      .done(function( msg ) {
      //   console.log(data);
         data = $('.oJobResults',msg).parent().html();
         if (!data)
            data = $("#jobs-list",msg).parent().html();
         if (data && open_tabs){
          work_data_func($('article',data),0);

           //console.log(latest_rid);
         }

      //   console.log(data);
        // chrome.browserAction.setBadgeText({text:"1"});
      });
}

function startRequest() {
    chrome.storage.sync.get({
      url1: "https://www.upwork.com/o/jobs/browse/?sort=relevance%2Bdesc",
      period:60
    }, function(items) {
      if (!paused)
        updateData(items.url1);
      timerId = window.setTimeout(startRequest, items.period*1000);
    });
}

function stopRequest() {
    window.clearTimeout(timerId);
}

//console.log(data);
var menu1 = chrome.contextMenus.create({
  title: "Pause requests",
  contexts: ["browser_action"],
  onclick: function(clickdata, tab) {
      paused = !paused;
      if (paused){
        newTitle = "Unpause requests";
      }
      else{
        newTitle = "Pause requests";
      }
      chrome.contextMenus.update(menu1,{
        title : newTitle
      });
   }
});




startRequest();
