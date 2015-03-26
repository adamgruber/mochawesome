var Handlebars = require("handlebars");
 Handlebars.registerPartial("_quickSummary", Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function";
  return "<ul class=\"list-unstyled quick-summary\">\n  <li class=\"qs-item summary-duration\" title=\"Duration\">"
    + escapeExpression(((helpers.formatSummaryDuration || (depth0 && depth0.formatSummaryDuration) || helperMissing).call(depth0, (depth0 != null ? depth0.duration : depth0), {"name":"formatSummaryDuration","hash":{},"data":data})))
    + "<span>"
    + escapeExpression(((helpers.getSummaryDurationUnits || (depth0 && depth0.getSummaryDurationUnits) || helperMissing).call(depth0, (depth0 != null ? depth0.duration : depth0), {"name":"getSummaryDurationUnits","hash":{},"data":data})))
    + "</span></li>\n  <li class=\"qs-item summary-suites\" title=\"Suites\">"
    + escapeExpression(((helper = (helper = helpers.suites || (depth0 != null ? depth0.suites : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"suites","hash":{},"data":data}) : helper)))
    + "</li>\n  <li class=\"qs-item summary-tests\" title=\"Tests\">"
    + escapeExpression(((helper = (helper = helpers.testsRegistered || (depth0 != null ? depth0.testsRegistered : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"testsRegistered","hash":{},"data":data}) : helper)))
    + "</li>\n  <li class=\"qs-item summary-passes\" title=\"Passed\" data-filter=\"passed\">"
    + escapeExpression(((helper = (helper = helpers.passes || (depth0 != null ? depth0.passes : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"passes","hash":{},"data":data}) : helper)))
    + "</li>\n  <li class=\"qs-item summary-failures\" title=\"Failed\" data-filter=\"failed\">"
    + escapeExpression(((helper = (helper = helpers.failures || (depth0 != null ? depth0.failures : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"failures","hash":{},"data":data}) : helper)))
    + "</li>\n  <li class=\"qs-item summary-pending\" title=\"Pending\" data-filter=\"pending\">"
    + escapeExpression(((helper = (helper = helpers.pending || (depth0 != null ? depth0.pending : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"pending","hash":{},"data":data}) : helper)))
    + "</li>\n</ul>";
},"useData":true}));
/*global Handlebars*/
var moment = require('moment');

function getDurationObj(durationInMilliseconds) {
  'use strict';
  var dur = moment.duration(durationInMilliseconds, 'ms');
  return {
    duration: dur,
    hrs: dur.get('h'),
    min: dur.get('m'),
    sec: dur.get('s'),
    ms: dur.get('ms')
  };
}

Handlebars.registerHelper('isBlank', function (context, options) {
  'use strict';
  return context === '' ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('getPlural', function (context) {
  'use strict';
  return context === 1 ? '' : 's';
});

Handlebars.registerHelper('formatSummaryDuration', function (context) {
  'use strict';
  var dur = getDurationObj(context);
  if (dur.hrs  < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return context;
      }
      return dur.sec + '.' + dur.ms;
    }
    return dur.min + ':' + (dur.sec < 10 ? ('0' + dur.sec) : dur.sec);
  }
  return dur.hrs + ':' + (dur.min < 10 ? ('0' + dur.min) : dur.min);
});

Handlebars.registerHelper('getSummaryDurationUnits', function (context) {
  'use strict';
  var dur = getDurationObj(context);
  if (dur.hrs  < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return 'MS';
      }
      return 'S';
    }
    return 'M';
  }
  return 'H';
});

Handlebars.registerHelper('formatDuration', function (context) {
  'use strict';
  var dur = getDurationObj(context);
  if (dur.hrs  < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return context + ' ms';
      }
      return dur.sec + '.' + dur.ms + ' s';
    }
    return dur.min + ':' + (dur.sec < 10 ? ('0' + dur.sec) : dur.sec) + '.' + dur.ms + ' m';
  }
  return dur.hrs + ':' + (dur.min < 10 ? ('0' + dur.min) : dur.min) + ':' + (dur.sec < 10 ? ('0' + dur.sec) : dur.sec) + '.' + dur.ms + ' h';
});

Handlebars.registerHelper('dateFormat', function(context, format) {
  'use strict';
  if (format === 'fromNow') {
    return moment(context).fromNow();
  } else {
    return moment(context).format(format);
  }
});
exports["mochawesome"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = this.invokePartial(partials._quickSummary, '            ', '_quickSummary', depth0, undefined, helpers, partials, data);
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"3":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = this.invokePartial(partials._summary, '          ', '_summary', depth0, undefined, helpers, partials, data);
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"5":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = (helper = helpers.hasOther || (depth0 != null ? depth0.hasOther : depth0)) != null ? helper : helperMissing),(options={"name":"hasOther","hash":{},"fn":this.program(6, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasOther) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasSkipped || (depth0 != null ? depth0.hasSkipped : depth0)) != null ? helper : helperMissing),(options={"name":"hasSkipped","hash":{},"fn":this.program(8, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasSkipped) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"6":function(depth0,helpers,partials,data) {
  return " has-failed-hooks";
  },"8":function(depth0,helpers,partials,data) {
  return " has-skipped-tests";
  },"10":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = this.invokePartial(partials._statusbar, '          ', '_statusbar', depth0, undefined, helpers, partials, data);
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"12":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = this.invokePartial(partials._suite, '        ', '_suite', depth0, undefined, helpers, partials, data);
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Mochawesome Report Card</title>\n    <link rel=\"stylesheet\" href=\"css/mochawesome.css\">\n  </head>\n  <body>\n    <!-- NAVBAR -->\n    <div class=\"navbar navbar-inverse navbar-fixed-top\" role=\"navigation\">\n      <div class=\"container\">\n        <div class=\"report-info-cnt\">\n          <h1 class=\"report-title\">"
    + escapeExpression(((helper = (helper = helpers.reportTitle || (depth0 != null ? depth0.reportTitle : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"reportTitle","hash":{},"data":data}) : helper)))
    + "</h1>\n          <h3 class=\"report-date\">"
    + escapeExpression(((helpers.dateFormat || (depth0 && depth0.dateFormat) || helperMissing).call(depth0, ((stack1 = (depth0 != null ? depth0.stats : depth0)) != null ? stack1.end : stack1), "dddd, MMMM D YYYY, hh:mma", {"name":"dateFormat","hash":{},"data":data})))
    + "</h3>\n        </div>\n        <div class=\"quick-summary-cnt\">\n";
  stack1 = ((helper = (helper = helpers.stats || (depth0 != null ? depth0.stats : depth0)) != null ? helper : helperMissing),(options={"name":"stats","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.stats) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "        </div>\n      </div>\n    </div>\n\n    <!-- Report Summary -->\n    <div class=\"summary\">\n      <div class=\"container\">\n";
  stack1 = ((helper = (helper = helpers.stats || (depth0 != null ? depth0.stats : depth0)) != null ? helper : helperMissing),(options={"name":"stats","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.stats) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "      </div>\n    </div>\n    <div class=\"statusbar";
  stack1 = ((helper = (helper = helpers.stats || (depth0 != null ? depth0.stats : depth0)) != null ? helper : helperMissing),(options={"name":"stats","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.stats) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n      <div class=\"container\">\n";
  stack1 = ((helper = (helper = helpers.stats || (depth0 != null ? depth0.stats : depth0)) != null ? helper : helperMissing),(options={"name":"stats","hash":{},"fn":this.program(10, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.stats) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "      </div>\n    </div>\n\n    <!-- Suites -->\n    <div class=\"details container\">\n";
  stack1 = ((helper = (helper = helpers.suites || (depth0 != null ? depth0.suites : depth0)) != null ? helper : helperMissing),(options={"name":"suites","hash":{},"fn":this.program(12, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.suites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\n\n    <footer>\n      <div class=\"container\">\n        <p>Report generated by <a href=\"https://github.dowjones.net/grubera/mochawesome\" target=\"_blank\">mochawesome</a>.<br>Designed and built by <a href=\"https://github.com/adamgruber\" target=\"_blank\">adamgruber</a>. &copy;2015.</p>\n      </div>\n    </footer>\n\n    <!-- Scripts -->\n    <script src=\"js/vendor.js\"></script>\n    <script src=\"js/mochawesome.js\"></script>\n  </body>\n</html>\n";
},"usePartial":true,"useData":true});
Handlebars.registerPartial("_statusbar", Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <div class=\"status-item status-item-hooks danger\">"
    + escapeExpression(((helper = (helper = helpers.other || (depth0 != null ? depth0.other : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"other","hash":{},"data":data}) : helper)))
    + " Failed Hook"
    + escapeExpression(((helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing).call(depth0, (depth0 != null ? depth0.other : depth0), {"name":"getPlural","hash":{},"data":data})))
    + "</div>\n";
},"3":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <div class=\"status-item status-item-skipped danger\">"
    + escapeExpression(((helper = (helper = helpers.skipped || (depth0 != null ? depth0.skipped : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"skipped","hash":{},"data":data}) : helper)))
    + " Skipped Test"
    + escapeExpression(((helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing).call(depth0, (depth0 != null ? depth0.skipped : depth0), {"name":"getPlural","hash":{},"data":data})))
    + "</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"row\">\n";
  stack1 = ((helper = (helper = helpers.hasOther || (depth0 != null ? depth0.hasOther : depth0)) != null ? helper : helperMissing),(options={"name":"hasOther","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasOther) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasSkipped || (depth0 != null ? depth0.hasSkipped : depth0)) != null ? helper : helperMissing),(options={"name":"hasSkipped","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasSkipped) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  <div class=\"status-item status-item-pending-pct\">"
    + escapeExpression(((helper = (helper = helpers.pendingPercent || (depth0 != null ? depth0.pendingPercent : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"pendingPercent","hash":{},"data":data}) : helper)))
    + "% Pending</div>\n  <div class=\"status-item status-item-passing-pct "
    + escapeExpression(((helper = (helper = helpers.passPercentClass || (depth0 != null ? depth0.passPercentClass : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"passPercentClass","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.passPercent || (depth0 != null ? depth0.passPercent : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"passPercent","hash":{},"data":data}) : helper)))
    + "% Passing</div>\n</div>";
},"useData":true}));
Handlebars.registerPartial("_suite", Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = (helper = helpers.suites || (depth0 != null ? depth0.suites : depth0)) != null ? helper : helperMissing),(options={"name":"suites","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.suites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = this.invokePartial(partials._suite, '    ', '_suite', depth0, undefined, helpers, partials, data);
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"4":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "<section class=\"suite-wrap\">\n  <div id=\""
    + escapeExpression(((helper = (helper = helpers.uuid || (depth0 != null ? depth0.uuid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "\" class=\"suite";
  stack1 = ((helper = (helper = helpers.root || (depth0 != null ? depth0.root : depth0)) != null ? helper : helperMissing),(options={"name":"root","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.root) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasSuites || (depth0 != null ? depth0.hasSuites : depth0)) != null ? helper : helperMissing),(options={"name":"hasSuites","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasSuites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasTests || (depth0 != null ? depth0.hasTests : depth0)) != null ? helper : helperMissing),(options={"name":"hasTests","hash":{},"fn":this.program(9, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasTests) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasPasses || (depth0 != null ? depth0.hasPasses : depth0)) != null ? helper : helperMissing),(options={"name":"hasPasses","hash":{},"fn":this.program(11, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasPasses) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasFailures || (depth0 != null ? depth0.hasFailures : depth0)) != null ? helper : helperMissing),(options={"name":"hasFailures","hash":{},"fn":this.program(13, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasFailures) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasPending || (depth0 != null ? depth0.hasPending : depth0)) != null ? helper : helperMissing),(options={"name":"hasPending","hash":{},"fn":this.program(15, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasPending) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.hasSkipped || (depth0 != null ? depth0.hasSkipped : depth0)) != null ? helper : helperMissing),(options={"name":"hasSkipped","hash":{},"fn":this.program(17, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasSkipped) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n    <h3 class=\"suite-title\">";
  stack1 = ((helpers.isBlank || (depth0 && depth0.isBlank) || helperMissing).call(depth0, (depth0 != null ? depth0.title : depth0), {"name":"isBlank","hash":{},"fn":this.program(19, data),"inverse":this.program(21, data),"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "</h3>\n    <h5 class=\"suite-filename\">";
  stack1 = ((helpers.isBlank || (depth0 && depth0.isBlank) || helperMissing).call(depth0, (depth0 != null ? depth0.file : depth0), {"name":"isBlank","hash":{},"fn":this.program(19, data),"inverse":this.program(23, data),"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "</h5>\n";
  stack1 = ((helper = (helper = helpers.hasTests || (depth0 != null ? depth0.hasTests : depth0)) != null ? helper : helperMissing),(options={"name":"hasTests","hash":{},"fn":this.program(25, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.hasTests) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = ((helper = (helper = helpers.suites || (depth0 != null ? depth0.suites : depth0)) != null ? helper : helperMissing),(options={"name":"suites","hash":{},"fn":this.program(28, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.suites) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n  </div>\n</section>\n";
},"5":function(depth0,helpers,partials,data) {
  return " root-suite";
  },"7":function(depth0,helpers,partials,data) {
  return " has-suites";
  },"9":function(depth0,helpers,partials,data) {
  return " has-tests";
  },"11":function(depth0,helpers,partials,data) {
  return " has-passed";
  },"13":function(depth0,helpers,partials,data) {
  return " has-failed";
  },"15":function(depth0,helpers,partials,data) {
  return " has-pending";
  },"17":function(depth0,helpers,partials,data) {
  return " has-skipped";
  },"19":function(depth0,helpers,partials,data) {
  return "&nbsp;";
  },"21":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)));
  },"23":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return escapeExpression(((helper = (helper = helpers.file || (depth0 != null ? depth0.file : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"file","hash":{},"data":data}) : helper)));
  },"25":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "    <!-- Suite Chart -->\n    <div class=\"suite-chart-wrap\">\n      <canvas id=\""
    + escapeExpression(((helper = (helper = helpers.uuid || (depth0 != null ? depth0.uuid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "\" class=\"suite-chart\" width=\"50\" height=\"50\" data-total-passes=\""
    + escapeExpression(((helper = (helper = helpers.totalPasses || (depth0 != null ? depth0.totalPasses : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPasses","hash":{},"data":data}) : helper)))
    + "\" data-total-failures=\""
    + escapeExpression(((helper = (helper = helpers.totalFailures || (depth0 != null ? depth0.totalFailures : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalFailures","hash":{},"data":data}) : helper)))
    + "\" data-total-pending=\""
    + escapeExpression(((helper = (helper = helpers.totalPending || (depth0 != null ? depth0.totalPending : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPending","hash":{},"data":data}) : helper)))
    + "\" data-total-skipped=\""
    + escapeExpression(((helper = (helper = helpers.totalSkipped || (depth0 != null ? depth0.totalSkipped : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalSkipped","hash":{},"data":data}) : helper)))
    + "\"></canvas>\n    </div>\n    <div class=\"suite-data-wrap\">\n      <!-- Suite Summary -->\n      <ul class=\"suite-summary list-unstyled\">\n        <li class=\"suite-summary-item duration\">"
    + escapeExpression(((helpers.formatDuration || (depth0 && depth0.formatDuration) || helperMissing).call(depth0, (depth0 != null ? depth0.duration : depth0), {"name":"formatDuration","hash":{},"data":data})))
    + "</li>\n        <li class=\"suite-summary-item tests\">"
    + escapeExpression(((helper = (helper = helpers.totalTests || (depth0 != null ? depth0.totalTests : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalTests","hash":{},"data":data}) : helper)))
    + "</li>\n        <li class=\"suite-summary-item passed\">"
    + escapeExpression(((helper = (helper = helpers.totalPasses || (depth0 != null ? depth0.totalPasses : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPasses","hash":{},"data":data}) : helper)))
    + "</li>\n        <li class=\"suite-summary-item failed\">"
    + escapeExpression(((helper = (helper = helpers.totalFailures || (depth0 != null ? depth0.totalFailures : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalFailures","hash":{},"data":data}) : helper)))
    + "</li>\n        <li class=\"suite-summary-item pending\">"
    + escapeExpression(((helper = (helper = helpers.totalPending || (depth0 != null ? depth0.totalPending : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"totalPending","hash":{},"data":data}) : helper)))
    + "</li>\n      </ul>\n      <!-- Test Info -->\n      <div class=\"suite-test-wrap\">\n        <div class=\"suite-test-header\" data-toggle=\"collapse\" data-target=\"#"
    + escapeExpression(((helper = (helper = helpers.uuid || (depth0 != null ? depth0.uuid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "-test-list\">\n          <h4 class=\"suite-test-header-title\">Tests</h4>\n        </div>\n        <div id=\""
    + escapeExpression(((helper = (helper = helpers.uuid || (depth0 != null ? depth0.uuid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "-test-list\" class=\"list-group test-list collapse in\">\n";
  stack1 = ((helper = (helper = helpers.tests || (depth0 != null ? depth0.tests : depth0)) != null ? helper : helperMissing),(options={"name":"tests","hash":{},"fn":this.program(26, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.tests) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </div>\n      </div>\n    </div>\n";
},"26":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = this.invokePartial(partials._test, '            ', '_test', depth0, undefined, helpers, partials, data);
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"28":function(depth0,helpers,partials,data) {
  var stack1, buffer = "";
  stack1 = this.invokePartial(partials._suite, '      ', '_suite', depth0, undefined, helpers, partials, data);
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "";
  stack1 = ((helper = (helper = helpers.rootEmpty || (depth0 != null ? depth0.rootEmpty : depth0)) != null ? helper : helperMissing),(options={"name":"rootEmpty","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.rootEmpty) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.rootEmpty || (depth0 != null ? depth0.rootEmpty : depth0)) != null ? helper : helperMissing),(options={"name":"rootEmpty","hash":{},"fn":this.noop,"inverse":this.program(4, data),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.rootEmpty) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"usePartial":true,"useData":true}));
Handlebars.registerPartial("_summary", Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function";
  return "<div class=\"row\">\n  <div class=\"summary-col summary-duration\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helpers.formatSummaryDuration || (depth0 && depth0.formatSummaryDuration) || helperMissing).call(depth0, (depth0 != null ? depth0.duration : depth0), {"name":"formatSummaryDuration","hash":{},"data":data})))
    + "<span>"
    + escapeExpression(((helpers.getSummaryDurationUnits || (depth0 && depth0.getSummaryDurationUnits) || helperMissing).call(depth0, (depth0 != null ? depth0.duration : depth0), {"name":"getSummaryDurationUnits","hash":{},"data":data})))
    + "</span></h1>\n    <h4 class=\"summary-label\">"
    + escapeExpression(((helpers.getSummaryDurationUnits || (depth0 && depth0.getSummaryDurationUnits) || helperMissing).call(depth0, (depth0 != null ? depth0.duration : depth0), {"name":"getSummaryDurationUnits","hash":{},"data":data})))
    + "</h4>\n  </div>\n  <div class=\"summary-col summary-suites\" title=\"Suites\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = (helper = helpers.suites || (depth0 != null ? depth0.suites : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"suites","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label\">Suite"
    + escapeExpression(((helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing).call(depth0, (depth0 != null ? depth0.suites : depth0), {"name":"getPlural","hash":{},"data":data})))
    + "</h4>\n  </div>\n  <div class=\"summary-col summary-tests\" title=\"Tests\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = (helper = helpers.testsRegistered || (depth0 != null ? depth0.testsRegistered : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"testsRegistered","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label\">Test"
    + escapeExpression(((helpers.getPlural || (depth0 && depth0.getPlural) || helperMissing).call(depth0, (depth0 != null ? depth0.testsRegistered : depth0), {"name":"getPlural","hash":{},"data":data})))
    + "</h4>\n  </div>\n  <div class=\"summary-col summary-passes\" data-filter=\"passed\" title=\"Passed\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = (helper = helpers.passes || (depth0 != null ? depth0.passes : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"passes","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label\">Passed</h4>\n  </div>\n  <div class=\"summary-col summary-failures\" data-filter=\"failed\" title=\"Failed\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = (helper = helpers.failures || (depth0 != null ? depth0.failures : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"failures","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label\">Failed</h4>\n  </div>\n  <div class=\"summary-col summary-pending\" data-filter=\"pending\" title=\"Pending\">\n    <h1 class=\"summary-count\">"
    + escapeExpression(((helper = (helper = helpers.pending || (depth0 != null ? depth0.pending : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"pending","hash":{},"data":data}) : helper)))
    + "</h1>\n    <h4 class=\"summary-label\">Pending</h4>\n  </div>\n</div>";
},"useData":true}));
Handlebars.registerPartial("_test", Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return " passed";
  },"3":function(depth0,helpers,partials,data) {
  return " failed";
  },"5":function(depth0,helpers,partials,data) {
  return " pending";
  },"7":function(depth0,helpers,partials,data) {
  return " skipped";
  },"9":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <div class=\"pull-right\">\n      <button class=\"btn btn-link btn-sm toggle-btn toggle-code collapsed\" data-toggle=\"collapse\" data-target=\"#"
    + escapeExpression(((helper = (helper = helpers.uuid || (depth0 != null ? depth0.uuid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + " > .test-code.collapse\">Code</button>\n      <span class=\"test-duration "
    + escapeExpression(((helper = (helper = helpers.speed || (depth0 != null ? depth0.speed : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"speed","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helpers.formatDuration || (depth0 && depth0.formatDuration) || helperMissing).call(depth0, (depth0 != null ? depth0.duration : depth0), {"name":"formatDuration","hash":{},"data":data})))
    + "</span>\n    </div>\n";
},"11":function(depth0,helpers,partials,data,depths) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, lambda=this.lambda;
  return "    <p class=\"test-error-message\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + ": "
    + escapeExpression(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"message","hash":{},"data":data}) : helper)))
    + "\n      <button class=\"btn btn-link btn-sm toggle-btn toggle-stack collapsed\" data-toggle=\"collapse\" data-target=\"#"
    + escapeExpression(lambda((depths[1] != null ? depths[1].uuid : depths[1]), depth0))
    + " > .test-error-stack.collapse\">Stack</button>\n    </p>\n";
},"13":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "  <div class=\"test-error-stack collapse\">\n    <pre><code class=\"hljs small\">"
    + escapeExpression(((helper = (helper = helpers.stack || (depth0 != null ? depth0.stack : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"stack","hash":{},"data":data}) : helper)))
    + "</code></pre>\n  </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,depths) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing, buffer = "<div id=\""
    + escapeExpression(((helper = (helper = helpers.uuid || (depth0 != null ? depth0.uuid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "\" class=\"list-group-item test";
  stack1 = ((helper = (helper = helpers.pass || (depth0 != null ? depth0.pass : depth0)) != null ? helper : helperMissing),(options={"name":"pass","hash":{},"fn":this.program(1, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.pass) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.fail || (depth0 != null ? depth0.fail : depth0)) != null ? helper : helperMissing),(options={"name":"fail","hash":{},"fn":this.program(3, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.fail) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.pending || (depth0 != null ? depth0.pending : depth0)) != null ? helper : helperMissing),(options={"name":"pending","hash":{},"fn":this.program(5, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.pending) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.skipped || (depth0 != null ? depth0.skipped : depth0)) != null ? helper : helperMissing),(options={"name":"skipped","hash":{},"fn":this.program(7, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.skipped) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n  <!-- Test Heading -->\n  <div class=\"test-heading\">\n    <h4 class=\"test-title\">\n      <span class=\"text-muted hidden\"> it </span>\n      "
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "\n    </h4>\n";
  stack1 = ((helper = (helper = helpers.pending || (depth0 != null ? depth0.pending : depth0)) != null ? helper : helperMissing),(options={"name":"pending","hash":{},"fn":this.noop,"inverse":this.program(9, data, depths),"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.pending) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "  </div>\n  <!-- Test Errors -->\n";
  stack1 = ((helper = (helper = helpers.err || (depth0 != null ? depth0.err : depth0)) != null ? helper : helperMissing),(options={"name":"err","hash":{},"fn":this.program(11, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.err) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "  <!-- Test Code -->\n  <div class=\"test-code collapse\">\n    <pre><code class=\"hljs javascript small\">";
  stack1 = ((helper = (helper = helpers.code || (depth0 != null ? depth0.code : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"code","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  buffer += "</code></pre>\n  </div>\n  <!-- Test Error Stack -->\n";
  stack1 = ((helper = (helper = helpers.err || (depth0 != null ? depth0.err : depth0)) != null ? helper : helperMissing),(options={"name":"err","hash":{},"fn":this.program(13, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.err) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>";
},"useData":true,"useDepths":true}));