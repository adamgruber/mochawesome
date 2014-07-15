<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mochawesome Report Card</title>
    <link rel="stylesheet" href="mochawesome.css">
  </head>
  <body>
    <!-- NAVBAR -->
    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <h1 class="report-title pull-left"><span>mochawesome report: </span>{{reportTitle}}</h1>
        <span class="report-date pull-right"><span>Last Run: </span>{{dateFormat stats.end 'dddd, MMMM D YYYY, hh:mma'}}</span>
      </div>
    </div>

    <!-- Test Summary -->
    <div class="summary">
      <div class="container">
        {{#stats}}
          {{> _summary}}
        {{/stats}}
      </div>
    </div>

    <!-- Suites -->
    <div class="details container">
      {{#suites}}
        {{> _suite}}
      {{/suites}}
    </div>

    <!-- Scripts -->
    <script src="../node_modules/chart.js/Chart.min.js"></script>
    <script>
      window.onload = makeSuiteCharts;
      function makeSuiteCharts(){
        var chartOpts = {
          percentageInnerCutout : 70,
          animationEasing: 'easeOutQuint',
          showTooltips: false
        };
        var suiteCharts = document.getElementsByClassName("suite-chart");
        for (var i=0; i<suiteCharts.length; i++) {
          var ctx = suiteCharts[i].getContext('2d');
          var data = [{
            value: suiteCharts[i].getAttribute('data-total-passes')*10,
            color:"#5cb85c",
            highlight: "#FF5A5E",
            label: "Passed"
          },
          {
            value: suiteCharts[i].getAttribute('data-total-failures')*10,
            color: "#d9534f",
            highlight: "#FFC870",
            label: "Failed"
          }]
          var chart = new Chart(ctx).Doughnut(data, chartOpts);
        };
      }
      </script>
  </body>
</html>
