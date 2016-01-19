/*global Handlebars, __dirname*/
var moment = require('moment');
var path = require('path');
var fs = require('fs');

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

Handlebars.registerHelper('inlineAsset', function(context) {
  'use strict';
  var distDir = path.join(__dirname, '..', 'dist');
  switch (context) {
    case 'styles':
      return fs.readFileSync(path.join(distDir, 'css', 'mochawesome-64.css'));

    case 'scripts':
      var vendorScripts = fs.readFileSync(path.join(distDir, 'js', 'vendor.js'));
      var mochawesomeScript = fs.readFileSync(path.join(distDir, 'js', 'mochawesome.js'));
      return vendorScripts + '\n' + mochawesomeScript;
  }
});