if get(g:, 'loaded_tataku', v:false)
  finish
endif
let g:loaded_tataku = v:true

let s:save_cpo = &cpo
set cpo&vim

if get(g:, 'tataku_enable_operator', v:false)
  for recipe in keys(get(g:, 'tataku_recipes', {}))
    for mode in ['n', 'v']
      execute printf(
            \ '%snoremap <expr> <Plug>(operator-tataku-%s) tataku#_setup_operator("%s")()',
            \ mode,
            \ recipe,
            \ recipe,
            \ )
    endfor
  endfor
endif

let &cpo = s:save_cpo
unlet s:save_cpo

" vim:set et:
