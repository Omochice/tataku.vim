{
  description = "The plugin that define protocol between collector-processor, processor-processor, processor-emitter.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
    nur = {
      url = "github:Omochice/nur-packages";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      treefmt-nix,
      flake-utils,
      nur,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ nur.overlays.default ];
        };
        treefmt = treefmt-nix.lib.evalModule pkgs (
          { ... }:
          {
            settings.global.excludes = [
              "CHANGELOG.md"
              "README.md"
              ".github/release-please-manifest.json"
            ];
            programs = {
              # keep-sorted start block=yes
              deno.enable = true;
              formatjson5 = {
                enable = true;
                indent = 2;
              };
              jsonfmt.enable = true;
              keep-sorted.enable = true;
              mdformat.enable = true;
              nixfmt.enable = true;
              yamlfmt = {
                enable = true;
                settings = {
                  formatter = {
                    type = "basic";
                    retain_line_breaks_single = true;
                  };
                };
              };
              # keep-sorted end
            };
          }
        );
        runAs =
          name: runtimeInputs: text:
          let
            program = pkgs.writeShellApplication {
              inherit name runtimeInputs text;
            };
          in
          {
            type = "app";
            program = "${program}/bin/${name}";
          };
        devPackages = rec {
          # keep-sorted start block=yes
          actions = [
            pkgs.actionlint
            pkgs.ghalint
            pkgs.zizmor
          ];
          deno = [ pkgs.deno ];
          renovate = [
            pkgs.renovate
          ];
          # keep-sorted end
          default = actions ++ deno ++ renovate ++ [ treefmt.config.build.wrapper ];
        };
      in
      {
        # keep-sorted start block=yes
        apps = {
          check-actions = pkgs.lib.pipe ''
            actionlint
            ghalint run
            zizmor .github/workflows
          '' [ (runAs "check-actions" devPackages.actions) ];
          check-renovate-config = pkgs.lib.pipe ''
            renovate-config-validator --strict renovate.json5
          '' [ (runAs "check-renovate-config" devPackages.renovate) ];
          check-deno = pkgs.lib.pipe ''
            deno task check
            deno task lint
          '' [ (runAs "check-deno" devPackages.deno) ];
        };
        checks = {
          formatting = treefmt.config.build.check self;
        };
        devShells = pkgs.lib.pipe devPackages [
          (pkgs.lib.attrsets.mapAttrs (name: buildInputs: pkgs.mkShell { inherit buildInputs; }))
        ];
        formatter = treefmt.config.build.wrapper;
        # keep-sorted end
      }
    );
}
