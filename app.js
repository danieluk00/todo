const addForm = document.querySelector('.add');
const list = document.querySelector('.todo-list');
const search = document.querySelector('.search input');
const title = document.querySelector('.my-title');
const card = document.querySelector('.card');
const wrapper = document.querySelector('.wrapper');
const editCard = document.querySelector('.editcard');
const editForm = document.querySelector('.editform');

let prevTaskValue="";
let iconsInactive=false;

// Generate HTML template for new task
const generateTemplate = (todo, newBadge, riseAnimation, shakeAnimation, starButton, highlightCheck) => {

    //Specify whether item should be highlighted, starred or have 'Move up' action button
    const starredClass = starButton ? `starred` : "";
    const starFilled = starButton ? `fas fa-star` : `far fa-star`;
    const highlightClass = highlightCheck ? `highlight` : "";
    const moveUpClass = (list.innerHTML.length>20) ? `<i class="far fa-arrow-alt-circle-up move-up" title="Move higher"></i>` : "";
    const shakeClass = shakeAnimation ? `rubberBand animated` : ""; 
    var riseClass = "";

    if (riseAnimation=="Rise") {
        riseClass = `fadeInUp animated`;
    } else if (riseAnimation=="Fall") {
        riseClass = `fadeInDown animated`;
    } else {
        riseClass = "";
    }
    
    console.log(starFilled);

    const html = `
        <li class="list-group-item d-flex justify-content-between align-items-center ${starredClass} ${riseClass} ${shakeClass} ${highlightClass}">
            <i class="icons ${starFilled} star" title="Mark as important"></i> 
            <span class="flex-fill font-weight-light">${todo}</span>
            ${moveUpClass}
            <i class="far fa-edit edit" title="Edit"></i>
            <i class="far fa-trash-alt delete" title="Delete"></i>
        </li>
    `;

    list.innerHTML += html; //Add template to existing HTML table
};

//Add task - user submits new task form
addForm.addEventListener('submit', e => {
    e.preventDefault();

    let todo=addForm.add.value.trim();
    if (todo!="") {
        generateTemplate(todo, true, false, true, false);
        housekeeping();
        setTimeout(function() {
            removeAnimations()
        }, 500); //Remove animations
    }
})

//Delete a task
function deleteTask(item) {
    item.classList.add('animated', 'bounceOutLeft'); //Animate out
    setTimeout(function() {item.remove(); housekeeping()}, 600); //Then pause and delete element
}

function starTask(item) {
    item.classList.toggle("starred");

    item.classList.add("pulse","animated");
    setTimeout(function(){ item.classList.remove("pulse","animated");; }, 800);

    item.children[0].classList.add("flip","animated");
    setTimeout(function(){ item.children[0].classList.remove("flip","animated"); }, 800);

    if (item.children[0].classList.contains('fas')) {
        item.children[0].classList.remove('fas');
        item.children[0].classList.add('far');

    } else {
        item.children[0].classList.remove('far');
        item.children[0].classList.add('fas');
    }

    updateTaskCookie();
}

//Reorder list
const reorderList = (movedItem) => {

    const myArray = Array.from(list.children); //Create array from current list of tasks
    const indexOfMovedItem = myArray.indexOf(movedItem);
  
    //Update array with position changes
    myArray.splice(indexOfMovedItem,1);
    myArray.splice(indexOfMovedItem-1,0,movedItem);

    list.innerHTML=``//Wipe HTML table

    for (let i=0; i<myArray.length; i++) { //Iterate new array and create new table (text content, new=FALSE, move animation?, shake=FALSE, starred?, highlight=FALSE)
            generateTemplate(myArray[i].textContent, false, moveAnimationCheck(i,indexOfMovedItem), false, myArray[i].classList.contains('starred'),false);
    }

    housekeeping();
    setTimeout(function() {removeAnimations()}, 600);  //Remove animations after delay
}

//If index matches the two items being swapped, set parameter for animation
moveAnimationCheck = (i,indexOfMovedItem) => {
    if (i==indexOfMovedItem) {
        return "Fall";
    } else if (i==indexOfMovedItem-1) {
        return "Rise";
    } else {
        return false;
    }
}

//Action button event listnener (task icons)
list.addEventListener('click', e => {

    let clickedItem = e.target.parentElement; //Parent item of clicked icon

    if (e.target.classList.contains('delete')) {deleteTask(clickedItem)} //Delete button
    else if (e.target.classList.contains('star')) {starTask(clickedItem)} //Star button
    else if (e.target.classList.contains('edit')) {editTask(clickedItem)} //Edit button
    else if (e.target.classList.contains('move-up')) {reorderList(clickedItem)} //Move up button
})

function errorWobble(item) {
 //   document.querySelector('.save-button').classList.add('animated','shake');
    document.querySelector('.edit-task').classList.add('animated','shake');
    setTimeout(function() {removeAnimations();}, 400);
}

function housekeeping() {
    addForm.add.value=""; //Clear any values in new item form
    iconsInactive=false; //Make icons active again
    updateCaption(); //Display number of visible tasks
    updateTaskCookie();  //Update caption and cookies
}

function removeAnimations() {
    console.log("Removing animations");
    ['animated','rubberBand','flipInX','shake','bounceOutUp','bounceInUp','bounceOutDown','bounceInDown','flipOutX','fadeInUp','fadeInDown'].forEach((anim) => {
        while (document.querySelector('.'+anim)) {
            document.querySelector('.'+anim).classList.remove(anim);
        }
    })
}

let activeItem; //Edit Task
function editTask(item) {

    prevTaskValue = item.querySelector('span').innerHTML.trim(); //Remember previous task text
    activeItem = item;

    wrapper.classList.add('disabled'); //Disabled rest of page
    animateEditCard("In"); //Show edit card
    editForm.edit.focus(); //Bring into focus
    editForm.edit.value=prevTaskValue; //Populate text field

    editForm.addEventListener('submit', e  => { //Submit event

        e.preventDefault()
        wrapper.classList.remove('disabled');
   
        text=editForm.edit.value.trim() //Get text from form

        if (text!="") {
            activeItem.querySelector('span').innerHTML=`${text}`;
        }
        
        animateEditCard("Out"); // Animate save
        wrapper.classList.remove('disabled'); 

    })
}

function animateEditCard(direction) {

    if (direction=="In") {

        editCard.classList.remove('hidden');
        editCard.classList.add('animated','rubberBand');
        setTimeout(function() {
            editCard.classList.remove('animated','rubberBand');
        }, 1000); //Snap, then removes

    } else if (direction=="Out") {

        editCard.classList.add('animated','zoomOut');
        setTimeout(function() {
            editCard.classList.remove('animated','zoomOut');
            editCard.classList.add('hidden');
        }, 1000); //Snap, then removess
    }
}

//Update number of tasks in caption
function updateCaption() {

    let prevCaption  = title.textContent; //Previous caption
    taskCount = document.getElementsByClassName("list-group-item").length; //Total tasks
    showCount = taskCount - document.getElementsByClassName("filter-out").length; //Total visible

    //If some tasks hidden by search filter
    if (showCount!=taskCount) {title.textContent=`Showing ${showCount} of ${taskCount} tasks`}
    else if (taskCount==0) {title.textContent=`No tasks to show :(`}
    else if (taskCount==1) {title.textContent=`1 task`}
    else {title.textContent=`${taskCount} tasks`}

    if (prevCaption != title.textContent) {
        title.classList.add('pulse', 'animated');
        setTimeout(function() { title.classList.remove('pulse', 'animated'); }, 1000); 
    }

}

//Listen for search term change
search.addEventListener('keyup', () => {
    const searchTerm = search.value.trim();
    filterList(searchTerm);
});

//Filter todo list by search term
const filterList = (searchTerm) => {

    //Iterate array and add or remove 'filter-out' class
    Array.from(list.children)
        .filter(todo => !todo.textContent.toLowerCase().includes(searchTerm.toLowerCase()))
        .forEach((todo) => todo.classList.add('filter-out'))

    Array.from(list.children)
        .filter(todo => todo.textContent.toLowerCase().includes(searchTerm.toLowerCase()))
        .forEach((todo) => todo.classList.remove('filter-out'))
        
    updateCaption()
}

//Make Add Form submit button action/inactive if text entered
addForm.addEventListener('keyup', () => {
    addForm.add.value.trim()=="" ? document.querySelector(".btn").disabled=true : document.querySelector(".btn").disabled=false;
}); 

editForm.addEventListener('keyup', () => {
    editForm.edit.value.trim()=="" ? document.querySelector(".update-btn").disabled=true : document.querySelector(".update-btn").disabled=false;
}); 