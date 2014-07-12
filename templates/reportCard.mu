<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mochawesome Report Card</title>
    <link href='http://fonts.googleapis.com/css?family=Dosis:300,400,600,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
    <style>
      body {
        font-family: 'Dosis', sans-serif;
      }
      .suite {
      }
    </style>
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

    <!-- Main jumbotron for a primary marketing message or call to action -->
    <div class="jumbotron">
      <div class="container">
        <h2>Test Summary</h2>
        {{#stats}}
          <h3>Suites: {{suites}}</h3>
          <h3>Tests: {{tests}}</h3>
          <h3>Passes: {{passes}}</h3>
          <h3>Failures: {{failures}}</h3>
          <h3>Duration: {{duration}}</h3>
        {{/stats}}
      </div>
    </div>

    <div class="container">
      {{#each suites}}
        {{> _suite}}
      {{/each}}
    </div> <!-- /container -->


  </body>
</html>
