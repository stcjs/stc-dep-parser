import Plugin from 'stc-plugin';

/**
 * StcDepParserPlugin
 */
export default class DefaultDepParserPlugin extends Plugin {
  /**
   * run
   */
  async run(){
    let tokens = await this.getAst();
    console.log(tokens);
  }
  /**
   * update
   */
  update(){
    
  }
}