var SqlParser=Editor.Parser=(function(){function wordRegexp(words){return new RegExp("^(?:"+ words.join("|")+")$","i");}
function labelRegexp(){return new RegExp("^(?:.+:)$","i");}
function labelRegexp2(){return new RegExp("^(?:\\..+)$","i");}
var keywords=wordRegexp(["adc","and","asl","bcc","bcs","beq","bit","bmi","bne","bpl","brk","bvc","bvs","clc","cld","cli","clv","cmp","cpx","cpy","dec","dex","dey","eor","inc","inx","iny","jmp","jsr","lda","ldx","ldy","lsr","nop","ora","pha","php","pla","plp","rol","ror","rti","rts","sbc","sec","sed","sei","sta","stx","sty","tax","tay","tsx","txa","txs","tya"]);var types=wordRegexp(["org","dcb","dcw","dcl","dcs","equb","equd"]);var operators=wordRegexp(["<","<=","==","<>",">",">="]);var operatorChars=/[*+\-<>=&|\/]/;var tokenizeSql=(function(){function normal(source,setState){var ch=source.next();if(ch=="#"||ch=="$"){source.nextWhileMatches(/[\w\d:]/);return"asm6502-var";}
else if(ch=="\""||ch=="'"){setState(inLiteral(ch));return null;}
else if(ch==","){return"asm6502-separator"}
else if(ch=='/'){if(source.peek()=="/"){while(!source.endOfLine())source.next();return"asm6502-comment";}
else if(/\d/.test(source.peek())){source.nextWhileMatches(/\d/);if(source.peek()=='.'){source.next();source.nextWhileMatches(/\d/);}
return"asm6502-number";}
else
return"asm6502-operator";}
else if(ch==';'){while(!source.endOfLine())source.next();return"asm6502-comment";}
else if(operatorChars.test(ch)){source.nextWhileMatches(operatorChars);return"asm6502-operator";}
else if(/\d/.test(ch)){source.nextWhileMatches(/\d/);if(source.peek()=='.'){source.next();source.nextWhileMatches(/\d/);}
return"asm6502-number";}
else if(/[()]/.test(ch)){return"asm6502-punctuation";}
else{source.nextWhileMatches(/[_\w\d:]/);var word=source.get(),type;if(labelRegexp().test(word))
type="asm6502-function";else if(labelRegexp2().test(word))
type="asm6502-function";else if(operators.test(word))
type="asm6502-operator";else if(keywords.test(word))
type="asm6502-keyword";else if(types.test(word))
type="asm6502-type";else
type="asm6502-word";return{style:type,content:word};}}
function inLiteral(quote){return function(source,setState){var escaped=false;while(!source.endOfLine()){var ch=source.next();if(ch==quote&&!escaped){setState(normal);break;}
escaped=!escaped&&ch=="\\";}
return quote=="`"?"asm6502-word":"asm6502-literal";};}
return function(source,startState){return tokenizer(source,startState||normal);};})();function indentSql(context){return function(nextChars){var firstChar=nextChars&&nextChars.charAt(0);var closing=context&&firstChar==context.type;if(!context)
return 0;else if(context.align)
return 0;else
return 0;}}
function parseSql(source){var tokens=tokenizeSql(source);var context=null,indent=0,col=0;function pushContext(type,width,align){context={prev:context,indent:indent,col:col,type:type,width:width,align:align};}
function popContext(){context=context.prev;}
var iter={next:function(){var token=tokens.next();var type=token.style,content=token.content,width=token.value.length;if(content=="\n"){token.indentation=indentSql(context);indent=col=0;if(context&&context.align==null)context.align=false;}
else if(type=="whitespace"&&col==0){indent=width;}
else if(!context&&type!="asm6502-comment"){pushContext(";",0,false);}
if(content!="\n")col+=width;if(type=="asm6502-punctuation"){if(content=="(")
pushContext(")",width);else if(content==")")
popContext();}
else if(type=="asm6502-separator"&&content==";"&&context&&!context.prev){popContext();}
return token;},copy:function(){var _context=context,_indent=indent,_col=col,_tokenState=tokens.state;return function(source){tokens=tokenizeSql(source,_tokenState);context=_context;indent=_indent;col=_col;return iter;};}};return iter;}
return{make:parseSql,electricChars:")"};})();