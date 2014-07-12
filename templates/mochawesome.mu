<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mochawesome Report Card</title>
    <link href='http://fonts.googleapis.com/css?family=Dosis:300,400,600,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="mochawesome.css">
  </head>
  <body>
    <!-- NAVBAR -->
    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">mochawesome report</a>
        </div>
      </div>
    </div>

    <!-- Test Summary -->
    <div class="jumbotron">
      <div class="container">
        <h2>Test Summary</h2>
        {{#stats}}
          {{> _summary}}
          <h3>Duration: {{duration}}</h3>
        {{/stats}}
      </div>
    </div>

    <!-- Suites -->
    <div class="container">
      {{#each suites}}
        {{> _suite}}
      {{/each}}
    </div>

  </body>
</html>
