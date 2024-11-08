import { Shape, Box, Plane, Camera } from "./geometry.ts";
import { Vector } from "./vector.ts";

abstract class Importer {
	abstract boxFaces(faces: string[]): string[];
	abstract position(vec: Vector): Vector;
	abstract size(vec: Vector): Vector;
	abstract rotation(vec: Vector): Vector;
}

class BlenderImporter extends Importer {
	boxFaces(faces: string[]): string[] {
		let face_colors = ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"];

		//face_colors[4] = faces[0]; // Flip front and top
		//face_colors[0] = faces[4];

		face_colors[0] = faces[2]; // FRONT
		face_colors[1] = faces[3]; // LEFT
		face_colors[2] = faces[0]; // BACK
		face_colors[3] = faces[1]; // RIGHT
		face_colors[4] = faces[5]; // TOP
		face_colors[5] = faces[4]; // BOTTOM

		console.log(face_colors);
		return face_colors;
	}

	position(vec: Vector): Vector {
		let res = new Vector(0, 0, 0);

		res.x = -vec.y;
		res.y = vec.z;
		res.z = vec.x;

		return res;
	}

	size(vec: Vector): Vector {
		let res = new Vector(0, 0, 0);

		res.x = vec.y;
		res.y = vec.z;
		res.z = vec.x;

		return res.multi(new Vector(2, 2, 2));
	}

	rotation(vec: Vector): Vector {
		let res = new Vector(vec[0], 0, 0, 0);

		res[1] = -vec[2];
		res[2] = vec[3];
		res[3] = -vec[1];

		return res;
	}
}

export class Project {
	shapes: Shape[] = [];
	camera: Camera | undefined;

	constructor(
		public fileName: string = "out/shapes.txt",
		public importer: Importer = new BlenderImporter()
	) {
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
			console.error("No camera found, using default camera");
			this.camera = new Camera(new Vector(0, 0, 0), new Vector(0, 0, 0));
		}

		return shapes;
	}

	parseCamera(parts: string[]) {
		if (parts.length !== 7) {
			throw new Error(`Invalid camera line: ${parts.join(" ")}`);
		}

		const [posX, posY, posZ, rotX, rotY, rotZ] = parts.slice(1).map(parseFloat);

		const pos = new Vector(posX, posY, posZ).scale();
		const rot = new Vector(rotX, rotY, rotZ);

		this.camera = new Camera(this.importer.position(pos), this.importer.rotation(rot));
	}

	parseBox(parts: string[], index: number): Shape {
		if (parts.length !== 17) {
			throw new Error(`Invalid box line: ${parts.join(" ")}`);
		}

		const [posX, posY, posZ, sizeX, sizeY, sizeZ, rotA, rotX, rotY, rotZ] = parts
			.slice(1, 11)
			.map(parseFloat);
		const colors = parts.slice(11);

		const pos = new Vector(posX, posY, posZ).scale();
		const scale = new Vector(sizeX, sizeY, sizeZ).scale();
		const rot = new Vector(rotA, rotX, rotY, rotZ);

		return new Box(
			this.importer.position(pos),
			this.importer.size(scale),
			this.importer.rotation(rot),
			this.importer.boxFaces(colors),
			index
		);
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
