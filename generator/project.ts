import { Shape, Box, Plane, Camera } from "./geometry.ts";

export class Project {
	shapes: Shape[] = [];
	camera: Camera | undefined;

	constructor(public fileName: string = "out/shapes.txt") {
		const content = this.loadShapesFile(fileName);

		this.shapes = this.parseShapesFile(content);
	}

	loadShapesFile(fileName: string): string {
		return Deno.readTextFileSync(fileName);
	}

	parseShapesFile(content: string): Shape[] {
		const shapes: Shape[] = [];
		let index = 0;

		for (const line of content.split("\n")) {
			const trimmed = line.trim();

			// Empty line
			if (trimmed === "") {
				continue;
			}

			// Comments
			if (trimmed[0] === "#") {
				continue;
			}

			const parts = trimmed.toLowerCase().split(" ");

			switch (parts[0]) {
				case "camera":
					this.parseCamera(parts);
					break;
				case "box":
					shapes.push(this.parseBox(parts, index));
					break;
				case "plane":
					throw new Error("Plane not implemented");
					//shapes.push(this.parsePlane(parts, index));
					break;
				default:
					throw new Error(`Unknown shape: ${parts[0]}`);
			}

			index++;
		}

		if (!this.camera) {
			throw new Error("Missing Camera!");
		}

		return shapes;
	}

	parseCamera(parts: string[]) {
		if (parts.length !== 7) {
			throw new Error(`Invalid camera line: ${parts.join(" ")}`);
		}

		const [posX, posY, posZ, rotX, rotY, rotZ] = parts.slice(1).map(parseFloat);
		this.camera = new Camera(posX, posY, posZ, rotX, rotY, rotZ);
	}

	parseBox(parts: string[], index: number): Shape {
		if (parts.length !== 17) {
			throw new Error(`Invalid box line: ${parts.join(" ")}`);
		}

		const [posX, posY, posZ, sizeX, sizeY, sizeZ, rotA, rotX, rotY, rotZ] = parts
			.slice(1, 11)
			.map(parseFloat);
		const colors = parts.slice(11);

		return new Box(posX, posY, posZ, sizeX, sizeY, sizeZ, rotA, rotX, rotY, rotZ, colors, index);
	}

	parsePlane(parts: string[], index: number): Shape {
		return new Plane();
	}

	generate(): [string, string] {
		// Generate elements
		let html = "";
		let styles = "";

		// Create main container
		html += `<div class="scene">`;

		{
			// Add Shapes
			for (const shape of this.shapes) {
				html += shape.toHtml();
				styles += shape.toCss(this.camera!);
			}
		}

		html += `</div>`;

		return [html, styles];
	}
}

/*
# type: camera posX posY posZ rotX rotY rotZ
camera 10 0 0 0 0 0 

# type: box posX posY posZ sizeX sizeY sizeZ rotX rotY rotZ colorFrontFace colorLeftFace colorBackFace colorRightFace colorUpFace colorDownFace
box 0 0 0 1 1 1 0 0 0 red red red red red red

# type: plane posX posY posZ sizeX sizeY rotX rotY rotZ colorUpFace colorDownFace
# plane 0 0 0 1 1 0 0 0 green red
*/
