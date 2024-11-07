import { Project } from "./project.ts";

// Parse arg
const args = Deno.args;
if (args.length === 0) {
	console.error("Missing shapes file");
	Deno.exit(1);
}

// Read shapes file
const project = new Project(args[0]);
console.log(project.shapes);

// Generate
const [htmlDOM, cssStyles] = project.generate();

// Write to html file
const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Shapes</title>
    <style>
        body { 
            font-family: sans-serif;
            margin: 0;
            overflow: hidden;
        }

        .scene {
            width: 100vw;
            height: 100vh;
            /*position: absolute;
            top: 50%;
            left: 50%;*/
            transform-style: preserve-3d;
            perspective: 800px;
        }

        ${cssStyles}
    </style>
</head>
<body>
    ${htmlDOM}
</body>
</html>
`;

Deno.writeTextFileSync("out/index.html", template);
