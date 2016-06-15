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
      return;
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
    if(!deps || !deps.length){
      return;
    }
    let filepath = this.file.path;
    let dependencies = this.addDependence(deps);
    dependencies.forEach(file => {
      let extname = file.extname.toLowerCase();
      if(extname === 'js' || extname === 'css'){
        this.invokeSelf(file);
      }
    });
    parsedFiles[filepath] = true;
  }
  // static after(files, instance){

  // }
  /**
   * cache
   */
  static cache(){
    return true;
  }
}