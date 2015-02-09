<div class="row">
  {{#hasOther}}
  <div class="status-item status-item-hooks danger">{{other}} Failed Hook{{getPlural other}}</div>
  {{/hasOther}}
  {{#hasSkipped}}
  <div class="status-item status-item-skipped danger">{{skipped}} Skipped Test{{getPlural skipped}}</div>
  {{/hasSkipped}}
  <div class="status-item status-item-pending-pct">{{pendingPercent}}% Pending</div>
  <div class="status-item status-item-passing-pct {{passPercentClass}}">{{passPercent}}% Passing</div>
</div>