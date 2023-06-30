let s:save_cpo = &cpo
set cpo&vim

function! tataku#util#echo_error(msg) abort
  let g:_tataku_internal_error_message = printf('[tataku] %s', type(a:msg) ==# v:t_string ? a:msg : string(a:msg))
  if has('nvim')
    lua vim.notify(vim.g._tataku_internal_error_message, vim.log.levels.ERROR)
  else
    echohl ErrorMsg
    echomsg g:_tataku_internal_error_message
    echohl None
  endif
endfunction

let &cpo = s:save_cpo
unlet s:save_cpo
