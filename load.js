const cookiePolicy = document.querySelector('.alert');
const cookiePolicyClose = document.querySelector('.close');

function onLoad() { //On page load

    console.log("Cookies on page:",document.cookie);

    cookiePopUp();
    loadTasksFromCookie()
    showSearchBox();
}

//Show cookie message
function cookiePopUp() { 
    (checkCookie('privacyPolicy')) ? cookiePolicy.classList.remove('show') : cookiePolicy.classList.add('show'); 
}

//Close cookie message
cookiePolicyClose.addEventListener('click', e => {
    setCookie('privacyPolicy','Closed',365); //Set preference in cookie
    cookiePolicy.classList.remove('show'); //Close cookie
})

//Load tasks from cookie
function loadTasksFromCookie() {
    console.log("Load previous todo list from cookie?",checkCookie('todoList'));

    //Check cookie exists
    if (checkCookie('todoList')) {

        const taskArray = getCookie('todoList').split(',');
        console.log("Tasks from cookie:", taskArray);

        for (let i=0; i<taskArray.length; i+=2) {
            generateTemplate(taskArray[i], false, false, false, taskArray[i+1]=='true', false);
        }

        newTaskContainer.classList.add('hide');
        updateCaption();
    }
}

//Save tasks to cookie
function updateTaskCookie() {
    let taskArray = [];

    //Loop through list and create array of text content and if starred (true/false)
    Array.from(list.children)
        .forEach((todo) => (taskArray.push(todo.querySelector('.flex-fill').textContent.trim(),todo.classList.contains('starred'))));

    setCookie('todoList',taskArray,365); //Log to cookie (overwrite)
}

function showSearchBox() {
   // if (document.getElementsByClassName("list-group-item").length>0 && document.querySelector('search-filter')) { //If no previous tasks exist, hide search filter
    //    document.querySelector('search-filter').classList.remove('filter-out');
    //}
}

//Get existing cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
//Check if cookie exists
function checkCookie(cname) {
    if (getCookie(cname)=="") {return false;}
    else {return true;}
}  

//Set new cookie
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
