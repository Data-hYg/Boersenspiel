/*

Login logic - Checks user input and redirects accordingly

short overview:
    - input check done by HTML5
    - AgeCheck
    - Set initial Cookies 
    - Redirect user to Game or HowTo

ToDo:
  - 
*/



window.addEventListener("load", function(){
    
    //Add event listenesers
    this.document.getElementById("btn_login").addEventListener("click", LoginClicked) 
});


function LoginClicked(){
    let surname = document.getElementById("lastname").value;
    let firstname = document.getElementById("firstname").value;
    let mail = document.getElementById("mail").value;
    let userDate = new Date($('#birthday').val()); 

    if(surname != "" && firstname != "" && mail != "" && userDate != ""){
        //check if user if of legal age
        if(CheckAge(userDate)){
        //User is old enough --> load gamePage  
            //create cookies
            setCookie("fullname", firstname + " " + surname, 7);
            setCookie("mail", mail, 7);
            setCookie("birthday", userDate, 7);
            if(document.getElementById("firstGame").checked){
                window.location.replace("./howto.html");
            }
            else{
                window.location.replace("./broker.html");
            }
        }
        else{
            md.showCustomNotification("top", "center","warning", "warning_amber","Sorry, you're too young to play.");
            //alert("Sorry you're too young to play this game"); 
        }

    }   
    else{
        md.showCustomNotification("top", "center","info", "info","All fields required.");
    }

}



/**
 * Calculating with time in js isn't fun... could have split and checked year then month then day
 * But (I thought) this code is better:
* https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
* 
* Update: Code has an error... talking about "thise code is better"...
* Values in far future result in age > 18 because of the Math abstract. 
*  --> Solution: added date != future 
**/
 function CheckAge(givenDate){
     
    let legal = false;
    
    if(givenDate.getTime() > Date.now()){   return legal; }
    
    let ageDiff = new Date(Date.now() - givenDate.getTime());
    console.log(ageDiff.getUTCFullYear());
    let age = Math.abs(ageDiff.getUTCFullYear() - 1970);
    if ( age >= 18 ){
        legal = true;
    }       
    return legal;
}

