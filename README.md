# tataku.vim

The plugin that define protocol between collector-processor, processor-processor, processor-emitter.

This plugin make easily to create plugin like call web API.


## Dependencies

This plugin depends on [denops.vim](https://github.com/vim-denops/denops.vim) and [deno](https://github.com/denoland/deno).


## Installation

Use your favorite plugin manager.

- [vim-plug](https://github.com/junegunn/vim-plug)
    ```vim
    Plug 'Omochice/tataku.vim'
    Plug 'vim-denops/denops.vim'
    ```
- [dein.vim](https://github.com/Shougo/dein.vim)
    ```vim
    call dein#add('Omochice/tataku.vim')
    call dein#add('vim-denops/denops.vim')
    ```
- [vim-jetpack](https://github.com/tani/vim-jetpack)
    ```vim
    Jetpack 'Omochice/tataku.vim'
    Jetpack 'vim-denops/denops.vim'
    ```

## Use

To use this plugin, you must install **collector**, **processor** and **emitter**.

And register recipe into `g:tataku_recipes`.

See `:help tataku.vim`.


## License

[MIT License](./LICENSE)
