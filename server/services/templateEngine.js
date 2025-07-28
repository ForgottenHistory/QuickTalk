class TemplateEngine {
  static render(template, data) {
    let result = template;
    
    // Handle {{#if variable}} blocks
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, content) => {
      return data[variable] && data[variable].trim() ? content : '';
    });
    
    // Handle simple {{variable}} replacements
    result = result.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return data[variable] || '';
    });
    
    // Clean up extra newlines (more than 2 consecutive)
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // Trim leading/trailing whitespace
    result = result.trim();
    
    return result;
  }
}

module.exports = TemplateEngine;