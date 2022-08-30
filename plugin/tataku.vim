if get(g:, 'loaded_tataku', v:false)
  finish
endif
let g:loaded_tataku = v:true

let s:save_cpo = &cpo
set cpo&vim

if get(g:, 'tataku_enable_operators', v:false)
  for recipe in keys(get(g:, 'tataku_recipes', {}))
    call operator#user#define(
          \ 'tataku-' .. recipe,
          \ 'tataku#_call_as_operator',
          \ printf('call tataku#_setup_operator("%s")', recipe)
          \ )
  endfor
endif

let &cpo = s:save_cpo
unlet s:save_cpo

" vim:set et:
