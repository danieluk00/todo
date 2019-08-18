const addForm = document.querySelector('.add');
const list = document.querySelector('.todo-list');
const del = document.querySelector('.fa-trash');
const search = document.querySelector('.search input');
const title = document.querySelector('.my-title');
const newTaskContainer = document.querySelector('.newtask');
const activeListContainer = document.querySelector('.activelist');

let prevTaskValue="";
let iconsInactive=false;


// Generate HTML template for new task
const generateTemplate = (todo, newBadge, riseAnimation, shakeAnimation, starButton, highlightCheck) => {

    //Specify whether item should be highlighted, starred or have 'Move up' action button
    //const highlightClass = highlight ? `highlight` : "";
    const starredClass = starButton ? `starred` : "";
    const highlightClass = highlightCheck ? `highlight` : "";
    const newClass = newBadge ? `<span class="badge badge-warning">New</span>` : "";
    const moveUpClass = (list.innerHTML.length>20) ? `<i class="far fa-arrow-alt-circle-up move-up" title="Move higher"></i>` : "";
    const riseClass = riseAnimation ? `flipInX animated` : ""; 
    const shakeClass = shakeAnimation ? `rubberBand animated` : ""; 

    removeNewBadge(); //Remove any previous new badges
    
    const html = `
        <li class="list-group-item d-flex justify-content-between align-items-center ${starredClass} ${riseClass} ${shakeClass} ${highlightClass}">
        <i class="icons far fa-star star" title="Mark as important"></i> 
        <span class="flex-fill font-weight-light">${todo}</span>
        ${moveUpClass}
        <i class="far fa-edit edit" title="Edit"></i>
        <i class="far fa-trash-alt delete" title="Delete"></i>
        </li>
    `;

    list.innerHTML += html; //Add template to existing HTML table
    setTimeout(function() {removeAnimations();}, 600); //Remove animation
};


//Add a new task
function addTask(todo) {
    console.log("Adding task:",todo);

    if (todo!="") {
        generateTemplate(todo, true, false, true, false); //Add HTML for new task
        housekeeping();
    }
}

//Delete a task
function deleteTask(item) {
    item.classList.add('animated', 'bounceOutLeft'); //Animate out
    setTimeout(function() {item.remove(); housekeeping();}, 600); //Then pause and delete element
}

//Change order of list
const reorderList = (movedItem) => {

    const myArray = Array.from(list.children); //Create array from current list of tasks
    const indexOfMovedItem = myArray.indexOf(movedItem);
  
    myArray.splice(indexOfMovedItem,1); //Update array with position changes
    myArray.splice(indexOfMovedItem-1,0,movedItem);

    list.innerHTML=`` //Wipe HTML table

    //Iterate new array and create new table (text content, new=FALSE, move animation?, shake=FALSE, starred?, highlight=TRUE)
    for (let i=0; i<myArray.length; i++) {
            generateTemplate(myArray[i].textContent, false, i==indexOfMovedItem-1||i==indexOfMovedItem, false, myArray[i].classList.contains('starred'),i==indexOfMovedItem-1&&!myArray[i].classList.contains('starred'));
    }

    housekeeping();
    setTimeout(function() {removeHighlight();}, 300);  //Remove highlight after delay
}

//------------------------ User actions ------------------------//

//Add new todo task
addForm.addEventListener('submit', e => {
    e.preventDefault();

    let todo=addForm.add.value.trim();
    if (todo!="") {
        shiftAddForm();
        setTimeout(function() {addTask(todo); addForm.date.value=1;},1000);
    }
})

//Action button event listnener
list.addEventListener('click', e => {

    let clickedItem = e.target.parentElement; //Parent item of clicked icon

    if (e.target.classList.contains('delete')) { //Delete button
       deleteTask(clickedItem);
    } else if (e.target.classList.contains('star')) { //Star button
        clickedItem.classList.toggle("starred");
        updateTaskCookie();
    } else if (e.target.classList.contains('edit')) {//Edit button
        editTask(clickedItem);
    } else if (e.target.classList.contains('move-up')) { //Move up button
        reorderList(clickedItem);
    }
})

function errorWobble(item) {
 //   document.querySelector('.save-button').classList.add('animated','shake');
    document.querySelector('.edit-task').classList.add('animated','shake');
    setTimeout(function() {removeAnimations();}, 400);
}

function housekeeping() {

    addForm.add.value=""; //Clear any values in new item form
    iconsInactive=false; //Make icons active again
    updateCaption();
    updateTaskCookie();  //Update caption and cookies
    //showSearchBox() //Show search filter if more than zero tasks

}

function removeAnimations() {

    ['animated','rubberBand','flipInX','shake','bounceOutUp','bounceInUp','bounceOutDown','bounceInDown'].forEach((anim) => {

        Array.from(document.querySelectorAll(anim)).forEach((anim) => {document.querySelector(anim).classList.remove(anim)},)
    })

}


let activeItem; //Edit Task
function editTask(item) {

    document.body.classList.add('disabled');
    item.classList.add('highlight-edit');

    prevTaskValue = item.querySelector('span').innerHTML.trim(); //Remember previous task text
    activeItem = item;
    iconsInactive=true;

    //Show form to edit task
    item.classList.add('animated','rubberBand'); setTimeout(function() {item.classList.remove('animated','rubberBand');}, 350); //Snap, then remove

    item.querySelector('span').innerHTML=`
    <form class="edit-form" autocomplete="off">
    <h6 class="font-weight-light">Edit task...</h5>
    <input class="form-control edit-task enabled" type="text" value="${prevTaskValue}" name="edit">
    <button type="submit" class="btn btn-dark enabled" value="Update">Update</button>
    </form>`;
    const editForm = document.querySelector('.edit-form');

    editForm.addEventListener('submit', e => {
   
        e.preventDefault()
        var text="";
        (e.target.classList.contains('update')) ? text=editForm.edit.value.trim() : text=prevTaskValue;
        if (text!="") {item.querySelector('span').innerHTML=`${text}`;}
        
            item.classList.add('animated','rubberBand'); setTimeout(function() {housekeeping(); removeAnimations;}, 500); //Snap, then remove
        
            item.classList.remove('highlight-edit');
            document.body.classList.remove('disabled');
            editForm.removeEventListener('submit', e);

        })
}

//Remove highlight after delay
function removeHighlight() {
    setTimeout(function() {
        while (document.querySelector('.highlight')!=null) {
        document.querySelector('.highlight').classList.remove('highlight');
        }
    }, 300);
}

//Update number of tasks in caption
function updateCaption() {

    let prevCaption  = title.textContent; //Previous caption
    taskCount = document.getElementsByClassName("list-group-item").length; //Total tasks
    showCount = taskCount - document.getElementsByClassName("filter-out").length; //Total visible

    //If some tasks hidden by search filter
    if (showCount!=taskCount) {title.textContent=`Showing ${showCount} of ${taskCount} tasks`;}
    else if (taskCount==0) {title.textContent=`No tasks to show :(`;}
    else if (taskCount==1) {title.textContent=`1 task`;}
    else {title.textContent=`${taskCount} tasks`;}

}

//Remove 'new' badge
function removeNewBadge() {
    while (document.querySelector('.badge')) {
        document.querySelector('.badge').remove();
    }
}

//Filter todo list by search term
const filterList = (searchTerm) => {

    //Iterate array and add or remove 'filter-out' class
    Array.from(list.children)
        .filter(todo => !todo.textContent.includes(searchTerm))
        .forEach((todo) => todo.classList.add('filter-out'))

    Array.from(list.children)
    .filter(todo => todo.textContent.includes(searchTerm))
    .forEach((todo) => todo.classList.remove('filter-out'))
    
    updateCaption()     //Housekeeping

}

//Listen for search term change
search.addEventListener('keyup', () => {
    const searchTerm = search.value.trim();
    filterList(searchTerm);
}); 


//Listen for click on 'Add task' plus icon -> Shift Up
document.querySelector('.plus-icon').addEventListener('click', e => {
    shiftTaskList();
});

//Listen for click on 'Add task' plus icon -> Shift Down
document.querySelector('.list-icon').addEventListener('click', e => {
    shiftAddForm();
});

function shiftAddForm() {
        newTaskContainer.classList.add('animated','bounceOutDown');
  
    setTimeout(function() {
        newTaskContainer.classList.add('hide'); newTaskContainer.classList.remove('animated','bounceOutDown'); 
        activeListContainer.classList.remove('hide'); activeListContainer.classList.add('animated','bounceInDown');
        setTimeout(function() {removeAnimations()}, 400);
    }, 600);
}

function shiftTaskList() {
    activeListContainer.classList.add('animated','bounceOutUp');
  
    setTimeout(function() {
        activeListContainer.classList.add('hide'); activeListContainer.classList.remove('animated','bounceOutUp'); 
        newTaskContainer.classList.remove('hide'); newTaskContainer.classList.add('animated','bounceInUp');
        setTimeout(function() {removeAnimations(); document.querySelector('.new-task').focus()}, 400);
    }, 600);
}

//Make Add Form submit button inactive if no text
addForm.addEventListener('keyup', () => {
    addForm.add.value.trim()=="" ? document.querySelector(".btn").disabled=true : document.querySelector(".btn").disabled=false;
}); 