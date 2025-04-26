module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Completely disable source map warnings
      webpackConfig.ignoreWarnings = [
        // Ignore all source map related warnings
        function ignoreAllSourceMapWarnings(warning) {
          return warning.message.includes('Failed to parse source map');
        }
      ];
      
      // Disable source-map-loader for all node_modules
      const rules = webpackConfig.module.rules.find(rule => 
        Array.isArray(rule.oneOf)
      ).oneOf;
      
      // Find the source-map-loader rule
      const sourceMapLoaderRule = rules.find(rule =>
        rule.use && 
        Array.isArray(rule.use) && 
        rule.use.some(use => 
          use.loader && use.loader.includes('source-map-loader')
        )
      );
      
      if (sourceMapLoaderRule) {
        // Exclude all node_modules from source-map-loader
        sourceMapLoaderRule.exclude = [/node_modules/];
      }
      
      return webpackConfig;
    },
  },
}; 