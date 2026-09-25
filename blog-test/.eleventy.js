module.exports = function(eleventyConfig) {
  // Le dice a Eleventy que copie carpetas estáticas sin procesarlas
  // eleventyConfig.addPassthroughCopy("public/images"); 
  
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};