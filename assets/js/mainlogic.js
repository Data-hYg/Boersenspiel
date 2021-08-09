/*

Central logic - here are all functions that are useful to all pages

short overview:
  - Cookie stuff based of --> https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
  - Alert/notification handeling
  - Integar check


ToDo:
  - 
*/


 window.addEventListener("load", function(){
    
    //Change logout to delete all cookies and then navigate to index.html
    $('#logout').click( function(e) {
        e.preventDefault();        
        DeleteAllCookies();
        window.location.replace("./index.html");        
        return false; } );
    $('#restart').click( function(e) {
        e.preventDefault();
        ResetGame();
        window.location.replace("./broker.html");
        return false; } );
});




//Creates a cookie with given name and value + how long it is valid. Default = 1 day.
function setCookie(name,value,days=1) {
    let exdate = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        exdate = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + exdate + "; path=/";
}

//get cookie by name
function getCookie(name) {
    let _name = name + "=";
    let ckarray = document.cookie.split(';');
    for(let i=0;i < ckarray.length;i++) {
        let ck = ckarray[i];
        while (ck.charAt(0)==' ') ck = ck.substring(1,ck.length);
        if (ck.indexOf(_name) == 0){
            return ck.substring(_name.length,ck.length);  
        } 
    }
    return null;
}

//delete cookie by name
function deleteCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

//iterate through all cookies and "reset" them
function DeleteAllCookies() {
    let ckarray = document.cookie.split(";");

    for (let i = 0; i < ckarray.length; i++) {
        let cookie = ckarray[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

//Reset game aka. delete all cookies
function ResetGame(){
    deleteCookie("dogelables");
    deleteCookie("dogeValues");
    deleteCookie("dogeHolding");
    deleteCookie("balance");
    deleteCookie("activityHistory");
    deleteCookie("gameTime");
}
/**
 * 
 * Replaced by built in Sendalert function. Kept in case it comes in handy
 * 
 * @param {primary, secondary, success, danger, warning, info, light, dark} type 
 * @param {Strong starting text} header 
 * @param {main information text} text 
 */
function SendAlert(type,header, text){
    document.getElementById("alertbar").innerHTML = '<div class="alert alert-'+type+' alert-dismissible fade show" role="alert">' +
    '<strong>'+header+'</strong> ' + text +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
      '<span aria-hidden="true">&times;</span>' +
    '</button>' +
    '</div>  '

    setTimeout(closeAlert, 10000);
}

function closeAlert(){
    $('.alert').alert('close');
}


/** 
*
* Tests if given value is an integar
* First test if not NaN then test if has modulo
*
**/
function isInt(n){
    return !isNaN(n) && n % 1 === 0;
}

function AddNotification(text){
    let notcounter = 1;
    if(document.getElementById("notificationCounter") != null){
        notcounter = document.getElementById("notificationCounter").innerHTML;
        notcounter ++; 
    }
    document.getElementById("notificationDropDown").innerHTML += '<a class="dropdown-item" id=not"' + notcounter + '" href="javascript:void(0)" onclick="RemoveNotification(this);">'+text+'</a>';
    document.getElementById("notificationCounter").className ='notification';
    document.getElementById("notificationCounter").innerHTML =notcounter;

}

//remove given element --> mainly used for notifications
function RemoveNotification(element){
    element.remove();
}

function RemoveNotificationCount(){
    if(document.getElementById("notificationCounter") != null){
        document.getElementById("notificationCounter").className = "";
        document.getElementById("notificationCounter").innerHTML = "";
    }
    
}