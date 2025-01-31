let s:save_cpo = &cpo
set cpo&vim

function! tataku#util#echo_error(msg) abort
  const l:error_message = printf('[tataku] %s', type(a:msg) ==# v:t_string ? a:msg : string(a:msg))
  if has('nvim')
    call luaeval('vim.notify(_A, vim.log.levels.ERROR)', l:error_message)
  else
    echohl ErrorMsg
    echomsg l:error_message
    echohl None
  endif
endfunction

let &cpo = s:save_cpo
unlet s:save_cpo
