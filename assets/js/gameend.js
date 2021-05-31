
window.addEventListener("load", function(){
    
    //Add event listenesers
        //Change logout to delete all cookies and then navigate to index.html
    $('#btn_logout').click( function(e) {
        e.preventDefault();        
        DeleteAllCookies();
        window.location.replace("./index.html");        
    return false; } );
    $('#btn_restart').click( function(e) {
        e.preventDefault();
        ResetGame();
        window.location.replace("./broker.html");
    return false; } );
    
    CheckHowUserDid();
});



function CheckHowUserDid(){
    let balance = parseFloat(getCookie("balance"));    
    let dogeHolding = parseFloat(getCookie("dogeHolding"));      
    var storedDogeVal = JSON.parse(getCookie("dogeseries"));
    let dogeSeries = storedDogeVal
    //  percentage profit
    let profitPerc = Math.round((dogeHolding * dogeSeries[dogeSeries.length -1 ] + balance - 50000) /  (50000/100) *100)/100;
    //  profit
    let profitMon = Math.round((dogeHolding * dogeSeries[dogeSeries.length -1 ] + balance)*100)/100;

    document.getElementById("balanceDisplay").innerHTML = profitMon +  "<small>€</small>";
    document.getElementById("profitDisplay").innerHTML = profitPerc + "  <small>%</small>";
    if(profitPerc > 0){
      document.getElementById("profitCard").className = "  card-header card-header-success card-header-icon";
      document.getElementById("profitCardSymbol").innerHTML = "trending_up";
    }
    else if( profitPerc < 0){
      document.getElementById("profitCard").className = "  card-header card-header-danger card-header-icon";
      document.getElementById("profitCardSymbol").innerHTML = "trending_down";
  
    }
    else{
      document.getElementById("profitCard").className = "  card-header card-header-warning card-header-icon";
      document.getElementById("profitCardSymbol").innerHTML = "trending_flat";
    }
  
    
}
