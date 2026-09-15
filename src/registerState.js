// Shared flag set when `mochawesome/register` is loaded. The reporter reads it
// to warn when running in parallel mode without the hook, where context added
// via `addContext` would otherwise be dropped during worker serialization.
module.exports = { registered: false };
