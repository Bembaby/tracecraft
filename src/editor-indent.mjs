// Native Tab still moves focus. Explicit controls indent selected Python lines.
export function indentCode(source,start,end,outdent=false){
  const from=start===0?0:source.lastIndexOf('\n',start-1)+1;
  const selectionEnd=end>start&&source[end-1]==='\n'?end-1:end;
  const newline=source.indexOf('\n',selectionEnd),to=newline<0?source.length:newline;
  const lines=source.slice(from,to).split('\n');
  const changed=lines.map(line=>outdent?line.replace(/^ {1,4}/,''):'    '+line).join('\n');
  return {source:source.slice(0,from)+changed+source.slice(to),start:from,end:from+changed.length};
}
