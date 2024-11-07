Running the blender addon will create a shapes.txt file.

This file will be parsed and a html file created

## Development

```bash
bash -c "find . -name '*.ts' -o -name '*.txt'  | entr -c ./build_and_run.sh"
```
