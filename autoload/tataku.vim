let s:save_cpo = &cpo
set cpo&vim

function! tataku#call_recipe(recipe_name) abort
  try
    let l:recipe = get(g:, 'tataku_recipes', {})[a:recipe_name]
  catch /^Vim\%((\a\+)\)\=:E716:/
    call tataku#util#echo_error(printf('"%s" does not exist in g:tataku_recipes.', a:recipe_name))
    return
  endtry
  call denops#plugin#wait('tataku')
  call denops#notify('tataku', 'run', [l:recipe])
endfunction


let &cpo = s:save_cpo
unlet s:save_cpo
