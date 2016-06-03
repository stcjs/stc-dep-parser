import Plugin from 'stc-plugin';
import Parser from './parser.js';

/**
 * parsed files
 */
let parsedFiles = {};

/**
 * StcDepParserPlugin
 */
export default class DefaultDepParserPlugin extends Plugin {
  /**
   * run
   */
  async run(){
    let filepath = this.file.path;
    if(parsedFiles[filepath]){
      return parsedFiles[filepath];
    }
    let tokens = await this.getAst();
    let instance = new Parser(this);
    let type = this.file.type;
    if(type === 'template'){
      return instance.parseHtml(tokens);
    }
    
    let extname = this.file.extname.toLowerCase();
    if(extname === '.js'){
      return instance.parseJs(tokens);
    }
    
    if(extname === '.css'){
      return instance.parseCss(tokens);
    }
  }
  /**
   * update
   */
  update(deps){
    let filepath = this.file.path;
    parsedFiles[filepath] = deps;
    
    console.log(deps)
  }
  /**
   * cache
   */
  cache(){
    return true;
  }
}