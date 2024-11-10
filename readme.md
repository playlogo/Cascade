# Cascade - Slow + Buggy 3D viewer

![3D rendering of a Plant pot](/docs/plant.gif)

My goal was to render 3D Animations (only cubes supported so far) in a browser only using CSS (yes, no WebGL!).

This repo contains the required workflow to achieve that:

- [A Blender add-on](/blender/): Export a Blender scene to a temporary file
- [A Deno program](/generator/): Convert that file into a CSS 3D scene

Features:

- Location, Rotation, Scale + Face colors for cubes
- Location, Rotation + Scale Animations for cubes

## How to use

Blender:

1. Install the [Blender add-on](/blender/addon_v1.py)
    - Download the add-on to your PC
    - `Edit` -> `Preferences` -> `Add-ons` -> (Dropdown top-right) `Install from Disk...` -> Select file
2. Design something only using cubes
    - The cubes must have one material assigned
    - The scene will be rendered as if you are viewing it from `Right` (`View` -> `Viewport` -> `Right`) with Perspective (toggle with `Numpad 5`)
    - Create animations with keyframes as normal
3. Press `CTRL+SHIFT+E` to export the scene to a temporary file

Generator:

4. [Install Deno](https://docs.deno.com/runtime/getting_started/installation/) if you don't already have it installed
5. Run `deno task run <path-to-temporary-file>` in the main directory of the repo
6. Open `out/index.html` in a web browser!

Notes:

- Try not to use more than 25 cubes, otherwise the framerate will suffer

## Development

Hot reload for the generator:

```bash
bash -c "find . -name '*.ts' -o -name '*.txt'  | entr -c ./build_and_run.sh"
```
