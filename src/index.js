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
    let extname = this.file.extname.toLowerCase();

    if(this.file.prop('tpl')){
      return instance.parseHtml(tokens);
    }

    if(extname === 'js'){
      return instance.parseJs(tokens);
    }
    
    if(extname === 'css'){
      return instance.parseCss(tokens);
    }
  }
  /**
   * update
   */
  update(deps){
    let filepath = this.file.path;
    parsedFiles[filepath] = deps;
    this.addDependence(deps);
  }
  /**
   * cache
   */
  cache(){
    return true;
  }
}