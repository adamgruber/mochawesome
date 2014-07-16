<div class="list-group-item test">
  <!-- Test Heading -->
  <div class="test-heading">
    <h4 class="test-title">
      <span class="glyphicon glyphicon-{{#pass}}ok text-success{{/pass}}{{#fail}}remove text-danger{{/fail}}"></span>
      <span class="text-muted"> it </span>
      {{title}}
    </h4>
    <span class="test-duration badge">{{formatDuration duration}}</span>
  </div>
  <!-- Test Errors -->
  {{#err}}
  <div class="test-error">
    <p class="test-error-msg">{{.}}</p>
    <pre class="bg-danger small hidden">{{stack}}</pre>
  </div>
  {{/err}}
  <!-- Test Code -->
  <div class="test-code">
    <pre><code>{{code}}</code></pre>
  </div>
</div>