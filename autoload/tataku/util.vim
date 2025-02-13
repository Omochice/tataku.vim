let s:save_cpo = &cpo
set cpo&vim

if has('nvim')
  function! tataku#util#echo_error(msg) abort
    const l:error_message = printf('[tataku] %s', type(a:msg) ==# v:t_string ? a:msg : string(a:msg))
    call luaeval('vim.notify(_A, vim.log.levels.ERROR)', l:error_message)
  endfunction
else
  function! tataku#util#echo_error(msg) abort
    const l:error_message = printf('[tataku] %s', type(a:msg) ==# v:t_string ? a:msg : string(a:msg))
    echohl ErrorMsg
    echomsg l:error_message
    echohl None
  endfunction
endif

let &cpo = s:save_cpo
unlet s:save_cpo
