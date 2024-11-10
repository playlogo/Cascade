import { Shape, Box, Plane, Camera } from "./geometry.ts";
import { Vector } from "./vector.ts";

abstract class Importer {
	abstract boxFaces(faces: string[]): string[];
	abstract position(vec: Vector): Vector;
	abstract size(vec: Vector): Vector;
	abstract rotation(vec: Vector): Vector;
	abstract keyframes(keyframes: RawKeyframe[]): Keyframe[];
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

		// Temporary fix
		face_colors[4] = faces[4];
		face_colors[5] = faces[5];

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

	keyframes(keyframes: RawKeyframe[]): Keyframe[] {
		const res: Keyframe[] = [];

		for (const keyframe of keyframes) {
			const loc = new Vector(keyframe.loc[0], keyframe.loc[1], keyframe.loc[2]).scale();
			const scale = new Vector(keyframe.scale[0], keyframe.scale[1], keyframe.scale[2]).scale();
			const rot = new Vector(keyframe.rot[0], keyframe.rot[1], keyframe.rot[2], keyframe.rot[3]);

			res.push({
				frame: keyframe.frame,
				loc: this.position(loc),
				scale: this.size(scale),
				rot: this.rotation(rot),
			});
		}

		return res;
	}
}

export class Project {
	shapes: Shape[] = [];
	camera: Camera | undefined;
	totalFrames = 0;

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
			// Read metadata
			try {
				if (index === 0) {
					const metaData = JSON.parse(trimmed.slice(2));
					this.totalFrames = metaData.maxFrame;
				}
			} catch (e) {
				console.error("Unable to parse metadata");
				console.error(trimmed);
				console.error(e);
			}

			index++;

			// Empty line
			if (trimmed === "") {
				continue;
			}

			// Comments
			if (trimmed[0] === "#") {
				continue;
			}

			// Load lines
			let entry: Line;
			try {
				entry = JSON.parse(trimmed) as Line;
			} catch (e) {
				continue;
			}

			switch (entry.type) {
				case "camera":
					throw new Error("Camera not implemented");
					//this.parseCamera(parts);
					break;
				case "box":
					shapes.push(this.parseBox(entry, index));
					break;
				case "plane":
					throw new Error("Plane not implemented");
					//shapes.push(this.parsePlane(parts, index));
					break;
				default:
					throw new Error(`Unknown type: ${entry.type}`);
			}
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

	parseBox(line: Line, index: number): Shape {
		const pos = new Vector(...line.location).scale();
		const scale = new Vector(...line.scale).scale();
		const rot = new Vector(...line.rotation);

		return new Box(
			this.importer.position(pos),
			this.importer.size(scale),
			this.importer.rotation(rot),
			this.importer.boxFaces(line.face_colors),
			this.importer.keyframes(line.keyframes),
			index,
			this.totalFrames
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

interface Line {
	type: string;
	name: string;
	location: [number, number, number];
	scale: [number, number, number];
	rotation: [number, number, number, number];
	face_colors: [string, string, string, string, string, string];
	keyframes: RawKeyframe[];
}

interface RawKeyframe {
	frame: number;
	loc: [number, number, number];
	scale: [number, number, number];
	rot: [number, number, number, number];
}

export interface Keyframe {
	frame: number;
	loc: Vector;
	scale: Vector;
	rot: Vector;
}
