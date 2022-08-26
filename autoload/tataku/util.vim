let s:save_cpo = &cpo
set cpo&vim

function! tataku#util#echo_error(msg) abort
  echohl ErrorMsg
  echomsg printf('[tataku] %s', type(a:msg) ==# v:t_string ? a:msg : string(a:msg))
  echohl None
endfunction

let &cpo = s:save_cpo
unlet s:save_cpo
