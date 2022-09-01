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

let s:recipe_name = ''
function! tataku#_setup_operator(recipe_name) abort
  let s:recipe_name = a:recipe_name
endfunction

function! tataku#_call_as_operator(motion_type) abort
  if s:is_invalid_region()
    return
  endif

  let l:tmp = @@
  let l:v = operator#user#visual_command_from_wise_name(a:motion_type)
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


function! s:get_recipe(recipe_name) abort
  try
    let l:recipe = get(g:, 'tataku_recipes', {})[a:recipe_name]
    return l:recipe
  catch /^Vim\%((\a\+)\)\=:E716:/
    call tataku#util#echo_error(printf('"%s" does not exist in g:tataku_recipes.', a:recipe_name))
    return {}
  endtry
endfunction

function! s:is_invalid_region() abort
  return line("'[") ==# line("']") + 1
endfunction

let &cpo = s:save_cpo
unlet s:save_cpo
