const SmellRule = require('../models/SmellRule');

class SmellDetector {
  constructor() {
    this.rules = new Map();
    this.loadRules();
  }

  // Load detection rules from database
  async loadRules() {
    try {
      const rules = await SmellRule.find({ isActive: true });
      this.rules.clear();
      
      rules.forEach(rule => {
        this.rules.set(rule.name, rule);
      });

      if (this.rules.size === 0) {
        console.log('No rules found in database, loading defaults');
        this.loadDefaultRules();
      }
      
      console.log(`Loaded ${this.rules.size} smell detection rules`);
    } catch (error) {
      console.error('Failed to load smell rules:', error);
      // Load default rules if database fails
      this.loadDefaultRules();
    }
  }

  // Load default rules (fallback)
  loadDefaultRules() {
    const defaultRules = [
      {
        name: 'long_method',
        threshold: 20,
        severity: 'medium',
        suggestion: 'Extract method: Break this long method into smaller, more focused methods'
      },
      {
        name: 'large_class',
        threshold: 50,
        severity: 'medium',
        suggestion: 'Extract class: Split this large class into smaller, more cohesive classes'
      },
      {
        name: 'excess_parameters',
        threshold: 5,
        severity: 'medium',
        suggestion: 'Introduce parameter object: Replace multiple parameters with a single object'
      },
      {
        name: 'duplicate_code',
        threshold: 3,
        severity: 'high',
        suggestion: 'Extract method: Move duplicate code to a shared method'
      },
      {
        name: 'high_complexity',
        threshold: 10,
        severity: 'medium',
        suggestion: 'Refactor complex logic: Break down complex conditions and loops'
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.name, rule);
    });
  }

  // Detect code smells based on analysis results
  async detectSmells(analysisResults, language) {
    const smells = [];
    const metrics = analysisResults.metrics || [];

    // Process each metric and check against rules
    metrics.forEach(metric => {
      const rule = this.rules.get(metric.name);
      if (!rule) return;

      if (metric.value > rule.threshold) {
        const smell = this.createSmellFromMetric(metric, rule, language);
        smells.push(smell);
      }
    });

    // Detect duplicate code
    const functionsToAnalyze = analysisResults.all_functions || analysisResults.functions;
    if (functionsToAnalyze) {
      const duplicateSmells = this.detectDuplicateCode(functionsToAnalyze);
      smells.push(...duplicateSmells);
    }

    // Detect complex methods (additional analysis)
    if (functionsToAnalyze) {
      const complexitySmells = this.detectComplexity(functionsToAnalyze);
      smells.push(...complexitySmells);
    }

    return smells;
  }

  // Create smell object from metric
  createSmellFromMetric(metric, rule, language) {
    const severity = this.calculateSeverity(metric.value, rule.threshold, rule.severity);
    
    return {
      type: rule.name,
      severity,
      location: metric.location || { line: 1 },
      description: this.generateDescription(metric, rule),
      suggestion: rule.suggestion,
      metricValue: metric.value
    };
  }

  // Calculate severity based on how much the threshold is exceeded
  calculateSeverity(value, threshold, baseSeverity) {
    const ratio = value / threshold;
    
    if (ratio >= 3) return 'high';
    if (ratio >= 2) return baseSeverity === 'high' ? 'high' : 'medium';
    if (ratio >= 1.5) return baseSeverity === 'low' ? 'medium' : baseSeverity;
    return 'low';
  }

  // Generate description for code smell
  generateDescription(metric, rule) {
    const location = metric.location ? 
      (metric.location.className || metric.location.functionName || `Line ${metric.location.line}`) : 
      'Code';
    
    switch (rule.name) {
      case 'long_method':
        return `${location} is too long (${metric.value} lines)`;
      case 'large_class':
        return `${location} is too large (${metric.value} members)`;
      case 'excess_parameters':
        return `${location} has too many parameters (${metric.value})`;
      case 'duplicate_code':
        return `Duplicate code detected (${metric.value} occurrences)`;
      default:
        return `${location} exceeds ${rule.name} threshold (${metric.value} > ${rule.threshold})`;
    }
  }

  // Detect duplicate code
  detectDuplicateCode(functions) {
    const duplicates = [];
    const codeMap = new Map();
    const threshold = this.rules.get('duplicate_code')?.threshold || 3;

    functions.forEach(func => {
      if (!func.code) return;
      
      // Normalize code for comparison
      const normalizedCode = this.normalizeCode(func.code);
      
      if (codeMap.has(normalizedCode)) {
        codeMap.get(normalizedCode).push(func);
      } else {
        codeMap.set(normalizedCode, [func]);
      }
    });

    // Find duplicates that exceed threshold
    codeMap.forEach((occurrences, code) => {
      if (occurrences.length >= threshold) {
        const severity = occurrences.length >= 5 ? 'high' : 
                        occurrences.length >= 4 ? 'medium' : 'low';
        
        duplicates.push({
          type: 'duplicate_code',
          severity,
          location: {
            line: occurrences[0].line,
            functionName: occurrences[0].name
          },
          description: `Duplicate code detected: ${occurrences[0].name} appears ${occurrences.length} times`,
          suggestion: 'Extract method: Move duplicate code to a shared method',
          metricValue: occurrences.length
        });
      }
    });

    return duplicates;
  }

  // Normalize code for duplicate detection
  normalizeCode(code) {
    return code
      .replace(/\s+/g, ' ')           // Replace multiple whitespace with single space
      .replace(/\s*([{}();,])\s*/g, '$1') // Remove spaces around punctuation
      .toLowerCase()                  // Case insensitive comparison
      .trim();
  }

  // Detect complexity issues (cyclomatic complexity approximation)
  detectComplexity(functions) {
    const complexitySmells = [];
    const rule = this.rules.get('high_complexity');
    const threshold = rule ? rule.threshold : 10;

    functions.forEach(func => {
      if (!func.code) return;
      
      const complexity = this.calculateComplexity(func.code);
      
      if (complexity > threshold) {
        const severity = rule ? 
          this.calculateSeverity(complexity, threshold, rule.severity) :
          (complexity > 20 ? 'high' : complexity > 15 ? 'medium' : 'low');
        
        complexitySmells.push({
          type: 'high_complexity',
          severity,
          location: {
            line: func.line,
            functionName: func.name
          },
          description: `Function ${func.name} has high complexity (${complexity})`,
          suggestion: rule ? rule.suggestion : 'Refactor complex logic: Break down complex conditions and loops',
          metricValue: complexity
        });
      }
    });

    return complexitySmells;
  }

  // Calculate cyclomatic complexity (simplified)
  calculateComplexity(code) {
    const complexityKeywords = [
      'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'with',
      '&&', '||', 'case', 'switch', 'catch', 'finally'
    ];
    
    let complexity = 1; // Base complexity
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  // Get current rules
  getRules() {
    return Array.from(this.rules.values());
  }

  // Update rule
  async updateRule(ruleName, updates) {
    try {
      const rule = await SmellRule.findOneAndUpdate(
        { name: ruleName },
        updates,
        { new: true, upsert: true }
      );
      
      this.rules.set(ruleName, rule);
      return rule;
    } catch (error) {
      console.error('Failed to update rule:', error);
      throw error;
    }
  }
}

module.exports = SmellDetector;
