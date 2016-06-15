import {isArray, isRemoteUrl} from 'stc-helper';
import path from 'path';

/**
 * resouce attrs
 */
const resourceAttrs = {
  img: ['src', 'srcset'],
  script: 'src',
  link: 'href',
  param: 'value',
  embed: 'src',
  object: 'data',
  source: ['src', 'srcset']
};
/**
 * get attr value in attrs
 */
const getAttrValue = (attrs, name) => {
  let value;
  attrs.some(item => {
    if(item.nameLowerCase === name){
      value = item.value;
      return true;
    }
  });
  return value;
}
/**
 * regular
 */
const RegInCss = [{
    // background image
    regexp: /url\s*\(\s*([\'\"]?)([\w\-\/\.\@]+\.(?:png|jpg|gif|jpeg|ico|cur|webp))(?:\?[^\?\'\"\)\s]*)?\1\s*\)/i,
    index: 2
  }, {
    // font
    regexp: /url\s*\(\s*([\'\"]?)([^\'\"\?]+\.(?:eot|woff|woff2|ttf|svg))([^\s\)\'\"]*)\1\s*\)/ig,
    index: 2
  }, {
    // ie filter
    regexp: /src\s*=\s*([\'\"])?([^\'\"]+\.(?:png|jpg|gif|jpeg|ico|cur|webp))(?:\?[^\?\'\"\)\s]*)?\1\s*/i,
    index: 2
  }
];
/**
 * @import url reg
 */
const RegImport = /url\s*\((['"])([\w\-\/\.]+\.css)(?:[^\?\'\"\)\s]*)?\1\)/;

/**
 * parser
 */
export default class Parser {
  /**
   * constructor
   */
  constructor(plugin){
    this.plugin = plugin;
    this.TokenType = this.plugin.TokenType;
    this.options = this.plugin.options;
  }
  /**
   * unique deps
   */
  uniqueDeps(deps){
    let obj = {};
    deps.forEach(item => {
      if(isRemoteUrl(item)){
        return;
      }
      obj[item] = true;
    });
    return Object.keys(obj);
  }
  /**
   * parse html
   */
  parseHtml(tokens){
    let deps = [];
    tokens.forEach(token => {
      switch(token.type){
        case this.TokenType.HTML_TAG_START:
          deps = deps.concat(this.parseHtmlTagStart(token));
          break;
        case this.TokenType.HTML_TAG_SCRIPT:
          deps = deps.concat(this.parseHtmlTagScript(token));
          break;
        case this.TokenType.HTML_TAG_STYLE:
          deps = deps.concat(this.parseHtmlTagStyle(token));
          break;
      }
    });
    return this.uniqueDeps(deps);
  }
  /**
   * parse html tag start resource
   */
  parseHtmlTagStart(token){
    let tagName = token.detail.tagLowerCase;
    let tagAttrs = token.detail.attrs;
    let deps = [];
    [resourceAttrs, this.options.tag || {}].forEach(item => {
      if(!item[tagName]){
        return;
      }
      let attrs = item[tagName];
      if(!isArray(attrs)){
        attrs = [attrs];
      }
      attrs.forEach(attr => {
        let value = getAttrValue(tagAttrs, attr);
        if(!value){
          return;
        }
        let extname = path.extname(value);
        // check link resource extname
        // ignore resource when has template syntax
        if(!/^\.\w+$/.test(extname)){
          return;
        }
        // <img src="/static/img/404.jpg" srcset="/static/img/404.jpg 640w 1x, /static/img/404.jpg 2x" />
        if(attr === 'srcset'){
          let values = value.split(',');
          values.forEach(item => {
            item = item.trim();
            item = item.split(' ')[0].trim();;
            deps.push(item);
          })
        }else{
          deps.push(value);
        }
      })
    });
    //style tokens
    if(token.ext.styleTokens){
      deps = deps.concat(this.parseCss(token.ext.styleTokens));
    }
    return deps;
  }
  
  /**
   * parse script in html
   */
  parseHtmlTagScript(token){
    let dep = [];
    let startToken = token.ext.start;
    // external script
    if(startToken.ext.isExternal){
      return this.parseHtmlTagStart(startToken);
    }
    // @TODO parse resource in js
    if(startToken.ext.isScript){
      return this.parseJs();;
    }
    // @TODO parse template in script
    return dep;
  }
  /**
   * parse style in html
   */
  parseHtmlTagStyle(token){
    let contentToken = token.ext.content;
    return this.parseCss(contentToken.ext.tokens);
  }
  /**
   * parse css
   */
  parseCss(tokens){
    let deps = [];
    tokens.forEach(token => {
      // css value
      if(token.type === this.TokenType.CSS_VALUE){
        RegInCss.some(item => {
          let flag = false;
          token.ext.value.replace(item.regexp, (...args) => {
           if(args[item.index]){
             flag = true;
             deps.push(args[item.index]);
           }
           return flag;
          });
        });
      }
      // css import
      else if(token.type === this.TokenType.CSS_IMPORT){
        token.value.replace(RegImport, (...args) => {
          deps.push(args[2]);
        });
      }
    })
    return deps;
  }
  /**
   * parse css
   */
  parseJs(tokens){
    return [];
  }
}