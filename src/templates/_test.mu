<div id="{{uuid}}" class="list-group-item test{{#pass}} passed{{/pass}}{{#fail}} failed{{/fail}}{{#pending}} pending{{/pending}}{{#skipped}} skipped{{/skipped}}">
  <!-- Test Heading -->
  <div class="test-heading">
    <h4 class="test-title">
      <span class="text-muted hidden"> it </span>
      {{title}}
    </h4>
    {{^pending}}
    <div class="pull-right">
      <button class="btn btn-link btn-sm toggle-btn toggle-code collapsed" data-toggle="collapse" data-target="#{{uuid}} > .test-code.collapse">Code</button>
      <span class="test-duration {{speed}}">{{formatDuration duration}}</span>
    </div>
    {{/pending}}
  </div>
  <!-- Test Errors -->
  {{#err}}
    <p class="test-error-message">{{name}}: {{message}}
      <button class="btn btn-link btn-sm toggle-btn toggle-stack collapsed" data-toggle="collapse" data-target="#{{../uuid}} > .test-error-stack.collapse">Stack</button>
    </p>
  {{/err}}
  <!-- Test Code -->
  <div class="test-code collapse">
    <pre><code class="hljs javascript small">{{{code}}}</code></pre>
  </div>
  <!-- Test Error Stack -->
  {{#err}}
  <div class="test-error-stack collapse">
    <pre><code class="hljs small">{{{stack}}}</code></pre>
  </div>
  {{/err}}
</div>