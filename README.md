# tataku.vim

## Introduction

[tataku.vim](tataku.vim) define protocol between collector-processor,
processor-processor, processor-emitter.

This plugin make easily to create plugin like call web API.

## Contents

- [Introduction](tataku-introduction)
- [Dependencies](tataku-dependencies)
- [Terms](tataku-terms)
- [Samples](tataku-processor-ollama-samples)

## Dependencies

This plugin needs:

- [vim-denops/denops.vim](https://github.com/vim-denops/denops.vim)

## Terms

[tataku.vim](tataku.vim) has some recipes define by user.

Recipe must have three parts.

- `Collector`

  `Collector` collect strings from some resources.
- `Processor`

  `Processor` process strings and pass strings to next processor.
- `Emitter`

  `Emitter` output strings to some resources.

Recipe must be below format:

```vim
{
\  "collector": { "name": string, "options": dict, },
\  "processor": { "name": string, "options": dict, }[],
\  "emitter": { "name": string, "options": dict, },
\ }
```

"Collector" and "Emitter" can be specified only one module. But "Processor" can
be specified multiply.

Each module have two keys.

- name

  The module name. If you use `tataku-collector-current_line`, specify
  `current_line`.
- options

  The options for the module.

## Function

- `tataku#call_recipe(recipe_name)`

  Call recipe which registered in [g:tataku_recipes](g:tataku_recipes).

## Variables

- [`g:tataku_recipes`](`g:tataku_recipes`)

  The recipe book. Default: `{}`
- [`g:tataku_enable_operator`](`g:tataku_enable_operator`)

  Enable operator mappings starts with `<Plug>(operator-tataku-`. For details:
  [tataku-operator](tataku-operator) Default: `v:false`

## Operator

If set `v:true` to `g:tataku_enable_operator`, The operator mappings will be
enable.

The mappings starts with `<Plug>(operator-tataku-`.

If you registered `foo` and `bar` into `g:tataku_recipes`,
`<Plug>(operator-tataku-foo)` and `<Plug>(operator-tataku-bar)` will be enabled.

NOTE: If call recipe via operator, `collector` module is ignored and use
motion/textobj instead of its.

## For developer

This section explain how to create module.

When call recipe, tataku.vim import module from
`denops/@tataku/<module-type>/<module-name>.ts` within &runtimepath.

The module must export function as default. The function must return
corresponding stream:

- Collector: `ReadableStream<string[]>`
- Processor: `TransformStream<string[]>`
- Emitter: `WritableStream<string[]>`
