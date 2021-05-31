////  global stuff
//  User stuff
let balance=0;
let dogeHolding=0;

//  Game settings:
let spread = -1;
let gametime;

//  Doge stuff
let dogelablesValues;
let dogeseriesValues;

let dogebearmarket;
let dogebullmarket
let dogeChances = 0.5;

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#defining_getters_and_setters
game = {
    balanceInternal: 0,
    balanceListener: function(val) {},
    set balance(val) {
      this.balanceInternal = val;
      this.balanceListener(val);
    },
    get balance() {
      return this.balanceInternal;
    },
    registerListener: function(listener){
      this.balanceListener = listener;
    }
}

game.registerListener(function (val) {
  console.log("balance was changed to: " + val);
});

//  On load
window.addEventListener("load", function(){

  //  Add EventListeners
    this.document.getElementById("buyDoge").addEventListener("click", BuyDogeClicked) 
    this.document.getElementById("sellDoge").addEventListener("click", SellDogeClicked) 

    CheckCookies();
    UpdateUserInfo();
    //  UpdateCharts/Info
    UpdateDogeCoin();
});

// On leave
window.onunload = function() {
  //Write cookies
  setCookie("balance", balance);    
  setCookie("dogeHolding", dogeHolding);
  setCookie("dogelables", JSON.stringify(dogelablesValues));
  setCookie("dogeValues", JSON.stringify(dogeseriesValues));
}



//  Interval function that executes every x(5) seconds
const interval = setInterval(function() {
    if(gametime==0){
      alert("game end");
      //Endgame
    }

    UpdateDogeCoin();
    UpdateUserInfo(); 

    gametime--;
  }, 1000);



//// Button functions
//  Buy Dogecoin
function BuyDogeClicked(){
    //  get amount 
    let amount = document.getElementById("dogeAmount").value;

    //  check if userinput is ok
    tstamount = parseInt(amount); //isNaN  fails for emtpy strings, so converting to int first.
    if(isNaN(tstamount)){
      md.showCustomNotification("top", "center", "warning","Please enter a valid number.");
      return; 
    }
    //  get current price
    let dogeprice  = dogeseriesValues[dogeseriesValues.length -1 ];
    let fee = GetFee(dogeprice, amount); 
    let price = dogeprice * amount + fee;

    //  player can't afford to buy this much
    if(price > balance){
      md.showCustomNotification("top", "center", "danger","You can't afford this purchase");
      return;
    }
    balance = balance - price;
    game.balance = balance - price;
    dogeHolding = (parseFloat(dogeHolding) + parseFloat(amount)) ;
    //  reset amount display to placeholder
    document.getElementById("dogeAmount").value = "";
    //SendAlert("info", "Dogecoin bought    ", 'Amount: ' + amount + ' | Price: ' + dogeprice + ' | Fee: ' + fee);
    md.showCustomNotification("bottom", "center", "info", 'Dogecoin bought: Amount: ' + amount + ' | Price: ' + dogeprice + ' | Fee: ' + fee);
    //  update userinfo
    UpdateUserInfo();
}


// Sell Dogecoin
function SellDogeClicked(){
    // get amount 
    let amount = document.getElementById("dogeAmount").value;
    //  check if userinput is ok
    tstamount = parseInt(amount); //isNaN  fails for emtpy strings, so converting to int first.
    if(isNaN(tstamount)){
      md.showCustomNotification("top", "center", "warning","Please enter a valid number.");
      return; 
    }
    if(amount > dogeHolding){
      md.showCustomNotification("top", "center", "danger","You don't own that many.(Available. + "+dogeHolding+")");
      return;    
    }
    let dogesellprice  = dogeseriesValues[dogeseriesValues.length -1] + spread;
    let fee = GetFee(dogesellprice, amount); 
    let money = dogesellprice * amount - fee;
    
    balance = balance + money;
    dogeHolding = (parseFloat(dogeHolding) - parseFloat(amount)) ;
  
    //  reset amount display to placeholder
    document.getElementById("dogeAmount").value = "";
    //Funciton is in mainlogic.js - reuse for profile etc.
    md.showCustomNotification("bottom", "center", "info", 'Dogecoin sold: Amount: ' + amount + ' | Price: ' + dogesellprice + ' | Fee: ' + fee);

    //  update userinfo
    UpdateUserInfo();
}

//// Background functions
//  Updates userinformation like balance, holding etc.
//  ToDo: update card color if negativ
function UpdateUserInfo(){
  let profit = Math.round((dogeHolding * dogeseriesValues[dogeseriesValues.length -1 ] + balance - 50000) /  (50000/100) *100)/100;
  document.getElementById("balanceDisplay").innerHTML = Math.round(balance*100)/100 +  "<small>€</small>";
  document.getElementById("holdingdisplay").innerHTML = Math.round(dogeHolding*100)/100 + " amt. | " + Math.round((dogeHolding * dogeseriesValues[dogeseriesValues.length -1 ])*100)/100 + "  <small>€</small>";
  document.getElementById("profitDisplay").innerHTML = profit + "  <small>%</small>";
  if(profit > 0){
    document.getElementById("profitCard").className = "  card-header card-header-success card-header-icon";
    document.getElementById("profitCardSymbol").innerHTML = "trending_up";
  }
  else if( profit < 0){
    document.getElementById("profitCard").className = "  card-header card-header-danger card-header-icon";
    document.getElementById("profitCardSymbol").innerHTML = "trending_down";

  }
  else{
    document.getElementById("profitCard").className = "  card-header card-header-warning card-header-icon";
    document.getElementById("profitCardSymbol").innerHTML = "trending_flat";
  }


}

//  Updates dogecoin with requirements given by task
function UpdateDogeCoin(){
  //  get last label and add + 1 
  let lastLabel = dogelablesValues[dogelablesValues.length -1]    
  dogelablesValues.push(lastLabel +1 );

  //  get last value of series for next equation 
  let lastSeries = dogeseriesValues[dogeseriesValues.length - 1]


  //  Simulate fall/rise of stock
  if(Math.random() < dogeChances){        
      pushVal = lastSeries + GetRandomStockFactor(1,5)
      dogebullmarket++;         
      dogebearmarket = 0;
  }else{
      pushVal = lastSeries - GetRandomStockFactor(1,5);
      dogebearmarket++;
      dogebullmarket = 0;
  }

  //  round values. Not very stockmarket like, but it's a game
  pushVal= Math.round(pushVal*100)/100
  dogeseriesValues.push(pushVal);

  //  Bull and Bearmarket check --> has do be done after value was pushed
  let market = "";
  let marketindicator = CheckBullBearMarket(dogeseriesValues)
  if(marketindicator == 1){
      //  bull - is rising
      market="[Bullmarket]";
      dogeChances = 0.75;
  }
  else if (marketindicator == -1){
      //  bear - is falling
      market="[Bearmarket]";
      dogeChances = 0.25;
  }
  else{
    dogeChances = 0.5;
  }

  //  Update charts and cookies
  UpdateChart('#dogeCoinChart', 'dogeSuc' ,dogelablesValues, dogeseriesValues, market);    
  document.getElementById('dogeTitle').innerHTML = "Dogecoin [ " + dogeseriesValues[dogeseriesValues.length -1] + "€ ]"
}

function UpdateChart(chartname, txtID , glabels, gseries, addInfo="") {
    //  Calc change before array is sliced.
    let changeVal = Math.round((gseries[gseries.length-1] - gseries[0]) / (gseries[0]/100) *100) /100;    

    //  isplay only lates 30 entries of series.     
    if(gseries.length > 30 ){
      glabels = glabels.slice(glabels.length -30);
        gseries = gseries.slice(gseries.length -30);
    }  
    //  get min and max values to dynamically adapt min and max of chart
    // minVal not used. Unsure what looks better. 
    let maxVal = Math.max.apply(null, gseries) + 20;
    let minVal = Math.min.apply(null, gseries) - 50 ;
    if(minVal < 0) {minVal = 0;}

    dataChart = {
      labels: glabels,
      series: [gseries]
    };

    optionsChart = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0
      }),
      low: 0 ,
      high: maxVal, 
      chartPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
    }

    //  Check if val is rising/falling to adapt text & arrow
    let arrow;
    if(changeVal > 0 ){
      document.getElementById(txtID).className ="text-success";
      arrow = '<i class="fa fa-long-arrow-up"></i>'
    }
    else if (changeVal == 0){
      document.getElementById(txtID).className ="text-warning";
      arrow = '<i class="fa fa-long-arrow-left"></i>'  
    }
    else{
      document.getElementById(txtID).className ="text-danger";
      arrow = '<i class="fa fa-long-arrow-down"></i>'
    }
    document.getElementById(txtID).innerHTML = addInfo + " " + arrow +  changeVal + '%';
    var chart = new Chartist.Line(chartname, dataChart, optionsChart);
}

/**
 * 
 * @param {min value} min 
 * @param {max value} max 
 * @returns random value between min and max
 */
function GetRandomStockFactor(min, max){
    let x = 0;
    x = Math.random() * (max-min) + min;
    return x;
}

/**
 * 
 * @param {*} price 
 * @param {*} amount 
 * @returns fee for buying/selling stocks
 */
function GetFee(price, amount){
  let fee = 4.95; 
  if(price * amount * 0.0025 + fee < 9.99 ){
    fee = 9.99;
  }
  else if (price * amount * 0.0025 + fee > 59.99 ){
    fee = 59.99;
  }
  else{
    fee = price * amount * 0.0025 + fee;
  }
  return fee;
}

/**
 * checks last 4 entries of array and determins current market 
 * Not a pretty solution, but it works
 * Improvement option: add loop and make "last 4 entries" a parameter for the loop --> easier to change market indicator
 * @param {*} valueArr 
 * @returns -1 = bear | 0 = nothing | 1 = bull
 */
function CheckBullBearMarket(valueArr){
    let res = 0;
    //  enough data?
    if(valueArr.length > 3){
        let four = valueArr[valueArr.length - 4];
        let three = valueArr[valueArr.length - 3];
        let two = valueArr[valueArr.length - 2];
        let one = valueArr[valueArr.length - 1];

        if(four > three && three > two && two > one ){
            res = -1; //- falling - Bear
        }
        else if(four < three &&three < two && two < one){
            res = 1; // - rising - Bull
        }
    }
    return res; 
}

/**
 * Checks available cookies
 * IF no name --> age check required. --> redirect to Login
 * If there are non --> new game
 * If all available -->  proceed game
 */
function CheckCookies(){
  
   //  Add EventListeners
   if(getCookie("fullname")==null){
        this.alert("Not logged in. Redirecting to login page.");
        DeleteAllCookies();
        window.location.replace("./index.html");
    }

    if(getCookie("dogelables") == null || getCookie("dogeValues") == null || getCookie("balance") == null || getCookie("dogeHolding") == null){
      console.log("One or more cookies were null. Reloading")
      dogelablesValues = [0];
      dogeseriesValues = [100]; 
      balance = 50000; // Default bank balance
      dogeHolding = 0;
      gametime = 600; //  Game has 10min.
    }
    else{      
      console.log("Cookies found: ");
      console.log("labels: " +getCookie("dogelables"));
      console.log("values: " + getCookie("dogeValues"));
      console.log("balance: " + getCookie("balance"));
      console.log("Holding: " + getCookie("dogeHolding"));
      var storedDogelbl = JSON.parse(getCookie("dogelables"));
      var storedDogeVal = JSON.parse(getCookie("dogeValues"));
      dogelablesValues = storedDogelbl
      dogeseriesValues = storedDogeVal
      balance = parseFloat(getCookie("balance"));      
      dogeHolding = parseFloat(getCookie("dogeHolding"));      
    }
}