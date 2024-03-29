const internal = {
  _enhanceLROStatus: require('./internal/_enhanceLROStatus'),
  _enhanceNonRunningEntry: require('./internal/_enhanceNonRunningEntry'),
  _enhanceRunningEntry: require('./internal/_enhanceRunningEntry'),
  _maxEnhancedState: require('./internal/_maxEnhancedState'),
  _progressPct: require('./internal/_progressPct'),
  _sumEnhancedEntries: require('./internal/_sumEnhancedEntries')
}

module.exports = {
  internal,
  LROIdModel: require('./LROIdModel'),
  LROProgressModel: require('./LROProgressModel'),
  LROStatusEntryModel: require('./LROStatusEntryModel'),
  LROStatusModel: require('./LROStatusModel'),
  OptionsModel: require('./OptionsModel'),
  defaultOptions: require('./defaultOptions'),
  enhanceLROStatus: require('./enhanceLROStatus'),
  enhanceLROStatusEntry: require('./enhanceLROStatusEntry'),
  enhancedRunState: require('./enhancedRunState'),
  lroRunState: require('./lroRunState'),
  mergeDefaultOptions: require('./mergeDefaultOptions')
}
