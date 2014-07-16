<div id="{{uuid}}" class="list-group-item test">
  <!-- Test Heading -->
  <div class="test-heading">
    <h4 class="test-title">
      <span class="glyphicon glyphicon-{{#pass}}ok text-success{{/pass}}{{#fail}}remove text-danger{{/fail}}"></span>
      <span class="text-muted hidden"> it </span>
      {{title}}
    </h4>
    <div class="pull-right">
      <button class="btn btn-link btn-sm toggle-code collapsed" data-toggle="collapse" data-target="#{{uuid}} > .test-code.collapse">
        <span class="show-code">Show </span>
        <span class="hide-code">Hide </span>
        Code</button>
      <span class="test-duration">{{formatDuration duration}}</span>
    </div>
  </div>
  <!-- Test Errors -->
  {{#err}}
  <div class="test-error">
    <p class="test-error-msg">{{.}}</p>
    <pre class="bg-danger small hidden">{{stack}}</pre>
  </div>
  {{/err}}
  <!-- Test Code -->
  <div class="test-code collapse">
    <pre><code>{{code}}</code></pre>
  </div>
</div>