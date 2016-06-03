import Plugin from 'stc-plugin';
import Parser from './parse_dep.js';

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
    console.log(deps)
  }
  /**
   * cluster
   */
  cluster(){
    return true;
  }
  /**
   * cache
   */
  cache(){
    return true;
  }
}