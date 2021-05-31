////  global stuff

//  Game settings:
let spread = -1;
let gametime;

let dogebearmarket;
let dogebullmarket
let dogeChances = 0.5;
let minStockChange = 1;
let maxStockChange = 5;

let influencerBoostChance = 0.02;
let influencerBoost = false;
let influencerTimespan = 6;

//  Added getter and setter with mapped Listeners to update cookies on variable change
//  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#defining_getters_and_setters
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
    balanceChangedListener: function(listener){
      this.balanceListener = listener;
    },
    gameTimeInternal: 0,
    gameTimeListener: function(val) {},
    set gameTime(val) {
      this.gameTimeInternal = val;
      this.gameTimeListener(val);
    },
    get gameTime() {
      return this.gameTimeInternal;
    },
    gameTimeChangedListener: function(listener){
      this.gameTimeListener = listener;
    },

    dogeHoldingInternal: 0,
    dogeHoldingListener: function(val) {},
    set dogeHolding(val) {
      this.dogeHoldingInternal = val;
      this.dogeHoldingListener(val);
    },
    get dogeHolding() {
      return this.dogeHoldingInternal;
    },
    dogeHoldingChangedListener: function(listener){
      this.dogeHoldingListener = listener;
    },

    dogeLabelsInternal: [],
    dogeLabelsListener: function(val) {},
    set dogeLabels(val) {
      //this.dogeLabelsInternal.push(val);
      this.dogeLabelsInternal = val;
      this.dogeLabelsListener(val);
    },
    get dogeLabels() {
      return this.dogeLabelsInternal;
    },    
    dogeLabelsChangedListener: function(listener){
      this.dogeLabelsListener = listener;
    },

    dogeSeriesInternal: [],
    dogeSeriesListener: function(val) {},
    set dogeSeries(val) {
      this.dogeSeriesInternal = val;
      this.dogeSeriesListener(val);
    },
    get dogeSeries() {
      return this.dogeSeriesInternal;
    },
    dogeSeriesChangedListener: function(listener){
      this.dogeSeriesListener = listener;
    },

    activityHistoryInternal: [],
    activityHistoryListener: function(val) {},
    set activityHistory(val) {
      this.activityHistoryInternal = val;
      this.activityHistoryListener(val);
    },
    get activityHistory() {
      return this.activityHistoryInternal;
    },
    activityHistoryChangedListener: function(listener){
      this.activityHistoryListener = listener;
    }
}
//  3 way switch push option
//  Because I'm using properties there is no push option anymore...at least the way I wrote the set function
//  Either write push or set manually. I decided to write the push functions
function PushToDogeLabelArray(pushval){
  let tmp = [];
  if(game.dogeLabels != null){
    tmp = game.dogeLabels;
  }
  tmp.push(pushval);
  game.dogeLabels = tmp;
}
function PushToDogeSeriesArray(pushval){
  let tmp = [];
  if(game.dogeSeries != null){
    tmp = game.dogeSeries;
  }
  tmp.push(pushval);
  game.dogeSeries = tmp;
}
function PushToActivityHistoryArray(pushval){
  let tmp = [];
  if(game.activityHistory != null){
    tmp = game.activityHistory;
  }
  tmp.push(pushval);
  game.activityHistory = tmp;
}


game.balanceChangedListener(function (val) {
  //console.log("called balanced changed function: " + val);
  setCookie("balance", game.balance);    
});
game.gameTimeChangedListener(function (val) {
  //console.log("called balanced changed function: " + val);
  setCookie("gameTime", game.gameTime);    
});
game.dogeHoldingChangedListener(function (val) {
  //console.log("called dogeholding changed function: " + val);
  setCookie("dogeHolding", game.dogeHolding.toString());    
});
game.dogeLabelsChangedListener(function (val) {
  //console.log("called dogeLabels changed function: " + game.dogeLabels);
  //dirty workaround. New loading of the page delcared new dogeLabel array which results in trigger of change event and therefore in new cookie. --> we don't want that
  // if first entry is "trash" don't use it
  if(!isNaN(game.dogeLabels[0])){ 
    setCookie("dogelabels", JSON.stringify(game.dogeLabels));    
  }
});
game.dogeSeriesChangedListener(function (val) {
  //console.log("called dogeSeries changed function: " + val);
  if(!isNaN(game.dogeSeries[0])){
    setCookie("dogeseries", JSON.stringify(game.dogeSeries));    
  }
});
game.activityHistoryChangedListener(function (val) {
  //console.log("called activityHistory changed function: " + game.activityHistory);
  setCookie("activityHistory", JSON.stringify(game.activityHistory));    
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
  //currently not needed anymore
}



//  Interval function that executes every x(5) seconds 
const interval = setInterval(function() {
    if(game.gameTime==0){     
      window.location.replace("./gameend.html");
    }
    //1min into the game: Acitvate Influencer Boost
    if(!influencerBoost && game.gameTime < 540){ InfluencerTweet();}
    else {
      if(influencerTimespan > 0){influencerTimespan--;}
      else{influencerBoost=false; influencerTimespan = 6; minStockChange = 1; maxStockChange = 5;}
    }
    UpdateDogeCoin();
    UpdateUserInfo(); 
    if(game.gameTime == 60){
      md.showCustomNotification("top", "center","warning", "warning_amber","One minute left.");
    }
    if(game.gameTime == 540){
      md.showCustomNotification("top", "center","info", "info","Influencer now starting to tweet.");
    }
    game.gameTime = game.gameTime - 1;
  }, 1000);



//// Button functions
//  Buy Dogecoin
function BuyDogeClicked(){
    //  get amount 
    let amount = document.getElementById("dogeAmount").value;

    //  check if userinput is ok
    tstamount = parseInt(amount); //isNaN  fails for emtpy strings, so converting to int first.
    if(isNaN(tstamount)){
      md.showCustomNotification("top", "center","warning", "warning_amber","Please enter a valid number.");
      return; 
    }
    //  get current price
    let dogeprice  = game.dogeSeries[game.dogeSeries.length -1 ];
    let fee = GetFee(dogeprice, amount); 
    let price = dogeprice * amount + fee;

    //  player can't afford to buy this much
    if(price > game.balance){
      md.showCustomNotification("top", "center", "danger", "block","You can't afford this purchase");
      return;
    }
    game.balance = game.balance - price;
    game.dogeHolding = (parseFloat(game.dogeHolding) + parseFloat(amount)) ;
    PushToActivityHistoryArray(["Buy", amount, "Dogecoin" , dogeprice, Math.round(price*100)/100]);

    //  reset amount display to placeholder
    document.getElementById("dogeAmount").value = "";
    //SendAlert("info", "Dogecoin bought    ", 'Amount: ' + amount + ' | Price: ' + dogeprice + ' | Fee: ' + fee);
    md.showCustomNotification("bottom", "center", "info", "shopping_cart" , 'Dogecoin bought: Amount: ' + amount + ' | Price: ' + dogeprice + ' | Fee: ' + fee + ' | Total: ' + Math.round(price*100)/100);
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
      md.showCustomNotification("top", "center", "warning","warning_amber","Please enter a valid number.");
      document.getElementById("dogeAmount").value = "";
      return; 
    }
    if(amount > game.dogeHolding){
      md.showCustomNotification("top", "center", "danger", "block" ,"You don't own that many.(Available: "+ game.dogeHolding+")");
      return;    
    }
    let dogesellprice  = game.dogeSeries[game.dogeSeries.length -1] + spread;
    let fee = GetFee(dogesellprice, amount); 
    let money = dogesellprice * amount - fee;
    
    game.balance = game.balance + money;
    game.dogeHolding = (parseFloat(game.dogeHolding) - parseFloat(amount)) ;
    PushToActivityHistoryArray(["Sell", amount, "Dogecoin" , dogesellprice, Math.round(money*100)/100]);

    //  reset amount display to placeholder
    document.getElementById("dogeAmount").value = "";
    //Funciton is in mainlogic.js - reuse for profile etc.
    md.showCustomNotification("bottom", "center", "info", "sell" ,'Dogecoin sold: Amount: ' + amount + ' | Price: ' + dogesellprice + ' | Fee: ' + fee + ' | Total: '+ Math.round(money*100)/100);

    //  update userinfo
    UpdateUserInfo();
}

//// Background functions
//  Updates userinformation like balance, holding etc.
//  ToDo: update card color if negativ
function UpdateUserInfo(){
  let profit = Math.round((game.dogeHolding * game.dogeSeries[game.dogeSeries.length -1 ] + game.balance - 50000) /  (50000/100) *100)/100;
  document.getElementById("balanceDisplay").innerHTML = Math.round(game.balance*100)/100 +  "<small>€</small>";
  document.getElementById("holdingdisplay").innerHTML = Math.round(game.dogeHolding*100)/100 + " amt. | " + Math.round((game.dogeHolding * game.dogeSeries[game.dogeSeries.length -1 ])*100)/100 + "  <small>€</small>";
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
  let lastLabel = game.dogeLabels[game.dogeLabels.length -1];    
  //game.dogeLabels = lastLabel +1;
  PushToDogeLabelArray(lastLabel +1);
  //  get last value of series for next equation 
  let lastSeries = game.dogeSeries[game.dogeSeries.length - 1]


  //  Simulate fall/rise of stock
  if(Math.random() < dogeChances){        
      pushVal = lastSeries + GetRandomStockFactor(minStockChange, maxStockChange)
      dogebullmarket++;         
      dogebearmarket = 0;
  }else{
      pushVal = lastSeries - GetRandomStockFactor(minStockChange,maxStockChange);
      dogebearmarket++;
      dogebullmarket = 0;
  }

  //  round values to two dec. Not very stockmarket like, but it's a game
  //  Stock not negative 
  pushVal= Math.round(pushVal*100)/100
  if(pushVal < 0){
    pushVal = 0;
  }
  PushToDogeSeriesArray(pushVal);
  //game.dogeSeries = pushVal;

  //  Bull and Bearmarket check --> has do be done after value was pushed
  let market = "";
  if(!influencerBoost){
    let marketindicator = CheckBullBearMarket(game.dogeSeries) 
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
  }
  else{
    market="[Manipulated]";
  }

  //  Update charts and cookies
  UpdateChart('#dogeCoinChart', 'dogeSuc' ,game.dogeLabels, game.dogeSeries, market);    
  document.getElementById('dogeTitle').innerHTML = "Dogecoin [ " + game.dogeSeries[game.dogeSeries.length -1] + "€ ]"
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
    if(maxVal < 100) {maxVal = 100;}
    let minVal = Math.min.apply(null, gseries) - 50 ;
    if(minVal < 0) {minVal = 0;}

    dataChart = {
      labels: glabels,
      series: [gseries]
    };

    optionsChart = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0.2
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
 * With a probability of "influencerBoostChance" (Default 2%) and with a 50/50 positiv/negativ chance an influencer posts a tweet about dogecoin --> extreme change for next 10 rounds
 */
function InfluencerTweet(){  
  let check = Math.round(Math.random()*100)/100;
  if(check < influencerBoostChance){
    console.log("Is this Musk thing working?");
    console.log(influencerBoostChance+ ">" +check);    
    let isPositiv = false;
    if(Math.random() < 0.5){
      isPositiv = true;
    }
    SendTweet(isPositiv);
  }
}

/**
 * "sends" a negativ or positiv tweet
 * increases chances and value change for next 7 ticks
 */
function SendTweet(isPositiv){
  influencerBoost = true;
  minStockChange = 4;
  maxStockChange = 8;
  let influence = "negative";
  let thumb  = "thumb_down_off_alt";
  if(isPositiv){
    dogeChances = 0.8;
    type = "success";
    influence = "positive" ;
    thumb  = "thumb_up_off_alt";
    
  }else{
    dogeChances = 0.2;
    type = "warning";
  }
  AddNotification('Elon Musk posted a '+influence+ ' tweet about dogecoin');
  md.showCustomNotification("top", "right", type, thumb ,'Elon Musk posted a '+influence+ ' tweet about dogecoin.\nMarkt manipulated for 6 rounds.');
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

    if(getCookie("dogelabels") == null || getCookie("dogeseries") == null || getCookie("balance") == null || getCookie("dogeHolding") == null){
      console.log("One or more cookies were null. Reloading")
      game.dogeLabels = [0];
      game.dogeSeries = [100]; 
      game.balance = 50000; // Default bank balance
      game.dogeHolding = parseFloat(0);
      game.gameTime = 600; //  Game has 10min.
    }
    else{      
      console.log("Cookies found: ");
      console.log("labels: " +getCookie("dogelabels"));
      console.log("values: " + getCookie("dogeseries"));
      console.log("balance: " + getCookie("balance"));
      console.log("Holding: " + getCookie("dogeHolding"));
      var storedDogelbl = JSON.parse(getCookie("dogelabels"));
      var storedDogeVal = JSON.parse(getCookie("dogeseries"));
      var storedHistory = JSON.parse(getCookie("activityHistory"));
      game.dogeLabels = storedDogelbl
      game.dogeSeries = storedDogeVal
      game.activityHistory = storedHistory
 
      game.balance = parseFloat(getCookie("balance"));
      game.gameTime = getCookie("gameTime");
      game.dogeHolding = parseFloat(getCookie("dogeHolding"));      
    }
}