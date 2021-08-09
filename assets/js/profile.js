
/*

Profile class. Loads user profile infos from cookies. 

short overview:
  - Userinfo
  - Pi chart with doge to cash comp.
  - Purchase/Sell History


ToDo:
  - Fix issue when accessing this page before the broker page
  - Fix isse pi chart when doge or cash amount = 0. Also labeling in general doesn't look good
*/


window.addEventListener("load", function(){
    if(getCookie("fullname")==null){
        this.alert("Not logged in. Redirecting to login page.");
        window.location.replace("./index.html");
    }

    UpdateUserInfo();
    BuildHistoryTable();
});


function BuildHistoryTable(){
    var history = JSON.parse(getCookie("activityHistory"));
    console.log(history);
    let tablecontent = "";
    for (let i=history.length -1; i >= 0 ; i--) {
        tablecontent+= '<tr>'
        
        tablecontent+= '<td>'
        tablecontent+=  history[i][0];
        tablecontent+= '</td>'
        tablecontent+= '<td>'
        tablecontent+=  history[i][1];
        tablecontent+= '</td>'
        tablecontent+= '<td>'
        tablecontent+=  history[i][2];
        tablecontent+= '</td>'
        tablecontent+= '<td>'
        tablecontent+=  history[i][3];
        tablecontent+= '</td>'
        tablecontent+= '<td>'
        tablecontent+=  history[i][4];
        tablecontent+= '</td>'

        tablecontent+= '</tr>'
    }
    document.getElementById("ActivityTable").innerHTML = tablecontent;
}


function UpdateUserInfo(){
    let name = getCookie("fullname");
    let mail = getCookie("mail")
    //  I hate dates...always unnecessary complicated
    //  f.e. why does getUTCDay() only return the first digit of a two digit day, but getUTCDate return the DAY?????
    //  https://stackoverflow.com/questions/2013255/how-to-get-year-month-day-from-a-date-object
    let birthday = new Date(getCookie("birthday"));
    let day = birthday.getUTCDate() ; 
    let month = birthday.getUTCMonth() + 1;
    let year = birthday.getUTCFullYear();
    birthday = day + "." + month + "." + year;
    
    let blanace =  Math.round(parseFloat(getCookie("balance"))*100)/100;
    let dogeholding = getCookie("dogeHolding");
    let dogevalue = JSON.parse(getCookie("dogeseries"));

    let dogemoney = Math.round((parseFloat(dogeholding * dogevalue[dogevalue.length - 1]))*100)/100;
    let totalbalance = Math.round((blanace + dogemoney)*100)/100;

    let labels = ["Stock: " + dogemoney + "€", "Cash: " + blanace + "€"];
    let series = [dogemoney, blanace];

    let color = "text-muted";
    if(totalbalance > 50000){
        color="text-success";
    }else if (totalbalance < 50000){
        color="text-danger";
    }
    document.getElementById("namelabel").innerHTML = name;
    document.getElementById("maillabel").innerHTML = mail;
    document.getElementById("birthdaylabel").innerHTML = birthday;


    UpdateBalanceChart(labels,series,"piChartTitle", color , "Total value: " + totalbalance + "€");
}

function UpdateBalanceChart(glabels, gseries, txtID, balanceclass, addInfo="") {

    new Chartist.Pie('.ct-chart', {
        series: gseries,
        labels: glabels

      }, {
        donut: true,
        donutWidth: 60,
        donutSolid: true,
        startAngle: 270,
        showLabel: true,    
        labelOffset: 50,
        labelDirection: 'explode'    
      });
      document.getElementById(txtID).className = balanceclass;
      document.getElementById(txtID).innerHTML = addInfo;
}


