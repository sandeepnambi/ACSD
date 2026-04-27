const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CodeAnalyzer {
  constructor() {
    this.supportedLanguages = [
      'python', 'java', 'cpp'
    ];
  }

  // Analyze code file and return metrics
  async analyzeFile(filePath, language) {
    try {
      const startTime = Date.now();
      const code = await fsPromises.readFile(filePath, 'utf8');
      
      let analysis;
      switch (language) {
        case 'python':
          analysis = await this.analyzePython(code, filePath);
          break;
        case 'java':
          analysis = await this.analyzeJava(code);
          break;
        case 'cpp':
        case 'c':
        case 'javascript':
        case 'typescript':
        case 'go':
        case 'ruby':
        case 'php':
        case 'swift':
        case 'kotlin':
        case 'rust':
          analysis = await this.analyzeGeneric(code, language);
          break;
        default:
          analysis = await this.analyzeGeneric(code, language);
      }

      const analysisDuration = Date.now() - startTime;
      
      return {
        ...analysis,
        analysisDuration,
        fileSize: code.length,
        lineCount: code.split('\n').length
      };
    } catch (error) {
      console.error('Code analysis error:', error);
      throw new Error(`Failed to analyze code: ${error.message}`);
    }
  }

  // Analyze Python code
  async analyzePython(code, filePath) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      // Create a dedicated analysis script that accepts a file path as an argument
      const pythonScript = `
import ast
import sys
import json
import os

def analyze_python_code(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        
        tree = ast.parse(code)
        analyzer = PythonAnalyzer(code)
        analyzer.visit(tree)
        return analyzer.get_results()
    except Exception as e:
        return {"error": f"Error: {str(e)}"}

class PythonAnalyzer(ast.NodeVisitor):
    def __init__(self, source_code):
        self.source_code = source_code
        self.classes = []
        self.functions = []
        self.current_class = None
        self.all_functions = []
    
    def visit_ClassDef(self, node):
        class_info = {
            "name": node.name,
            "line": node.lineno,
            "methods": [],
            "attributes": []
        }
        self.current_class = class_info
        self.generic_visit(node)
        self.classes.append(class_info)
        self.current_class = None
    
    def visit_FunctionDef(self, node):
        # Calculate end line safely
        end_lineno = getattr(node, 'end_lineno', node.lineno)
        
        # Extract code segment
        try:
            lines = self.source_code.splitlines()
            code_segment = "\\n".join(lines[node.lineno-1:end_lineno])
        except:
            code_segment = ""

        func_info = {
            "name": node.name,
            "line": node.lineno,
            "end_line": end_lineno,
            "parameters": len(node.args.args),
            "code": code_segment
        }
        
        if self.current_class:
            self.current_class["methods"].append(func_info)
        else:
            self.functions.append(func_info)
        
        self.all_functions.append(func_info)
        self.generic_visit(node)
    
    def visit_Assign(self, node):
        if self.current_class:
            for target in node.targets:
                if isinstance(target, ast.Name):
                    self.current_class["attributes"].append(target.id)
        self.generic_visit(node)
    
    def get_results(self):
        return {
            "classes": self.classes,
            "functions": self.functions,
            "all_functions": self.all_functions,
            "metrics": {
                "class_count": len(self.classes),
                "function_count": len(self.functions),
                "total_functions": len(self.all_functions)
            }
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = analyze_python_code(file_path)
    print(json.dumps(result))
`;

      const analysisId = uuidv4();
      const tempScriptFile = path.join(process.env.UPLOAD_PATH || './uploads', `analyzer_${analysisId}.py`);
      
      // Use synchronous write for the temp script to ensure it's ready
      fs.writeFileSync(tempScriptFile, pythonScript);
      
      const python = spawn('python', [tempScriptFile, filePath]);
      let output = '';
      let errorStr = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorStr += data.toString();
      });

      python.on('close', (code) => {
        // Clean up temp analyzer script
        try {
          fs.unlinkSync(tempScriptFile);
        } catch (cleanupError) {
          console.warn('Failed to cleanup analyzer script:', cleanupError.message);
        }
        
        if (code !== 0) {
          reject(new Error(`Python analysis process failed with code ${code}: ${errorStr}`));
          return;
        }

        try {
          if (!output.trim()) {
            reject(new Error('Python analysis produced no output'));
            return;
          }
          const result = JSON.parse(output);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(this.processPythonResults(result));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse Python analysis results: ${parseError.message}. Output was: ${output}`));
        }
      });
    });
  }

  // Process Python analysis results
  processPythonResults(results) {
    const metrics = [];
    const codeSmells = [];

    // Analyze classes
    results.classes.forEach(cls => {
      const classSize = cls.methods.length + cls.attributes.length;
      metrics.push({
        name: 'large_class',
        value: classSize,
        threshold: 50,
        location: { line: cls.line, className: cls.name }
      });

    });

    // Analyze functions
    results.all_functions.forEach(func => {
      const funcLength = func.end_line - func.line + 1;
      
      metrics.push({
        name: 'long_method',
        value: funcLength,
        threshold: 20,
        location: { line: func.line, functionName: func.name }
      });

      metrics.push({
        name: 'excess_parameters',
        value: func.parameters,
        threshold: 5,
        location: { line: func.line, functionName: func.name }
      });
    });

    return {
      metrics,
      codeSmells: [], // detector will handle this
      functions: results.functions,
      all_functions: results.all_functions,
      classes: results.classes,
      summary: {
        classCount: results.classes.length,
        functionCount: results.functions.length,
        totalFunctions: results.all_functions.length
      }
    };
  }

  // Analyze Java code
  async analyzeJava(code) {
    // For now, return a placeholder implementation
    // In a real implementation, you would use JavaParser or similar
    return {
      metrics: [],
      codeSmells: [],
      summary: {
        classCount: 0,
        functionCount: 0,
        totalFunctions: 0
      }
    };
  }

  // Generic analyzer for multiple languages
  async analyzeGeneric(code, language) {
    const lines = code.split('\n');
    const functions = [];
    const metrics = [];

    // Simple regex to find functions in many languages (e.g., name followed by parens and braces)
    // This is a rough approximation for the generic analyzer
    const funcRegex = /(?:function\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{)/g;
    let match;
    
    while ((match = funcRegex.exec(code)) !== null) {
      const funcName = match[1] || match[2];
      const startPos = match.index;
      const lineNum = code.substring(0, startPos).split('\n').length;
      
      // Find end of function (simple brace counting)
      let endLineNum = lineNum;
      let braceCount = 0;
      let started = false;
      
      for (let i = startPos; i < code.length; i++) {
        if (code[i] === '{') {
          braceCount++;
          started = true;
        } else if (code[i] === '}') {
          braceCount--;
        }
        
        if (started && braceCount === 0) {
          endLineNum = code.substring(0, i).split('\n').length;
          break;
        }
      }

      functions.push({
        name: funcName,
        line: lineNum,
        end_line: endLineNum,
        code: code.substring(startPos, code.indexOf('}', startPos) + 1)
      });
    }

    // Process metrics for functions
    functions.forEach(func => {
      const length = func.end_line - func.line + 1;
      metrics.push({
        name: 'long_method',
        value: length,
        threshold: 20,
        location: { line: func.line, functionName: func.name }
      });
    });

    return {
      metrics,
      codeSmells: [], // detector will handle this
      functions,
      all_functions: functions,
      summary: {
        classCount: 0,
        functionCount: functions.length,
        totalFunctions: functions.length
      }
    };
  }

  // Detect duplicate code
  detectDuplicates(functions) {
    const duplicates = [];
    const codeMap = new Map();

    functions.forEach((func, index) => {
      const normalizedCode = func.code.replace(/\s+/g, ' ').trim();
      
      if (codeMap.has(normalizedCode)) {
        duplicates.push({
          original: codeMap.get(normalizedCode),
          duplicate: func,
          similarity: 1.0
        });
      } else {
        codeMap.set(normalizedCode, func);
      }
    });

    return duplicates;
  }
}

module.exports = CodeAnalyzer;
