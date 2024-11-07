import { Vector3 } from "./vector.ts";

export abstract class Shape {
	abstract toHtml(): string;
	abstract toCss(): string;
}

export class Box extends Shape {
	index: number;

	pos: Vector3;
	size: Vector3;
	rot: Vector3;

	faceColors: string[];

	constructor(
		posX: number,
		posY: number,
		posZ: number,
		sizeX: number,
		sizeY: number,
		sizeZ: number,
		rotX: number,
		rotY: number,
		rotZ: number,
		faceColors: string[],
		index: number
	) {
		super();

		this.index = index;

		this.pos = new Vector3(posX, posY, posZ).scale();
		this.size = new Vector3(sizeX, sizeY, sizeZ).scale();
		this.rot = new Vector3(rotX, rotY, rotZ);

		if (faceColors.length === 1) {
			this.faceColors = [
				faceColors[0],
				faceColors[0],
				faceColors[0],
				faceColors[0],
				faceColors[0],
				faceColors[0],
			];
		} else {
			this.faceColors = faceColors;
		}
	}

	override toHtml(): string {
		return `
            <div class="box_${this.index}">
                <div class="box_face_${this.index} box_face_${this.index}_front">front</div>
                <div class="box_face_${this.index} box_face_${this.index}_back">back</div>
                <div class="box_face_${this.index} box_face_${this.index}_right">right</div>
                <div class="box_face_${this.index} box_face_${this.index}_left">left</div>
                <div class="box_face_${this.index} box_face_${this.index}_top">top</div>
                <div class="box_face_${this.index} box_face_${this.index}_bottom">bottom</div>
            </div>
        `;
	}

	override toCss(): string {
		return `
            .box_${this.index} {
                width: ${this.size.x}px;
                height: ${this.size.y}px;
                position: absolute;
                transform-style: preserve-3d;
                transform: translateX(${this.pos.x}px) translateY(${this.pos.y}px) translateZ(${
			this.pos.z
		}px) rotateX(${this.rot.x}deg) rotateY(${this.rot.y}deg) rotateZ(${this.rot.z}deg);
                transition: transform 1s;
            }

            .box_face_${this.index} {
                position: absolute;
                border: 2px solid black;
                font-size: 40px;
                font-weight: bold;
                color: white;
                text-align: center;
            }

            .box_face_${this.index}_front,
            .box_face_${this.index}_back {
                width: ${this.size.x}px;
                height: ${this.size.y}px;
                line-height: ${this.size.y}px;
            }

            .box_face_${this.index}_right,
            .box_face_${this.index}_left {
                width: ${this.size.z}px;
                height: ${this.size.y}px;
                left: ${this.size.x / 2 - this.size.z / 2}px;
                line-height: ${this.size.y}px;
            }

            .box_face_${this.index}_top,
            .box_face_${this.index}_bottom {
                width: ${this.size.x}px;
                height: ${this.size.z}px;
                top: ${this.size.y / 2 - this.size.z / 2}px;
                line-height: ${this.size.z}px;
            }

            .box_face_${this.index}_front  { background: ${this.faceColors[0]}; }
            .box_face_${this.index}_right  { background: ${this.faceColors[3]}; }
            .box_face_${this.index}_back   { background: ${this.faceColors[2]}; }
            .box_face_${this.index}_left   { background: ${this.faceColors[1]}; }
            .box_face_${this.index}_top    { background: ${this.faceColors[4]}; }
            .box_face_${this.index}_bottom { background: ${this.faceColors[5]}; }

            .box_face_${this.index}_front  { transform: rotateY(  0deg) translateZ(${this.size.z / 2}px); }
            .box_face_${this.index}_back   { transform: rotateY(180deg) translateZ(${this.size.z / 2}px); }

            .box_face_${this.index}_right  { transform: rotateY( 90deg) translateZ(${this.size.x / 2}px); }
            .box_face_${this.index}_left   { transform: rotateY(-90deg) translateZ(${this.size.x / 2}px); }

            .box_face_${this.index}_top    { transform: rotateX( 90deg) translateZ(${this.size.y / 2}px); }
            .box_face_${this.index}_bottom { transform: rotateX(-90deg) translateZ(${this.size.y / 2}px); }
        `;
	}
}

export class Plane extends Shape {
	override toHtml(): string {
		throw new Error("Method not implemented.");
	}

	override toCss(): string {
		throw new Error("Method not implemented.");
	}
}

export class Camera {
	pos: Vector3;
	rot: Vector3;

	constructor(posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number) {
		this.pos = new Vector3(posX, posY, posZ).scale();
		this.rot = new Vector3(rotX, rotY, rotZ);
	}

	toCss(): string {
		return `
        .camera {
                width: 400px;
            height: 400px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            perspective: 400px;
               }
        }
        `;
	}
}
