let s:save_cpo = &cpo
set cpo&vim

function! tataku#call_recipe(recipe_name) abort
  let l:recipe = s:get_recipe(a:recipe_name)
  if empty(l:recipe)
    return
  endif
  call denops#plugin#wait('tataku')
  call denops#notify('tataku', 'run', [l:recipe])
endfunction

" operator{{{
function! tataku#_operator(recipe_name) abort
  let s:recipe_name = a:recipe_name

  function! s:operator(...) abort
    if a:0 == 0
      let &operatorfunc = function('s:operator')
      return 'g@'
    endif

    let l:tmp = @@
    let l:v = s:visual_command_from_wise_name(a:000[0])
    execute 'silent!' 'normal!' '`[' .. v .. '`]"@y'
    let l:selected = split(@@, '\n')
    let @@ = l:tmp

    let l:recipe = s:get_recipe(s:recipe_name)
    if empty(l:recipe)
      return
    endif
    call denops#plugin#wait('tataku')
    call denops#notify('tataku', 'runWithoutCollector', [l:recipe, l:selected])
  endfunction

  return function('s:operator')
endfunction

function! s:visual_command_from_wise_name(wise_name) abort
  " this from kana/vim-operator-user
  if a:wise_name ==# 'char'
    return 'v'
  elseif a:wise_name ==# 'line'
    return 'V'
  elseif a:wise_name ==# 'block'
    return "\<C-v>"
  endif
  call tataku#util#echo_error(
        \ printf(':Internal error: Invalid wise: %s', string(a:wise_name))
        \ )
  return 'v'  " fallback
endfunction

" }}}

function! s:get_recipe(recipe_name) abort
  try
    let l:recipe = get(g:, 'tataku_recipes', {})[a:recipe_name]
    return l:recipe
  catch /^Vim\%((\a\+)\)\=:E716:/
    call tataku#util#echo_error(printf('"%s" does not exist in g:tataku_recipes.', a:recipe_name))
    return {}
  endtry
endfunction

let &cpo = s:save_cpo
unlet s:save_cpo
