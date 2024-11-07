import { Project } from "./project.ts";

// Read shapes file
const project = new Project();
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
